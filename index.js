import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { resolve } from 'import-meta-resolve'

/** @type {import('.').crawlFrameworkDeps} */
export async function crawlFrameworkDeps(options) {
  const pkgJsonPath = path.join(options.root, 'package.json')
  const pkgJson = await readJson(pkgJsonPath).catch((e) => {
    throw new Error(`Unable to read ${pkgJsonPath}`, { cause: e })
  })

  /** @type {string[]} */
  const optimizeDepsInclude = []
  /** @type {string[]} */
  const optimizeDepsExclude = []
  /** @type {string[]} */
  const ssrNoExternal = []
  /** @type {string[]} */
  const ssrExternal = []

  await crawl(pkgJsonPath, pkgJson)

  return {
    optimizeDeps: {
      include: optimizeDepsInclude,
      exclude: optimizeDepsExclude
    },
    ssr: {
      noExternal: ssrNoExternal,
      external: ssrExternal
    }
  }

  /**
   * crawl the package.json dependencies for framework deps. rules:
   * 1. a framework dep should be `optimizeDeps.exclude` and `ssr.noExternal`.
   * 2. the deps of the framework dep should be `optimizeDeps.include` and `ssr.external`
   *    unless the dep is also a framework dep, in which case do no1 & no2 recusrively.
   * 3. any non-framework dep that isn't imported by a framework dep can be skipped entirely.
   * @param {string} pkgJsonPath
   * @param {Record<string, any>} pkgJson
   * @param {string[]} [parentDepNames]
   */
  async function crawl(pkgJsonPath, pkgJson, parentDepNames = []) {
    const isRoot = parentDepNames.length === 0

    /** @type {string[]} */
    let deps = [
      ...Object.keys(pkgJson.dependencies || {}),
      ...(isRoot ? Object.keys(pkgJson.devDependencies || {}) : [])
    ]

    deps = deps.filter((dep) => {
      // skip circular deps
      if (parentDepNames.includes(dep)) {
        return false
      }

      // true     : we still keep to crawl it's nested deps as they need to be deep included and
      //            ssr externalized in dev mode.
      // false    : we have no interest in non-framework deps, filter them out.
      // undefined: "i don't know", keep and crawl
      const isFrameworkPkg = options.isFrameworkPkgByName?.(dep)
      const isSemiFrameworkPkg = options.isSemiFrameworkPkgByName?.(dep)
      if (isFrameworkPkg) {
        // framework packages should be excluded from optimization as esbuild can't handle them.
        // otherwise it'll cause https://github.com/vitejs/vite/issues/3910
        optimizeDepsExclude.push(dep)
        // framework packages should be noExternal so that they go through vite's transformation
        // pipeline, since nodejs can't support them.
        ssrNoExternal.push(dep)
      } else if (isSemiFrameworkPkg) {
        // TODO: note
        ssrNoExternal.push(dep)
      }

      if (isFrameworkPkg === false || isSemiFrameworkPkg === false) {
        return false
      } else {
        return true
      }
    })

    const promises = deps.map(async (dep) => {
      const depPkgJsonPath = await findDepPkgJsonPath(dep, pkgJsonPath)
      if (!depPkgJsonPath) return
      const depPkgJson = await readJson(depPkgJsonPath).catch(() => {})
      if (!depPkgJson) return

      // fast path if this dep is already a framework dep based on the filter condition above
      const cachedIsFrameworkPkg = ssrNoExternal.includes(dep)
      if (cachedIsFrameworkPkg) {
        return crawl(depPkgJsonPath, depPkgJson, parentDepNames.concat(dep))
      }

      // check if this dep is a framework dep, if so, track and crawl it
      const isFrameworkPkg = options.isFrameworkPkgByJson?.(depPkgJson)
      const isSemiFrameworkPkg = options.isSemiFrameworkPkgByJson?.(depPkgJson)
      if (isFrameworkPkg || isSemiFrameworkPkg) {
        if (isFrameworkPkg) {
          optimizeDepsExclude.push(dep)
          ssrNoExternal.push(dep)
        } else if (isSemiFrameworkPkg) {
          ssrNoExternal.push(dep)
        }
        return crawl(depPkgJsonPath, depPkgJson, parentDepNames.concat(dep))
      }

      // if we're crawling in a non-root state, the parent is 100% a framework package
      // because of the above if block. in this case, if it's dep is a non-framework
      // package, handle special cases for them.
      if (!isRoot) {
        // deep include it if it's a CJS package, so it becomes ESM and vite is happy.
        if (pkgJsonNeedsOptimization(pkgJson)) {
          optimizeDepsInclude.push(parentDepNames.concat(dep).join(' > '))
        }
        // also externalize it in dev so it doesn't trip vite's SSR transformation.
        // we do in dev only as build cannot access deep external packages in strict
        // dependency installations, such as pnpm.
        if (!options.isBuild) {
          ssrExternal.push(dep)
        }
      }
    })

    await Promise.allSettled(promises)
  }
}

/** @type {import('.').findDepPkgJsonPath} */
export async function findDepPkgJsonPath(dep, parent) {
  // try simple dep/package.json import
  try {
    return await importMetaResolve(path.join(dep, 'package.json'), parent)
  } catch {}
  // try default import, then walk up the directory tree
  let resolved
  try {
    resolved = await importMetaResolve(dep, parent)
  } catch {
    return undefined
  }
  let dir = path.dirname(resolved)
  while (dir) {
    const pkg = path.join(dir, 'package.json')
    try {
      await fs.access(pkg)
      return pkg
    } catch {}
    const nextDir = path.dirname(dir)
    if (nextDir === dir) break
    dir = nextDir
  }
  return undefined
}

/** @type {import('.').pkgJsonNeedsOptimization} */
export function pkgJsonNeedsOptimization(pkgJson) {
  // only optimize if is cjs, using the below as heuristic
  // see https://github.com/sveltejs/vite-plugin-svelte/issues/162
  if (pkgJson.module || pkgJson.exports) return false
  // has implicit index.js entrypoint, prebundle
  // see https://github.com/sveltejs/vite-plugin-svelte/issues/281
  if (!pkgJson.main) return true
  // ensure entry is js so vite can prebundle it
  // see https://github.com/sveltejs/vite-plugin-svelte/issues/233
  const entryExt = path.extname(pkgJson.main)
  return !entryExt || entryExt === '.js' || entryExt === '.cjs'
}

/**
 * @param {string} findDepPkgJsonPath
 * @returns {Promise<Record<string, any>>}
 */
async function readJson(findDepPkgJsonPath) {
  return JSON.parse(await fs.readFile(findDepPkgJsonPath, 'utf8'))
}

/**
 * @param {string} specifier
 * @param {string} parent
 */
async function importMetaResolve(specifier, parent) {
  const result = await resolve(specifier, pathToFileURL(parent).href)
  return fileURLToPath(result)
}

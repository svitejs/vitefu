import { fileURLToPath } from 'node:url'
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import {crawlFrameworkPkgs} from '../../../src/index.js'

const workspaceRoot = fileURLToPath(new URL('./', import.meta.url)).replace(/\/$/,'')
const root = `${workspaceRoot}/packages/workspace-app`;

test('crawlFrameworkPkgs (dev)', async () => {
  const result = await callCrawlFrameworkPkgs({isBuild: false})
  assert.equal(result, {
    optimizeDeps: {
      include: [],
      exclude: [
        "@vitefu/workspace-dep-full-direct-framework-lib",
        "@vitefu/workspace-dep-full-framework-lib",
        "@vitefu/workspace-dep-proxy-framework-lib"
      ]
    },
    ssr: {
      noExternal: [
        "@vitefu/workspace-dep-full-direct-framework-lib",
        "@vitefu/workspace-dep-full-framework-lib",
        "@vitefu/workspace-dep-proxy-framework-lib"
      ],
      external: []
    }
  })
})

test('crawlFrameworkPkgs (build)', async () => {
  const result = await callCrawlFrameworkPkgs({isBuild: true})
  assert.equal(result, {
    optimizeDeps: {
      include: [],
      exclude: [
        "@vitefu/workspace-dep-full-direct-framework-lib",
        "@vitefu/workspace-dep-full-framework-lib",
        "@vitefu/workspace-dep-proxy-framework-lib"
      ]
    },
    ssr: {
      noExternal: [
        "@vitefu/workspace-dep-full-direct-framework-lib",
        "@vitefu/workspace-dep-full-framework-lib",
        "@vitefu/workspace-dep-proxy-framework-lib"
      ],
      external: []
    }
  })
})

test('crawlFrameworkPkgs (dev + workspaceRoot)', async () => {
  const result = await callCrawlFrameworkPkgs({isBuild: false, workspaceRoot})
  assert.equal(result, {
    optimizeDeps: {
      include: [
        "@vitefu/workspace-dep-full-direct-framework-lib > @vitefu/dep-cjs-js-lib",
        "@vitefu/workspace-dep-full-direct-framework-lib > @vitefu/dep-implicit-entry-cjs-lib",
        "@vitefu/workspace-dep-full-framework-lib > @vitefu/dep-cjs-js-lib",
        "@vitefu/workspace-dep-full-framework-lib > @vitefu/dep-implicit-entry-cjs-lib",
        "@vitefu/workspace-dep-proxy-framework-lib > @vitefu/dep-full-framework-lib > @vitefu/dep-cjs-js-lib",
        "@vitefu/workspace-dep-proxy-framework-lib > @vitefu/dep-full-framework-lib > @vitefu/dep-implicit-entry-cjs-lib"

      ],
      exclude: [
        "@vitefu/dep-full-framework-lib",
        "@vitefu/workspace-dep-full-direct-framework-lib",
        "@vitefu/workspace-dep-full-framework-lib",
        "@vitefu/workspace-dep-proxy-framework-lib"
      ]
    },
    ssr: {
      noExternal: [
        "@vitefu/dep-full-framework-lib",
        "@vitefu/workspace-dep-full-direct-framework-lib",
        "@vitefu/workspace-dep-full-framework-lib",
        "@vitefu/workspace-dep-proxy-framework-lib"
      ],
      external: [
        "@vitefu/dep-cjs-js-lib",
        "@vitefu/dep-framework",
        "@vitefu/dep-implicit-entry-cjs-lib",
        "@vitefu/dep-no-deep-optimize-lib",
        "@vitefu/dep-no-entry-lib"
      ]
    }
  })
})

test('crawlFrameworkPkgs (build + workspaceRoot)', async () => {
  const result = await callCrawlFrameworkPkgs({isBuild:true, workspaceRoot})
  assert.equal(result, {
    optimizeDeps: {
      include: [
        "@vitefu/workspace-dep-full-direct-framework-lib > @vitefu/dep-cjs-js-lib",
        "@vitefu/workspace-dep-full-direct-framework-lib > @vitefu/dep-implicit-entry-cjs-lib",
        "@vitefu/workspace-dep-full-framework-lib > @vitefu/dep-cjs-js-lib",
        "@vitefu/workspace-dep-full-framework-lib > @vitefu/dep-implicit-entry-cjs-lib",
        "@vitefu/workspace-dep-proxy-framework-lib > @vitefu/dep-full-framework-lib > @vitefu/dep-cjs-js-lib",
        "@vitefu/workspace-dep-proxy-framework-lib > @vitefu/dep-full-framework-lib > @vitefu/dep-implicit-entry-cjs-lib"

      ],
      exclude: [
        "@vitefu/dep-full-framework-lib",
        "@vitefu/workspace-dep-full-direct-framework-lib",
        "@vitefu/workspace-dep-full-framework-lib",
        "@vitefu/workspace-dep-proxy-framework-lib"
      ]
    },
    ssr: {
      noExternal: [
        "@vitefu/dep-full-framework-lib",
        "@vitefu/workspace-dep-full-direct-framework-lib",
        "@vitefu/workspace-dep-full-framework-lib",
        "@vitefu/workspace-dep-proxy-framework-lib"
      ],
      external: []
    }
  })
})


test.run()

/**
 *
 * @param {Partial<import('../../../src/index.d.ts').CrawlFrameworkPkgsOptions>} options
 * @returns {ReturnType<typeof crawlFrameworkPkgs>}
 */
async function callCrawlFrameworkPkgs(options) {
  const mergedOptions = {
    root,
    ...options,
    isBuild: options.isBuild ?? false,
    viteUserConfig: {
      optimizeDeps: {
        exclude: ['@vitefu/dep-no-deep-optimize-lib']
      },
      ssr: {
        noExternal: [/@vitefu\/dep-should-no-external-lib/]
      }
    },
    isFrameworkPkgByJson: (pkgJson) => {
      return exportsHasFrameworkField(pkgJson.exports || {})
    },
    isSemiFrameworkPkgByJson: (pkgJson) => {
      return !!(
          pkgJson.dependencies?.['@vitefu/dep-framework'] ||
          pkgJson.peerDependencies?.['@vitefu/dep-framework']
      )
    }
  };
  const result = await crawlFrameworkPkgs(mergedOptions)
  // sort for deep equal comparison
  result.optimizeDeps.include.sort()
  result.optimizeDeps.exclude.sort()
  result.ssr.noExternal.sort()
  result.ssr.external.sort()
  return result
}

/**
 * @param {Record<string, any>} exports
 */
function exportsHasFrameworkField(exports) {
  for (const [key, value] of Object.entries(exports)) {
    if (key === 'framework') {
      return true
    } else if (
      typeof value === 'object' &&
      value != null &&
      exportsHasFrameworkField(value)
    ) {
      return true
    }
  }
  return false
}

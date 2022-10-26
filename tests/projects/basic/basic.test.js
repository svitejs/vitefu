import { fileURLToPath } from 'node:url'
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { crawlFrameworkPkgs } from '../../../src/index.js'

const root = fileURLToPath(new URL('./', import.meta.url))

test('crawlFrameworkPkgs (dev)', async () => {
  const result = await callCrawlFrameworkPkgs(false)
  assert.equal(result, {
    optimizeDeps: {
      include: [
        '@vitefu/dep-full-direct-framework-lib > @vitefu/dep-cjs-js-lib',
        '@vitefu/dep-full-framework-lib > @vitefu/dep-cjs-js-lib',
        '@vitefu/dep-proxy-framework-lib > @vitefu/dep-full-framework-lib > @vitefu/dep-cjs-js-lib'
      ],
      exclude: [
        '@vitefu/dep-full-direct-framework-lib',
        '@vitefu/dep-full-framework-lib',
        '@vitefu/dep-proxy-framework-lib'
      ]
    },
    ssr: {
      noExternal: [
        '@vitefu/dep-full-direct-framework-lib',
        '@vitefu/dep-full-framework-lib',
        '@vitefu/dep-proxy-framework-lib',
        '@vitefu/dep-semi-framework-lib'
      ],
      external: [
        '@vitefu/dep-cjs-js-lib',
        '@vitefu/dep-cjs-js-lib',
        '@vitefu/dep-cjs-js-lib',
        '@vitefu/dep-framework'
      ]
    }
  })
})

test('crawlFrameworkPkgs (build)', async () => {
  const result = await callCrawlFrameworkPkgs(true)
  assert.equal(result, {
    optimizeDeps: {
      include: [
        '@vitefu/dep-full-direct-framework-lib > @vitefu/dep-cjs-js-lib',
        '@vitefu/dep-full-framework-lib > @vitefu/dep-cjs-js-lib',
        '@vitefu/dep-proxy-framework-lib > @vitefu/dep-full-framework-lib > @vitefu/dep-cjs-js-lib'
      ],
      exclude: [
        '@vitefu/dep-full-direct-framework-lib',
        '@vitefu/dep-full-framework-lib',
        '@vitefu/dep-proxy-framework-lib'
      ]
    },
    ssr: {
      noExternal: [
        '@vitefu/dep-full-direct-framework-lib',
        '@vitefu/dep-full-framework-lib',
        '@vitefu/dep-proxy-framework-lib',
        '@vitefu/dep-semi-framework-lib'
      ],
      external: []
    }
  })
})

test.run()

/**
 * @param {boolean} isBuild
 */
async function callCrawlFrameworkPkgs(isBuild) {
  const result = await crawlFrameworkPkgs({
    root,
    isBuild,
    isFrameworkPkgByJson: (pkgJson) => {
      return exportsHasFrameworkField(pkgJson.exports || {})
    },
    isSemiFrameworkPkgByJson: (pkgJson) => {
      return !!(
        pkgJson.dependencies?.['@vitefu/dep-framework'] ||
        pkgJson.peerDependencies?.['@vitefu/dep-framework']
      )
    }
  })
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

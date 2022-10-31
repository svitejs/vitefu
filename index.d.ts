import type { UserConfig } from 'vite'

export interface CrawlFrameworkPkgsOptions {
  /**
   * Path to the root of the project that contains the `package.json`
   */
  root: string
  /**
   * Whether we're currently in a Vite build
   */
  isBuild: boolean
  /**
   * Optional. If a Vite user config is passed, the output Vite config will respect the
   * set `optimizeDeps` and `ssr` options so it doesn't override it
   */
  viteUserConfig?: UserConfig
  /**
   * Whether this is a framework package by checking it's `package.json`.
   * A framework package is one that exports special files that can't be processed
   * by esbuild natively. For example, exporting `.framework` files.
   *
   * @example
   * ```ts
   * return pkgJson.keywords?.includes('my-framework')
   * ```
   */
  isFrameworkPkgByJson?: (pkgJson: Record<string, any>) => boolean
  /**
   * Whether this is a framework package by checking it's name. This is
   * usually used as a fast path. Return `true` or `false` if you know 100%
   * if it's a framework package or not. Return `undefined` to fallback to
   * `isFrameworkPkgByJson`.
   *
   * @example
   * ```ts
   * return SPECIAL_PACKAGES.includes(pkgName) || undefined
   * ```
   */
  isFrameworkPkgByName?: (pkgName: string) => boolean | undefined
  /**
   * Whether this is a semi-framework package by checking it's `package.json`.
   * A semi-framework package is one that **doesn't** export special files but
   * consumes other APIs of the framework. For example, it only does
   * `import { debounce } from 'my-framework/utils'`.
   *
   * @example
   * ```ts
   * return Object.keys(pkgJson.dependencies || {}).includes('my-framework')
   * ```
   */
  isSemiFrameworkPkgByJson?: (pkgJson: Record<string, any>) => boolean
  /**
   * Whether this is a semi-framework package by checking it's name. This is
   * usually used as a fast path. Return `true` or `false` if you know 100%
   * if it's a semi-framework package or not. Return `undefined` to fallback to
   * `isSemiFrameworkPkgByJson`.
   *
   * @example
   * ```ts
   * return SPECIAL_SEMI_PACKAGES.includes(pkgName) || undefined
   * ```
   */
  isSemiFrameworkPkgByName?: (pkgName: string) => boolean | undefined
}

export interface CrawlFrameworkPkgsResult {
  optimizeDeps: {
    include: string[]
    exclude: string[]
  }
  ssr: {
    noExternal: string[]
    external: string[]
  }
}

/**
 * Crawls for framework packages starting from `<root>/package.json` to build
 * out a partial Vite config. See the source code for details of how this is built.
 */
export declare function crawlFrameworkPkgs(
  options: CrawlFrameworkPkgsOptions
): Promise<CrawlFrameworkPkgsResult>

/**
 * Find the `package.json` of a dep, starting from the parent, e.g. `process.cwd()`.
 * A simplified implementation of https://nodejs.org/api/esm.html#resolver-algorithm-specification
 * (PACKAGE_RESOLVE) for `package.json` specifically.
 */
export declare function findDepPkgJsonPath(
  dep: string,
  parent: string
): Promise<string | undefined>

/**
 * Find the closest `package.json` path by walking `filePath` upwards
 */
export declare function findClosestPkgJsonPath(
  dir: string
): Promise<string | undefined>

/**
 * Check if a package needs to be optimized by Vite, aka if it's CJS-only
 */
export declare function pkgJsonNeedsOptimization(
  pkgJson: Record<string, any>
): boolean

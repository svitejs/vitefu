export interface CrawlFrameworkDepsOptions {
  root: string
  isBuild: boolean
  isFrameworkPkgByJson?: (pkgJson: Record<string, any>) => boolean
  isFrameworkPkgByName?: (pkgName: string) => boolean | undefined
  isSemiFrameworkPkgByJson?: (pkgJson: Record<string, any>) => boolean
  isSemiFrameworkPkgByName?: (pkgName: string) => boolean | undefined
}

export interface CrawlFrameworkDepsResult {
  optimizeDeps: {
    include: string[]
    exclude: string[]
  }
  ssr: {
    noExternal: string[]
    external: string[]
  }
}

export declare function crawlFrameworkDeps(
  options: CrawlFrameworkDepsOptions
): Promise<CrawlFrameworkDepsResult>

export declare function findDepPkgJsonPath(
  dep: string,
  parent: string
): Promise<string | undefined>

export declare function pkgJsonNeedsOptimization(
  pkgJson: Record<string, any>
): boolean

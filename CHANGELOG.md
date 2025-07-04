# Changelog

## 1.1.1 (2025-07-04)

- fix: ensure workspaceRoot option works on windows ([#26](https://github.com/svitejs/vitefu/pull/26))

## 1.1.0 (2025-07-03)

- Add workspaceRoot option to `crawlFrameworkPkgs` that enables crawling devDependencies of local workspace **private** packages ([#23](https://github.com/svitejs/vitefu/pull/23))

## 1.0.7 (2025-06-20)

- Allow Vite 7 peer dependency ([#21](https://github.com/svitejs/vitefu/pull/21))

## 1.0.6 (2025-02-24)

- Handle `ssr.external: true` Vite config when calling `crawlFrameworkPkgs` and `isDepExternaled` ([#19](https://github.com/svitejs/vitefu/pull/19))

## 1.0.5 (2025-01-02)

- Don't require `package.json` to exist for `crawlFrameworkPkgs` ([#16](https://github.com/svitejs/vitefu/pull/16))

## 1.0.4 (2024-11-26)

- Allow Vite 6 peer dependency (remove beta support)

## 1.0.3 (2024-10-14)

- Allow Vite 6 beta peer dependency (experimental support)

## 1.0.2 (2024-09-02)

- Duplicate CJS types to correct ESM types export

## 1.0.1 (2024-09-02)

- Fix ESM types export

## 1.0.0 (2024-08-26)

The library is now v1! This release is mostly ceremonial as the API has been stable for a while without any plans to change it. As such, there are no breaking changes.

- Remove top-level await to allow future compatibility to `require` ESM code
- Export proper ESM and CJS types

## 0.2.5 (2023-10-13)

- Align `findDepPkgJsonPath` implementation with Vite
- Allow Vite 5 peer dependency

## 0.2.4 (2022-12-17)

- Fix `findDepPkgJsonPath` usage in Windows mapped network drives

## 0.2.3 (2022-12-09)

- Allow Vite 4 peer dependency

## 0.2.2 (2022-11-23)

- `findClosestPkgJsonPath` only returns `package.json` file, not directory
- Support `predicate` parameter for `findClosestPkgJsonPath` to filter paths

## 0.2.1 (2022-11-12)

- Don't throw error if `package.json` not found in Deno

## 0.2.0 (2022-11-10)

- BREAKING: Rename `pkgJsonNeedsOptimization` to `pkgNeedsOptimization` with new parameters and async for correctness
- Prevent deep optimize packages with no exports and `index.js` file
- Correctly respect Vite user config for `crawlFrameworkPkgs`
- Export new utilities to respect Vite user config

## 0.1.1 (2022-11-01)

- Resolve packages without root entry ([#1](https://github.com/svitejs/vitefu/issues/1))
- Support yarn pnp ([#2](https://github.com/svitejs/vitefu/issues/2))

## 0.1.0 (2022-10-27)

- Fix Windows `package.json` import resolve
- Remove `ssr.external` duplicates for `crawlFrameworkPkgs`

## 0.0.1 (2022-10-26)

Initial release

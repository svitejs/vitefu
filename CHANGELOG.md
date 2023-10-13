# Changelog

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

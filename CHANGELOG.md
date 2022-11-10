# Changelog

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

// CJS -> ESM proxy file
// Reference: https://github.com/vitejs/vite/blob/9f268dad2e82c0f1276b1098c0a28f1cf245aa50/packages/vite/index.cjs

// redirect async functions to ESM
const asyncFunctions = [
  'crawlFrameworkPkgs',
  'findDepPkgJsonPath',
  'findClosestPkgJsonPath',
  'pkgJsonNeedsOptimization'
]

for (const fn of asyncFunctions) {
  module.exports[fn] = function () {
    return import('./index.js').then((mod) => mod[fn].apply(this, arguments))
  }
}

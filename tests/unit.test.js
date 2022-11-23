import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { suite } from 'uvu'
import * as assert from 'uvu/assert'
import {
  findClosestPkgJsonPath,
  isDepIncluded,
  isDepExcluded,
  isDepNoExternaled,
  isDepExternaled
} from '../src/index.js'

const test1 = suite('isDepIncluded')
test1('return true if dep is included', () => {
  assert.ok(isDepIncluded('foo', ['foo']))
})
test1('return true if dep is deep included', () => {
  assert.ok(isDepIncluded('bar', ['foo > bar']))
})
test1('return false if dep is not included', () => {
  assert.not.ok(isDepIncluded('bar', ['foo']))
})
test1.run()

const test2 = suite('isDepExcluded')
test2('return true if dep is excluded', () => {
  assert.ok(isDepExcluded('foo', ['foo']))
})
test2('return false if dep is not excluded', () => {
  assert.not.ok(isDepExcluded('bar', ['foo']))
})
test2('return true if nested dep is excluded', () => {
  assert.ok(isDepExcluded('hello > foo', ['foo']))
  assert.ok(isDepExcluded('hello > world > foo', ['foo']))
})
test2('return false if nested dep is not excluded', () => {
  assert.not.ok(isDepExcluded('hello > bar', ['foo']))
  assert.not.ok(isDepExcluded('hello > world > bar', ['foo']))
})
test2.run()

const test3 = suite('isDepNoExternaled')
test3('return true if dep is noExternaled', () => {
  assert.ok(isDepNoExternaled('foo', ['foo']))
})
test3('return false if dep is not noExternaled', () => {
  assert.not.ok(isDepNoExternaled('bar', ['foo']))
})
test3('return true if dep is noExternaled is true', () => {
  assert.ok(isDepNoExternaled('foo', true))
})
test3('return true if dep is noExternaled with regex', () => {
  assert.ok(isDepNoExternaled('foo', 'foo'))
})
test3('return true if dep is noExternaled with regex', () => {
  assert.ok(isDepNoExternaled('foo', /fo/))
})
test3('return true if dep is noExternaled with string and regex array', () => {
  assert.ok(isDepNoExternaled('foo', ['foo', /ba/]))
  assert.ok(isDepNoExternaled('bar', ['foo', /ba/]))
})
test3.run()

const test4 = suite('isDepExternaled')
test4('return true if dep is externaled', () => {
  assert.ok(isDepExternaled('foo', ['foo']))
})
test4('return false if dep is not externaled', () => {
  assert.not.ok(isDepExternaled('bar', ['foo']))
})
test4.run()

const test5 = suite('findClosestPkgJsonPath')
test5('return package.json', async () => {
  const start = fileURLToPath(new URL('.', import.meta.url))
  const actual = await findClosestPkgJsonPath(start)
  const expected = fileURLToPath(new URL('../package.json', import.meta.url))
  assert.equal(actual, expected)
})
test5('ignore package.json directory name', async () => {
  const start = fileURLToPath(
    new URL('./projects/package.json/empty.js', import.meta.url)
  )
  const actual = await findClosestPkgJsonPath(start)
  const expected = fileURLToPath(new URL('../package.json', import.meta.url))
  assert.equal(actual, expected)
})
test5('respect predicate', async () => {
  const start = fileURLToPath(
    new URL('./projects/basic/package.json', import.meta.url)
  )
  const actual = await findClosestPkgJsonPath(start, async (pkgJsonPath) => {
    console.log(pkgJsonPath)
    const content = await fs.readFile(pkgJsonPath, 'utf8')
    const json = JSON.parse(content)
    return json.name === 'vitefu'
  })
  const expected = fileURLToPath(new URL('../package.json', import.meta.url))
  assert.equal(actual, expected)
})
test5.run()

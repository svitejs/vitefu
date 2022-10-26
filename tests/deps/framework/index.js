export function compile(code) {
  return code.replace('<framework>', '').replace('</framework>', '')
}

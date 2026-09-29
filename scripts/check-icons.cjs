const fs = require('fs')
const apps = fs.readFileSync('app/data/apps.ts', 'utf8')
const logos = fs.readFileSync('app/utils/logos.ts', 'utf8')

const logoBlock = logos.split('export const ICON_BG')[0]
const bgBlock = logos.split('export const ICON_BG')[1] || ''

const keys = new Set([...logoBlock.matchAll(/^ {2}([A-Za-z]\w*):\s*`/gm)].map((m) => m[1]))
const bgKeys = new Set([...bgBlock.matchAll(/^ {2}([A-Za-z]\w*):/gm)].map((m) => m[1]))
const used = [...apps.matchAll(/icon:\s*'([^']+)'/g)].map((m) => m[1])
const uniq = [...new Set(used)]

console.log('LOGOS marks:', keys.size, '| ICON_BG:', bgKeys.size, '| distinct icons used:', uniq.length)
console.log('MISSING logo mark ->', uniq.filter((u) => !keys.has(u)))
console.log('MISSING background ->', uniq.filter((u) => !bgKeys.has(u)))
console.log('UNUSED logo marks ->', [...keys].filter((k) => !uniq.includes(k)))

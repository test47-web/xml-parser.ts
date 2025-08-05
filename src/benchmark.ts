import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { XMLParser } from 'fast-xml-parser'
import { xml_to_json } from './core'

let dir = 'res/source/annotations'
let filenames = readdirSync(dir)

let text_samples = filenames.map(filename => {
  let file = join(dir, filename)
  let content = readFileSync(file, 'utf-8')
  return content
})

function test(name: string, parse: (xml: string) => object) {
  let start = performance.now()
  for (let text_sample of text_samples) {
    parse(text_sample)
  }
  let end = performance.now()
  let total = end - start
  console.log(`${name}: ${total.toFixed(2)}ms`)
}

let bar = '-'.repeat(25)

console.log(bar)
console.log('Testing Dataset')
console.log('file count:', filenames.length)
console.log(
  'total size:',
  text_samples.reduce((acc, curr) => acc + curr.length, 0).toLocaleString(),
)
console.log(bar)

let fast_xml_parser = new XMLParser()
test('fast-xml-parser', xml => fast_xml_parser.parse(xml))
test('xml-parser.ts', xml => xml_to_json(xml))

console.log(bar)

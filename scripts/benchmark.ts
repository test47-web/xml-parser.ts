import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { XMLParser } from 'fast-xml-parser'
import { xml_to_json } from '../src/core'

let dir = 'res/source/annotations'
let samples = readdirSync(dir).map(filename => {
  let file = join(dir, filename)
  let xml = readFileSync(file, 'utf-8')
  return { filename, xml }
})

function test(name: string, parse: (xml: string) => object) {
  let start = performance.now()
  for (let sample of samples) {
    parse(sample.xml)
  }
  let end = performance.now()
  let total = end - start
  console.log(`${name}: ${total.toFixed(2)}ms`)
}

let bar = '-'.repeat(25)

console.log(bar)
console.log('Testing Dataset')
console.log('file count:', samples.length)
console.log(
  'total size:',
  samples.reduce((acc, curr) => acc + curr.xml.length, 0).toLocaleString(),
)
console.log(bar)

let fast_xml_parser = new XMLParser()
test('fast-xml-parser', xml => fast_xml_parser.parse(xml))
test('xml-parser.ts', xml => xml_to_json(xml))

console.log(bar)
console.log('Correctness Check')
for (let sample of samples) {
  let fast_xml_parser_result = fast_xml_parser.parse(sample.xml)
  let xml_parser_ts_result = xml_to_json(sample.xml)
  if (
    JSON.stringify(fast_xml_parser_result) !==
    JSON.stringify(xml_parser_ts_result)
  ) {
    console.log(
      `Error: fast-xml-parser and xml-parser.ts results are different for ${dir}/${sample.filename}`,
    )
    writeFileSync('res/input.xml', sample.xml)
    writeFileSync(
      'res/expected.json',
      JSON.stringify(fast_xml_parser_result, null, 2),
    )
    writeFileSync(
      'res/actual.json',
      JSON.stringify(xml_parser_ts_result, null, 2),
    )
    process.exit(1)
  }
}
console.log('Passed')
console.log(bar)

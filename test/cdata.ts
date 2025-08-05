import { xml_to_json } from '../src/core'

let xml = /* xml */ `
<note>
  <message><![CDATA[<tag>content</tag>]]></message>
</note>
`

let expected = {
  note: { message: '<tag>content</tag>' },
}

let actual = xml_to_json(xml)
let passed = JSON.stringify(actual) === JSON.stringify(expected)

if (passed) {
  console.log('CDATA Test: passed')
} else {
  console.log('CDATA Test: failed')
  console.log('Expected:')
  console.log(JSON.stringify(expected, null, 2))
  console.log('Actual:')
  console.log(JSON.stringify(actual, null, 2))
  process.exit(1)
}

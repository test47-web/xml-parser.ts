import { xml_to_json } from '../src/core'

let xml = /* xml */ `
<?xml version="1.0" encoding="UTF-8"?>
<object>
  <x>1</x>
  <y>2</y>
</object>
`

let expected = {
  object: { x: 1, y: 2 },
}

let actual = xml_to_json(xml)
let passed = JSON.stringify(actual) === JSON.stringify(expected)

if (passed) {
  console.log('Metadata Test: passed')
} else {
  console.log('Metadata Test: failed')
  console.log('Expected:')
  console.log(JSON.stringify(expected, null, 2))
  console.log('Actual:')
  console.log(JSON.stringify(actual, null, 2))
  process.exit(1)
}

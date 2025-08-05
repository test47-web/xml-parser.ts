import { xml_to_json } from '../src/core'

let xml = /* xml */ `
<object>
  <x>1</x>
  <y>2</y>
</object>
<object>
  <x>3</x>
  <y>4</y>
</object>
`

let expected = {
  object: [
    { x: 1, y: 2 },
    { x: 3, y: 4 },
  ],
}
let actual = xml_to_json(xml)
let passed = JSON.stringify(actual) === JSON.stringify(expected)

if (passed) {
  console.log('Multi-root Test: passed')
} else {
  console.log('Multi-root Test: failed')
  console.log('Expected:')
  console.log(JSON.stringify(expected, null, 2))
  console.log('Actual:')
  console.log(JSON.stringify(actual, null, 2))
  process.exit(1)
}

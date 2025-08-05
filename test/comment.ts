import { xml_to_json } from '../src/core'

let xml = /* xml */ `
<!-- top level comment -->
<object>
  <x><!-- before text -->1<!-- between text-->2<!-- after text --></x>
  <!-- child comment -->
  <y>34</y>
	<z><!-- continuos --><!-- comment --></z>
	<name><!-- in empty element --></name>
</object>
<!-- after root element -->
`

let expected = {
  object: { x: 12, y: 34, z: '', name: '' },
}

let actual = xml_to_json(xml)
let passed = JSON.stringify(actual) === JSON.stringify(expected)

if (passed) {
  console.log('Comment Test: passed')
} else {
  console.log('Comment Test: failed')
  console.log('Expected:')
  console.log(JSON.stringify(expected, null, 2))
  console.log('Actual:')
  console.log(JSON.stringify(actual, null, 2))
  process.exit(1)
}

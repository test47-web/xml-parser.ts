import { xml_to_json } from '../src/core'

let xml = /* xml */ `
<player >
  <name > John </name>
	<box />
</player>
`

let expected = {
  player: {
    name: 'John',
    box: {},
  },
}

let actual = xml_to_json(xml)
let passed = JSON.stringify(actual) === JSON.stringify(expected)

if (passed) {
  console.log('Extra Space Test: passed')
} else {
  console.log('Extra Space Test: failed')
  console.log('Expected:')
  console.log(JSON.stringify(expected, null, 2))
  console.log('Actual:')
  console.log(JSON.stringify(actual, null, 2))
  process.exit(1)
}

import { xml_to_json } from '../src/core'

let xml = /* xml */ `
<player>
  <name>John</name>
	<box/>
	<skill />
</player>
`

let expected = {
  player: {
    name: 'John',
    box: {},
    skill: {},
  },
}

let actual = xml_to_json(xml)
let passed = JSON.stringify(actual) === JSON.stringify(expected)

if (passed) {
  console.log('Self-closing Test: passed')
} else {
  console.log('Self-closing Test: failed')
  console.log('Expected:')
  console.log(JSON.stringify(expected, null, 2))
  console.log('Actual:')
  console.log(JSON.stringify(actual, null, 2))
  process.exit(1)
}

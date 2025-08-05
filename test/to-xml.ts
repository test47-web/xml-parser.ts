import { writeFileSync } from 'fs'
import { json_to_xml } from '../src/core'

let object = {
  annotation: {
    folder: 'images',
    filename: 'maksssksksss0.png',
    size: {
      width: 512,
      height: 366,
    },
    object: [
      {
        x: 79,
        y: 105,
      },
      {
        x: 185,
        y: 100,
      },
    ],
  },
}

let xml = /* xml */ `
<annotation>
  <folder>images</folder>
  <filename>maksssksksss0.png</filename>
  <size>
    <width>512</width>
    <height>366</height>
  </size>
  <object>
    <x>79</x>
    <y>105</y>
  </object>
  <object>
    <x>185</x>
    <y>100</y>
  </object>
</annotation>
`.trim()

let actual = json_to_xml(object)

if (actual.trim() !== xml.trim()) {
  console.log('To XML Test: failed')
  writeFileSync('res/to-xml-expected.xml', xml)
  writeFileSync('res/to-xml-actual.xml', actual)
  console.log('see res/to-xml-expected.xml and res/to-xml-actual.xml')
} else {
  console.log('To XML Test: passed')
}

# xml-parser.ts

A lightweight, zero-dependency XML parser for TypeScript/JavaScript that converts XML strings to JavaScript objects and vice versa.

[![npm Package Version](https://img.shields.io/npm/v/xml-parser.ts)](https://www.npmjs.com/package/xml-parser.ts)
[![Minified Package Size](https://img.shields.io/bundlephobia/min/xml-parser.ts)](https://bundlephobia.com/package/xml-parser.ts)
[![Minified and Gzipped Package Size](https://img.shields.io/bundlephobia/minzip/xml-parser.ts)](https://bundlephobia.com/package/xml-parser.ts)

## Features

- **Zero dependencies** - Lightweight and fast
- **TypeScript support** - Full type safety
- **Isomorphic package** - Works in Node.js and browsers
- **Bidirectional conversion** - XML ↔ JSON in both directions
- **Simple API** - Two main functions for complete XML handling
- **High performance** - [4x faster than popular alternatives](#performance-benchmark)

### Supported:

- Nested elements
- Text content (as string or number)
- Multiple root elements
- CDATA sections
- Self-closing elements

### Ignored:

- Metadata (e.g., `<?xml version="1.0"?>`)
- Comments (e.g., `<!-- comment -->`)

### Not supported:

- Attributes
- Element with both child elements and text content
- XML comments inside CDATA

## Performance Benchmark

xml-parser.ts is significantly (4x) faster than a popular alternative [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser) in parsing simple XML files.

**Benchmark dataset:**  
[Face Mask Detection dataset](https://www.kaggle.com/datasets/andrewmvd/face-mask-detection) (Pascal VOC annotation files)

```
Testing Dataset
file count: 853
total size: 1,576,046 bytes
-------------------------
fast-xml-parser: 206.42ms
xml-parser.ts: 47.75ms
Speedup: 4.32x
```

**Note:** This performance advantage comes from a trade off of supporting only a subset of XML features that are sufficient for common use cases like machine learning label files (e.g., Pascal VOC format). The parser intentionally omits complex XML features like attributes, mixed content, and XML entities to maintain simplicity and speed.

## Installation

```bash
npm install xml-parser.ts
```

You can also install `xml-parser.ts` with [pnpm](https://pnpm.io/), [yarn](https://yarnpkg.com/), or [slnpm](https://github.com/beenotung/slnpm)

## Usage Example

```typescript
import { xml_to_json, json_to_xml } from 'xml-parser.ts'

const xml = `
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
`

// Parse XML to JavaScript object
const result = xml_to_json(xml)
console.log(result)

// Convert back to XML
const regeneratedXml = json_to_xml(result)
console.log(regeneratedXml == xml) // output true
```

Converted JavaScript object:

```javascript
{
  annotation: {
    folder: "images",
    filename: "maksssksksss0.png",
    size: {
      width: 512,
      height: 366,
    },
    object: [
      { x: 79, y: 105 },
      { x: 185, y: 100 }
    ]
  }
}
```

## Supported XML Features

### ✅ Supported

- **Nested elements** - Parsed as object properties
- **Text content** - Automatically converted to string or number
- **Multiple root elements** - All root elements are included
- **CDATA sections** - Content is preserved as text
- **Self-closing elements** - Parsed as empty objects
- **XML comments** - Automatically removed
- **XML metadata** - Automatically removed

### ❌ Not Supported

- **Attributes** - Element attributes are ignored
- **Mixed content** - Elements with both text and child elements
- **XML entities** - No entity decoding (e.g., `&lt;`, `&gt;`)

## Data Validation

For runtime validation on parsed XML data, you can use [cast.ts](https://github.com/beenotung/cast.ts) - a lightweight runtime parser-based data validation library that also provides static type inference on the parsed result.

The array parser is particularly useful for XML data as it can convert single or multiple values into an array, enabling unified handling on cases where XML elements might appear once or multiple times.

```typescript
import { xml_to_json } from 'xml-parser.ts'
import { string, int, object, array } from 'cast.ts'

// Define validation schema
const annotationParser = object({
  annotation: object({
    folder: string(),
    filename: string(),
    size: object({
      width: int(),
      height: int(),
    }),
    object: array(
      object({
        name: string(),
        bndbox: object({
          xmin: int(),
          ymin: int(),
          xmax: int(),
          ymax: int(),
        }),
      }),
      { maybeSingle: true }, // Allows single object or array of objects
    ),
  }),
})

/* Parse and validate XML with full type inference */
const xml = `...` // the XML string, from file or network
const json = xml_to_json(xml) // the JavaScript object converted from XML string, with "any" type
const data = annotationParser.parse(json) // the parsed JavaScript object, with full TypeScript type inference

console.log('filename:', data.annotation.filename)
console.log('object count:', data.annotation.object.length)
```

## TypeScript Signature

### Core Functions

```typescript
/**
 * Parse XML string to JavaScript object.
 *
 * Converts XML elements to object properties using tag names as keys.
 * Text content is automatically converted to strings or numbers.
 * Multiple elements with the same name become arrays.
 *
 * @param xml - The XML string to parse
 * @returns JavaScript object representation of the XML structure
 * @throws Error if the XML is invalid or malformed
 */
export function xml_to_json(xml: string): Record<string, any>

/**
 * Convert JavaScript object to XML string.
 *
 * Converts object properties to XML elements using property names as tag names.
 * String and number values become text content.
 * Arrays create multiple elements with the same tag name.
 * Nested objects create nested XML elements.
 *
 * @param object - The JavaScript object to convert
 * @param options - Formatting options for the XML output
 * @returns XML string representation of the object
 */
export function json_to_xml(
  object: Record<string, any>,
  options?: {
    /** default `''` */
    initial_indent?: string
    /** default `'  '` (2 spaces) */
    indent_step?: string
  },
): string
```

### Helper Functions

```typescript
/**
 * Parse a single root element from XML string.
 * - Metadata and comments should be removed before passing to this function.
 */
export function parse_xml_element(xml: string, offset: number): ParsedElement

/**
 * Remove XML comments from the input string.
 * Removes all occurrences of <!-- ... --> patterns.
 */
export function remove_xml_comments(xml: string): string

/**
 * Remove XML metadata from the input string.
 * Removes all occurrences of <? ... ?> patterns (e.g., <?xml version="1.0"?>).
 */
export function remove_xml_metadata(xml: string): string

interface ParsedElement {
  tag_name: string
  properties: Record<string, any>
  text_content: string | number | null
  offset: number
}
```

## License

This project is licensed with [BSD-2-Clause](./LICENSE)

This is free, libre, and open-source software. It comes down to four essential freedoms [[ref]](https://seirdy.one/2021/01/27/whatsapp-and-the-domestication-of-users.html#fnref:2):

- The freedom to run the program as you wish, for any purpose
- The freedom to study how the program works, and change it so it does your computing as you wish
- The freedom to redistribute copies so you can help others
- The freedom to distribute copies of your modified versions to others

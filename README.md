https://github.com/test47-web/xml-parser.ts/releases

# XML Parser TS: Lightweight, Zero-Dependency XML to JSON Converter Toolkit

[![Release status](https://img.shields.io/github/v/release/test47-web/xml-parser.ts?logo=github&style=flat-square)](https://github.com/test47-web/xml-parser.ts/releases)

A lightweight, zero-dependency XML parser for TypeScript/JavaScript that converts XML strings to JavaScript objects and vice versa.

This project focuses on simplicity, speed, and broad compatibility. It runs in both the browser and Node.js without any extra runtime dependencies. It emphasizes a pleasant developer experience, small bundle sizes, and straightforward semantics for common XML structures. The parser is designed to be deterministic, easy to reason about, and friendly to isomorphic codebases.

Embrace bidirectional conversion, clear data models, and predictable behavior across environments.

Table of contents
- Why this project
- Core concepts
- Features
- Quick start
- API reference
- Data model and examples
- Best practices and caveats
- Performance and optimization
- Browser and Node usage
- Isomorphism and bundling
- Testing and debugging
- Contributing
- Changelog
- License
- Keywords and topics

Why this project
XML remains a common format for configuration, data exchange, and document storage. Many XML parsers in the JavaScript ecosystem require heavy dependencies or produce verbose, hard-to-map structures. This project aims to fill a niche: a small, dependable XML parser that converts XML into clean JavaScript objects and can serialize objects back into XML, with a minimal footprint and no runtime dependencies.

The library is built with TypeScript in mind, but it remains usable from plain JavaScript as well. It targets isomorphic use cases, meaning the same code can run in the browser or in Node.js without modification. The goal is straightforward: provide a dependable tool for developers who want to move data between XML and JSON-like objects without friction.

Core concepts
- XML to JSON-like objects: The parser reads an XML string and returns a structured JavaScript object representation. The representation is designed to be intuitive for common XML structures and easy to navigate with standard JavaScript APIs.
- JSON to XML: The serializer takes a JavaScript object (in the same shape as produced by the parser or a natural variant) and turns it into a well-formed XML string.
- Deterministic structure: The output follows a consistent, predictable model. This makes it easy to write tests, transform data, and integrate with other parts of a codebase.
- Zero dependencies: The library never pulls in external code at runtime. It ships as a small, standalone package that can be dropped into projects without worrying about transitive dependencies.
- Isomorphic by design: The code path works equally well in browsers and Node environments. This enables shared data handling logic across platforms.
- Simple configuration: Optional options allow you to tweak whitespace handling, attribute representation, and other parsing behavior without introducing complexity.

Features
- XML to JSON-like object conversion
- JSON-like object to XML string conversion
- Lightweight footprint with zero runtime dependencies
- Simple, predictable data model for elements, attributes, and text
- Browser and Node compatibility (isomorphic)
- Clear error handling with helpful messages
- Optional customization for attributes and text handling
- Small API surface, easy to learn
- Clear TypeScript typings, friendly to JS users as well
- Friendly to tooling and bundlers (ESM and CJS support, tree-shaking friendly)
- Quick-to-integrate with existing codebases

Quick start
Install
- npm:
  npm install xml-parser.ts

Usage in TypeScript
- Parse XML into an object
  import { parseXml } from 'xml-parser.ts';

  const xml = `<note id="n1"><to>Alice</to><from>Bob</from><heading>Reminder</heading><body>Hello!</body></note>`;
  const doc = parseXml(xml);
  console.log(JSON.stringify(doc, null, 2));

- Convert an object back to XML
  import { toXml } from 'xml-parser.ts';

  const obj = {
    note: {
      $: { id: 'n1' },
      to: 'Alice',
      from: 'Bob',
      heading: 'Reminder',
      body: 'Hello!'
    }
  };

  const xmlAgain = toXml(obj);
  console.log(xmlAgain);

Usage in plain JavaScript
- If you use plain JavaScript, you can import the same functions from the package and use them with commonJS or ESM syntax, depending on your setup.

What the basic flow looks like
- You provide an XML string.
- The parser converts that string into a JavaScript object with a predictable structure.
- You can inspect, transform, or modify the object using standard JavaScript.
- You can then feed the object to the serializer to produce XML again.

A minimal example showing round-trip conversion
- The example demonstrates a simple, readable representation for both directions.

Code snippet (TypeScript)
import { parseXml, toXml } from 'xml-parser.ts';

const xml = `<library>
  <book id="b1">
    <title>XML Essentials</title>
    <author>Jane Doe</author>
  </book>
  <book id="b2">
    <title>TypeScript In Practice</title>
    <author>John Smith</author>
  </book>
</library>`;

const data = parseXml(xml);

console.log('Parsed data:', JSON.stringify(data, null, 2));

const rebuiltXml = toXml(data);
console.log('Rebuilt XML:', rebuiltXml);

The example above should be enough to illustrate a clean round-trip: parse the XML into a JavaScript object, then serialize that object back into XML. In a real project you would typically parse XML data from an external source, transform it to fit your internal models, and then optionally write it back out to XML for interoperability.

API reference
Exported functions
- parseXml(xml: string, options?: ParseOptions): XmlNode
  - Returns a hierarchical object that models the XML structure.
  - XmlNode includes the tag name, attributes, and children (which can be strings for text nodes or nested XmlNode objects).
  - Options allow toggling minor behaviors (for example, how you want attributes to be represented, whitespace handling, or how text content is captured).

- toXml(node: XmlNode | string, options?: BuildOptions): string
  - Converts a JavaScript object back into a well-formed XML string.
  - Accepts either a parsed XmlNode or a compatible plain object structure.
  - Options control formatting, whitespace, and whether to pretty-print the output.

Types and shape (illustrative)
Note: The exact shape can evolve, but the goal is to keep a stable, predictable model that developers can rely on.

type XmlAttributes = Record<string, string>;

interface XmlNode {
  name: string;
  attributes: XmlAttributes;
  children: Array<XmlNode | string>;
}

interface ParseOptions {
  // If true, preserve text nodes with surrounding whitespace.
  preserveWhitespace?: boolean;
  // If true, merge identical element children into arrays for repeatable tags.
  // This helps with representing multiple same-named elements.
  mergeRepeated?: boolean;
  // Custom function to transform attribute values on the fly.
  attributeTransformer?: (name: string, value: string) => string;
}

interface BuildOptions {
  // Pretty print the resulting XML with indentation.
  pretty?: boolean;
  // Indentation string for pretty printing (e.g., "  " or "\t").
  indent?: string;
  // If true, collapse empty elements into self-closing tags.
  selfClosingForEmpty?: boolean;
  // Custom function to transform values during serialization.
  valueTransformer?: (name: string, value: any) => string;
}

Examples of common structures
- Simple element with text
  XML:
  <greeting>Hello</greeting>

  Object:
  {
    name: 'greeting',
    attributes: {},
    children: ['Hello']
  }

- Element with attributes
  XML:
  <user id="u42" role="admin">Alex</user>

  Object:
  {
    name: 'user',
    attributes: { id: 'u42', role: 'admin' },
    children: ['Alex']
  }

- Nested elements
  XML:
  <library>
    <book id="b1">
      <title>XML Essentials</title>
      <author>Jane Doe</author>
    </book>
  </library>

  Object:
  {
    name: 'library',
    attributes: {},
    children: [
      {
        name: 'book',
        attributes: { id: 'b1' },
        children: [
          { name: 'title', attributes: {}, children: ['XML Essentials'] },
          { name: 'author', attributes: {}, children: ['Jane Doe'] }
        ]
      }
    ]
  }

- Text and elements mixed
  XML:
  <note id="n1">Reminder: Meeting at 3 PM</note>

  Object:
  {
    name: 'note',
    attributes: { id: 'n1' },
    children: ['Reminder: Meeting at 3 PM']
  }

Data model and mapping rules
- Tag names map to object keys in a flat, readable manner.
- Attributes are captured in an attributes map, typically under an attributes property, or merged into a dedicated attributes object for clarity.
- Text content is represented as strings in the children array. When an element contains only text, the children array may be a single string to keep the representation compact.
- Repeated tags with the same name can be modeled as arrays to preserve the order and allow easy iteration.

Common usage patterns
- Reading data from XML to use inside code
  - Transform to your internal domain models
  - Validate key fields early
  - Normalize attributes and nested structures
- Writing data back to XML for interoperability
  - Use the toXml function to ensure a consistent structure
  - Use the options to achieve the desired formatting and style
- Handling errors
  - The parser throws descriptive errors for invalid XML
  - Include try-catch blocks around parseXml to handle bad input gracefully

Best practices and caveats
- Make the most of the simple data model
  - Favor predictable shapes over clever abstractions
  - Keep your internal models aligned with the XML structure you care about
- Be mindful of whitespace
  - XML whitespace handling can vary, so use ParseOptions to control preservation if needed
- Use the same structure for round-trips
  - If you parse and then serialize, you should end up with well-formed XML. Do not rely on exact string equality if you don’t need exact formatting; focus on semantic equivalence.
- Attributes handling
  - Decide early how you want attributes represented in your data model. The default approach is to keep them in an attributes map, but different applications may prefer merging them into a dedicated structure.
- Isomorphic code
  - Write code that does not rely on browser- or Node-only features. The library is designed to run in both environments, but your surrounding code should be mindful of platform differences (e.g., file I/O is not part of the library itself).

Performance and optimization
- Zero-dependency architecture keeps bundle size small and reduces startup cost.
- The parser concentrates on common XML cases and avoids heavy parsing strategies. It prioritizes clarity and reliability over exotic XML features.
- Memory usage scales with document size and depth. For very large XML documents, consider streaming strategies or chunked processing if your environment supports it.
- Benchmarks are context dependent. In typical usage, this library provides fast parsing and serialization for everyday XML data without imposing a heavy runtime tax.

Browser and Node usage
- Browser
  - The library runs in modern browsers without special polyfills.
  - Works with module bundlers like Webpack, Rollup, Vite, and esbuild.
  - If you fetch XML from a server, you can parse the string after you receive it and work with the resulting object.
- Node
  - The library works in Node.js without native bindings.
  - You can use it to parse XML files read from disk, or XML strings obtained from external sources.
  - No extra runtime dependencies means a clean install in your CI environments.

Isomorphism and bundling
- The library is designed to be isomorphic. Your code that handles XML-to-JSON and back can be shared across client and server.
- ES Modules and CommonJS
  - The package provides both ES module and CommonJS entry points as appropriate. It is friendly to bundlers and tree-shaking.
- Tree-shaking friendly
  - The API surface is small and deliberate, allowing bundlers to prune unused code effectively.
- Interoperability with existing tooling
  - Works with TypeScript projects, as well as plain JavaScript projects.
  - No runtime dependencies makes it easy to integrate into diverse toolchains.

Testing and debugging
- Unit tests
  - Expect core behaviors: parsing common structures, attribute handling, text handling, and round-trip accuracy.
  - Include edge cases: empty elements, whitespace-only text, nested children, and mixed content.
- Debugging tips
  - Log the parsed object to verify structure before serialization.
  - Compare input XML with the output XML after a round trip to catch formatting or structural differences.
  - Use exact-structure comparisons in tests, not string equality for the serialized XML, unless formatting must be identical.
- Test data
  - Create representative XML samples for your domain (configuration files, data feeds, small documents) to ensure your tests reflect real-world usage.

Contributing
- How to contribute
  - Fork the repository.
  - Create a feature or bugfix branch with a descriptive name.
  - Add or update tests corresponding to your change.
  - Write clear, concise code and include inline comments where the logic could be unclear.
  - Update README or docs if your change adds new capabilities.
  - Submit a pull request with a descriptive summary of the change and its impact.
- Coding standards
  - Use clear variable and function names.
  - Keep functions small and focused.
  - Prefer explicit type annotations in TypeScript, but keep the API approachable for JavaScript users.
- Local development
  - Install dependencies (if any) and run tests locally.
  - Run type checks and linting as applicable to your setup.
- Issue reporting
  - When reporting issues, include a minimal reproducible example, the environment (Node version or browser), and the expected vs. actual behavior.

Changelog
- v0.x.y
  - Initial release with core XML to JSON and JSON to XML functionality.
  - Zero dependencies, isomorphic by design.
  - Basic parsing options and a clean object model.
- v0.x.y+1
  - Improvements to attribute handling and text preservation options.
  - Added example snippets and expanded documentation.
- v0.x.y+2
  - Performance tuning and better error messages.
  - Expanded API surface with optional transformers for attributes and values.
- future
  - Potential streaming support, additional formatting options, and richer data-model mapping.

License
- This project is released under an open-source license. See the LICENSE file in the repository for details.

Topics
- bidirectional
- browser
- converter
- isomorphic
- javascript
- json
- json-to-xml
- lightweight
- node
- parser
- typescript
- xml
- xml-parser
- xml-to-json
- zero-dependency

Final notes
- The goal is to provide a clean, practical tool for converting between XML and JSON-like objects in a predictable, straightforward way. It’s designed to be a solid building block for configuration management, data interchange, and lightweight document processing in both browser and Node environments.

If you are evaluating this library for a project, explore the Releases page to grab a stable version and relevant assets:
https://github.com/test47-web/xml-parser.ts/releases

For quick access to the latest release assets, you can use the badge above as a ready-made entry point to the Releases page. The link is there to help you get started quickly and to keep you aligned with the latest improvements and fixes.
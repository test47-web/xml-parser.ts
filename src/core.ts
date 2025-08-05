/**
 * Parse XML string to javascript object.
 *
 * Supported:
 * - Nested elements
 * - Text content (as string or number)
 * - Multiple root elements
 * - CDATA
 * - Self-closing elements
 *
 * Ignored:
 * - Metadata
 * - Comments
 *
 * Not supported:
 * - Attributes
 * - Comments
 * - Element with both child elements and text content
 * - XML comments inside CDATA
 *
 * @description
 * - Nested elements are parsed as object properties using tag name as property name.
 * - Element with text content is parsed as string or number.
 * - Element appears multiple times is parsed as array.
 *
 * @example
 * XML content:
 * ```xml
 * <annotation>
 *   <folder>images</folder>
 *   <filename>maksssksksss0.png</filename>
 *   <size>
 *     <width>512</width>
 *     <height>366</height>
 *   </size>
 *   <object>
 *     <x>79</x>
 *     <y>105</y>
 *   </object>
 *   <object>
 *     <x>185</x>
 *     <y>100</y>
 *   </object>
 * </annotation>
 * ```
 *
 * Parsed javascript object:
 * ```javascript
 * {
 *   annotation: {
 *     folder: "images",
 *     filename: "maksssksksss0.png",
 *     size: {
 *       width: 512,
 *       height: 366,
 *     },
 *     object: [
 *       { x: 79, y: 105 },
 *       { x: 185, y: 100 }
 *     ]
 *   }
 * }
 * ```
 */
export function xml_to_json(xml: string) {
  xml = remove_xml_comments(xml)
  xml = remove_xml_metadata(xml)

  if (!xml.includes('<')) {
    throw new Error('Invalid XML: no element found')
  }
  let properties: Properties = new Map()
  let offset = 0

  for (;;) {
    let element = parse_xml_element(xml, offset)
    add_property(properties, element.tag_name, element.properties)
    offset = element.offset
    if (offset == xml.length || xml.slice(offset).trim().length == 0) {
      break
    }
  }

  return Object.fromEntries(properties)
}

let cdata_start_pattern = '<![CDATA['
let cdata_end_pattern = ']]>'

/**
 * @description Parse a single root element from XML string.
 * - Metadata and comments should be removed before passing to this function.
 */
export function parse_xml_element(xml: string, offset: number) {
  let tag_name_start_index = xml.indexOf('<', offset)
  if (tag_name_start_index == -1) {
    throw new Error(
      `Invalid XML: symbol "<" not found for element opening, offset: ${offset}`,
    )
  }
  offset = tag_name_start_index + 1

  let tag_name_end_index = xml.indexOf('>', offset)
  if (tag_name_end_index == -1) {
    throw new Error(
      `Invalid XML: symbol ">" not found for element opening, offset: ${offset}`,
    )
  }
  let tag_content = xml.slice(tag_name_start_index + 1, tag_name_end_index)
  let content_start_index = tag_name_end_index + 1
  offset = content_start_index

  // Check if this is a self-closing element (e.g. '<box/>')
  if (tag_content.endsWith('/')) {
    // Self-closing element
    let tag_name = tag_content.slice(0, -1).trim()
    return {
      tag_name,
      properties: {},
      text_content: null,
      offset,
    }
  }

  let tag_name = tag_content.trim()
  let closing_tag = `</${tag_name}>`
  let element_end_index = xml.indexOf(closing_tag, offset)
  if (element_end_index == -1) {
    throw new Error(
      `Invalid XML: symbol "</${tag_name}>" not found for element closing, offset: ${offset}`,
    )
  }

  let properties: Properties = new Map()
  let text_content: string | null = null

  for (;;) {
    // Find the next '<' character
    let next_tag_index = xml.indexOf('<', offset)
    if (next_tag_index == -1) {
      throw new Error(
        `Invalid XML: symbol "<" not found for element closing or child element of element <${tag_name}>, offset: ${offset}`,
      )
    }

    if (next_tag_index == element_end_index) {
      // element ending
      offset = element_end_index + closing_tag.length
      break
    }

    // Check if this is a CDATA section
    if (
      xml.slice(next_tag_index, next_tag_index + cdata_start_pattern.length) ===
      cdata_start_pattern
    ) {
      // Parse CDATA
      offset = next_tag_index + cdata_start_pattern.length
      let end_index = xml.indexOf(cdata_end_pattern, offset)
      if (end_index == -1) {
        throw new Error(
          `Invalid XML: symbol "]]>" not found for CDATA closing, offset: ${next_tag_index}`,
        )
      }
      let cdata_content = xml.slice(offset, end_index)
      if (text_content == null) {
        text_content = ''
      }
      text_content += cdata_content
      offset = end_index + cdata_end_pattern.length
      continue
    }

    // Parse regular child element
    let child = parse_xml_element(xml, next_tag_index)

    let value
    if (child.text_content != null) {
      // object property
      value = parse_text_content(child.text_content)
    } else {
      // child element
      value = child.properties
    }

    add_property(properties, child.tag_name, value)

    offset = child.offset
  }

  if (properties.size == 0 && text_content == null) {
    text_content = xml.slice(content_start_index, element_end_index).trim()
  }

  return {
    tag_name,
    properties: Object.fromEntries(properties),
    text_content,
    offset,
  }
}

let comment_start_pattern = '<!--'
let comment_end_pattern = '-->'

export function remove_xml_comments(xml: string): string {
  for (;;) {
    let start_index = xml.indexOf(comment_start_pattern)
    if (start_index == -1) {
      return xml
    }
    let end_index = xml.indexOf(comment_end_pattern, start_index)
    if (end_index == -1) {
      throw new Error(
        `Invalid XML: symbol "-->" not found for comment closing, offset: ${start_index}`,
      )
    }
    let before = xml.slice(0, start_index)
    let after = xml.slice(end_index + comment_end_pattern.length)
    xml = before + after
  }
}

let metadata_start_pattern = '<?'
let metadata_end_pattern = '?>'
export function remove_xml_metadata(xml: string): string {
  for (;;) {
    let start_index = xml.indexOf(metadata_start_pattern)
    if (start_index == -1) {
      return xml
    }
    let end_index = xml.indexOf(metadata_end_pattern, start_index)
    if (end_index == -1) {
      throw new Error(
        `Invalid XML: symbol "?>" not found for metadata closing, offset: ${start_index}`,
      )
    }
    let before = xml.slice(0, start_index)
    let after = xml.slice(end_index + metadata_end_pattern.length)
    xml = before + after
  }
}

type Properties = Map<string, string | number | object>

function add_property(
  properties: Properties,
  tag_name: string,
  value: string | number | object,
) {
  if (!properties.has(tag_name)) {
    // new property (single value)
    properties.set(tag_name, value)
    return
  }

  let existing_value = properties.get(tag_name)
  if (Array.isArray(existing_value)) {
    // add to existing array
    existing_value.push(value)
  } else {
    // wrap values into a new array
    properties.set(tag_name, [existing_value, value])
  }
}

function parse_text_content(text: string): string | number {
  if (text == '') return ''
  let number = +text
  return Number.isNaN(number) ? text : number
}

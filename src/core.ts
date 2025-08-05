/**
 * Parse XML string to javascript object.
 *
 * Supported:
 * - Nested elements
 * - Text content (as string or number)
 * - Multiple root elements
 * - CDATA
 *
 * Ignored:
 * - Metadata
 * - Comments
 *
 * Not supported:
 * - Attributes
 * - Comments
 * - Element with both child elements and text content
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

  // skip metadata, e.g. `<?xml version="1.0" encoding="UTF-8"?>`
  let metadata_start_index = xml.indexOf('<?')
  if (metadata_start_index != -1) {
    offset = metadata_start_index
    let metadata_end_index = xml.indexOf('?>', offset)
    if (metadata_end_index == -1) {
      throw new Error(
        `Invalid XML: symbol "?>" not found for metadata closing, offset: ${offset}`,
      )
    }
    offset = metadata_end_index + 2
  }

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
  let tag_name = xml.slice(tag_name_start_index + 1, tag_name_end_index)
  let content_start_index = tag_name_end_index + 1
  offset = content_start_index

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
    for (;;) {
      let cdata = parse_cdata(xml, offset)
      if (cdata.content == null) {
        break
      }
      if (text_content == null) {
        text_content = ''
      }
      text_content += cdata.content
      offset = cdata.offset
    }

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
    continue
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

let cdata_start_pattern = '<![CDATA['
let cdata_end_pattern = ']]>'

function parse_cdata(xml: string, offset: number) {
  let content: string | null = null

  let next_index = xml.indexOf('<', offset)
  if (next_index == -1) {
    // no more elements
    return { content, offset }
  }

  let start_index = xml.indexOf(cdata_start_pattern, offset)
  if (start_index == -1) {
    // no CDATA found
    return { content, offset }
  }

  if (next_index < start_index) {
    // CDATA is far away
    return { content, offset }
  }

  // CDATA found
  offset = start_index + cdata_start_pattern.length
  let end_index = xml.indexOf(cdata_end_pattern, offset)
  if (end_index == -1) {
    throw new Error(
      `Invalid XML: symbol "]]>" not found for CDATA closing, offset: ${start_index}`,
    )
  }
  content = xml.slice(offset, end_index)
  offset = end_index + cdata_end_pattern.length
  return { content, offset }
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

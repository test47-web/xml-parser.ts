/**
 * Parse XML string to javascript object.
 *
 * Support:
 * - Nested elements
 * - Text
 *
 * Not support:
 * - Attributes
 * - Comments
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
  if (!xml.includes('<')) {
    throw new Error('Invalid XML: no element found')
  }
  let element = parse_element(xml, 0)
  return {
    [element.tag_name]: element.properties,
  }
}

function parse_element(xml: string, offset: number) {
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

  let properties = new Map<string, string | number | object>()

  for (;;) {
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

    let child = parse_element(xml, next_tag_index)

    let value
    if (child.text_content != null) {
      // object property
      value = parse_text_content(child.text_content)
    } else {
      // child element
      value = child.properties
    }

    if (!properties.has(child.tag_name)) {
      // new property (single value)
      properties.set(child.tag_name, value)
    } else {
      // existing property (array of values)
      let existing_value = properties.get(child.tag_name)
      if (Array.isArray(existing_value)) {
        existing_value.push(value)
      } else {
        properties.set(child.tag_name, [existing_value, value])
      }
    }

    offset = child.offset
    continue
  }

  let text_content =
    properties.size == 0
      ? xml.slice(content_start_index, element_end_index).trim()
      : null

  return {
    tag_name,
    properties: Object.fromEntries(properties),
    text_content,
    offset,
  }
}

function parse_text_content(text: string): string | number {
  if (text == '') return ''
  let number = +text
  return Number.isNaN(number) ? text : number
}

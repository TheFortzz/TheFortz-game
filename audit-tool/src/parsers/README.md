# HTML Parser

The HTMLParser extracts data from HTML files for the audit tool.

## Features

- **Element ID Extraction**: Finds all elements with `id` attributes and returns them as a Set for O(1) lookup
- **Event Handler Extraction**: Identifies all inline event handlers (onclick, oninput, onchange, etc.) and extracts the function calls
- **Interactive Element Detection**: Identifies buttons, inputs, selects, textareas, and links, checking whether they have event handlers

## Usage

```javascript
import { HTMLParser } from './parsers/HTMLParser.js';

const parser = new HTMLParser('path/to/file.html');
const data = parser.parse();

console.log('Element IDs:', data.elementIds);
console.log('Event Handlers:', data.eventHandlers);
console.log('Interactive Elements:', data.interactiveElements);
```

## API

### `constructor(htmlFilePath)`
Creates a new HTMLParser instance.

### `parse()`
Parses the HTML file and returns an `HTMLData` object containing:
- `elementIds`: Set of all element IDs
- `eventHandlers`: Array of event handler objects
- `interactiveElements`: Array of interactive element objects

### `getElementIds()`
Returns a Set of all element IDs found in the HTML.

### `getEventHandlers()`
Returns an array of event handler objects, each containing:
- `elementId`: ID of the element (or null)
- `eventType`: Type of event (e.g., 'onclick')
- `functionCall`: The function call string
- `lineNumber`: Line number in the HTML file

### `getInteractiveElements()`
Returns an array of interactive element objects, each containing:
- `elementId`: ID of the element (or null)
- `tagName`: HTML tag name
- `hasEventHandler`: Boolean indicating if element has an event handler
- `lineNumber`: Line number in the HTML file

## Testing

The HTMLParser has comprehensive test coverage:
- Unit tests with synthetic HTML
- Integration tests with the actual TheFortz HTML file

Run tests with:
```bash
npm test -- audit-tool/tests/HTMLParser
```

## Results from TheFortz HTML

When tested against the actual TheFortz HTML file:
- **217 element IDs** found
- **104 event handlers** found
- **144 interactive elements** found (101 buttons, 35 inputs, 6 selects, 2 links)
- **99 elements with handlers**, **45 without handlers**

# JavaScript-HTML Connection Audit Tool

A static analysis tool for identifying disconnected functions, broken event handlers, and unused code in JavaScript/HTML applications.

## Features

- **Orphaned Function Detection**: Identifies JavaScript functions that reference non-existent HTML elements
- **Broken Event Handler Detection**: Finds HTML elements with event handlers calling non-existent JavaScript functions
- **Unused Function Detection**: Locates JavaScript functions that are never called (dead code)
- **Non-Functional Element Detection**: Identifies interactive HTML elements without event handlers
- **UI Pattern Validation**: Validates common UI patterns (modals, tabs, forms, navigation)
- **Auto-Fix**: Automatically fixes simple issues with backup creation

## Installation

The tool uses dependencies from the parent project. Ensure the following packages are installed:

```bash
npm install --save-dev cheerio @babel/parser glob fs-extra fast-check typescript @types/node
```

## Usage

### Basic Usage

```bash
node audit-tool/src/index.js
```

### With Custom Paths

```bash
node audit-tool/src/index.js --html src/client/index.html --js src/client/js
```

### Generate JSON Report Only

```bash
node audit-tool/src/index.js --format json
```

### Enable Auto-Fix

```bash
node audit-tool/src/index.js --fix
```

### Using npm Scripts

```bash
cd audit-tool
npm run audit
npm run audit:fix
```

## Command-Line Options

- `-h, --html <path>`: Path to HTML file (default: `src/client/index.html`)
- `-j, --js <path>`: Path to JavaScript directory (default: `src/client/js`)
- `-o, --output <path>`: Path to output directory (default: `audit-tool/output`)
- `-f, --format <format>`: Report format: `markdown`, `json`, or `both` (default: `both`)
- `--fix`: Enable auto-fix mode (default: `false`)
- `--help`: Display help message

## Output

The tool generates reports in the specified output directory:

- `audit-report.md`: Human-readable markdown report
- `audit-report.json`: Machine-readable JSON report
- `backups/`: Directory containing file backups (when using auto-fix)

## Architecture

The tool follows a pipeline architecture:

1. **Parsing Stage**: Extract data from HTML and JavaScript files
2. **Analysis Stage**: Cross-reference parsed data to identify issues
3. **Reporting Stage**: Generate structured reports
4. **Fix Stage** (optional): Apply automated fixes

## Development

### Running Tests

```bash
npm test
```

### Project Structure

```
audit-tool/
├── src/
│   ├── index.js          # Main entry point
│   ├── parsers/          # HTML and JS parsers
│   ├── analyzer/         # Analysis logic
│   ├── reporter/         # Report generation
│   └── fixer/            # Auto-fix functionality
├── tests/                # Test files
├── output/               # Generated reports
├── package.json
├── tsconfig.json
└── README.md
```

## Requirements

- Node.js 18+
- ES Modules support

## License

MIT

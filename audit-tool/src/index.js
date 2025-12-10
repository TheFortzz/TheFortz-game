#!/usr/bin/env node

/**
 * JavaScript-HTML Connection Audit Tool
 * 
 * This tool analyzes JavaScript and HTML files to identify:
 * - Orphaned functions (JS references non-existent HTML elements)
 * - Broken event handlers (HTML references non-existent JS functions)
 * - Unused functions (dead code)
 * - Non-functional interactive elements
 * - Incomplete UI patterns
 */

import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { HTMLParser, JavaScriptParser } from './parsers/index.js';
import { Analyzer } from './analyzer/index.js';
import { ReportGenerator } from './reporter/index.js';
import { AutoFixer } from './fixer/index.js';

/**
 * Progress indicator utilities
 */
class ProgressIndicator {
  constructor(total, label) {
    this.total = total;
    this.current = 0;
    this.label = label;
    this.startTime = Date.now();
  }

  update(current, message = '') {
    this.current = current;
    const percentage = Math.round((current / this.total) * 100);
    const elapsed = Date.now() - this.startTime;
    const eta = current > 0 ? Math.round((elapsed / current) * (this.total - current)) : 0;
    
    const progressBar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
    const etaStr = eta > 0 ? ` ETA: ${Math.round(eta / 1000)}s` : '';
    
    process.stdout.write(`\r  ${this.label}: [${progressBar}] ${percentage}%${etaStr} ${message}`);
    
    if (current === this.total) {
      console.log(); // New line when complete
    }
  }

  complete(message = 'Complete') {
    this.update(this.total, message);
  }
}

/**
 * Parse command-line arguments
 */
function parseCommandLineArgs() {
  const { values } = parseArgs({
    options: {
      html: {
        type: 'string',
        short: 'h',
        default: 'src/client/index.html'
      },
      js: {
        type: 'string',
        short: 'j',
        default: 'src/client/js'
      },
      output: {
        type: 'string',
        short: 'o',
        default: 'audit-tool/output'
      },
      format: {
        type: 'string',
        short: 'f',
        default: 'both'
      },
      fix: {
        type: 'boolean',
        default: false
      },
      help: {
        type: 'boolean',
        default: false
      }
    }
  });

  return values;
}

/**
 * Display help message
 */
function displayHelp() {
  console.log(`
JavaScript-HTML Connection Audit Tool

Usage: node audit-tool/src/index.js [options]

Options:
  -h, --html <path>      Path to HTML file (default: src/client/index.html)
  -j, --js <path>        Path to JavaScript directory (default: src/client/js)
  -o, --output <path>    Path to output directory (default: audit-tool/output)
  -f, --format <format>  Report format: markdown, json, or both (default: both)
  --fix                  Enable auto-fix mode (default: false)
  --help                 Display this help message

Examples:
  node audit-tool/src/index.js
  node audit-tool/src/index.js --html src/client/index.html --js src/client/js
  node audit-tool/src/index.js --format json --output ./reports
  node audit-tool/src/index.js --fix
  `);
}

/**
 * Validate command-line arguments
 */
function validateArgs(args) {
  const errors = [];

  // Validate HTML file
  const htmlPath = resolve(args.html);
  if (!existsSync(htmlPath)) {
    errors.push(`HTML file not found: ${htmlPath}`);
  }

  // Validate JS directory
  const jsPath = resolve(args.js);
  if (!existsSync(jsPath)) {
    errors.push(`JavaScript directory not found: ${jsPath}`);
  }

  // Validate format
  const validFormats = ['markdown', 'json', 'both'];
  if (!validFormats.includes(args.format)) {
    errors.push(`Invalid format: ${args.format}. Must be one of: ${validFormats.join(', ')}`);
  }

  return errors;
}

/**
 * Main execution function
 */
async function main() {
  console.log('🔍 JavaScript-HTML Connection Audit Tool\n');

  // Parse arguments
  const args = parseCommandLineArgs();

  // Display help if requested
  if (args.help) {
    displayHelp();
    process.exit(0);
  }

  // Validate arguments
  const errors = validateArgs(args);
  if (errors.length > 0) {
    console.error('❌ Validation errors:');
    errors.forEach(error => console.error(`  - ${error}`));
    console.error('\nUse --help for usage information.');
    process.exit(1);
  }

  console.log('Configuration:');
  console.log(`  HTML file: ${resolve(args.html)}`);
  console.log(`  JS directory: ${resolve(args.js)}`);
  console.log(`  Output directory: ${resolve(args.output)}`);
  console.log(`  Report format: ${args.format}`);
  console.log(`  Auto-fix: ${args.fix ? 'enabled' : 'disabled'}`);
  console.log();

  try {
    // Stage 1: Parsing files
    console.log('📄 Stage 1: Parsing files...');
    
    const parseProgress = new ProgressIndicator(2, 'Parsing');
    
    // Parse HTML file
    parseProgress.update(0, 'Loading HTML file...');
    const htmlParser = new HTMLParser(resolve(args.html));
    const htmlData = await htmlParser.parse();
    parseProgress.update(1, `Found ${htmlData.elementIds.size} elements, ${htmlData.eventHandlers.length} handlers`);
    
    // Parse JavaScript files
    parseProgress.update(1, 'Scanning JavaScript files...');
    const jsParser = new JavaScriptParser(resolve(args.js));
    const jsData = await jsParser.parse();
    parseProgress.complete(`Found ${jsData.functions.size} functions, ${jsData.domQueries.length} DOM queries`);

    // Stage 2: Analyzing connections
    console.log('\n🔬 Stage 2: Analyzing connections...');
    
    const analysisProgress = new ProgressIndicator(5, 'Analysis');
    const analyzer = new Analyzer(htmlData, jsData);
    
    analysisProgress.update(1, 'Finding orphaned functions...');
    const orphanedFunctions = analyzer.findOrphanedFunctions();
    
    analysisProgress.update(2, 'Finding broken event handlers...');
    const brokenHandlers = analyzer.findBrokenEventHandlers();
    
    analysisProgress.update(3, 'Finding unused functions...');
    const unusedFunctions = analyzer.findUnusedFunctions();
    
    analysisProgress.update(4, 'Finding non-functional elements...');
    const nonFunctionalElements = analyzer.findNonFunctionalElements();
    
    analysisProgress.update(5, 'Validating UI patterns...');
    const patternIssues = analyzer.validateUIPatterns();
    analysisProgress.complete('Analysis complete');

    const analysisResults = {
      orphanedFunctions,
      brokenHandlers,
      unusedFunctions,
      nonFunctionalElements,
      patternIssues
    };

    // Stage 3: Generating reports
    console.log('\n📊 Stage 3: Generating reports...');
    
    const reportProgress = new ProgressIndicator(3, 'Reporting');
    const reportGenerator = new ReportGenerator(analysisResults);
    
    reportProgress.update(1, 'Generating reports...');
    
    // Generate and save reports based on format
    const outputDir = resolve(args.output);
    
    if (args.format === 'markdown' || args.format === 'both') {
      reportProgress.update(2, 'Saving markdown report...');
      await reportGenerator.saveReport('markdown', outputDir);
    }
    
    if (args.format === 'json' || args.format === 'both') {
      reportProgress.update(2, 'Saving JSON report...');
      await reportGenerator.saveReport('json', outputDir);
    }
    
    reportProgress.complete('Reports saved');
    
    // Print summary to console
    console.log('\n📋 Summary:');
    reportGenerator.printSummary();

    // Stage 4: Apply fixes (if enabled)
    if (args.fix) {
      console.log('\n🔧 Stage 4: Applying fixes...');
      
      const autoFixer = new AutoFixer(analysisResults, { createBackups: true });
      const safeFixes = autoFixer.getSafeFixes();
      
      if (safeFixes.length === 0) {
        console.log('  No safe fixes available.');
      } else {
        const fixProgress = new ProgressIndicator(safeFixes.length, 'Fixing');
        
        console.log(`  Found ${safeFixes.length} safe fixes to apply:`);
        safeFixes.forEach((fix, index) => {
          console.log(`    ${index + 1}. ${fix.description}`);
        });
        
        console.log('\n  Applying fixes...');
        const fixResults = await autoFixer.applyFixes(safeFixes);
        
        fixProgress.complete(`Applied ${fixResults.applied.length} fixes`);
        
        if (fixResults.failed.length > 0) {
          console.log(`\n  ⚠️  ${fixResults.failed.length} fixes failed:`);
          fixResults.failed.forEach(({ fix, error }) => {
            console.log(`    - ${fix.description}: ${error}`);
          });
        }
        
        console.log(`\n  📁 Backups created in: ${fixResults.backupPaths[0]?.split('/').slice(0, -1).join('/') || 'N/A'}`);
      }
    }

    // Final summary
    const totalIssues = orphanedFunctions.length + brokenHandlers.length + 
                       unusedFunctions.length + nonFunctionalElements.length + 
                       patternIssues.length;
    
    console.log('\n✅ Audit complete!');
    console.log(`   Found ${totalIssues} total issues`);
    console.log(`   Reports saved to: ${outputDir}`);
    
    if (args.fix && totalIssues > 0) {
      console.log('   Some issues may require manual fixing');
    }

  } catch (error) {
    console.error('\n❌ Error during audit:');
    console.error(error.message || error);
    
    if (process.env.NODE_ENV === 'development') {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    
    process.exit(1);
  }
}

// Run the tool
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

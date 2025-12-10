/**
 * HTMLParser integration tests
 * 
 * Tests the HTMLParser with the actual TheFortz HTML file
 */

import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { HTMLParser } from '../src/parsers/HTMLParser.js';

const htmlFilePath = resolve('src/client/index.html');

describe('HTMLParser Integration Tests', () => {
  it('should parse the actual TheFortz HTML file', () => {
    // Skip if file doesn't exist
    if (!existsSync(htmlFilePath)) {
      console.log('Skipping integration test: HTML file not found');
      return;
    }

    const parser = new HTMLParser(htmlFilePath);
    const data = parser.parse();
    
    expect(data).toBeDefined();
    expect(data.elementIds).toBeInstanceOf(Set);
    expect(data.eventHandlers).toBeInstanceOf(Array);
    expect(data.interactiveElements).toBeInstanceOf(Array);
    
    console.log(`\nTheFortz HTML Analysis:`);
    console.log(`  Element IDs found: ${data.elementIds.size}`);
    console.log(`  Event handlers found: ${data.eventHandlers.length}`);
    console.log(`  Interactive elements found: ${data.interactiveElements.length}`);
  });

  it('should extract element IDs from TheFortz HTML', () => {
    if (!existsSync(htmlFilePath)) {
      return;
    }

    const parser = new HTMLParser(htmlFilePath);
    parser.parse();
    const ids = parser.getElementIds();
    
    expect(ids.size).toBeGreaterThan(0);
    
    // Log some sample IDs
    const sampleIds = Array.from(ids).slice(0, 10);
    console.log(`\nSample Element IDs:`, sampleIds);
  });

  it('should extract event handlers from TheFortz HTML', () => {
    if (!existsSync(htmlFilePath)) {
      return;
    }

    const parser = new HTMLParser(htmlFilePath);
    parser.parse();
    const handlers = parser.getEventHandlers();
    
    // Log some sample handlers
    const sampleHandlers = handlers.slice(0, 5);
    console.log(`\nSample Event Handlers:`);
    sampleHandlers.forEach(h => {
      console.log(`  ${h.eventType}: ${h.functionCall} (element: ${h.elementId || 'no-id'})`);
    });
  });

  it('should extract interactive elements from TheFortz HTML', () => {
    if (!existsSync(htmlFilePath)) {
      return;
    }

    const parser = new HTMLParser(htmlFilePath);
    parser.parse();
    const elements = parser.getInteractiveElements();
    
    expect(elements.length).toBeGreaterThan(0);
    
    // Count by type
    const counts = elements.reduce((acc, el) => {
      acc[el.tagName] = (acc[el.tagName] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`\nInteractive Elements by Type:`, counts);
    
    // Count with/without handlers
    const withHandlers = elements.filter(e => e.hasEventHandler).length;
    const withoutHandlers = elements.filter(e => !e.hasEventHandler).length;
    
    console.log(`  With event handlers: ${withHandlers}`);
    console.log(`  Without event handlers: ${withoutHandlers}`);
  });
});

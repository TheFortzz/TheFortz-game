/**
 * HTMLParser - Extracts data from HTML files
 * 
 * This parser uses cheerio to analyze HTML files and extract:
 * - Element IDs
 * - Event handlers (onclick, oninput, etc.)
 * - Interactive elements (buttons, inputs, etc.)
 */

import { readFileSync } from 'node:fs';
import * as cheerio from 'cheerio';

/**
 * @typedef {import('../types/index.js').HTMLData} HTMLData
 * @typedef {import('../types/index.js').EventHandler} EventHandler
 * @typedef {import('../types/index.js').InteractiveElement} InteractiveElement
 */

export class HTMLParser {
  /**
   * Create an HTMLParser instance
   * @param {string} htmlFilePath - Path to the HTML file to parse
   */
  constructor(htmlFilePath) {
    this.htmlFilePath = htmlFilePath;
    this.$ = null;
    this.htmlContent = null;
  }

  /**
   * Parse the HTML file and extract all data
   * @returns {HTMLData} Parsed HTML data
   */
  parse() {
    // Load HTML file
    this.htmlContent = readFileSync(this.htmlFilePath, 'utf-8');
    
    // Parse with cheerio
    this.$ = cheerio.load(this.htmlContent, {
      sourceCodeLocationInfo: true,
      xmlMode: false
    });

    // Extract all data
    const elementIds = this.getElementIds();
    const eventHandlers = this.getEventHandlers();
    const interactiveElements = this.getInteractiveElements();

    return {
      elementIds,
      eventHandlers,
      interactiveElements
    };
  }

  /**
   * Get all element IDs from the HTML
   * @returns {Set<string>} Set of element IDs
   */
  getElementIds() {
    const ids = new Set();
    
    if (!this.$) {
      throw new Error('Parser not initialized. Call parse() first.');
    }

    // Find all elements with id attribute
    this.$('[id]').each((_, element) => {
      const id = this.$(element).attr('id');
      if (id && id.trim()) {
        ids.add(id.trim());
      }
    });

    return ids;
  }

  /**
   * Get all event handlers from the HTML
   * @returns {EventHandler[]} Array of event handlers
   */
  getEventHandlers() {
    const handlers = [];
    
    if (!this.$) {
      throw new Error('Parser not initialized. Call parse() first.');
    }

    // List of event attributes to check
    const eventAttributes = [
      'onclick', 'ondblclick', 'onmousedown', 'onmouseup', 'onmouseover',
      'onmouseout', 'onmousemove', 'onkeydown', 'onkeyup', 'onkeypress',
      'onchange', 'oninput', 'onsubmit', 'onfocus', 'onblur', 'onload',
      'onunload', 'onresize', 'onscroll'
    ];

    // Check each event attribute
    eventAttributes.forEach(eventType => {
      this.$(`[${eventType}]`).each((_, element) => {
        const $element = this.$(element);
        const functionCall = $element.attr(eventType);
        const elementId = $element.attr('id') || null;
        const lineNumber = this._getLineNumber(element);

        if (functionCall && functionCall.trim()) {
          handlers.push({
            elementId,
            eventType,
            functionCall: functionCall.trim(),
            lineNumber
          });
        }
      });
    });

    return handlers;
  }

  /**
   * Get all interactive elements from the HTML
   * @returns {InteractiveElement[]} Array of interactive elements
   */
  getInteractiveElements() {
    const elements = [];
    
    if (!this.$) {
      throw new Error('Parser not initialized. Call parse() first.');
    }

    // Interactive element selectors
    const interactiveSelectors = [
      'button',
      'input',
      'select',
      'textarea',
      'a[href]'
    ];

    // Event attributes to check for handlers
    const eventAttributes = [
      'onclick', 'ondblclick', 'onmousedown', 'onmouseup', 'onmouseover',
      'onmouseout', 'onmousemove', 'onkeydown', 'onkeyup', 'onkeypress',
      'onchange', 'oninput', 'onsubmit', 'onfocus', 'onblur'
    ];

    // Find all interactive elements
    interactiveSelectors.forEach(selector => {
      this.$(selector).each((_, element) => {
        const $element = this.$(element);
        const elementId = $element.attr('id') || null;
        const tagName = element.tagName.toLowerCase();
        const lineNumber = this._getLineNumber(element);

        // Check if element has any event handler
        const hasEventHandler = eventAttributes.some(attr => 
          $element.attr(attr) !== undefined
        );

        elements.push({
          elementId,
          tagName,
          hasEventHandler,
          lineNumber
        });
      });
    });

    return elements;
  }

  /**
   * Get line number for an element
   * @private
   * @param {any} element - Cheerio element
   * @returns {number} Line number (1-indexed)
   */
  _getLineNumber(element) {
    // Try to get line number from source code location
    if (element.sourceCodeLocation) {
      return element.sourceCodeLocation.startLine || 0;
    }

    // Fallback: count newlines up to element position
    if (this.htmlContent && element.startIndex !== undefined) {
      const textBeforeElement = this.htmlContent.substring(0, element.startIndex);
      return textBeforeElement.split('\n').length;
    }

    return 0;
  }
}

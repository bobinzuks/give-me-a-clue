#!/usr/bin/env node

// Claude Code integration for Firefox navigation
const fs = require('fs');
const path = require('path');
const { sendCommand } = require('./websocket-server');

// Claude Code command interface
class ClaudeNavigator {
  constructor() {
    this.dataDir = path.join(__dirname, 'data');
  }
  
  // Highlight element on page
  highlight(selector, color = 'red') {
    sendCommand({
      action: 'highlight',
      selector: selector,
      color: color
    });
    return `Highlighting ${selector} in ${color}`;
  }
  
  // Click element
  click(selector) {
    sendCommand({
      action: 'click',
      selector: selector
    });
    return `Clicking ${selector}`;
  }
  
  // Type text in element
  type(selector, text) {
    sendCommand({
      action: 'type',
      selector: selector,
      text: text
    });
    return `Typing "${text}" in ${selector}`;
  }
  
  // Copy text from element
  copy(selector) {
    sendCommand({
      action: 'copy',
      selector: selector
    });
    
    // Wait a moment then read clipboard file
    setTimeout(() => {
      const clipboardFile = path.join(this.dataDir, 'clipboard.txt');
      if (fs.existsSync(clipboardFile)) {
        const text = fs.readFileSync(clipboardFile, 'utf8');
        console.log('Copied text:', text);
      }
    }, 1000);
    
    return `Copying text from ${selector}`;
  }
  
  // Draw box around element
  box(selector, color = 'red', label = '') {
    sendCommand({
      action: 'box',
      selector: selector,
      color: color,
      text: label
    });
    return `Drawing ${color} box around ${selector}${label ? ' with label: ' + label : ''}`;
  }
  
  // Show arrow at coordinates
  arrow(x, y, text = 'Click here') {
    sendCommand({
      action: 'arrow',
      x: x,
      y: y,
      text: text
    });
    return `Showing arrow at (${x}, ${y}) with text: ${text}`;
  }
  
  // Take screenshot
  screenshot() {
    sendCommand({ action: 'screenshot' });
    return 'Taking screenshot...';
  }
  
  // Get page content
  scrape() {
    sendCommand({ action: 'scrape' });
    
    // Return latest page data
    const files = fs.readdirSync(this.dataDir)
      .filter(f => f.startsWith('page-') && f.endsWith('.html'))
      .sort()
      .reverse();
    
    if (files.length > 0) {
      const latestFile = path.join(this.dataDir, files[0]);
      return `Page content saved to ${latestFile}`;
    }
    
    return 'Scraping page content...';
  }
  
  // Clear all overlays
  clear() {
    sendCommand({ action: 'clear' });
    return 'Clearing all overlays';
  }
  
  // Get latest screenshot path
  getLatestScreenshot() {
    const files = fs.readdirSync(this.dataDir)
      .filter(f => f.startsWith('screenshot-') && f.endsWith('.png'))
      .sort()
      .reverse();
    
    if (files.length > 0) {
      return path.join(this.dataDir, files[0]);
    }
    return null;
  }
  
  // Get latest page HTML
  getLatestPageHTML() {
    const files = fs.readdirSync(this.dataDir)
      .filter(f => f.startsWith('page-') && f.endsWith('.html'))
      .sort()
      .reverse();
    
    if (files.length > 0) {
      const htmlFile = path.join(this.dataDir, files[0]);
      return fs.readFileSync(htmlFile, 'utf8');
    }
    return null;
  }
  
  // Get latest page metadata
  getLatestPageMeta() {
    const files = fs.readdirSync(this.dataDir)
      .filter(f => f.startsWith('page-') && f.endsWith('.json'))
      .sort()
      .reverse();
    
    if (files.length > 0) {
      const metaFile = path.join(this.dataDir, files[0]);
      return JSON.parse(fs.readFileSync(metaFile, 'utf8'));
    }
    return null;
  }
  
  // Execute sequence of commands
  async executeSequence(commands) {
    for (const cmd of commands) {
      console.log(`Executing: ${cmd.action}`);
      sendCommand(cmd);
      
      // Add delay between commands
      await new Promise(resolve => setTimeout(resolve, cmd.delay || 1000));
    }
    return 'Sequence completed';
  }
  
  // Fill form fields
  async fillForm(formData) {
    const commands = [];
    
    for (const [selector, value] of Object.entries(formData)) {
      commands.push({
        action: 'type',
        selector: selector,
        text: value,
        delay: 500
      });
    }
    
    return this.executeSequence(commands);
  }
  
  // Navigate workflow
  async navigateWorkflow(steps) {
    console.log('Starting navigation workflow...');
    
    for (const step of steps) {
      console.log(`Step: ${step.description}`);
      
      if (step.highlight) {
        this.highlight(step.selector, step.color || 'blue');
      }
      
      if (step.action === 'click') {
        this.click(step.selector);
      } else if (step.action === 'type') {
        this.type(step.selector, step.text);
      } else if (step.action === 'scroll') {
        sendCommand({
          action: 'scroll',
          selector: step.selector
        });
      }
      
      // Wait before next step
      await new Promise(resolve => setTimeout(resolve, step.wait || 2000));
    }
    
    return 'Workflow completed';
  }
}

// Export for Claude Code
module.exports = ClaudeNavigator;

// CLI interface for testing
if (require.main === module) {
  const navigator = new ClaudeNavigator();
  
  // Example usage
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch(command) {
    case 'highlight':
      console.log(navigator.highlight(args[1], args[2]));
      break;
    case 'click':
      console.log(navigator.click(args[1]));
      break;
    case 'type':
      console.log(navigator.type(args[1], args.slice(2).join(' ')));
      break;
    case 'screenshot':
      console.log(navigator.screenshot());
      break;
    case 'scrape':
      console.log(navigator.scrape());
      break;
    case 'clear':
      console.log(navigator.clear());
      break;
    default:
      console.log(`
Usage: node claude-integration.js <command> [args]

Commands:
  highlight <selector> [color] - Highlight element
  click <selector> - Click element  
  type <selector> <text> - Type in element
  screenshot - Take screenshot
  scrape - Get page content
  clear - Clear overlays
      `);
  }
}
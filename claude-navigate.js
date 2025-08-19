#!/usr/bin/env node

// Claude Code Browser Navigation Interface
const ClaudeNavigator = require('./firefox-extension/server/claude-integration');
const navigator = new ClaudeNavigator();

// Parse command from Claude Code
const command = process.argv[2];
const args = process.argv.slice(3);

// Execute navigation commands
async function execute() {
  switch(command) {
    case 'highlight':
      return navigator.highlight(args[0], args[1]);
    
    case 'click':
      return navigator.click(args[0]);
    
    case 'type':
      return navigator.type(args[0], args.slice(1).join(' '));
    
    case 'copy':
      return navigator.copy(args[0]);
    
    case 'box':
      return navigator.box(args[0], args[1], args.slice(2).join(' '));
    
    case 'arrow':
      return navigator.arrow(parseInt(args[0]), parseInt(args[1]), args.slice(2).join(' '));
    
    case 'screenshot':
      return navigator.screenshot();
    
    case 'scrape':
      return navigator.scrape();
    
    case 'clear':
      return navigator.clear();
    
    case 'fill-form':
      const formData = {};
      for (let i = 0; i < args.length; i += 2) {
        formData[args[i]] = args[i + 1];
      }
      return navigator.fillForm(formData);
    
    default:
      console.log('Usage: node claude-navigate.js <command> [args]');
      console.log('Commands: highlight, click, type, copy, box, arrow, screenshot, scrape, clear, fill-form');
      process.exit(1);
  }
}

execute().then(result => {
  console.log(result);
}).catch(error => {
  console.error('Error:', error);
  process.exit(1);
});

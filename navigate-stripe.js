#!/usr/bin/env node

// Direct WebSocket client for navigating Stripe
const WebSocket = require('ws');

async function navigateStripe(command, args) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket('ws://localhost:8765');
    
    ws.on('open', () => {
      // Wait a moment for connection to establish
      setTimeout(() => {
        const message = {
          action: command,
          ...args
        };
        
        console.log('Sending command:', message);
        ws.send(JSON.stringify(message));
        
        // Give it time to execute
        setTimeout(() => {
          ws.close();
          resolve(`Command sent: ${command}`);
        }, 1500);
      }, 100);
    });
    
    ws.on('error', (error) => {
      reject(`WebSocket error: ${error.message}`);
    });
    
    ws.on('message', (data) => {
      console.log('Response:', data.toString());
    });
  });
}

// Parse command line arguments
const command = process.argv[2];
const selector = process.argv[3];
const extra = process.argv[4];

if (!command) {
  console.log('Usage: node navigate-stripe.js <command> [selector] [extra]');
  console.log('Commands:');
  console.log('  screenshot - Take a screenshot');
  console.log('  click <selector> - Click an element');
  console.log('  type <selector> <text> - Type text');
  console.log('  highlight <selector> [color] - Highlight element');
  console.log('  clear - Clear all overlays');
  console.log('  scrape - Get page content');
  process.exit(1);
}

// Execute command
const args = {};
if (selector) args.selector = selector;
if (extra) {
  if (command === 'type') args.text = extra;
  else if (command === 'highlight') args.color = extra;
}

navigateStripe(command, args)
  .then(result => console.log(result))
  .catch(error => console.error('Error:', error));
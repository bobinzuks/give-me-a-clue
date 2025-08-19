#!/usr/bin/env node

const WebSocket = require('ws');

// Get command from arguments
const action = process.argv[2];
const selector = process.argv[3];
const extra = process.argv[4];

if (!action) {
  console.log('Usage: node send-command.js <action> [selector] [extra]');
  console.log('Actions: highlight, click, type, screenshot, clear');
  process.exit(1);
}

// Create WebSocket connection
const ws = new WebSocket('ws://localhost:8765');

ws.on('open', () => {
  console.log('Connected to server');
  
  // Build command
  const command = { action };
  if (selector) command.selector = selector;
  if (extra) {
    if (action === 'type') command.text = extra;
    else if (action === 'highlight') command.color = extra;
  }
  
  console.log('Sending:', command);
  
  // Send command
  ws.send(JSON.stringify(command));
  
  // Wait for response
  setTimeout(() => {
    ws.close();
    console.log('Command sent');
  }, 1000);
});

ws.on('error', (err) => {
  console.error('Connection error:', err.message);
});

ws.on('message', (data) => {
  console.log('Response:', data.toString());
});
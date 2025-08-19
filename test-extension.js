#!/usr/bin/env node

const WebSocket = require('ws');

console.log('🧪 Testing Firefox Extension Connection\n');

const ws = new WebSocket('ws://localhost:8765');

ws.on('open', () => {
  console.log('✅ Connected to WebSocket server on port 8765');
  console.log('\nNow testing commands...\n');
  
  // Test screenshot command
  const testCommand = {
    action: 'screenshot'
  };
  
  console.log('📸 Sending screenshot command...');
  ws.send(JSON.stringify(testCommand));
});

ws.on('message', (data) => {
  console.log('📨 Response from server:', data.toString());
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error.message);
  console.log('\nTroubleshooting:');
  console.log('1. Make sure the server is running: ./start-navigator.sh');
  console.log('2. Check that Firefox extension is loaded');
  console.log('3. Click extension icon and connect to server');
});

ws.on('close', () => {
  console.log('\n👋 Connection closed');
});

// Close after 5 seconds
setTimeout(() => {
  console.log('\n✅ Test complete');
  ws.close();
  process.exit(0);
}, 5000);
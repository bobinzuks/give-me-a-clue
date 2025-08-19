#!/usr/bin/env node

const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// WebSocket server
const wss = new WebSocket.Server({ port: 8765 });

console.log('🚀 Fixed WebSocket Server running on port 8765');

const clients = new Set();
let browserClient = null;

wss.on('connection', (ws) => {
  console.log('✅ New client connected');
  clients.add(ws);
  
  // Check if this is the browser extension
  let isBrowser = false;
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('📨 Received:', data.type || data.action || 'unknown');
      
      // If it's from browser (has type: pageInfo)
      if (data.type === 'pageInfo') {
        isBrowser = true;
        browserClient = ws;
        console.log('🌐 Browser extension identified');
        savePageData(data);
      }
      
      // If it's a command (has action field)
      if (data.action && !data.type) {
        console.log('🎯 Command received:', data.action);
        // Forward to browser
        if (browserClient && browserClient.readyState === WebSocket.OPEN) {
          console.log('➡️ Forwarding to browser');
          browserClient.send(JSON.stringify(data));
        } else {
          console.log('❌ No browser connected');
        }
      }
      
      // Handle other message types
      if (data.type === 'screenshot') {
        saveScreenshot(data.data);
      }
      
      if (data.type === 'action_result') {
        console.log(`✅ Action ${data.action} completed`);
      }
      
    } catch (error) {
      console.error('❌ Error parsing message:', error.message);
    }
  });
  
  ws.on('close', () => {
    console.log('👋 Client disconnected');
    clients.delete(ws);
    if (ws === browserClient) {
      browserClient = null;
      console.log('⚠️ Browser disconnected');
    }
  });
  
  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error.message);
  });
});

// Save page data
function savePageData(data) {
  const dataDir = path.join(__dirname, 'firefox-extension', 'server', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const metaFile = path.join(dataDir, `page-${timestamp}.json`);
  
  fs.writeFileSync(metaFile, JSON.stringify({
    url: data.url,
    title: data.title,
    timestamp: timestamp
  }, null, 2));
  
  console.log(`📄 Page: ${data.url}`);
}

// Save screenshot
function saveScreenshot(dataUrl) {
  const dataDir = path.join(__dirname, 'firefox-extension', 'server', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const screenshotFile = path.join(dataDir, `screenshot-${timestamp}.png`);
  
  const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync(screenshotFile, Buffer.from(base64Data, 'base64'));
  
  console.log(`📸 Screenshot saved`);
}

// Status check
setInterval(() => {
  console.log(`📊 Status: ${clients.size} clients, Browser: ${browserClient ? 'connected' : 'disconnected'}`);
}, 30000);

console.log('Ready to receive connections...');
console.log('Browser should connect automatically when extension is loaded');
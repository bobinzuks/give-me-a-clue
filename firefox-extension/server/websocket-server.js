#!/usr/bin/env node

const WebSocket = require('ws');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// WebSocket server for Claude Code communication
const wss = new WebSocket.Server({ port: 8765 });

console.log('Claude Code WebSocket Server running on port 8765');

// Store connected clients
const clients = new Set();
let currentPageData = null;

// Handle new connections
wss.on('connection', (ws) => {
  console.log('New client connected');
  clients.add(ws);
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleMessage(ws, data);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Handle messages from extension
function handleMessage(ws, data) {
  console.log('Received:', data.type);
  
  switch(data.type) {
    case 'pageInfo':
      currentPageData = data;
      savePageData(data);
      console.log(`Page loaded: ${data.url}`);
      break;
      
    case 'screenshot':
      saveScreenshot(data.data);
      console.log('Screenshot captured');
      break;
      
    case 'action_result':
      console.log(`Action ${data.action} completed: ${data.success}`);
      break;
      
    case 'copied_text':
      console.log(`Copied text: ${data.text.substring(0, 100)}...`);
      saveClipboard(data.text);
      break;
  }
}

// Save page data for Claude Code
function savePageData(data) {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const htmlFile = path.join(dataDir, `page-${timestamp}.html`);
  const metaFile = path.join(dataDir, `page-${timestamp}.json`);
  
  fs.writeFileSync(htmlFile, data.html);
  fs.writeFileSync(metaFile, JSON.stringify({
    url: data.url,
    title: data.title,
    viewport: data.viewport,
    timestamp: timestamp
  }, null, 2));
  
  console.log(`Page data saved to ${dataDir}`);
}

// Save screenshot
function saveScreenshot(dataUrl) {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const screenshotFile = path.join(dataDir, `screenshot-${timestamp}.png`);
  
  // Convert data URL to buffer
  const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync(screenshotFile, Buffer.from(base64Data, 'base64'));
  
  console.log(`Screenshot saved to ${screenshotFile}`);
}

// Save clipboard content
function saveClipboard(text) {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const clipboardFile = path.join(dataDir, 'clipboard.txt');
  fs.writeFileSync(clipboardFile, text);
  console.log('Clipboard content saved');
}

// Send command to all connected clients
function sendCommand(command) {
  const message = JSON.stringify(command);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// API for Claude Code to send commands
function executeCommand(commandString) {
  try {
    const command = JSON.parse(commandString);
    sendCommand(command);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Create command interface for Claude Code
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Command prompt for testing
function showPrompt() {
  rl.question('Command (help for list): ', (input) => {
    handleCommand(input);
    showPrompt();
  });
}

// Handle commands from CLI
function handleCommand(input) {
  const parts = input.trim().split(' ');
  const cmd = parts[0].toLowerCase();
  
  switch(cmd) {
    case 'help':
      console.log(`
Available commands:
  highlight <selector> [color] - Highlight elements
  click <selector> - Click an element
  scroll <selector> - Scroll to element
  type <selector> <text> - Type text in element
  copy <selector> - Copy text from element
  paste <selector> <text> - Paste text to element
  arrow <x> <y> [text] - Show arrow at coordinates
  box <selector> [color] [text] - Draw box around element
  screenshot - Take a screenshot
  scrape - Get page content
  clear - Clear all overlays
  status - Show connection status
  exit - Exit server
      `);
      break;
      
    case 'highlight':
      sendCommand({
        action: 'highlight',
        selector: parts[1],
        color: parts[2] || 'red'
      });
      break;
      
    case 'click':
      sendCommand({
        action: 'click',
        selector: parts[1]
      });
      break;
      
    case 'scroll':
      sendCommand({
        action: 'scroll',
        selector: parts[1]
      });
      break;
      
    case 'type':
      sendCommand({
        action: 'type',
        selector: parts[1],
        text: parts.slice(2).join(' ')
      });
      break;
      
    case 'copy':
      sendCommand({
        action: 'copy',
        selector: parts[1]
      });
      break;
      
    case 'paste':
      sendCommand({
        action: 'paste',
        selector: parts[1],
        text: parts.slice(2).join(' ')
      });
      break;
      
    case 'arrow':
      sendCommand({
        action: 'arrow',
        x: parseInt(parts[1]),
        y: parseInt(parts[2]),
        text: parts.slice(3).join(' ') || 'Click here'
      });
      break;
      
    case 'box':
      sendCommand({
        action: 'box',
        selector: parts[1],
        color: parts[2] || 'red',
        text: parts.slice(3).join(' ')
      });
      break;
      
    case 'screenshot':
      sendCommand({ action: 'screenshot' });
      break;
      
    case 'scrape':
      sendCommand({ action: 'scrape' });
      break;
      
    case 'clear':
      sendCommand({ action: 'clear' });
      break;
      
    case 'status':
      console.log(`Connected clients: ${clients.size}`);
      if (currentPageData) {
        console.log(`Current page: ${currentPageData.url}`);
      }
      break;
      
    case 'exit':
      process.exit(0);
      break;
      
    default:
      console.log('Unknown command. Type "help" for available commands.');
  }
}

// Export for use by Claude Code
module.exports = {
  sendCommand,
  executeCommand,
  getPageData: () => currentPageData,
  getClients: () => clients.size
};

// Start interactive prompt if run directly
if (require.main === module) {
  showPrompt();
}
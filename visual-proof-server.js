#!/usr/bin/env node

const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// Enhanced Visual Proof WebSocket Server
console.log('🎯 Starting Claude Code Visual Proof Server...');
console.log('==================================================');

const wss = new WebSocket.Server({ port: 8765 });
let clients = new Map();
let browserExtension = null;
let actionCounter = 0;
let screenshotCounter = 0;

// Create proof directories
const proofDir = path.join(__dirname, 'proof');
const screenshotsDir = path.join(proofDir, 'screenshots');
const logsDir = path.join(proofDir, 'logs');

[proofDir, screenshotsDir, logsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Visual proof command templates
const VISUAL_PROOF_COMMANDS = {
  // Multi-color highlighting
  rainbowHighlight: (selectors) => ({
    action: 'multiHighlight',
    highlights: selectors.map((selector, i) => ({
      selector,
      color: ['#FF4444', '#44FF44', '#4444FF', '#FFAA44', '#AA44FF', '#44AAFF'][i % 6],
      text: `Element ${i + 1}`,
      style: 'glow'
    }))
  }),
  
  // Progressive highlighting
  progressiveHighlight: (selectors, delay = 1000) => 
    selectors.map((selector, i) => ({
      action: 'highlight',
      selector,
      color: '#FF4444',
      text: `Step ${i + 1}`,
      animation: 'claude-bounce',
      delay: i * delay
    })),
  
  // Visual workflow demonstration
  demonstrateWorkflow: (steps) => ({
    action: 'visualWorkflow',
    steps: steps.map((step, i) => ({
      ...step,
      stepNumber: i + 1,
      totalSteps: steps.length
    }))
  }),
  
  // Show visual breadcrumb trail
  showBreadcrumbs: (path) => ({
    action: 'breadcrumb',
    path: path
  }),
  
  // Enhanced screenshot with metadata
  enhancedScreenshot: (metadata = {}) => ({
    action: 'screenshot',
    options: {
      includeAnnotations: true,
      watermark: true,
      metadata: {
        timestamp: new Date().toISOString(),
        actionCount: actionCounter,
        ...metadata
      }
    }
  }),
  
  // Visual status update
  showStatus: (message, type = 'info') => ({
    action: 'showText',
    text: `${getStatusIcon(type)} ${message}`,
    position: { x: 0.85 * 1920, y: 100 }, // Assuming 1920px width
    options: {
      color: getStatusColor(type),
      duration: 3000,
      size: 'medium'
    }
  })
};

function getStatusIcon(type) {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    working: '⚙️'
  };
  return icons[type] || 'ℹ️';
}

function getStatusColor(type) {
  const colors = {
    info: '#44AAFF',
    success: '#44FF44',
    warning: '#FFAA44',
    error: '#FF4444',
    working: '#AA44FF'
  };
  return colors[type] || '#44AAFF';
}

// Enhanced logging with visual proof tracking
function logWithProof(message, data = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    message,
    data,
    actionNumber: ++actionCounter
  };
  
  console.log(`📝 [${actionCounter}] ${timestamp}: ${message}`);
  
  // Save to log file
  const logFile = path.join(logsDir, `visual-proof-${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  
  return logEntry;
}

// Save screenshot with enhanced metadata
function saveScreenshot(data, metadata = {}) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `proof-screenshot-${++screenshotCounter}-${timestamp}.png`;
    const filepath = path.join(screenshotsDir, filename);
    
    // Remove data URL prefix
    const base64Data = data.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(filepath, base64Data, 'base64');
    
    const screenshotInfo = {
      filename,
      filepath,
      timestamp: new Date().toISOString(),
      actionNumber: actionCounter,
      ...metadata
    };
    
    // Save metadata
    const metadataFile = path.join(screenshotsDir, `${filename}.json`);
    fs.writeFileSync(metadataFile, JSON.stringify(screenshotInfo, null, 2));
    
    logWithProof(`Screenshot saved: ${filename}`, screenshotInfo);
    return screenshotInfo;
    
  } catch (error) {
    console.error('❌ Error saving screenshot:', error);
    return null;
  }
}

// Enhanced client management
wss.on('connection', (ws, req) => {
  const clientId = Date.now() + Math.random();
  clients.set(clientId, ws);
  
  console.log(`✅ New client connected (ID: ${clientId})`);
  logWithProof('Client connected', { clientId, userAgent: req.headers['user-agent'] });
  
  // Send welcome message with visual proof activation
  ws.send(JSON.stringify({
    action: 'showText',
    text: '🎯 VISUAL PROOF SYSTEM ACTIVATED',
    position: { x: 0.5, y: 0.1 },
    options: { color: '#44FF44', duration: 3000, size: 'large' }
  }));
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleEnhancedMessage(data, ws, clientId);
    } catch (error) {
      console.error('❌ Error parsing message:', error);
    }
  });
  
  ws.on('close', () => {
    console.log(`👋 Client disconnected (ID: ${clientId})`);
    clients.delete(clientId);
    
    if (browserExtension === ws) {
      browserExtension = null;
      console.log('🔌 Browser extension disconnected');
    }
    
    logWithProof('Client disconnected', { clientId });
    broadcastStatus();
  });
  
  broadcastStatus();
});

// Enhanced message handling
function handleEnhancedMessage(data, ws, clientId) {
  logWithProof('Message received', { type: data.type, clientId, data: JSON.stringify(data).substring(0, 200) });
  
  switch (data.type) {
    case 'pageInfo':
      console.log('🌐 Browser extension identified');
      console.log(`📄 Page: ${data.url}`);
      browserExtension = ws;
      
      // Show page loaded indicator
      forwardToBrowser({
        action: 'showText',
        text: `📄 PAGE LOADED: ${new URL(data.url).hostname}`,
        position: { x: 0.5, y: 0.95 },
        options: { color: '#44AAFF', duration: 2000 }
      });
      break;
      
    case 'screenshot':
      console.log('📸 Screenshot received');
      const screenshotInfo = saveScreenshot(data.data, data.metadata);
      if (screenshotInfo) {
        // Show screenshot confirmation
        forwardToBrowser({
          action: 'showText',
          text: `📸 SCREENSHOT ${screenshotCounter} SAVED`,
          position: { x: 0.85, y: 0.85 },
          options: { color: '#AA44FF', duration: 2000 }
        });
      }
      break;
      
    case 'action_result':
      console.log(`✅ Action ${data.action} completed`);
      logWithProof('Action completed', data);
      break;
      
    default:
      // Forward other messages to browser extension
      forwardToBrowser(data);
  }
}

// Enhanced command forwarding
function forwardToBrowser(command) {
  if (browserExtension && browserExtension.readyState === WebSocket.OPEN) {
    console.log(`🎯 Command sent: ${command.action || command.type}`);
    console.log(`➡️ Forwarding to browser`);
    
    // Add action tracking
    if (command.action) {
      logWithProof('Command forwarded', { action: command.action, command });
    }
    
    browserExtension.send(JSON.stringify(command));
  } else {
    console.log('❌ No browser extension connected');
  }
}

// Broadcast status to all clients
function broadcastStatus() {
  const status = {
    clients: clients.size,
    browserConnected: browserExtension !== null,
    timestamp: new Date().toISOString(),
    actionCount: actionCounter,
    screenshotCount: screenshotCounter
  };
  
  console.log(`📊 Status: ${status.clients} clients, Browser: ${status.browserConnected ? 'connected' : 'disconnected'}`);
  
  // Save status to file
  const statusFile = path.join(proofDir, 'current-status.json');
  fs.writeFileSync(statusFile, JSON.stringify(status, null, 2));
}

// API for external control
function createVisualProofAPI() {
  // Comprehensive visual proof demonstration
  global.demonstrateVisualProof = () => {
    console.log('🎨 Starting comprehensive visual proof demonstration...');
    
    const demonstration = [
      // Step 1: Multi-color highlighting
      {
        command: VISUAL_PROOF_COMMANDS.rainbowHighlight(['button', 'input', 'a', 'form', 'div[role="button"]']),
        description: 'Multi-color element highlighting'
      },
      
      // Step 2: Show status
      {
        command: VISUAL_PROOF_COMMANDS.showStatus('Visual Proof System Active', 'success'),
        description: 'Status indicator display'
      },
      
      // Step 3: Enhanced screenshot
      {
        command: VISUAL_PROOF_COMMANDS.enhancedScreenshot({ phase: 'demonstration' }),
        description: 'Annotated screenshot capture'
      },
      
      // Step 4: Breadcrumb trail
      {
        command: VISUAL_PROOF_COMMANDS.showBreadcrumbs('Home → Dashboard → Settings → Visual Proof Demo'),
        description: 'Navigation breadcrumb trail'
      }
    ];
    
    demonstration.forEach((step, index) => {
      setTimeout(() => {
        console.log(`🎯 Step ${index + 1}: ${step.description}`);
        forwardToBrowser(step.command);
      }, index * 2000);
    });
  };
  
  // Highlight specific elements with different colors
  global.highlightElements = (elements) => {
    const colors = ['#FF4444', '#44FF44', '#4444FF', '#FFAA44', '#AA44FF', '#44AAFF'];
    elements.forEach((selector, i) => {
      forwardToBrowser({
        action: 'highlight',
        selector,
        color: colors[i % colors.length],
        text: `Element ${i + 1}`,
        style: 'glow',
        animation: 'claude-pulse',
        persistent: true
      });
    });
  };
  
  // Take annotated screenshot
  global.takeProofScreenshot = (label = 'Proof Screenshot') => {
    forwardToBrowser(VISUAL_PROOF_COMMANDS.enhancedScreenshot({ label }));
  };
  
  // Show visual workflow
  global.showWorkflow = (steps) => {
    steps.forEach((step, i) => {
      setTimeout(() => {
        forwardToBrowser({
          action: 'showText',
          text: `Step ${i + 1}: ${step}`,
          position: { x: 0.1, y: 0.1 + (i * 0.05) },
          options: { color: '#44AAFF', duration: 5000 }
        });
      }, i * 1000);
    });
  };
  
  // Clear all visual overlays
  global.clearVisualProof = () => {
    forwardToBrowser({ action: 'clear' });
  };
  
  // Get proof statistics
  global.getProofStats = () => {
    return {
      actionCount: actionCounter,
      screenshotCount: screenshotCounter,
      clientCount: clients.size,
      browserConnected: browserExtension !== null,
      proofDirectory: proofDir
    };
  };
}

// Initialize Visual Proof API
createVisualProofAPI();

// Handle incoming connections for commands
process.stdin.on('data', (data) => {
  const command = data.toString().trim();
  
  switch (command) {
    case 'demo':
      demonstrateVisualProof();
      break;
    case 'screenshot':
      takeProofScreenshot('Manual Screenshot');
      break;
    case 'clear':
      clearVisualProof();
      break;
    case 'stats':
      console.log('📊 Proof Statistics:', getProofStats());
      break;
    case 'help':
      console.log(`
🎯 Available commands:
- demo: Run visual proof demonstration
- screenshot: Take proof screenshot
- clear: Clear all visual overlays
- stats: Show proof statistics
- help: Show this help message
      `);
      break;
    default:
      console.log(`❓ Unknown command: ${command}`);
  }
});

console.log('🎯 Visual Proof Server running on ws://localhost:8765');
console.log('📁 Proof files will be saved to:', proofDir);
console.log('💡 Type "help" for available commands');
console.log('🔥 Visual Proof System Ready!');

// Periodic status broadcast
setInterval(broadcastStatus, 30000);
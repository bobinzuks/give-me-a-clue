#!/usr/bin/env node

// Visual Proof System Demo Controller
const WebSocket = require('ws');

class VisualProofDemo {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.demoStep = 0;
  }

  // Connect to the visual proof server
  async connect() {
    return new Promise((resolve, reject) => {
      console.log('🔌 Connecting to Visual Proof Server...');
      this.ws = new WebSocket('ws://localhost:8765');

      this.ws.on('open', () => {
        console.log('✅ Connected to Visual Proof Server');
        this.isConnected = true;
        resolve();
      });

      this.ws.on('error', (error) => {
        console.error('❌ Connection failed:', error);
        reject(error);
      });

      this.ws.on('close', () => {
        console.log('🔌 Disconnected from server');
        this.isConnected = false;
      });
    });
  }

  // Send command to browser
  sendCommand(command) {
    if (this.isConnected) {
      console.log(`📤 Sending command: ${command.action}`);
      this.ws.send(JSON.stringify(command));
      return true;
    } else {
      console.error('❌ Not connected to server');
      return false;
    }
  }

  // Wait for specified time
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Demo 1: Multi-Color Element Highlighting
  async demoMultiColorHighlighting() {
    console.log('\n🎨 DEMO 1: Multi-Color Element Highlighting');
    console.log('===========================================');

    // Show status message
    this.sendCommand({
      action: 'showText',
      text: '🎨 DEMO 1: Multi-Color Highlighting',
      position: { x: 0.5, y: 0.1 },
      options: { color: '#FF4444', duration: 3000, size: 'large' }
    });

    await this.wait(1000);

    // Highlight different types of elements with different colors
    const highlightTargets = [
      { selector: 'button', color: '#FF4444', text: '🔴 Buttons' },
      { selector: 'input', color: '#44FF44', text: '🟢 Input Fields' },
      { selector: 'a', color: '#4444FF', text: '🔵 Links' },
      { selector: 'form', color: '#FFAA44', text: '🟠 Forms' },
      { selector: 'nav', color: '#AA44FF', text: '🟣 Navigation' }
    ];

    for (const target of highlightTargets) {
      this.sendCommand({
        action: 'highlight',
        selector: target.selector,
        color: target.color,
        text: target.text,
        style: 'glow',
        animation: 'claude-pulse',
        persistent: false
      });
      await this.wait(1000);
    }

    console.log('✅ Multi-color highlighting complete');
    return true;
  }

  // Demo 2: Visual Text Overlays and Annotations
  async demoTextOverlays() {
    console.log('\n📝 DEMO 2: Visual Text Overlays');
    console.log('===============================');

    const overlays = [
      { text: '📍 Top Left Indicator', x: 0.1, y: 0.1, color: '#FF4444' },
      { text: '⚡ Center Status', x: 0.5, y: 0.5, color: '#44FF44' },
      { text: '🎯 Bottom Right Info', x: 0.9, y: 0.9, color: '#4444FF' },
      { text: '🔄 Processing...', x: 0.5, y: 0.3, color: '#FFAA44' }
    ];

    for (const overlay of overlays) {
      this.sendCommand({
        action: 'showText',
        text: overlay.text,
        position: { 
          x: overlay.x * 1920, // Assuming 1920px width
          y: overlay.y * 1080  // Assuming 1080px height
        },
        options: { 
          color: overlay.color, 
          duration: 4000,
          size: 'medium'
        }
      });
      await this.wait(800);
    }

    console.log('✅ Text overlays demo complete');
    return true;
  }

  // Demo 3: Breadcrumb Trail Demonstration
  async demoBreadcrumbTrail() {
    console.log('\n🗺️ DEMO 3: Breadcrumb Trail');
    console.log('==========================');

    const breadcrumbs = [
      'Home',
      'Home → Dashboard',
      'Home → Dashboard → Settings',
      'Home → Dashboard → Settings → Visual Proof',
      'Home → Dashboard → Settings → Visual Proof → Demo Complete'
    ];

    for (const breadcrumb of breadcrumbs) {
      this.sendCommand({
        action: 'breadcrumb',
        path: breadcrumb
      });
      await this.wait(1500);
    }

    console.log('✅ Breadcrumb trail demo complete');
    return true;
  }

  // Demo 4: Progressive Action Highlighting
  async demoProgressiveActions() {
    console.log('\n⚡ DEMO 4: Progressive Actions');
    console.log('=============================');

    // Simulate a multi-step workflow
    const workflow = [
      { selector: 'input[type="text"]:first-of-type', action: 'Find first input', color: '#FF4444' },
      { selector: 'input[type="email"]', action: 'Locate email field', color: '#44FF44' },
      { selector: 'button[type="submit"]', action: 'Find submit button', color: '#4444FF' },
      { selector: 'form', action: 'Identify form container', color: '#FFAA44' }
    ];

    for (let i = 0; i < workflow.length; i++) {
      const step = workflow[i];
      
      // Show step indicator
      this.sendCommand({
        action: 'showText',
        text: `Step ${i + 1}/${workflow.length}: ${step.action}`,
        position: { x: 0.1, y: 0.2 + (i * 0.05) },
        options: { color: step.color, duration: 3000, size: 'medium' }
      });

      // Highlight the element
      this.sendCommand({
        action: 'highlight',
        selector: step.selector,
        color: step.color,
        text: `Step ${i + 1}: ${step.action}`,
        style: 'outline',
        animation: 'claude-bounce',
        persistent: false
      });

      await this.wait(2000);
    }

    console.log('✅ Progressive actions demo complete');
    return true;
  }

  // Demo 5: Screenshot Documentation
  async demoScreenshotDocumentation() {
    console.log('\n📸 DEMO 5: Screenshot Documentation');
    console.log('===================================');

    // Show screenshot preparation message
    this.sendCommand({
      action: 'showText',
      text: '📸 Preparing Visual Proof Screenshot...',
      position: { x: 0.5, y: 0.2 },
      options: { color: '#AA44FF', duration: 2000, size: 'large' }
    });

    await this.wait(2000);

    // Add some visual elements for the screenshot
    this.sendCommand({
      action: 'multiHighlight',
      highlights: [
        { selector: 'body', color: '#FF444420', text: '📄 Page Content', style: 'fill' },
        { selector: 'header', color: '#44FF44', text: '🎯 Header Section', style: 'outline' },
        { selector: 'main', color: '#4444FF', text: '📝 Main Content', style: 'glow' }
      ]
    });

    await this.wait(1000);

    // Take the enhanced screenshot
    this.sendCommand({
      action: 'screenshot',
      options: {
        includeAnnotations: true,
        watermark: true,
        metadata: {
          demo: 'Visual Proof System',
          step: 'Screenshot Documentation',
          elements_highlighted: 3
        }
      }
    });

    console.log('✅ Screenshot documentation complete');
    return true;
  }

  // Demo 6: Interactive Element Detection
  async demoElementDetection() {
    console.log('\n🔍 DEMO 6: Interactive Element Detection');
    console.log('========================================');

    const interactiveSelectors = [
      'button',
      'a[href]',
      'input',
      'select',
      'textarea',
      '[onclick]',
      '[role="button"]',
      '[tabindex]'
    ];

    this.sendCommand({
      action: 'showText',
      text: '🔍 Scanning for Interactive Elements...',
      position: { x: 0.5, y: 0.15 },
      options: { color: '#44AAFF', duration: 3000, size: 'large' }
    });

    await this.wait(1000);

    // Highlight different types of interactive elements
    for (let i = 0; i < interactiveSelectors.length; i++) {
      const selector = interactiveSelectors[i];
      const colors = ['#FF4444', '#44FF44', '#4444FF', '#FFAA44', '#AA44FF', '#44AAFF', '#FF44AA', '#AAFF44'];
      
      this.sendCommand({
        action: 'highlight',
        selector: selector,
        color: colors[i % colors.length],
        text: `🎯 ${selector}`,
        style: 'glow',
        animation: 'claude-flash',
        persistent: false
      });

      await this.wait(500);
    }

    console.log('✅ Element detection demo complete');
    return true;
  }

  // Demo 7: Visual Status Updates
  async demoStatusUpdates() {
    console.log('\n📊 DEMO 7: Visual Status Updates');
    console.log('================================');

    const statusUpdates = [
      { message: 'System Initializing...', type: 'working' },
      { message: 'Elements Located', type: 'info' },
      { message: 'Validation Complete', type: 'success' },
      { message: 'Proof Generated', type: 'success' },
      { message: 'Demo Complete!', type: 'success' }
    ];

    for (const status of statusUpdates) {
      const icons = {
        working: '⚙️',
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌'
      };

      const colors = {
        working: '#AA44FF',
        info: '#44AAFF',
        success: '#44FF44',
        warning: '#FFAA44',
        error: '#FF4444'
      };

      this.sendCommand({
        action: 'showText',
        text: `${icons[status.type]} ${status.message}`,
        position: { x: 0.85, y: 0.1 },
        options: {
          color: colors[status.type],
          duration: 2500,
          size: 'medium'
        }
      });

      await this.wait(1800);
    }

    console.log('✅ Status updates demo complete');
    return true;
  }

  // Run complete demonstration
  async runCompleteDemonstration() {
    console.log('\n🎯 STARTING COMPREHENSIVE VISUAL PROOF DEMONSTRATION');
    console.log('====================================================');
    console.log('This demo will showcase all visual proof capabilities:');
    console.log('1. Multi-Color Element Highlighting');
    console.log('2. Visual Text Overlays');
    console.log('3. Breadcrumb Trail');
    console.log('4. Progressive Actions');
    console.log('5. Screenshot Documentation');
    console.log('6. Interactive Element Detection');
    console.log('7. Visual Status Updates');
    console.log('====================================================\n');

    try {
      await this.connect();
      
      // Wait for browser extension to connect
      console.log('⏳ Waiting for browser extension connection...');
      await this.wait(3000);

      // Show initial status
      this.sendCommand({
        action: 'showText',
        text: '🎯 VISUAL PROOF SYSTEM - COMPREHENSIVE DEMO',
        position: { x: 0.5, y: 0.05 },
        options: { color: '#FF4444', duration: 5000, size: 'large' }
      });

      await this.wait(2000);

      // Run all demos
      await this.demoMultiColorHighlighting();
      await this.wait(2000);
      
      await this.demoTextOverlays();
      await this.wait(2000);
      
      await this.demoBreadcrumbTrail();
      await this.wait(2000);
      
      await this.demoProgressiveActions();
      await this.wait(2000);
      
      await this.demoScreenshotDocumentation();
      await this.wait(2000);
      
      await this.demoElementDetection();
      await this.wait(2000);
      
      await this.demoStatusUpdates();
      await this.wait(3000);

      // Final completion message
      this.sendCommand({
        action: 'showText',
        text: '🎉 VISUAL PROOF DEMONSTRATION COMPLETE!',
        position: { x: 0.5, y: 0.5 },
        options: { color: '#44FF44', duration: 5000, size: 'large' }
      });

      // Take final proof screenshot
      this.sendCommand({
        action: 'screenshot',
        options: {
          includeAnnotations: true,
          watermark: true,
          metadata: {
            demo: 'Complete Visual Proof Demonstration',
            completion: 'success',
            timestamp: new Date().toISOString()
          }
        }
      });

      console.log('\n🎉 DEMONSTRATION COMPLETE!');
      console.log('✅ All visual proof capabilities demonstrated');
      console.log('📸 Screenshots and logs saved to proof directory');
      
    } catch (error) {
      console.error('❌ Demo failed:', error);
    }
  }

  // Clean up overlays
  clearAll() {
    this.sendCommand({ action: 'clear' });
    console.log('🧹 Cleared all visual overlays');
  }

  // Disconnect from server
  disconnect() {
    if (this.ws) {
      this.ws.close();
      console.log('👋 Disconnected from server');
    }
  }
}

// Command line interface
async function main() {
  const demo = new VisualProofDemo();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'full':
    case 'demo':
      await demo.runCompleteDemonstration();
      break;
      
    case 'highlight':
      await demo.connect();
      await demo.demoMultiColorHighlighting();
      break;
      
    case 'text':
      await demo.connect();
      await demo.demoTextOverlays();
      break;
      
    case 'breadcrumb':
      await demo.connect();
      await demo.demoBreadcrumbTrail();
      break;
      
    case 'screenshot':
      await demo.connect();
      await demo.demoScreenshotDocumentation();
      break;
      
    case 'clear':
      await demo.connect();
      demo.clearAll();
      break;
      
    default:
      console.log(`
🎯 Visual Proof System Demo

Usage: node visual-proof-demo.js [command]

Commands:
  full, demo    - Run complete demonstration
  highlight     - Demo multi-color highlighting
  text         - Demo text overlays
  breadcrumb   - Demo breadcrumb trail
  screenshot   - Demo screenshot documentation
  clear        - Clear all overlays
  
Examples:
  node visual-proof-demo.js full
  node visual-proof-demo.js highlight
  node visual-proof-demo.js clear
      `);
  }
  
  setTimeout(() => {
    demo.disconnect();
    process.exit(0);
  }, 2000);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down demo...');
  process.exit(0);
});

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = VisualProofDemo;
#!/usr/bin/env node

// Analyze current Stripe page structure
const WebSocket = require('ws');

async function analyzePage() {
  return new Promise((resolve) => {
    const ws = new WebSocket('ws://localhost:8765');
    
    ws.on('open', () => {
      console.log('🔍 Analyzing page structure...\n');
      
      // Request page scrape
      ws.send(JSON.stringify({ action: 'scrape' }));
      
      // Take screenshot
      setTimeout(() => {
        ws.send(JSON.stringify({ action: 'screenshot' }));
      }, 500);
      
      setTimeout(() => {
        ws.close();
        resolve();
      }, 2000);
    });
    
    ws.on('message', (data) => {
      console.log('Page data received');
    });
    
    ws.on('error', (err) => {
      console.error('Error:', err.message);
      resolve();
    });
  });
}

async function findElements() {
  const ws = new WebSocket('ws://localhost:8765');
  
  return new Promise((resolve) => {
    ws.on('open', async () => {
      console.log('🎯 Finding interactive elements...\n');
      
      // Common Stripe Dashboard selectors
      const selectors = [
        // Buttons
        { selector: 'button', desc: 'All buttons' },
        { selector: 'a[href*="webhook"]', desc: 'Webhook links' },
        { selector: '[role="button"]', desc: 'Button roles' },
        
        // Navigation
        { selector: 'nav a', desc: 'Navigation links' },
        { selector: '[aria-label*="navigation"]', desc: 'Navigation areas' },
        
        // Forms
        { selector: 'input', desc: 'Input fields' },
        { selector: 'form', desc: 'Forms' },
        
        // Specific Stripe elements
        { selector: '[data-testid]', desc: 'Test IDs' },
        { selector: '.Box-root', desc: 'Box components' },
        { selector: '.Button', desc: 'Button components' }
      ];
      
      for (const item of selectors) {
        console.log(`Checking: ${item.desc}`);
        
        const command = {
          action: 'highlight',
          selector: item.selector,
          color: 'blue'
        };
        
        ws.send(JSON.stringify(command));
        await new Promise(r => setTimeout(r, 1000));
        
        // Clear highlights
        ws.send(JSON.stringify({ action: 'clear' }));
        await new Promise(r => setTimeout(r, 200));
      }
      
      ws.close();
      resolve();
    });
    
    ws.on('error', (err) => {
      console.error('Error:', err.message);
      resolve();
    });
  });
}

// Run analysis
(async () => {
  console.log('📊 STRIPE PAGE ANALYZER');
  console.log('======================\n');
  
  console.log('Make sure you are on the Stripe Dashboard page.\n');
  console.log('Suggested URLs:');
  console.log('  • https://dashboard.stripe.com/webhooks');
  console.log('  • https://dashboard.stripe.com/test/webhooks');
  console.log('  • https://dashboard.stripe.com/developers/webhooks\n');
  
  await analyzePage();
  await findElements();
  
  console.log('\n✅ Analysis complete!');
  console.log('Check the firefox-extension/server/data/ folder for screenshots and page data.');
})();
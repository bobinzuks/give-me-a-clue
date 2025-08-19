#!/usr/bin/env node

// Detect all buttons and clickable elements on page
const WebSocket = require('ws');

async function findAllButtons() {
  const ws = new WebSocket('ws://localhost:8765');
  
  return new Promise((resolve) => {
    ws.on('open', async () => {
      console.log('🔍 BUTTON DETECTOR');
      console.log('==================\n');
      
      // All possible button selectors
      const buttonSelectors = [
        // Standard buttons
        'button',
        'a.btn',
        'a.button',
        '[role="button"]',
        
        // Stripe specific
        '.Button',
        '.Box-button',
        '[data-testid*="button"]',
        '[data-test*="button"]',
        
        // Text content
        'button:contains("Add")',
        'button:contains("Create")',
        'button:contains("New")',
        'button:contains("endpoint")',
        'a:contains("Add")',
        'a:contains("Create")',
        
        // Icons/actions
        '[aria-label*="Add"]',
        '[aria-label*="Create"]',
        '[title*="Add"]',
        '[title*="Create"]',
        
        // Forms
        'button[type="submit"]',
        'input[type="submit"]',
        
        // Floating action buttons
        '[class*="fab"]',
        '[class*="floating"]',
        '[class*="action"]'
      ];
      
      console.log('Highlighting all buttons on page...\n');
      
      for (const [i, selector] of buttonSelectors.entries()) {
        const color = ['red', 'green', 'blue', 'yellow', 'orange'][i % 5];
        
        console.log(`Testing: ${selector} (${color})`);
        
        ws.send(JSON.stringify({
          action: 'highlight',
          selector: selector,
          color: color
        }));
        
        await new Promise(r => setTimeout(r, 500));
      }
      
      console.log('\n✅ Check the page for highlighted buttons!');
      console.log('Different colors = different selector types');
      
      setTimeout(() => {
        ws.close();
        resolve();
      }, 2000);
    });
    
    ws.on('error', (err) => {
      console.error('Error:', err.message);
      resolve();
    });
  });
}

findAllButtons();
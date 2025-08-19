#!/usr/bin/env node

// Click the Add/Create button on Stripe webhooks page
const WebSocket = require('ws');

async function clickAddButton() {
  console.log('🎯 CLICKING ADD/CREATE BUTTON');
  console.log('=============================\n');
  
  const ws = new WebSocket('ws://localhost:8765');
  
  return new Promise((resolve) => {
    ws.on('open', async () => {
      console.log('Connected to browser\n');
      
      // Stripe-specific button selectors
      const buttonSelectors = [
        // Text-based
        'button:contains("Add")',
        'button:contains("Create")',
        'button:contains("Add endpoint")',
        'button:contains("Add destination")',
        'button:contains("Create event destination")',
        
        // Links that look like buttons
        'a:contains("Add")',
        'a:contains("Create")',
        'a:contains("Add endpoint")',
        
        // Stripe's Button class
        '.Button:contains("Add")',
        '.Button:contains("Create")',
        
        // Data attributes
        '[data-test="add-button"]',
        '[data-testid="add-button"]',
        '[data-test="create-button"]',
        
        // Aria labels
        '[aria-label*="Add"]',
        '[aria-label*="Create"]',
        '[aria-label*="New"]',
        
        // Generic buttons
        'button.primary',
        'button.btn-primary',
        'button[type="button"]:not(:disabled)',
        
        // Floating action button
        '[class*="FloatingActionButton"]',
        '[class*="fab"]',
        
        // Icon buttons
        'button svg',
        'button [class*="Icon"]'
      ];
      
      console.log('Trying to click Add/Create button...\n');
      
      // First highlight all potential buttons
      for (const selector of buttonSelectors) {
        ws.send(JSON.stringify({
          action: 'highlight',
          selector: selector,
          color: 'yellow'
        }));
        await new Promise(r => setTimeout(r, 300));
      }
      
      console.log('Highlighted potential buttons in yellow\n');
      
      // Now try clicking them
      for (const selector of buttonSelectors.slice(0, 10)) {
        console.log(`Clicking: ${selector}`);
        
        ws.send(JSON.stringify({
          action: 'click',
          selector: selector
        }));
        
        await new Promise(r => setTimeout(r, 1000));
      }
      
      console.log('\n✅ Attempted clicks on all Add/Create buttons');
      console.log('Check if you\'re now on the webhook creation page');
      
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

clickAddButton();
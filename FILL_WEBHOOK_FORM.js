#!/usr/bin/env node

// Fill the webhook form if on creation page
const WebSocket = require('ws');

async function fillForm() {
  console.log('📝 FILLING WEBHOOK FORM');
  console.log('=======================\n');
  
  const ws = new WebSocket('ws://localhost:8765');
  
  return new Promise((resolve) => {
    ws.on('open', async () => {
      console.log('Connected to browser\n');
      
      // Step 1: Fill URL field
      console.log('Step 1: Filling URL field...');
      
      const urlSelectors = [
        'input[placeholder*="https"]',
        'input[name="url"]',
        'input[type="url"]',
        'input[id*="url"]',
        'input[aria-label*="URL"]',
        'input[aria-label*="endpoint"]',
        '[data-test*="url-input"]',
        '[data-testid*="url-input"]',
        'input.form-control',
        'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])'
      ];
      
      for (const selector of urlSelectors) {
        // Highlight
        ws.send(JSON.stringify({
          action: 'highlight',
          selector: selector,
          color: 'green'
        }));
        
        await new Promise(r => setTimeout(r, 300));
        
        // Clear and type
        ws.send(JSON.stringify({
          action: 'click',
          selector: selector
        }));
        
        await new Promise(r => setTimeout(r, 300));
        
        ws.send(JSON.stringify({
          action: 'clear'
        }));
        
        await new Promise(r => setTimeout(r, 300));
        
        ws.send(JSON.stringify({
          action: 'type',
          selector: selector,
          text: 'https://tinyolearn.vercel.app/api/webhook'
        }));
        
        await new Promise(r => setTimeout(r, 500));
      }
      
      console.log('URL: https://tinyolearn.vercel.app/api/webhook\n');
      
      // Step 2: Select events
      console.log('Step 2: Selecting events...\n');
      
      // Click on events section
      const eventTriggers = [
        'button:contains("Select events")',
        'button:contains("Choose events")',
        '[aria-label*="Select events"]',
        '.event-selector',
        '[data-test*="event"]'
      ];
      
      for (const selector of eventTriggers) {
        ws.send(JSON.stringify({
          action: 'click',
          selector: selector
        }));
        await new Promise(r => setTimeout(r, 500));
      }
      
      // Select specific events
      const events = [
        'checkout.session.completed',
        'payment_intent.succeeded',
        'payment_intent.payment_failed'
      ];
      
      for (const event of events) {
        console.log(`  ✓ Selecting: ${event}`);
        
        // Type in search
        ws.send(JSON.stringify({
          action: 'type',
          selector: 'input[type="search"]',
          text: event
        }));
        
        await new Promise(r => setTimeout(r, 1000));
        
        // Click checkbox
        ws.send(JSON.stringify({
          action: 'click',
          selector: `input[value="${event}"]`
        }));
        
        ws.send(JSON.stringify({
          action: 'click',
          selector: `label:contains("${event}")`
        }));
        
        await new Promise(r => setTimeout(r, 500));
        
        // Clear search
        ws.send(JSON.stringify({
          action: 'click',
          selector: 'input[type="search"]'
        }));
        
        ws.send(JSON.stringify({
          action: 'clear'
        }));
        
        await new Promise(r => setTimeout(r, 500));
      }
      
      // Step 3: Submit
      console.log('\nStep 3: Highlighting submit button...');
      
      const submitSelectors = [
        'button[type="submit"]',
        'button:contains("Add endpoint")',
        'button:contains("Create")',
        'button:contains("Save")',
        '.Button:contains("Add")',
        '.Button:contains("Create")'
      ];
      
      for (const selector of submitSelectors) {
        ws.send(JSON.stringify({
          action: 'highlight',
          selector: selector,
          color: 'yellow'
        }));
        await new Promise(r => setTimeout(r, 300));
      }
      
      console.log('\n✅ Form filled!');
      console.log('Click the yellow button to create the webhook');
      console.log('Then copy the webhook secret (whsec_...)');
      
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

fillForm();
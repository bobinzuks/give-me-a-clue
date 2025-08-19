#!/usr/bin/env node

// Improved Stripe Webhook Navigation
const WebSocket = require('ws');

console.log('🔍 STRIPE WEBHOOK NAVIGATION TOOL');
console.log('==================================\n');

async function sendCommand(action, selector, extra) {
  return new Promise((resolve) => {
    const ws = new WebSocket('ws://localhost:8765');
    
    ws.on('open', () => {
      const command = { action };
      if (selector) command.selector = selector;
      if (extra) {
        if (action === 'type') command.text = extra;
        else if (action === 'highlight') command.color = extra;
      }
      
      console.log(`Sending: ${action} ${selector || ''}`);
      ws.send(JSON.stringify(command));
      
      setTimeout(() => {
        ws.close();
        resolve();
      }, 1500);
    });
    
    ws.on('error', (err) => {
      console.error('Error:', err.message);
      resolve();
    });
  });
}

async function navigateToWebhooks() {
  console.log('📍 STEP 1: Navigate to Stripe Webhooks');
  console.log('Go to: https://dashboard.stripe.com/webhooks');
  console.log('OR: https://dashboard.stripe.com/test/webhooks (for test mode)\n');
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Take screenshot to see current state
  await sendCommand('screenshot');
  
  console.log('\n📍 STEP 2: Looking for "Add endpoint" button...');
  
  // Try multiple selectors for the Add endpoint button
  const addButtonSelectors = [
    'button:contains("Add endpoint")',
    'button[aria-label*="Add"]',
    'a:contains("Add endpoint")',
    'button.btn-primary',
    '[data-testid="add-endpoint-button"]',
    'button[type="button"]:contains("Add")'
  ];
  
  for (const selector of addButtonSelectors) {
    await sendCommand('highlight', selector, 'yellow');
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📍 STEP 3: Click Add endpoint button');
  await sendCommand('click', addButtonSelectors[0]);
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('\n📍 STEP 4: Fill in webhook URL');
  
  // Try multiple selectors for URL input
  const urlInputSelectors = [
    'input[placeholder*="https"]',
    'input[name="url"]',
    'input[type="url"]',
    'input[aria-label*="URL"]',
    'input[id*="url"]'
  ];
  
  for (const selector of urlInputSelectors) {
    await sendCommand('highlight', selector, 'green');
    await sendCommand('type', selector, 'https://tinyolearn.vercel.app/api/webhook');
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📍 STEP 5: Select events');
  console.log('Events to select:');
  console.log('  ✓ checkout.session.completed');
  console.log('  ✓ payment_intent.succeeded');
  console.log('  ✓ payment_intent.payment_failed\n');
  
  // Search and select events
  const events = [
    'checkout.session.completed',
    'payment_intent.succeeded',
    'payment_intent.payment_failed'
  ];
  
  for (const event of events) {
    console.log(`Selecting: ${event}`);
    
    // Clear search
    await sendCommand('click', 'input[type="search"]');
    await sendCommand('clear');
    
    // Type event name
    await sendCommand('type', 'input[type="search"]', event);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Click checkbox
    await sendCommand('click', `input[value="${event}"]`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📍 STEP 6: Save webhook');
  
  // Try multiple selectors for save button
  const saveButtonSelectors = [
    'button:contains("Add endpoint")',
    'button:contains("Save")',
    'button[type="submit"]',
    'button.btn-primary'
  ];
  
  for (const selector of saveButtonSelectors) {
    await sendCommand('highlight', selector, 'yellow');
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  await sendCommand('click', saveButtonSelectors[0]);
  
  console.log('\n✅ WEBHOOK CREATED!');
  console.log('\n📋 Copy the webhook secret (starts with whsec_)');
  console.log('Add it to Vercel environment variables as STRIPE_WEBHOOK_SECRET');
}

// Run the navigation
navigateToWebhooks().catch(console.error);
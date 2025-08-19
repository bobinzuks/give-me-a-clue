#!/usr/bin/env node

// Navigate to correct Stripe webhook page
const WebSocket = require('ws');

async function send(action, selector, extra) {
  return new Promise((resolve) => {
    const ws = new WebSocket('ws://localhost:8765');
    
    ws.on('open', () => {
      const cmd = { action };
      if (selector) cmd.selector = selector;
      if (extra) {
        if (action === 'type') cmd.text = extra;
        else if (action === 'highlight') cmd.color = extra;
      }
      
      console.log(`➡️ ${action}: ${selector || ''}`);
      ws.send(JSON.stringify(cmd));
      
      setTimeout(() => {
        ws.close();
        resolve();
      }, 1200);
    });
    
    ws.on('error', () => resolve());
  });
}

async function setupWebhook() {
  console.log('🎯 STRIPE WEBHOOK SETUP - CORRECT URL');
  console.log('=====================================\n');
  
  console.log('📍 STEP 1: Navigate to the correct page');
  console.log('Go to: https://dashboard.stripe.com/webhooks');
  console.log('(or for test mode: https://dashboard.stripe.com/test/webhooks)\n');
  
  console.log('Waiting for page load...\n');
  await new Promise(r => setTimeout(r, 3000));
  
  // Take screenshot
  await send('screenshot');
  
  console.log('📍 STEP 2: Looking for "Add endpoint" button\n');
  
  // Try various selectors for Add endpoint button
  await send('highlight', 'button:contains("Add endpoint")', 'yellow');
  await send('highlight', 'a:contains("Add endpoint")', 'yellow');
  await send('highlight', 'button[aria-label*="Add"]', 'yellow');
  await send('highlight', '[data-test*="add"]', 'yellow');
  
  console.log('Click the "Add endpoint" button (highlighted in yellow)\n');
  
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('📍 STEP 3: After clicking Add endpoint, fill the form:\n');
  
  // URL field
  console.log('  • Endpoint URL:');
  await send('highlight', 'input[placeholder*="https"]', 'green');
  await send('highlight', 'input[name="url"]', 'green');
  await send('highlight', 'input[type="url"]', 'green');
  await send('type', 'input[placeholder*="https"]', 'https://tinyolearn.vercel.app/api/webhook');
  
  console.log('    https://tinyolearn.vercel.app/api/webhook\n');
  
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('📍 STEP 4: Select events\n');
  console.log('Click "Select events" or look for event checkboxes\n');
  
  // Events to select
  const events = [
    'checkout.session.completed',
    'payment_intent.succeeded',
    'payment_intent.payment_failed'
  ];
  
  console.log('Events to select:');
  for (const event of events) {
    console.log(`  ✓ ${event}`);
  }
  
  console.log('\n📍 STEP 5: Submit');
  console.log('Click "Add endpoint" button at the bottom\n');
  
  await send('highlight', 'button[type="submit"]', 'yellow');
  await send('highlight', 'button:contains("Add endpoint")', 'yellow');
  
  console.log('✅ After creating the webhook:');
  console.log('  1. Copy the webhook secret (whsec_...)');
  console.log('  2. Add to Vercel environment variables:');
  console.log('     - Name: STRIPE_WEBHOOK_SECRET');
  console.log('     - Value: [the whsec_ value]');
}

setupWebhook().catch(console.error);
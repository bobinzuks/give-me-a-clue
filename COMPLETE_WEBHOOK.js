#!/usr/bin/env node

// Complete Stripe Webhook Setup
const WebSocket = require('ws');

async function sendCmd(action, selector, extra) {
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
      }, 1500);
    });
    
    ws.on('error', () => resolve());
  });
}

async function completeWebhookSetup() {
  console.log('🚀 COMPLETING STRIPE WEBHOOK SETUP');
  console.log('===================================\n');
  
  console.log('You are on: https://dashboard.stripe.com/workbench/webhooks/create\n');
  
  // Step 1: Fill URL field
  console.log('📍 STEP 1: Entering webhook URL...');
  
  // Try multiple selectors for URL input
  await sendCmd('highlight', 'input[name="url"]', 'green');
  await sendCmd('click', 'input[name="url"]');
  await sendCmd('type', 'input[name="url"]', 'https://tinyolearn.vercel.app/api/webhook');
  
  // Alternative selectors
  await sendCmd('type', 'input[placeholder*="https://"]', 'https://tinyolearn.vercel.app/api/webhook');
  await sendCmd('type', 'input[type="url"]', 'https://tinyolearn.vercel.app/api/webhook');
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Step 2: Description (optional)
  console.log('\n📍 STEP 2: Adding description...');
  await sendCmd('type', 'textarea[name="description"]', 'TinyOLearn payment webhook');
  await sendCmd('type', 'input[name="description"]', 'TinyOLearn payment webhook');
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Step 3: Select events
  console.log('\n📍 STEP 3: Selecting events...');
  console.log('Looking for event selection area...\n');
  
  // Click on "Select events" button if exists
  await sendCmd('click', 'button:contains("Select events")');
  await sendCmd('click', '[aria-label*="Select events"]');
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Select the three required events
  const events = [
    'checkout.session.completed',
    'payment_intent.succeeded', 
    'payment_intent.payment_failed'
  ];
  
  for (const event of events) {
    console.log(`  ✓ Selecting: ${event}`);
    
    // Search for event
    await sendCmd('click', 'input[type="search"]');
    await sendCmd('clear');
    await sendCmd('type', 'input[type="search"]', event);
    
    await new Promise(r => setTimeout(r, 1500));
    
    // Try multiple ways to select checkbox
    await sendCmd('click', `input[value="${event}"]`);
    await sendCmd('click', `label:contains("${event}")`);
    await sendCmd('click', `[aria-label*="${event}"]`);
    
    await new Promise(r => setTimeout(r, 1000));
  }
  
  // Step 4: Submit
  console.log('\n📍 STEP 4: Creating webhook endpoint...');
  
  // Highlight submit buttons
  await sendCmd('highlight', 'button[type="submit"]', 'yellow');
  await sendCmd('highlight', 'button:contains("Add endpoint")', 'yellow');
  await sendCmd('highlight', 'button:contains("Create")', 'yellow');
  
  console.log('\n✅ READY TO SUBMIT!');
  console.log('\nClick the highlighted button to create the webhook.');
  console.log('After creating, copy the webhook secret (whsec_...)');
  console.log('\nAdd to Vercel:');
  console.log('  Name: STRIPE_WEBHOOK_SECRET');
  console.log('  Value: [paste the whsec_ value]');
}

// Run
completeWebhookSetup().catch(console.error);
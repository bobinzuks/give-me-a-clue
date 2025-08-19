#!/usr/bin/env node

const WebSocket = require('ws');

console.log('📋 MANUAL WEBHOOK SETUP INSTRUCTIONS');
console.log('====================================\n');
console.log('You are on: https://dashboard.stripe.com/workbench/webhooks/create\n');

console.log('Please fill the form manually:\n');
console.log('1️⃣ ENDPOINT URL:');
console.log('   👉 https://tinyolearn.vercel.app/api/webhook\n');

console.log('2️⃣ DESCRIPTION (optional):');
console.log('   👉 TinyOLearn Payment Webhook\n');

console.log('3️⃣ EVENTS TO LISTEN FOR:');
console.log('   Search and select these 3 events:');
console.log('   ✅ checkout.session.completed');
console.log('   ✅ payment_intent.succeeded');
console.log('   ✅ payment_intent.payment_failed\n');

console.log('4️⃣ CLICK: "Add endpoint" or "Create" button\n');

console.log('5️⃣ COPY: The webhook secret (starts with whsec_)\n');

console.log('6️⃣ ADD TO VERCEL:');
console.log('   Name: STRIPE_WEBHOOK_SECRET');
console.log('   Value: [paste the whsec_ value]\n');

// Also try to highlight the form fields
const ws = new WebSocket('ws://localhost:8765');

ws.on('open', () => {
  // Highlight URL input
  ws.send(JSON.stringify({
    action: 'highlight',
    selector: 'input[type="url"]',
    color: 'green'
  }));
  
  // Highlight search box
  setTimeout(() => {
    ws.send(JSON.stringify({
      action: 'highlight',
      selector: 'input[type="search"]',
      color: 'blue'
    }));
  }, 1000);
  
  // Highlight submit button
  setTimeout(() => {
    ws.send(JSON.stringify({
      action: 'highlight',
      selector: 'button[type="submit"]',
      color: 'yellow'
    }));
  }, 2000);
  
  setTimeout(() => {
    ws.close();
  }, 3000);
});

ws.on('error', () => {
  console.log('Extension not connected, but instructions above still apply!');
});

#!/usr/bin/env node

const WebSocket = require('ws');

console.log('📋 Selecting Stripe Payment Events');
console.log('===================================\n');

const ws = new WebSocket('ws://localhost:8765');

ws.on('open', async () => {
  console.log('Connected\n');
  
  const script = `
    // Look for checkout.session.completed
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    let found = [];
    
    checkboxes.forEach(checkbox => {
      const label = checkbox.parentElement?.textContent || '';
      const value = checkbox.value || '';
      
      // Look for our specific events
      if (value.includes('checkout.session.completed') || 
          label.includes('checkout.session.completed')) {
        checkbox.click();
        found.push('checkout.session.completed');
        checkbox.style.outline = '3px solid green';
      }
      
      if (value.includes('payment_intent.succeeded') || 
          label.includes('payment_intent.succeeded')) {
        checkbox.click();
        found.push('payment_intent.succeeded');
        checkbox.style.outline = '3px solid green';
      }
      
      if (value.includes('payment_intent.payment_failed') || 
          label.includes('payment_intent.payment_failed')) {
        checkbox.click();
        found.push('payment_intent.payment_failed');
        checkbox.style.outline = '3px solid green';
      }
    });
    
    // Try searching for events if not found
    if (found.length === 0) {
      const searchBox = document.querySelector('input[type="search"], input[placeholder*="Search"]');
      if (searchBox) {
        searchBox.value = 'checkout.session.completed';
        searchBox.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('Searched for checkout.session.completed');
      }
    }
    
    console.log('Found events:', found);
    'Events selected: ' + found.join(', ');
  `;
  
  ws.send(JSON.stringify({
    action: 'custom_script',
    script: script
  }));
  
  setTimeout(() => {
    console.log('\nNow searching for remaining events...');
    ws.close();
  }, 2000);
});

ws.on('error', (err) => {
  console.error('Error:', err.message);
});
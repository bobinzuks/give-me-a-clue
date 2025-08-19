#!/usr/bin/env node

const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8765');

ws.on('open', () => {
  console.log('🔍 Looking for Add/Create button...\n');
  
  const script = `
    // Find all buttons and highlight them
    const buttons = document.querySelectorAll('button, [role="button"], a.Button');
    let found = false;
    
    buttons.forEach((btn, i) => {
      const text = btn.textContent || btn.innerText || '';
      console.log('Button ' + i + ': ' + text);
      
      // Highlight all buttons
      btn.style.border = '2px solid red';
      
      // Special highlight for Add/Create buttons
      if (text.includes('Add') || text.includes('Create') || text.includes('New')) {
        btn.style.border = '4px solid #00FF00';
        btn.style.boxShadow = '0 0 20px #00FF00';
        found = true;
        
        // Try clicking it
        setTimeout(() => {
          btn.click();
          console.log('Clicked: ' + text);
        }, 1000);
      }
    });
    
    // Also look for floating action buttons (FAB)
    const fabs = document.querySelectorAll('[class*="fab"], [class*="float"], [aria-label*="Add"]');
    fabs.forEach(fab => {
      fab.style.border = '4px solid blue';
      const label = fab.getAttribute('aria-label') || '';
      if (label.includes('Add')) {
        fab.click();
        console.log('Clicked FAB: ' + label);
      }
    });
    
    // Look for the plus icon button
    const plusButtons = document.querySelectorAll('button svg, [role="button"] svg');
    plusButtons.forEach(btn => {
      const parent = btn.closest('button') || btn.closest('[role="button"]');
      if (parent) {
        parent.style.border = '4px solid purple';
      }
    });
    
    'Buttons found: ' + buttons.length + ', Add buttons: ' + found;
  `;
  
  ws.send(JSON.stringify({
    action: 'custom_script',
    script: script
  }));
  
  setTimeout(() => {
    console.log('\n✅ Check browser for highlighted buttons');
    console.log('Green = Add/Create buttons (should auto-click)');
    console.log('Red = Other buttons');
    console.log('Blue = Floating action buttons');
    console.log('Purple = Icon buttons');
    ws.close();
  }, 2000);
});

ws.on('error', (err) => {
  console.error('Connection error:', err.message);
});
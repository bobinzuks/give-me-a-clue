#!/usr/bin/env node

const WebSocket = require('ws');

async function clickAddButton() {
  console.log('🎯 Clicking Add Destination Button');
  console.log('==================================\n');
  
  const ws = new WebSocket('ws://localhost:8765');
  
  return new Promise((resolve) => {
    ws.on('open', async () => {
      console.log('Connected\n');
      
      // Try multiple methods to click the button
      const script = `
        // Find the Add destination button
        const buttons = Array.from(document.querySelectorAll('button'));
        const addButton = buttons.find(btn => 
          btn.textContent.includes('Add destination') || 
          btn.textContent.includes('Add endpoint')
        );
        
        if (addButton) {
          console.log('Found button:', addButton.textContent);
          
          // Method 1: Direct click
          addButton.click();
          
          // Method 2: Dispatch mouse events
          const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
          });
          addButton.dispatchEvent(clickEvent);
          
          // Method 3: Focus and Enter
          addButton.focus();
          const enterEvent = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            bubbles: true
          });
          addButton.dispatchEvent(enterEvent);
          
          // Highlight it
          addButton.style.border = '4px solid #00FF00';
          addButton.style.boxShadow = '0 0 20px #00FF00';
          
          'CLICKED';
        } else {
          // Try role="button" elements
          const roleButtons = document.querySelectorAll('[role="button"]');
          const found = Array.from(roleButtons).find(el => 
            el.textContent.includes('Add destination')
          );
          
          if (found) {
            found.click();
            found.style.border = '4px solid #00FF00';
            'CLICKED_ROLE';
          } else {
            'NOT_FOUND';
          }
        }
      `;
      
      ws.send(JSON.stringify({
        action: 'custom_script',
        script: script
      }));
      
      setTimeout(() => {
        ws.close();
        resolve();
      }, 2000);
    });
  });
}

clickAddButton().then(() => {
  console.log('\n✅ Complete! Check if form opened.');
});
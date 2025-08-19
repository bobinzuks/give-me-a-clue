#!/usr/bin/env node

const WebSocket = require('ws');

async function fillStripeForm() {
  console.log('📝 Filling Stripe Webhook Form');
  console.log('==============================\n');
  
  const ws = new WebSocket('ws://localhost:8765');
  
  return new Promise((resolve) => {
    ws.on('open', async () => {
      console.log('Connected\n');
      
      // Fill the form
      const script = `
        console.log('Looking for form fields...');
        
        // 1. Fill URL field
        const urlInputs = document.querySelectorAll('input[type="url"], input[placeholder*="https"], input[name="url"], input');
        let urlFilled = false;
        
        urlInputs.forEach(input => {
          if (input.type === 'url' || input.placeholder?.includes('https') || input.name === 'url') {
            input.value = 'https://tinyolearn.vercel.app/api/webhook';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            input.style.border = '2px solid #00FF00';
            urlFilled = true;
            console.log('✅ URL field filled');
          }
        });
        
        // 2. Look for event selection
        const searchInput = document.querySelector('input[type="search"]');
        if (searchInput) {
          console.log('Found search input for events');
          
          // Select the three events
          const events = [
            'checkout.session.completed',
            'payment_intent.succeeded',
            'payment_intent.payment_failed'
          ];
          
          events.forEach((event, index) => {
            setTimeout(() => {
              searchInput.value = event;
              searchInput.dispatchEvent(new Event('input', { bubbles: true }));
              
              // Try to click the checkbox
              setTimeout(() => {
                const checkbox = document.querySelector(\`input[value="\${event}"]\`);
                if (checkbox) {
                  checkbox.click();
                  console.log(\`✅ Selected: \${event}\`);
                }
              }, 500);
            }, index * 1500);
          });
        }
        
        // 3. Highlight submit button
        setTimeout(() => {
          const submitButtons = document.querySelectorAll('button[type="submit"], button');
          submitButtons.forEach(btn => {
            if (btn.textContent.includes('Add') || btn.textContent.includes('Create') || btn.textContent.includes('Save')) {
              btn.style.border = '4px solid #FFFF00';
              btn.style.boxShadow = '0 0 20px #FFFF00';
              console.log('✅ Submit button highlighted');
            }
          });
        }, 5000);
        
        'FORM_FILLED';
      `;
      
      ws.send(JSON.stringify({
        action: 'custom_script',
        script: script
      }));
      
      setTimeout(() => {
        ws.close();
        resolve();
      }, 6000);
    });
  });
}

fillStripeForm().then(() => {
  console.log('\n✅ Form filled! Click the yellow button to create webhook.');
});
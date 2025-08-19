#!/usr/bin/env node

// Test the enhanced Stripe clicker
const WebSocket = require('ws');

async function testEnhancedClicker() {
  console.log('🧪 Testing Enhanced Stripe Clicker');
  console.log('==================================\n');
  
  const ws = new WebSocket('ws://localhost:8765');
  
  return new Promise((resolve) => {
    ws.on('open', async () => {
      console.log('✅ Connected to browser\n');
      
      // Test 1: Page analysis
      console.log('📊 Test 1: Analyzing page structure...');
      ws.send(JSON.stringify({
        action: 'custom_script',
        script: `
          const analysis = {
            buttons: document.querySelectorAll('button').length,
            links: document.querySelectorAll('a').length,
            roleButtons: document.querySelectorAll('[role="button"]').length,
            clickableElements: document.querySelectorAll('[onclick], [style*="cursor: pointer"]').length,
            url: window.location.href,
            title: document.title
          };
          
          console.log('Page Analysis:', analysis);
          analysis;
        `
      }));
      
      await delay(2000);
      
      // Test 2: Find potential Stripe buttons
      console.log('🎯 Test 2: Finding Stripe-style buttons...');
      ws.send(JSON.stringify({
        action: 'custom_script',
        script: `
          const stripeButtons = [];
          
          // Look for common Stripe button patterns
          const selectors = [
            '[data-testid*="add"]',
            '[data-testid*="create"]', 
            '[role="button"]',
            '.Button',
            'button',
            'a[href*="create"]',
            '[aria-label*="Add"]',
            '[aria-label*="Create"]'
          ];
          
          selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
              const text = el.textContent?.trim() || '';
              if (text.toLowerCase().includes('add') || 
                  text.toLowerCase().includes('create') || 
                  text.toLowerCase().includes('new') ||
                  text === '+') {
                stripeButtons.push({
                  selector,
                  tag: el.tagName,
                  text: text.substring(0, 50),
                  class: el.className,
                  role: el.getAttribute('role'),
                  testid: el.getAttribute('data-testid')
                });
              }
            });
          });
          
          console.log('Found potential Stripe buttons:', stripeButtons);
          stripeButtons;
        `
      }));
      
      await delay(2000);
      
      // Test 3: Test enhanced clicking on role="button" elements
      console.log('🖱️  Test 3: Testing enhanced click on role="button" elements...');
      ws.send(JSON.stringify({
        action: 'enhanced_click',
        selector: '[role="button"]'
      }));
      
      await delay(2000);
      
      // Test 4: Try clicking Stripe Button components
      console.log('🖱️  Test 4: Testing Stripe .Button components...');
      ws.send(JSON.stringify({
        action: 'enhanced_click',
        selector: '.Button'
      }));
      
      await delay(2000);
      
      // Test 5: Highlight all clickable elements for visual inspection
      console.log('🎨 Test 5: Highlighting all clickable elements...');
      const highlightSelectors = [
        'button',
        '[role="button"]', 
        '.Button',
        'a[href*="create"]',
        'a[href*="add"]',
        '[data-testid*="button"]'
      ];
      
      for (let i = 0; i < highlightSelectors.length; i++) {
        const color = ['red', 'green', 'blue', 'yellow', 'orange', 'purple'][i];
        ws.send(JSON.stringify({
          action: 'highlight',
          selector: highlightSelectors[i],
          color: color
        }));
        await delay(300);
      }
      
      console.log('\n✅ Enhanced clicker test completed!');
      console.log('Check the page for:');
      console.log('- Colored highlights on different element types');
      console.log('- Console output in browser dev tools');
      console.log('- Any modals or navigation that occurred from clicks');
      
      setTimeout(() => {
        ws.close();
        resolve();
      }, 3000);
    });
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        if (message.type === 'script_result') {
          console.log('📋 Script result:', message.success ? '✅' : '❌');
          if (message.result) {
            console.log('   Result:', message.result);
          }
          if (message.error) {
            console.log('   Error:', message.error);
          }
        } else if (message.type === 'action_result') {
          console.log('🎯 Action result:', message.success ? '✅' : '❌', message.action);
          if (message.elementInfo) {
            console.log('   Element:', message.elementInfo);
          }
        }
      } catch (err) {
        console.log('📨 Raw message:', data.toString());
      }
    });
    
    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error.message);
      resolve();
    });
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

testEnhancedClicker();
#!/usr/bin/env node

// Enhanced Stripe Button Clicker - Robust solution for modern SPAs
const WebSocket = require('ws');

class StripeClicker {
  constructor() {
    this.ws = null;
    this.isConnected = false;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket('ws://localhost:8765');
      
      this.ws.on('open', () => {
        console.log('✅ Connected to browser extension');
        this.isConnected = true;
        resolve();
      });
      
      this.ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error.message);
        reject(error);
      });
      
      this.ws.on('close', () => {
        console.log('🔌 Connection closed');
        this.isConnected = false;
      });
    });
  }

  async sendCommand(command) {
    if (!this.isConnected) {
      throw new Error('Not connected to browser');
    }
    
    return new Promise((resolve) => {
      this.ws.send(JSON.stringify(command));
      setTimeout(resolve, 300); // Short delay for processing
    });
  }

  // Enhanced click function that handles modern SPA issues
  async robustClick(selector, retries = 3) {
    console.log(`🎯 Attempting robust click on: ${selector}`);
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`   Attempt ${attempt}/${retries}`);
        
        // Step 1: Highlight the element to verify it exists
        await this.sendCommand({
          action: 'custom_script',
          script: `
            const elements = document.querySelectorAll('${selector.replace(/'/g, "\\'")}');
            console.log('Found elements:', elements.length);
            elements.forEach((el, i) => {
              el.style.outline = '3px solid red';
              el.style.outlineOffset = '2px';
              console.log('Element', i, ':', el.tagName, el.className, el.textContent?.substring(0, 50));
            });
            return elements.length;
          `
        });
        
        await this.delay(500);
        
        // Step 2: Try multiple click strategies
        const clickStrategies = [
          // Strategy 1: Direct click with event bubbling
          `
            const el = document.querySelector('${selector.replace(/'/g, "\\'")}');
            if (el) {
              el.scrollIntoView({behavior: 'smooth', block: 'center'});
              setTimeout(() => {
                el.click();
                el.dispatchEvent(new Event('click', {bubbles: true, cancelable: true}));
              }, 200);
              return 'direct_click';
            }
            return null;
          `,
          
          // Strategy 2: Mouse events simulation
          `
            const el = document.querySelector('${selector.replace(/'/g, "\\'")}');
            if (el) {
              const rect = el.getBoundingClientRect();
              const x = rect.left + rect.width / 2;
              const y = rect.top + rect.height / 2;
              
              ['mousedown', 'mouseup', 'click'].forEach(type => {
                el.dispatchEvent(new MouseEvent(type, {
                  view: window,
                  bubbles: true,
                  cancelable: true,
                  clientX: x,
                  clientY: y
                }));
              });
              return 'mouse_simulation';
            }
            return null;
          `,
          
          // Strategy 3: Focus and Enter key
          `
            const el = document.querySelector('${selector.replace(/'/g, "\\'")}');
            if (el) {
              el.focus();
              el.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                bubbles: true,
                cancelable: true
              }));
              return 'keyboard_enter';
            }
            return null;
          `,
          
          // Strategy 4: Find and click parent with onclick handler
          `
            const el = document.querySelector('${selector.replace(/'/g, "\\'")}');
            if (el) {
              let current = el;
              while (current && current !== document.body) {
                if (current.onclick || current.addEventListener || current.hasAttribute('role')) {
                  current.click();
                  return 'parent_handler';
                }
                current = current.parentElement;
              }
            }
            return null;
          `
        ];
        
        for (const strategy of clickStrategies) {
          console.log(`     Trying click strategy...`);
          
          await this.sendCommand({
            action: 'custom_script',
            script: strategy
          });
          
          await this.delay(800);
          
          // Check if page changed or modal opened
          const pageChange = await this.sendCommand({
            action: 'custom_script',
            script: `
              const hasModal = document.querySelector('[role="dialog"], .modal, [class*="Modal"]');
              const urlChanged = window.location.href !== window.lastUrl;
              window.lastUrl = window.location.href;
              return {hasModal: !!hasModal, urlChanged, currentUrl: window.location.href};
            `
          });
          
          if (pageChange) {
            console.log('✅ Click appears successful - page state changed');
            return true;
          }
        }
        
        // If direct selectors fail, try broader search
        if (attempt === retries) {
          console.log('🔍 Trying fallback text-based search...');
          await this.textBasedClick(['Add', 'Create', 'New', '+']);
        }
        
      } catch (error) {
        console.log(`   ❌ Attempt ${attempt} failed:`, error.message);
      }
      
      if (attempt < retries) {
        await this.delay(1000);
      }
    }
    
    console.log('❌ All click attempts failed');
    return false;
  }

  // Fallback: Search for buttons by text content
  async textBasedClick(searchTexts) {
    const script = `
      const searchTexts = ${JSON.stringify(searchTexts)};
      let found = false;
      
      searchTexts.forEach(text => {
        if (found) return;
        
        const elements = Array.from(document.querySelectorAll('*')).filter(el => {
          const txt = el.textContent?.trim() || '';
          const isClickable = el.tagName === 'BUTTON' || 
                            el.tagName === 'A' || 
                            el.getAttribute('role') === 'button' ||
                            el.onclick ||
                            el.style.cursor === 'pointer';
          return isClickable && (txt === text || txt.includes(text));
        });
        
        elements.forEach(el => {
          if (!found) {
            console.log('Found text-based element:', text, el);
            el.style.background = 'yellow';
            el.click();
            el.dispatchEvent(new Event('click', {bubbles: true}));
            found = true;
          }
        });
      });
      
      return found;
    `;
    
    await this.sendCommand({
      action: 'custom_script',
      script: script
    });
  }

  // Analyze page for clickable elements
  async analyzePage() {
    console.log('🔍 Analyzing page structure...');
    
    const analysisScript = `
      const analysis = {
        buttons: document.querySelectorAll('button').length,
        links: document.querySelectorAll('a').length,
        roleButtons: document.querySelectorAll('[role="button"]').length,
        clickableElements: document.querySelectorAll('[onclick], [style*="cursor: pointer"]').length,
        forms: document.querySelectorAll('form').length,
        modals: document.querySelectorAll('[role="dialog"], .modal, [class*="Modal"]').length,
        iframes: document.querySelectorAll('iframe').length,
        currentUrl: window.location.href,
        title: document.title
      };
      
      // Find potential "Add" buttons
      const addButtons = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent?.toLowerCase() || '';
        const isClickable = el.tagName === 'BUTTON' || 
                          el.tagName === 'A' || 
                          el.getAttribute('role') === 'button' ||
                          window.getComputedStyle(el).cursor === 'pointer';
        return isClickable && (text.includes('add') || text.includes('create') || text.includes('new'));
      }).slice(0, 5);
      
      analysis.potentialAddButtons = addButtons.map(el => ({
        tag: el.tagName,
        text: el.textContent?.trim(),
        class: el.className,
        id: el.id,
        role: el.getAttribute('role'),
        href: el.href
      }));
      
      console.log('Page Analysis:', analysis);
      return analysis;
    `;
    
    await this.sendCommand({
      action: 'custom_script',
      script: analysisScript
    });
  }

  // Wait for element to appear with timeout
  async waitForElement(selector, timeout = 10000) {
    const script = `
      return new Promise((resolve) => {
        const startTime = Date.now();
        
        function check() {
          const el = document.querySelector('${selector.replace(/'/g, "\\'")}');
          if (el) {
            resolve(true);
          } else if (Date.now() - startTime > ${timeout}) {
            resolve(false);
          } else {
            setTimeout(check, 500);
          }
        }
        
        check();
      });
    `;
    
    await this.sendCommand({
      action: 'custom_script',
      script: script
    });
  }

  // Smart selector finder for Stripe pages
  async findStripeButtons() {
    console.log('🎯 Searching for Stripe-specific buttons...');
    
    const stripeSelectors = [
      // Stripe's current design system selectors
      '[data-testid*="add"]',
      '[data-testid*="create"]',
      '[data-testid*="new"]',
      '[data-testid*="button"]',
      
      // Stripe Button components
      '.Button[role="button"]',
      '.PressableCore[role="button"]',
      'button.Button',
      
      // Text-based searches in Stripe components
      'button:has-text("Add")',
      'button:has-text("Create")',
      '[role="button"]:has-text("Add")',
      '[role="button"]:has-text("Create")',
      
      // Stripe's navigation and action elements
      'a[href*="create"]',
      'a[href*="/new"]',
      'a[href*="add"]',
      
      // Aria labels
      '[aria-label*="Add"]',
      '[aria-label*="Create"]',
      '[aria-label*="New"]',
      
      // Plus icons (often used for add buttons)
      'button svg[data-testid*="plus"]',
      'button svg[class*="plus"]',
      '[role="button"] svg[viewBox*="12"][viewBox*="12"]' // Common plus icon viewBox
    ];
    
    for (let i = 0; i < stripeSelectors.length; i++) {
      const selector = stripeSelectors[i];
      console.log(`Testing selector ${i + 1}/${stripeSelectors.length}: ${selector}`);
      
      const success = await this.robustClick(selector, 1);
      
      if (success) {
        console.log(`✅ Success with selector: ${selector}`);
        return true;
      }
      
      await this.delay(500);
    }
    
    return false;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Enhanced content script injection
const enhancedContentScript = `
// Enhanced content script for modern SPA interaction
(function() {
  'use strict';
  
  // Override click method to handle React event system
  const originalClick = Element.prototype.click;
  Element.prototype.click = function() {
    console.log('Enhanced click on:', this);
    
    // Try original click first
    originalClick.call(this);
    
    // Also trigger React synthetic events
    const reactEvents = ['onClick', '__reactEventHandlers$', '_reactInternalFiber'];
    reactEvents.forEach(prop => {
      if (this[prop] && typeof this[prop].onClick === 'function') {
        this[prop].onClick({
          preventDefault: () => {},
          stopPropagation: () => {},
          target: this,
          currentTarget: this,
          type: 'click'
        });
      }
    });
    
    // Dispatch additional events for SPAs
    this.dispatchEvent(new Event('mousedown', {bubbles: true}));
    this.dispatchEvent(new Event('mouseup', {bubbles: true}));
    this.dispatchEvent(new Event('click', {bubbles: true}));
  };
  
  // Add custom click method for WebSocket commands
  window.customClick = function(selector) {
    const elements = document.querySelectorAll(selector);
    console.log(\`Found \${elements.length} elements for: \${selector}\`);
    
    elements.forEach((el, index) => {
      console.log(\`Clicking element \${index + 1}:\`, el);
      
      // Multiple click strategies
      try {
        // Strategy 1: Scroll into view and click
        el.scrollIntoView({behavior: 'smooth', block: 'center'});
        setTimeout(() => {
          el.click();
        }, 200);
        
        // Strategy 2: Simulate mouse events
        const rect = el.getBoundingClientRect();
        const mouseEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + rect.height / 2
        });
        el.dispatchEvent(mouseEvent);
        
        // Strategy 3: If it's a form element, try submit
        const form = el.closest('form');
        if (form && el.type === 'submit') {
          form.submit();
        }
        
      } catch (error) {
        console.error('Click error:', error);
      }
    });
    
    return elements.length;
  };
  
  // MutationObserver to detect dynamic content
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        console.log('DOM updated, new nodes added');
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  });
  
  console.log('Enhanced Stripe clicker loaded');
})();
`;

// Main execution function
async function main() {
  console.log('🚀 Enhanced Stripe Button Clicker');
  console.log('==================================\n');
  
  const clicker = new StripeClicker();
  
  try {
    await clicker.connect();
    
    // Inject enhanced content script
    console.log('📝 Injecting enhanced content script...');
    await clicker.sendCommand({
      action: 'custom_script',
      script: enhancedContentScript
    });
    
    // Analyze the page first
    await clicker.analyzePage();
    await clicker.delay(1000);
    
    // Try to find and click Stripe buttons
    console.log('\n🎯 Starting enhanced button detection...');
    const success = await clicker.findStripeButtons();
    
    if (!success) {
      console.log('\n🔍 Fallback: Trying generic button patterns...');
      await clicker.textBasedClick(['Add endpoint', 'Create endpoint', 'Add', 'Create', 'New', '+']);
    }
    
    console.log('\n✅ Enhanced clicking sequence completed');
    console.log('Check if any modals opened or navigation occurred');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await clicker.delay(2000);
    await clicker.close();
  }
}

// Add custom_script handling to content script
const contentScriptEnhancement = `
// Handle custom_script commands
function handleCommand(command) {
  console.log('Received command:', command);
  
  switch(command.action) {
    case 'custom_script':
      try {
        const result = eval(command.script);
        console.log('Script result:', result);
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'script_result',
            result: result,
            success: true
          }));
        }
      } catch (error) {
        console.error('Script execution error:', error);
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'script_result',
            error: error.message,
            success: false
          }));
        }
      }
      break;
      
    // ... existing cases
  }
}
`;

if (require.main === module) {
  main();
}

module.exports = { StripeClicker, enhancedContentScript };
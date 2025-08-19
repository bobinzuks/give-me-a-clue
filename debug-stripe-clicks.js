#!/usr/bin/env node

// Debug script to analyze why clicks aren't working on Stripe
const WebSocket = require('ws');

async function debugStripeClicks() {
  console.log('🔧 Stripe Click Debug Tool');
  console.log('===========================\n');
  
  const ws = new WebSocket('ws://localhost:8765');
  
  return new Promise((resolve) => {
    ws.on('open', async () => {
      console.log('✅ Connected to browser\n');
      
      // Debug 1: Analyze page architecture
      console.log('🏗️  Debug 1: Analyzing page architecture...');
      ws.send(JSON.stringify({
        action: 'custom_script',
        script: `
          console.log('=== PAGE ARCHITECTURE ANALYSIS ===');
          
          const analysis = {
            // Basic structure
            framework: 'unknown',
            hasReact: !!window.React,
            hasAngular: !!window.angular,
            hasVue: !!window.Vue,
            
            // Shadow DOM check
            shadowRoots: document.querySelectorAll('*').length - document.querySelectorAll('*:not([shadow])').length,
            
            // Event system analysis
            clickHandlers: 0,
            
            // Element counts
            buttons: document.querySelectorAll('button').length,
            roleButtons: document.querySelectorAll('[role="button"]').length,
            links: document.querySelectorAll('a').length,
            clickableElements: 0,
            
            // Stripe specific
            stripeClasses: document.querySelectorAll('[class*="stripe"], [class*="Stripe"]').length,
            hashClasses: document.querySelectorAll('[class*="⚙"]').length,
            
            // CSP and security
            cspMeta: !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'),
            
            url: window.location.href
          };
          
          // Count elements with click handlers
          document.querySelectorAll('*').forEach(el => {
            if (el.onclick || el.addEventListener) {
              analysis.clickHandlers++;
            }
            if (window.getComputedStyle(el).cursor === 'pointer') {
              analysis.clickableElements++;
            }
          });
          
          // Detect framework
          if (window.React || document.querySelector('[data-reactroot]')) {
            analysis.framework = 'React';
          } else if (window.angular) {
            analysis.framework = 'Angular';
          } else if (window.Vue) {
            analysis.framework = 'Vue';
          }
          
          console.log('Page Analysis:', analysis);
          return analysis;
        `
      }));
      
      await delay(2000);
      
      // Debug 2: Find all potential add/create buttons
      console.log('🎯 Debug 2: Scanning for add/create buttons...');
      ws.send(JSON.stringify({
        action: 'custom_script',
        script: `
          console.log('=== BUTTON DETECTION ===');
          
          const potentialButtons = [];
          
          // Scan all elements
          document.querySelectorAll('*').forEach((el, index) => {
            const text = el.textContent?.toLowerCase() || '';
            const isClickable = 
              el.tagName === 'BUTTON' ||
              el.tagName === 'A' ||
              el.getAttribute('role') === 'button' ||
              el.onclick ||
              window.getComputedStyle(el).cursor === 'pointer';
            
            const isRelevant = 
              text.includes('add') ||
              text.includes('create') ||
              text.includes('new') ||
              text.includes('+') ||
              text.includes('endpoint') ||
              text.includes('webhook');
            
            if (isClickable && isRelevant) {
              // Get computed styles
              const styles = window.getComputedStyle(el);
              
              potentialButtons.push({
                index,
                tag: el.tagName,
                text: el.textContent?.trim().substring(0, 100),
                className: el.className?.substring(0, 100),
                id: el.id,
                role: el.getAttribute('role'),
                testid: el.getAttribute('data-testid'),
                href: el.href,
                
                // Event handlers
                hasOnclick: !!el.onclick,
                hasEventListeners: Object.keys(el).some(key => key.startsWith('on')),
                
                // Position and visibility
                visible: styles.display !== 'none' && styles.visibility !== 'hidden',
                opacity: styles.opacity,
                zIndex: styles.zIndex,
                position: styles.position,
                
                // Dimensions
                width: el.offsetWidth,
                height: el.offsetHeight,
                
                // React fiber (if exists)
                hasReactFiber: !!el._reactInternalFiber,
                
                // Parent info
                parentTag: el.parentElement?.tagName,
                parentClass: el.parentElement?.className?.substring(0, 50)
              });
            }
          });
          
          console.log('Found potential buttons:', potentialButtons.length);
          potentialButtons.forEach((btn, i) => {
            console.log(\`Button \${i + 1}:\`, btn);
          });
          
          return potentialButtons.slice(0, 10); // Return top 10
        `
      }));
      
      await delay(3000);
      
      // Debug 3: Test click event propagation
      console.log('🖱️  Debug 3: Testing click event propagation...');
      ws.send(JSON.stringify({
        action: 'custom_script',
        script: `
          console.log('=== CLICK EVENT TESTING ===');
          
          // Create a test element to understand event system
          const testButton = document.createElement('button');
          testButton.textContent = 'TEST BUTTON';
          testButton.style.position = 'fixed';
          testButton.style.top = '10px';
          testButton.style.right = '10px';
          testButton.style.zIndex = '999999';
          testButton.style.background = 'red';
          testButton.style.color = 'white';
          testButton.style.padding = '10px';
          
          let clickCount = 0;
          testButton.addEventListener('click', (e) => {
            clickCount++;
            console.log('Test button clicked!', clickCount, e);
          });
          
          document.body.appendChild(testButton);
          
          // Test different click methods
          setTimeout(() => {
            console.log('Testing native click...');
            testButton.click();
          }, 100);
          
          setTimeout(() => {
            console.log('Testing event dispatch...');
            testButton.dispatchEvent(new Event('click', {bubbles: true}));
          }, 200);
          
          setTimeout(() => {
            console.log('Testing mouse event...');
            testButton.dispatchEvent(new MouseEvent('click', {
              view: window,
              bubbles: true,
              cancelable: true
            }));
          }, 300);
          
          return 'Click test started - check console';
        `
      }));
      
      await delay(2000);
      
      // Debug 4: Analyze event listeners on potential buttons
      console.log('👂 Debug 4: Analyzing event listeners on buttons...');
      ws.send(JSON.stringify({
        action: 'custom_script',
        script: `
          console.log('=== EVENT LISTENER ANALYSIS ===');
          
          const buttonAnalysis = [];
          
          // Look at the first few buttons/clickable elements
          const buttons = document.querySelectorAll('button, [role="button"], a');
          
          Array.from(buttons).slice(0, 5).forEach((btn, i) => {
            const analysis = {
              index: i,
              tag: btn.tagName,
              text: btn.textContent?.substring(0, 50),
              
              // Direct event handlers
              onclick: !!btn.onclick,
              
              // React event handlers
              reactProps: Object.keys(btn).filter(key => 
                key.startsWith('__reactEventHandlers') || 
                key.startsWith('_reactInternalFiber')
              ),
              
              // Computed style
              cursor: window.getComputedStyle(btn).cursor,
              
              // Try to detect framework event handlers
              eventKeys: Object.keys(btn).filter(key => key.startsWith('on')),
              
              // Check for data attributes
              dataAttribs: Array.from(btn.attributes)
                .filter(attr => attr.name.startsWith('data-'))
                .map(attr => attr.name + '=' + attr.value)
            };
            
            buttonAnalysis.push(analysis);
            
            console.log(\`Button \${i + 1} analysis:\`, analysis);
          });
          
          return buttonAnalysis;
        `
      }));
      
      await delay(2000);
      
      // Debug 5: Test actual clicking with detailed logging
      console.log('🎪 Debug 5: Testing actual clicks with detailed logging...');
      ws.send(JSON.stringify({
        action: 'custom_script',
        script: `
          console.log('=== ACTUAL CLICK TESTING ===');
          
          // Find the most likely add button
          const candidates = Array.from(document.querySelectorAll('*')).filter(el => {
            const text = el.textContent?.toLowerCase() || '';
            const isButton = el.tagName === 'BUTTON' || el.getAttribute('role') === 'button';
            return isButton && (text.includes('add') || text.includes('create') || text === '+');
          });
          
          console.log('Click candidates found:', candidates.length);
          
          if (candidates.length > 0) {
            const target = candidates[0];
            console.log('Testing click on:', {
              tag: target.tagName,
              text: target.textContent?.substring(0, 50),
              class: target.className?.substring(0, 50),
              role: target.getAttribute('role')
            });
            
            // Highlight the target
            target.style.outline = '5px solid lime';
            target.style.outlineOffset = '2px';
            
            // Multiple click strategies with logging
            const strategies = [
              () => {
                console.log('Strategy 1: Native click');
                target.click();
              },
              () => {
                console.log('Strategy 2: Event dispatch');
                target.dispatchEvent(new Event('click', {bubbles: true, cancelable: true}));
              },
              () => {
                console.log('Strategy 3: Mouse events');
                const rect = target.getBoundingClientRect();
                target.dispatchEvent(new MouseEvent('click', {
                  view: window,
                  bubbles: true,
                  cancelable: true,
                  clientX: rect.left + rect.width / 2,
                  clientY: rect.top + rect.height / 2
                }));
              },
              () => {
                console.log('Strategy 4: Focus and Enter');
                target.focus();
                target.dispatchEvent(new KeyboardEvent('keydown', {
                  key: 'Enter',
                  code: 'Enter',
                  keyCode: 13,
                  bubbles: true
                }));
              },
              () => {
                console.log('Strategy 5: Parent click (if applicable)');
                if (target.parentElement) {
                  target.parentElement.click();
                }
              }
            ];
            
            // Execute strategies with delays
            strategies.forEach((strategy, i) => {
              setTimeout(() => {
                try {
                  strategy();
                  console.log(\`Strategy \${i + 1} executed\`);
                } catch (e) {
                  console.log(\`Strategy \${i + 1} failed:\`, e.message);
                }
              }, i * 1000);
            });
            
            return 'Click strategies executed - check for page changes';
          } else {
            return 'No suitable click candidates found';
          }
        `
      }));
      
      await delay(6000);
      
      // Debug 6: Final state check
      console.log('📊 Debug 6: Final state check...');
      ws.send(JSON.stringify({
        action: 'custom_script',
        script: `
          console.log('=== FINAL STATE CHECK ===');
          
          const finalState = {
            currentUrl: window.location.href,
            hasModal: !!document.querySelector('[role="dialog"], .modal'),
            hasForm: !!document.querySelector('form'),
            pageTitle: document.title,
            
            // Check for navigation or state changes
            bodyClasses: document.body.className,
            
            // Look for success/error messages
            messages: Array.from(document.querySelectorAll('*')).filter(el => {
              const text = el.textContent?.toLowerCase() || '';
              return text.includes('error') || text.includes('success') || text.includes('created');
            }).map(el => el.textContent?.substring(0, 100))
          };
          
          console.log('Final state:', finalState);
          return finalState;
        `
      }));
      
      console.log('\n✅ Debug analysis completed!');
      console.log('Check the browser console for detailed logs.');
      console.log('Look for:');
      console.log('- Button candidates and their properties');
      console.log('- Event handler analysis');
      console.log('- Click test results');
      console.log('- Any page state changes');
      
      setTimeout(() => {
        ws.close();
        resolve();
      }, 3000);
    });
    
    ws.on('error', (err) => {
      console.error('Error:', err.message);
      resolve();
    });
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

debugStripeClicks();
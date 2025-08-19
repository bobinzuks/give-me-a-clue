// Content script for Claude Code Navigator
let ws = null;
let isConnected = false;
let overlayElements = [];

// Connect to WebSocket server
function connectWebSocket() {
  console.log('Attempting to connect to Claude Code server...');
  ws = new WebSocket('ws://localhost:8765');
  
  ws.onopen = () => {
    console.log('✅ Connected to Claude Code server');
    isConnected = true;
    sendPageInfo();
    // Notify popup of connection
    if (typeof browser !== 'undefined') {
      browser.runtime.sendMessage({ status: 'connected' });
    }
  };
  
  ws.onmessage = (event) => {
    const command = JSON.parse(event.data);
    handleCommand(command);
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  ws.onclose = () => {
    console.log('Disconnected from Claude Code server');
    isConnected = false;
    setTimeout(connectWebSocket, 3000); // Reconnect after 3 seconds
  };
}

// Send page information to Claude Code
function sendPageInfo() {
  const pageData = {
    type: 'pageInfo',
    url: window.location.href,
    title: document.title,
    html: document.documentElement.outerHTML,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  };
  
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(pageData));
  }
}

// Capture screenshot using browser API
async function captureScreenshot() {
  // Send message to background script to capture
  browser.runtime.sendMessage({
    action: 'captureScreenshot'
  }, (response) => {
    if (response && response.screenshot) {
      ws.send(JSON.stringify({
        type: 'screenshot',
        data: response.screenshot
      }));
    }
  });
}

// Handle commands from Claude Code
function handleCommand(command) {
  console.log('Received command:', command);
  
  switch(command.action) {
    case 'highlight':
      highlightElement(command.selector, command.color || 'red');
      break;
    case 'click':
      clickElement(command.selector);
      break;
    case 'scroll':
      scrollToElement(command.selector);
      break;
    case 'type':
      typeInElement(command.selector, command.text);
      break;
    case 'copy':
      copyText(command.selector);
      break;
    case 'paste':
      pasteText(command.selector, command.text);
      break;
    case 'arrow':
      showArrow(command.x, command.y, command.text);
      break;
    case 'box':
      drawBox(command.selector, command.color, command.text);
      break;
    case 'screenshot':
      captureScreenshot();
      break;
    case 'scrape':
      sendPageInfo();
      break;
    case 'clear':
      clearOverlays();
      break;
    case 'custom_script':
      executeCustomScript(command.script);
      break;
    case 'enhanced_click':
      enhancedClickElement(command.selector);
      break;
  }
}

// Highlight an element
function highlightElement(selector, color = 'red') {
  try {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      const highlight = document.createElement('div');
      highlight.className = 'claude-highlight';
      const rect = element.getBoundingClientRect();
      
      highlight.style.cssText = `
        position: fixed;
        top: ${rect.top}px;
        left: ${rect.left}px;
        width: ${rect.width}px;
        height: ${rect.height}px;
        border: 3px solid ${color};
        background: rgba(255, 0, 0, 0.1);
        pointer-events: none;
        z-index: 999999;
        box-shadow: 0 0 10px ${color};
      `;
      
      document.body.appendChild(highlight);
      overlayElements.push(highlight);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (highlight.parentNode) {
          highlight.remove();
        }
      }, 5000);
    });
  } catch (error) {
    console.error('Error highlighting element:', error);
  }
}

// Click an element
function clickElement(selector) {
  try {
    const element = document.querySelector(selector);
    if (element) {
      // Flash highlight before clicking
      highlightElement(selector, 'green');
      setTimeout(() => {
        element.click();
        ws.send(JSON.stringify({
          type: 'action_result',
          action: 'click',
          success: true,
          selector: selector
        }));
      }, 500);
    }
  } catch (error) {
    console.error('Error clicking element:', error);
  }
}

// Scroll to element
function scrollToElement(selector) {
  try {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      highlightElement(selector, 'blue');
    }
  } catch (error) {
    console.error('Error scrolling to element:', error);
  }
}

// Type in element
function typeInElement(selector, text) {
  try {
    const element = document.querySelector(selector);
    if (element) {
      highlightElement(selector, 'green');
      element.focus();
      element.value = text;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }
  } catch (error) {
    console.error('Error typing in element:', error);
  }
}

// Copy text from element
function copyText(selector) {
  try {
    const element = document.querySelector(selector);
    if (element) {
      const text = element.textContent || element.value || '';
      navigator.clipboard.writeText(text).then(() => {
        highlightElement(selector, 'blue');
        ws.send(JSON.stringify({
          type: 'copied_text',
          text: text,
          selector: selector
        }));
      });
    }
  } catch (error) {
    console.error('Error copying text:', error);
  }
}

// Paste text to element
function pasteText(selector, text) {
  try {
    const element = document.querySelector(selector);
    if (element) {
      highlightElement(selector, 'green');
      element.focus();
      element.value = text;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }
  } catch (error) {
    console.error('Error pasting text:', error);
  }
}

// Show arrow pointing to coordinates
function showArrow(x, y, text = 'Click here') {
  const arrow = document.createElement('div');
  arrow.className = 'claude-arrow';
  arrow.innerHTML = `
    <svg width="100" height="100" style="position: absolute; top: -50px; left: -50px;">
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="red" />
        </marker>
      </defs>
      <line x1="10" y1="10" x2="45" y2="45" stroke="red" stroke-width="3" marker-end="url(#arrowhead)" />
    </svg>
    <div style="position: absolute; top: -70px; left: -50px; background: red; color: white; padding: 5px 10px; border-radius: 5px; font-weight: bold;">
      ${text}
    </div>
  `;
  
  arrow.style.cssText = `
    position: fixed;
    top: ${y}px;
    left: ${x}px;
    z-index: 999999;
    pointer-events: none;
  `;
  
  document.body.appendChild(arrow);
  overlayElements.push(arrow);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (arrow.parentNode) {
      arrow.remove();
    }
  }, 5000);
}

// Draw box around element with label
function drawBox(selector, color = 'red', text = '') {
  try {
    const element = document.querySelector(selector);
    if (element) {
      const rect = element.getBoundingClientRect();
      const box = document.createElement('div');
      box.className = 'claude-box';
      
      box.style.cssText = `
        position: fixed;
        top: ${rect.top}px;
        left: ${rect.left}px;
        width: ${rect.width}px;
        height: ${rect.height}px;
        border: 3px solid ${color};
        background: transparent;
        pointer-events: none;
        z-index: 999999;
      `;
      
      if (text) {
        const label = document.createElement('div');
        label.style.cssText = `
          position: absolute;
          top: -25px;
          left: 0;
          background: ${color};
          color: white;
          padding: 3px 8px;
          border-radius: 3px;
          font-size: 12px;
          font-weight: bold;
        `;
        label.textContent = text;
        box.appendChild(label);
      }
      
      document.body.appendChild(box);
      overlayElements.push(box);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (box.parentNode) {
          box.remove();
        }
      }, 5000);
    }
  } catch (error) {
    console.error('Error drawing box:', error);
  }
}

// Clear all overlays
function clearOverlays() {
  overlayElements.forEach(element => {
    if (element.parentNode) {
      element.remove();
    }
  });
  overlayElements = [];
}

// Execute custom JavaScript with enhanced error handling
function executeCustomScript(script) {
  try {
    console.log('Executing custom script:', script.substring(0, 100) + '...');
    const result = eval(script);
    
    // Send result back through WebSocket
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'script_result',
        result: result,
        success: true,
        timestamp: Date.now()
      }));
    }
    
    return result;
  } catch (error) {
    console.error('Custom script execution error:', error);
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'script_result',
        error: error.message,
        success: false,
        timestamp: Date.now()
      }));
    }
    
    return null;
  }
}

// Enhanced click element with multiple strategies for SPAs
function enhancedClickElement(selector) {
  try {
    console.log('Enhanced click on selector:', selector);
    
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) {
      console.log('No elements found for selector:', selector);
      return;
    }
    
    elements.forEach((element, index) => {
      console.log(`Clicking element ${index + 1}/${elements.length}:`, element);
      
      // Highlight before clicking
      highlightElement(selector, 'green');
      
      setTimeout(() => {
        // Strategy 1: Scroll into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        setTimeout(() => {
          // Strategy 2: Multiple click methods
          try {
            // Focus the element if possible
            if (element.focus) {
              element.focus();
            }
            
            // Method 1: Native click
            element.click();
            
            // Method 2: Dispatch click event
            element.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }));
            
            // Method 3: Mouse events for SPAs
            const rect = element.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            
            ['mousedown', 'mouseup', 'click'].forEach(eventType => {
              element.dispatchEvent(new MouseEvent(eventType, {
                view: window,
                bubbles: true,
                cancelable: true,
                clientX: x,
                clientY: y,
                button: 0
              }));
            });
            
            // Method 4: Keyboard event for role="button"
            if (element.getAttribute('role') === 'button') {
              element.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                bubbles: true,
                cancelable: true
              }));
            }
            
            // Method 5: Try clicking parent if element seems to be a wrapper
            if (element.children.length > 0 && !element.onclick) {
              let parent = element.parentElement;
              while (parent && parent !== document.body) {
                if (parent.onclick || parent.getAttribute('role') === 'button') {
                  parent.click();
                  break;
                }
                parent = parent.parentElement;
              }
            }
            
            // Send success feedback
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'action_result',
                action: 'enhanced_click',
                success: true,
                selector: selector,
                elementInfo: {
                  tag: element.tagName,
                  className: element.className,
                  id: element.id,
                  textContent: element.textContent ? element.textContent.substring(0, 50) : ''
                }
              }));
            }
            
          } catch (clickError) {
            console.error('Click error:', clickError);
            
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'action_result',
                action: 'enhanced_click',
                success: false,
                error: clickError.message,
                selector: selector
              }));
            }
          }
        }, 500);
      }, 300);
    });
    
  } catch (error) {
    console.error('Enhanced click error:', error);
  }
}

// Enhanced SPA detection and interaction
function setupSPAEnhancements() {
  // Override native click to handle React events
  const originalClick = Element.prototype.click;
  Element.prototype.click = function() {
    console.log('Enhanced click intercepted for:', this);
    
    // Call original click
    originalClick.call(this);
    
    // Additional React/SPA event handling
    try {
      // Look for React event handlers
      const reactProps = Object.keys(this).find(key => key.startsWith('__reactEventHandlers'));
      if (reactProps && this[reactProps] && this[reactProps].onClick) {
        this[reactProps].onClick({
          preventDefault: () => {},
          stopPropagation: () => {},
          target: this,
          currentTarget: this,
          type: 'click'
        });
      }
      
      // Try _reactInternalFiber properties
      if (this._reactInternalFiber && this._reactInternalFiber.memoizedProps && this._reactInternalFiber.memoizedProps.onClick) {
        this._reactInternalFiber.memoizedProps.onClick({
          preventDefault: () => {},
          stopPropagation: () => {},
          target: this,
          currentTarget: this,
          type: 'click'
        });
      }
      
      // Dispatch additional events for better compatibility
      this.dispatchEvent(new Event('mousedown', {bubbles: true}));
      this.dispatchEvent(new Event('mouseup', {bubbles: true}));
      
    } catch (reactError) {
      console.log('React event handling failed (normal for non-React elements):', reactError);
    }
  };
  
  console.log('SPA enhancements activated');
}

// Initialize SPA enhancements
setupSPAEnhancements();

// Listen for page changes
const observer = new MutationObserver(() => {
  if (isConnected) {
    sendPageInfo();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Initialize connection
connectWebSocket();

// Listen for messages from background script
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'executeCommand') {
    handleCommand(request.command);
    sendResponse({ success: true });
  }
  return true;
});
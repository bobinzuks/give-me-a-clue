// Enhanced Visual Proof Content Script for Claude Code Navigator
let ws = null;
let isConnected = false;
let overlayElements = [];
let breadcrumbTrail = [];
let proofHistory = [];
let visualProofEnabled = true;

// Visual proof configuration
const VISUAL_PROOF_CONFIG = {
  colors: {
    primary: '#FF4444',    // Red
    secondary: '#4444FF',  // Blue  
    success: '#44FF44',    // Green
    warning: '#FFAA44',    // Orange
    info: '#44AAFF',       // Light Blue
    purple: '#AA44FF',     // Purple
    yellow: '#FFFF44',     // Yellow
    pink: '#FF44AA'        // Pink
  },
  animations: {
    pulse: 'claude-pulse 2s infinite',
    flash: 'claude-flash 0.5s ease-in-out 3',
    bounce: 'claude-bounce 1s ease-in-out 2'
  }
};

// Inject CSS for visual proof system
function injectVisualProofCSS() {
  const css = `
    @keyframes claude-pulse {
      0% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.05); }
      100% { opacity: 1; transform: scale(1); }
    }
    
    @keyframes claude-flash {
      0%, 100% { background-color: rgba(255, 68, 68, 0.1); }
      50% { background-color: rgba(255, 68, 68, 0.4); }
    }
    
    @keyframes claude-bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    @keyframes claude-slide-in {
      from { transform: translateX(-100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    .claude-visual-proof-panel {
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px;
      border-radius: 10px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 14px;
      z-index: 999999;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      max-width: 350px;
      animation: claude-slide-in 0.5s ease-out;
    }
    
    .claude-proof-counter {
      background: rgba(255,255,255,0.2);
      padding: 8px 12px;
      border-radius: 20px;
      font-weight: bold;
      margin-bottom: 10px;
      text-align: center;
    }
    
    .claude-action-log {
      max-height: 200px;
      overflow-y: auto;
      font-size: 12px;
      line-height: 1.4;
    }
    
    .claude-action-item {
      padding: 5px;
      margin-bottom: 5px;
      background: rgba(255,255,255,0.1);
      border-radius: 5px;
      border-left: 3px solid;
    }
    
    .claude-breadcrumb {
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 10px 20px;
      border-radius: 25px;
      z-index: 999999;
      font-family: monospace;
      font-size: 12px;
      animation: claude-slide-in 0.5s ease-out;
    }
    
    .claude-status-indicator {
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: #44FF44;
      color: black;
      padding: 10px 15px;
      border-radius: 20px;
      font-weight: bold;
      z-index: 999999;
      animation: claude-pulse 2s infinite;
    }
    
    .claude-highlight-advanced {
      pointer-events: none;
      z-index: 999998;
      border-radius: 5px;
      transition: all 0.3s ease;
    }
    
    .claude-text-overlay {
      position: fixed;
      background: rgba(0,0,0,0.9);
      color: white;
      padding: 8px 15px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: bold;
      z-index: 999999;
      animation: claude-bounce 1s ease-in-out 2;
    }
    
    .claude-progress-bar {
      width: 100%;
      height: 4px;
      background: rgba(255,255,255,0.2);
      border-radius: 2px;
      overflow: hidden;
      margin: 10px 0;
    }
    
    .claude-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #44FF44, #44AAFF);
      animation: claude-pulse 1.5s infinite;
    }
  `;
  
  const styleSheet = document.createElement('style');
  styleSheet.textContent = css;
  document.head.appendChild(styleSheet);
}

// Connect to WebSocket server
function connectWebSocket() {
  console.log('🔌 Attempting to connect to Claude Code Visual Proof server...');
  ws = new WebSocket('ws://localhost:8765');
  
  ws.onopen = () => {
    console.log('✅ Connected to Claude Code Visual Proof server');
    isConnected = true;
    showStatusIndicator('🟢 CONNECTED', VISUAL_PROOF_CONFIG.colors.success);
    sendPageInfo();
    createVisualProofPanel();
    
    if (typeof browser !== 'undefined') {
      browser.runtime.sendMessage({ status: 'connected' });
    }
  };
  
  ws.onmessage = (event) => {
    const command = JSON.parse(event.data);
    handleCommand(command);
  };
  
  ws.onerror = (error) => {
    console.error('❌ WebSocket error:', error);
    showStatusIndicator('🔴 ERROR', VISUAL_PROOF_CONFIG.colors.primary);
  };
  
  ws.onclose = () => {
    console.log('⚠️ Disconnected from Claude Code Visual Proof server');
    isConnected = false;
    showStatusIndicator('🟡 RECONNECTING...', VISUAL_PROOF_CONFIG.colors.warning);
    setTimeout(connectWebSocket, 3000);
  };
}

// Create visual proof panel
function createVisualProofPanel() {
  // Remove existing panel if present
  const existing = document.querySelector('.claude-visual-proof-panel');
  if (existing) existing.remove();
  
  const panel = document.createElement('div');
  panel.className = 'claude-visual-proof-panel';
  panel.innerHTML = `
    <div class="claude-proof-counter" id="claude-proof-counter">
      🎯 Actions Performed: 0
    </div>
    <div>📊 <strong>Visual Proof System Active</strong></div>
    <div class="claude-progress-bar">
      <div class="claude-progress-fill" style="width: 0%"></div>
    </div>
    <div class="claude-action-log" id="claude-action-log"></div>
  `;
  
  document.body.appendChild(panel);
  overlayElements.push(panel);
}

// Update visual proof panel
function updateVisualProofPanel(action, details) {
  const counter = document.getElementById('claude-proof-counter');
  const log = document.getElementById('claude-action-log');
  
  if (counter && log) {
    proofHistory.push({ action, details, timestamp: new Date() });
    counter.textContent = `🎯 Actions Performed: ${proofHistory.length}`;
    
    const logItem = document.createElement('div');
    logItem.className = 'claude-action-item';
    logItem.style.borderLeftColor = getActionColor(action);
    
    const time = new Date().toLocaleTimeString();
    logItem.innerHTML = `
      <strong>${getActionIcon(action)} ${action.toUpperCase()}</strong><br>
      <span style="opacity: 0.8;">${details}</span><br>
      <small style="opacity: 0.6;">${time}</small>
    `;
    
    log.insertBefore(logItem, log.firstChild);
    
    // Keep only last 10 items
    while (log.children.length > 10) {
      log.removeChild(log.lastChild);
    }
    
    // Update progress bar
    const progressBar = document.querySelector('.claude-progress-fill');
    if (progressBar) {
      const progress = Math.min(100, (proofHistory.length / 20) * 100);
      progressBar.style.width = `${progress}%`;
    }
  }
}

// Get action-specific color
function getActionColor(action) {
  const colorMap = {
    highlight: VISUAL_PROOF_CONFIG.colors.primary,
    click: VISUAL_PROOF_CONFIG.colors.success,
    type: VISUAL_PROOF_CONFIG.colors.info,
    scroll: VISUAL_PROOF_CONFIG.colors.secondary,
    screenshot: VISUAL_PROOF_CONFIG.colors.purple,
    clear: VISUAL_PROOF_CONFIG.colors.warning
  };
  return colorMap[action] || VISUAL_PROOF_CONFIG.colors.info;
}

// Get action-specific icon
function getActionIcon(action) {
  const iconMap = {
    highlight: '🎨',
    click: '👆',
    type: '⌨️',
    scroll: '📜',
    screenshot: '📸',
    clear: '🧹',
    scrape: '🔍',
    arrow: '➡️',
    box: '📦'
  };
  return iconMap[action] || '⚡';
}

// Show status indicator
function showStatusIndicator(message, color) {
  const existing = document.querySelector('.claude-status-indicator');
  if (existing) existing.remove();
  
  const indicator = document.createElement('div');
  indicator.className = 'claude-status-indicator';
  indicator.textContent = message;
  indicator.style.backgroundColor = color;
  
  document.body.appendChild(indicator);
  overlayElements.push(indicator);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (indicator.parentNode) {
      indicator.remove();
    }
  }, 3000);
}

// Show breadcrumb trail
function showBreadcrumb(path) {
  const existing = document.querySelector('.claude-breadcrumb');
  if (existing) existing.remove();
  
  const breadcrumb = document.createElement('div');
  breadcrumb.className = 'claude-breadcrumb';
  breadcrumb.textContent = `🗺️ Navigation: ${path}`;
  
  document.body.appendChild(breadcrumb);
  overlayElements.push(breadcrumb);
  
  breadcrumbTrail.push(path);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (breadcrumb.parentNode) {
      breadcrumb.remove();
    }
  }, 5000);
}

// Enhanced highlight with multiple colors and animations
function highlightElementAdvanced(selector, options = {}) {
  try {
    const {
      color = VISUAL_PROOF_CONFIG.colors.primary,
      animation = 'claude-pulse',
      duration = 5000,
      text = '',
      persistent = false,
      style = 'outline'
    } = options;
    
    const elements = document.querySelectorAll(selector);
    
    elements.forEach((element, index) => {
      const highlight = document.createElement('div');
      highlight.className = 'claude-highlight-advanced';
      const rect = element.getBoundingClientRect();
      
      let highlightStyle = `
        position: fixed;
        top: ${rect.top}px;
        left: ${rect.left}px;
        width: ${rect.width}px;
        height: ${rect.height}px;
        pointer-events: none;
        z-index: 999998;
        animation: ${animation};
      `;
      
      if (style === 'outline') {
        highlightStyle += `
          border: 3px solid ${color};
          background: ${color}20;
          box-shadow: 0 0 15px ${color};
        `;
      } else if (style === 'fill') {
        highlightStyle += `
          background: ${color}40;
          border: 2px solid ${color};
        `;
      } else if (style === 'glow') {
        highlightStyle += `
          border: 2px solid ${color};
          box-shadow: 0 0 20px ${color}, inset 0 0 20px ${color}40;
          background: ${color}10;
        `;
      }
      
      highlight.style.cssText = highlightStyle;
      
      // Add text label if provided
      if (text) {
        const label = document.createElement('div');
        label.style.cssText = `
          position: absolute;
          top: -35px;
          left: 50%;
          transform: translateX(-50%);
          background: ${color};
          color: white;
          padding: 5px 10px;
          border-radius: 15px;
          font-size: 12px;
          font-weight: bold;
          white-space: nowrap;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        `;
        label.textContent = `${text} (${index + 1}/${elements.length})`;
        highlight.appendChild(label);
      }
      
      // Add index number for multiple elements
      if (elements.length > 1) {
        const indexLabel = document.createElement('div');
        indexLabel.style.cssText = `
          position: absolute;
          top: 5px;
          right: 5px;
          background: ${color};
          color: white;
          width: 25px;
          height: 25px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 12px;
        `;
        indexLabel.textContent = index + 1;
        highlight.appendChild(indexLabel);
      }
      
      document.body.appendChild(highlight);
      overlayElements.push(highlight);
      
      // Auto-remove unless persistent
      if (!persistent) {
        setTimeout(() => {
          if (highlight.parentNode) {
            highlight.remove();
          }
        }, duration);
      }
    });
    
    updateVisualProofPanel('highlight', `${elements.length} element(s) with ${color} ${style}`);
    
  } catch (error) {
    console.error('❌ Error highlighting element:', error);
  }
}

// Enhanced text overlay with positioning
function showTextOverlay(text, position = {}, options = {}) {
  const {
    color = VISUAL_PROOF_CONFIG.colors.info,
    duration = 3000,
    size = 'medium'
  } = options;
  
  const overlay = document.createElement('div');
  overlay.className = 'claude-text-overlay';
  overlay.textContent = text;
  
  // Position based on parameters or center of screen
  const x = position.x || window.innerWidth / 2;
  const y = position.y || window.innerHeight / 2;
  
  overlay.style.cssText += `
    top: ${y}px;
    left: ${x}px;
    transform: translate(-50%, -50%);
    background: ${color};
    font-size: ${size === 'large' ? '18px' : size === 'small' ? '12px' : '14px'};
  `;
  
  document.body.appendChild(overlay);
  overlayElements.push(overlay);
  
  setTimeout(() => {
    if (overlay.parentNode) {
      overlay.remove();
    }
  }, duration);
}

// Capture enhanced screenshot with annotations
async function captureEnhancedScreenshot(options = {}) {
  const {
    includeAnnotations = true,
    watermark = true
  } = options;
  
  // Add watermark overlay
  if (watermark) {
    showTextOverlay('📸 CLAUDE CODE AUTOMATION PROOF', 
      { x: window.innerWidth - 200, y: 50 }, 
      { color: VISUAL_PROOF_CONFIG.colors.purple, duration: 2000, size: 'small' }
    );
  }
  
  // Wait a moment for overlays to render
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Send message to background script to capture
  if (typeof browser !== 'undefined') {
    browser.runtime.sendMessage({
      action: 'captureScreenshot',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      proofCount: proofHistory.length
    }, (response) => {
      if (response && response.screenshot) {
        ws.send(JSON.stringify({
          type: 'screenshot',
          data: response.screenshot,
          metadata: {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            proofCount: proofHistory.length,
            breadcrumb: breadcrumbTrail.join(' → ')
          }
        }));
        
        updateVisualProofPanel('screenshot', `Captured with ${proofHistory.length} actions logged`);
        showTextOverlay('📸 Screenshot Captured!', {}, { color: VISUAL_PROOF_CONFIG.colors.success });
      }
    });
  }
}

// Send enhanced page information
function sendPageInfo() {
  const pageData = {
    type: 'pageInfo',
    url: window.location.href,
    title: document.title,
    html: document.documentElement.outerHTML,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    visualProof: {
      actionsPerformed: proofHistory.length,
      breadcrumbTrail: breadcrumbTrail,
      overlaysActive: overlayElements.length,
      timestamp: new Date().toISOString()
    }
  };
  
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(pageData));
  }
}

// Enhanced command handler
function handleCommand(command) {
  console.log('📨 Received enhanced command:', command);
  
  switch(command.action) {
    case 'highlight':
      highlightElementAdvanced(command.selector, {
        color: command.color || VISUAL_PROOF_CONFIG.colors.primary,
        animation: command.animation || 'claude-pulse',
        text: command.text || 'Highlighted',
        style: command.style || 'outline',
        persistent: command.persistent || false
      });
      break;
      
    case 'multiHighlight':
      // Highlight multiple elements with different colors
      command.highlights.forEach((highlight, index) => {
        const colors = Object.values(VISUAL_PROOF_CONFIG.colors);
        highlightElementAdvanced(highlight.selector, {
          color: highlight.color || colors[index % colors.length],
          text: highlight.text || `Element ${index + 1}`,
          style: highlight.style || 'outline'
        });
      });
      break;
      
    case 'click':
      clickElementEnhanced(command.selector, command.options);
      break;
      
    case 'type':
      typeInElementEnhanced(command.selector, command.text, command.options);
      break;
      
    case 'scroll':
      scrollToElementEnhanced(command.selector, command.options);
      break;
      
    case 'screenshot':
      captureEnhancedScreenshot(command.options);
      break;
      
    case 'showText':
      showTextOverlay(command.text, command.position, command.options);
      break;
      
    case 'breadcrumb':
      showBreadcrumb(command.path);
      break;
      
    case 'visualProof':
      toggleVisualProofMode(command.enabled);
      break;
      
    case 'clear':
      clearEnhancedOverlays();
      break;
      
    case 'scrape':
      sendPageInfo();
      break;
  }
}

// Enhanced click with visual feedback
function clickElementEnhanced(selector, options = {}) {
  try {
    const element = document.querySelector(selector);
    if (element) {
      // Pre-click highlight
      highlightElementAdvanced(selector, {
        color: VISUAL_PROOF_CONFIG.colors.warning,
        animation: 'claude-flash',
        text: '🎯 About to click',
        duration: 1000
      });
      
      setTimeout(() => {
        element.click();
        
        // Post-click highlight
        highlightElementAdvanced(selector, {
          color: VISUAL_PROOF_CONFIG.colors.success,
          text: '✅ Clicked!',
          duration: 2000
        });
        
        updateVisualProofPanel('click', `Clicked: ${selector}`);
        showBreadcrumb(`Clicked → ${element.tagName}${element.id ? '#' + element.id : ''}`);
        
        ws.send(JSON.stringify({
          type: 'action_result',
          action: 'click',
          success: true,
          selector: selector,
          timestamp: new Date().toISOString()
        }));
      }, 500);
    }
  } catch (error) {
    console.error('❌ Error clicking element:', error);
  }
}

// Enhanced typing with visual feedback
function typeInElementEnhanced(selector, text, options = {}) {
  try {
    const element = document.querySelector(selector);
    if (element) {
      highlightElementAdvanced(selector, {
        color: VISUAL_PROOF_CONFIG.colors.info,
        text: '⌨️ Typing...',
        animation: 'claude-pulse',
        duration: 3000
      });
      
      element.focus();
      
      // Clear existing content if specified
      if (options.clear) {
        element.value = '';
      }
      
      // Simulate typing animation
      let currentText = element.value;
      let index = 0;
      const typeInterval = setInterval(() => {
        if (index < text.length) {
          currentText += text[index];
          element.value = currentText;
          element.dispatchEvent(new Event('input', { bubbles: true }));
          index++;
        } else {
          clearInterval(typeInterval);
          element.dispatchEvent(new Event('change', { bubbles: true }));
          
          highlightElementAdvanced(selector, {
            color: VISUAL_PROOF_CONFIG.colors.success,
            text: `✅ Typed: "${text}"`,
            duration: 2000
          });
          
          updateVisualProofPanel('type', `Entered: "${text}" into ${selector}`);
        }
      }, 100);
    }
  } catch (error) {
    console.error('❌ Error typing in element:', error);
  }
}

// Enhanced scroll with visual feedback
function scrollToElementEnhanced(selector, options = {}) {
  try {
    const element = document.querySelector(selector);
    if (element) {
      highlightElementAdvanced(selector, {
        color: VISUAL_PROOF_CONFIG.colors.secondary,
        text: '📜 Scrolling to view',
        animation: 'claude-bounce'
      });
      
      element.scrollIntoView({ 
        behavior: options.smooth !== false ? 'smooth' : 'auto', 
        block: options.block || 'center' 
      });
      
      updateVisualProofPanel('scroll', `Scrolled to: ${selector}`);
    }
  } catch (error) {
    console.error('❌ Error scrolling to element:', error);
  }
}

// Toggle visual proof mode
function toggleVisualProofMode(enabled) {
  visualProofEnabled = enabled;
  
  if (enabled) {
    createVisualProofPanel();
    showStatusIndicator('🎯 VISUAL PROOF ACTIVE', VISUAL_PROOF_CONFIG.colors.success);
  } else {
    clearEnhancedOverlays();
    showStatusIndicator('⏸️ VISUAL PROOF PAUSED', VISUAL_PROOF_CONFIG.colors.warning);
  }
}

// Clear all enhanced overlays
function clearEnhancedOverlays() {
  overlayElements.forEach(element => {
    if (element.parentNode) {
      element.remove();
    }
  });
  overlayElements = [];
  updateVisualProofPanel('clear', 'All visual overlays cleared');
}

// Initialize enhanced visual proof system
function initializeVisualProofSystem() {
  injectVisualProofCSS();
  connectWebSocket();
  
  // Show initialization message
  setTimeout(() => {
    showTextOverlay('🎯 CLAUDE CODE VISUAL PROOF SYSTEM ACTIVE', 
      {}, 
      { color: VISUAL_PROOF_CONFIG.colors.success, duration: 3000, size: 'large' }
    );
  }, 1000);
}

// Listen for page changes with enhanced feedback
const observer = new MutationObserver(() => {
  if (isConnected && visualProofEnabled) {
    sendPageInfo();
    
    // Show subtle page change indicator
    showTextOverlay('🔄 Page Updated', 
      { x: window.innerWidth - 100, y: 100 }, 
      { color: VISUAL_PROOF_CONFIG.colors.info, duration: 1000, size: 'small' }
    );
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Listen for messages from background script
if (typeof browser !== 'undefined') {
  browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'executeCommand') {
      handleCommand(request.command);
      sendResponse({ success: true });
    }
    return true;
  });
}

// Initialize the enhanced system
initializeVisualProofSystem();

// Export functions for testing
window.claudeVisualProof = {
  highlightElementAdvanced,
  showTextOverlay,
  captureEnhancedScreenshot,
  updateVisualProofPanel,
  showBreadcrumb,
  toggleVisualProofMode
};
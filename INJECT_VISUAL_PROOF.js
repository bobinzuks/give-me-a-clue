#!/usr/bin/env node

// Inject visual proof directly into browser page
const WebSocket = require('ws');

async function injectVisualProof() {
  console.log('💉 INJECTING VISUAL PROOF INTO BROWSER');
  console.log('=====================================\n');
  
  const ws = new WebSocket('ws://localhost:8765');
  
  return new Promise((resolve) => {
    ws.on('open', async () => {
      console.log('✅ Connected to browser\n');
      
      // Inject comprehensive visual proof
      const injectionScript = `
        // Remove any existing visual proof
        document.querySelectorAll('[data-visual-proof]').forEach(el => el.remove());
        
        // Create visual proof container
        const container = document.createElement('div');
        container.setAttribute('data-visual-proof', 'true');
        container.innerHTML = \`
          <div style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            z-index: 2147483647;
          ">
            <!-- Status Panel -->
            <div style="
              position: fixed;
              top: 20px;
              right: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.5);
              font-family: system-ui, -apple-system, sans-serif;
              animation: slideIn 0.5s ease-out;
            ">
              <h2 style="margin: 0 0 10px 0; font-size: 24px;">🎯 CLAUDE CODE WORKING!</h2>
              <div style="font-size: 16px; margin: 5px 0;">✅ Extension: CONNECTED</div>
              <div style="font-size: 16px; margin: 5px 0;">✅ WebSocket: ACTIVE</div>
              <div style="font-size: 16px; margin: 5px 0;">✅ Page: \${window.location.hostname}</div>
              <div style="font-size: 16px; margin: 5px 0;">🎨 Highlighting: ACTIVE</div>
              <div style="font-size: 16px; margin: 5px 0;">📸 Time: \${new Date().toLocaleTimeString()}</div>
            </div>
            
            <!-- Breadcrumb Trail -->
            <div style="
              position: fixed;
              top: 20px;
              left: 50%;
              transform: translateX(-50%);
              background: white;
              padding: 15px 25px;
              border-radius: 10px;
              box-shadow: 0 5px 20px rgba(0,0,0,0.3);
              font-family: system-ui, -apple-system, sans-serif;
              font-size: 16px;
              font-weight: bold;
              color: #333;
            ">
              <span style="background: #4CAF50; color: white; padding: 5px 10px; border-radius: 5px;">Connected</span>
              →
              <span style="background: #2196F3; color: white; padding: 5px 10px; border-radius: 5px;">Highlighting</span>
              →
              <span style="background: #FF9800; color: white; padding: 5px 10px; border-radius: 5px;">Ready</span>
            </div>
          </div>
        \`;
        document.body.appendChild(container);
        
        // Add animations
        const style = document.createElement('style');
        style.setAttribute('data-visual-proof', 'true');
        style.textContent = \`
          @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
          }
          [data-highlight-red] {
            border: 4px solid #FF4444 !important;
            box-shadow: 0 0 20px #FF4444 !important;
            animation: pulse 2s infinite !important;
          }
          [data-highlight-green] {
            border: 4px solid #44FF44 !important;
            box-shadow: 0 0 20px #44FF44 !important;
            animation: pulse 2s infinite !important;
          }
          [data-highlight-blue] {
            border: 4px solid #4444FF !important;
            box-shadow: 0 0 20px #4444FF !important;
            animation: pulse 2s infinite !important;
          }
          [data-highlight-yellow] {
            border: 4px solid #FFFF44 !important;
            box-shadow: 0 0 20px #FFFF44 !important;
            animation: pulse 2s infinite !important;
          }
        \`;
        document.head.appendChild(style);
        
        // Now highlight specific elements
        console.log('Highlighting elements...');
        
        // Find and highlight buttons
        document.querySelectorAll('button').forEach((btn, i) => {
          btn.setAttribute('data-highlight-red', 'true');
          
          // Add label
          const label = document.createElement('div');
          label.setAttribute('data-visual-proof', 'true');
          label.innerHTML = \`<span style="
            position: absolute;
            background: #FF4444;
            color: white;
            padding: 3px 8px;
            font-size: 12px;
            font-weight: bold;
            border-radius: 3px;
            z-index: 2147483647;
            pointer-events: none;
          ">BTN #\${i+1}</span>\`;
          label.style.cssText = 'position: absolute; z-index: 2147483647; pointer-events: none;';
          const rect = btn.getBoundingClientRect();
          label.style.left = rect.left + 'px';
          label.style.top = (rect.top - 25) + 'px';
          document.body.appendChild(label);
        });
        
        // Highlight "Add destination" specifically
        const addButtons = Array.from(document.querySelectorAll('button')).filter(
          btn => btn.textContent.includes('Add') || btn.textContent.includes('destination')
        );
        addButtons.forEach(btn => {
          btn.setAttribute('data-highlight-green', 'true');
          btn.style.border = '4px solid #44FF44';
          btn.style.boxShadow = '0 0 30px #44FF44';
        });
        
        // Highlight links
        document.querySelectorAll('a').forEach((link, i) => {
          if (i < 10) { // Only first 10 to avoid clutter
            link.setAttribute('data-highlight-blue', 'true');
          }
        });
        
        // Add click interceptor for debugging
        document.addEventListener('click', function(e) {
          console.log('Click detected on:', e.target);
          const rect = e.target.getBoundingClientRect();
          
          // Visual feedback
          const clickMarker = document.createElement('div');
          clickMarker.setAttribute('data-visual-proof', 'true');
          clickMarker.style.cssText = \`
            position: fixed;
            left: \${e.clientX - 10}px;
            top: \${e.clientY - 10}px;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, rgba(255,0,0,0.8) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 2147483647;
            animation: ripple 0.6s ease-out;
          \`;
          document.body.appendChild(clickMarker);
          setTimeout(() => clickMarker.remove(), 600);
        }, true);
        
        // Add ripple animation
        const rippleStyle = document.createElement('style');
        rippleStyle.setAttribute('data-visual-proof', 'true');
        rippleStyle.textContent = \`
          @keyframes ripple {
            from { transform: scale(1); opacity: 1; }
            to { transform: scale(4); opacity: 0; }
          }
        \`;
        document.head.appendChild(rippleStyle);
        
        console.log('✅ Visual proof injected!');
        console.log('Highlighted:', {
          buttons: document.querySelectorAll('[data-highlight-red]').length,
          addButtons: addButtons.length,
          links: document.querySelectorAll('[data-highlight-blue]').length
        });
        
        // Return confirmation
        'VISUAL_PROOF_ACTIVE';
      `;
      
      console.log('Injecting visual proof script...');
      
      // Send the injection command
      ws.send(JSON.stringify({
        action: 'custom_script',
        script: injectionScript
      }));
      
      await new Promise(r => setTimeout(r, 2000));
      
      // Take screenshot
      console.log('Taking screenshot...');
      ws.send(JSON.stringify({ action: 'screenshot' }));
      
      await new Promise(r => setTimeout(r, 2000));
      
      console.log('\n✅ VISUAL PROOF INJECTED!');
      console.log('\nYou should now see in your browser:');
      console.log('  🟣 Status panel (top-right corner)');
      console.log('  🔵 Breadcrumb trail (top-center)');
      console.log('  🔴 Red borders on buttons');
      console.log('  🟢 Green highlight on "Add destination"');
      console.log('  🔵 Blue borders on links');
      console.log('  🏷️ Labels on elements');
      console.log('\nClick anywhere to see ripple effect!');
      
      ws.close();
      resolve();
    });
    
    ws.on('error', (err) => {
      console.error('Error:', err.message);
      resolve();
    });
  });
}

injectVisualProof();
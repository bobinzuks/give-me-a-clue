// Background script for Claude Code Navigator

// Handle screenshot requests
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureScreenshot') {
    browser.tabs.captureVisibleTab(null, { format: 'png' })
      .then(screenshot => {
        sendResponse({ screenshot: screenshot });
      })
      .catch(error => {
        console.error('Screenshot error:', error);
        sendResponse({ error: error.message });
      });
    return true; // Will respond asynchronously
  }
});

// Connect to native messaging host (optional for better integration)
let port = null;

function connectNative() {
  try {
    port = browser.runtime.connectNative('claude_code_connector');
    
    port.onMessage.addListener((message) => {
      // Forward commands to content script
      browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          browser.tabs.sendMessage(tabs[0].id, {
            action: 'executeCommand',
            command: message
          });
        }
      });
    });
    
    port.onDisconnect.addListener(() => {
      console.log('Native messaging disconnected');
      port = null;
    });
  } catch (error) {
    console.log('Native messaging not available:', error);
  }
}

// Initialize
connectNative();
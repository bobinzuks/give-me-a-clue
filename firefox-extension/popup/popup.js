// Popup script for Claude Code Navigator

// Check connection status
function checkConnection() {
  // Send message to content script to check WebSocket status
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      browser.tabs.sendMessage(tabs[0].id, {
        action: 'checkConnection'
      }, response => {
        updateStatus(response && response.connected);
      });
    }
  });
}

// Update status display
function updateStatus(connected) {
  const statusEl = document.getElementById('status');
  if (connected) {
    statusEl.className = 'status connected';
    statusEl.textContent = 'Connected to Claude Code';
  } else {
    statusEl.className = 'status disconnected';
    statusEl.textContent = 'Disconnected';
  }
}

// Send command to content script
function sendCommand(command) {
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      browser.tabs.sendMessage(tabs[0].id, {
        action: 'executeCommand',
        command: command
      });
    }
  });
}

// Button handlers
document.getElementById('connect').addEventListener('click', () => {
  sendCommand({ action: 'connect' });
  setTimeout(checkConnection, 1000);
});

document.getElementById('screenshot').addEventListener('click', () => {
  sendCommand({ action: 'screenshot' });
});

document.getElementById('scrape').addEventListener('click', () => {
  sendCommand({ action: 'scrape' });
});

document.getElementById('clear').addEventListener('click', () => {
  sendCommand({ action: 'clear' });
});

// Check status on load
checkConnection();
setInterval(checkConnection, 3000);
# Claude Code Navigator - Firefox Extension

## Installation

### 1. Install the Extension in Firefox

1. Open Firefox
2. Navigate to `about:debugging`
3. Click "This Firefox" in the left sidebar
4. Click "Load Temporary Add-on"
5. Navigate to the `firefox-extension` directory
6. Select `manifest.json`

### 2. Start the WebSocket Server

```bash
./start-navigator.sh
```

Or manually:
```bash
cd firefox-extension/server
npm start
```

### 3. Connect Extension to Server

1. Navigate to any webpage
2. Click the Claude Code Navigator icon in Firefox toolbar
3. Click "Connect to Claude Code"
4. The status should show "Connected"

## Usage from Claude Code

### Basic Commands

```javascript
// Highlight an element
node claude-navigate.js highlight "button.submit" red

// Click an element
node claude-navigate.js click "#login-button"

// Type text
node claude-navigate.js type "input[name='username']" "myusername"

// Copy text from element
node claude-navigate.js copy ".article-content"

// Draw box with label
node claude-navigate.js box "#important-section" blue "Important!"

// Show arrow at coordinates
node claude-navigate.js arrow 500 300 "Click here"

// Take screenshot
node claude-navigate.js screenshot

// Scrape page content
node claude-navigate.js scrape

// Clear all overlays
node claude-navigate.js clear
```

### Advanced Usage

```javascript
// Fill a form
node claude-navigate.js fill-form "input[name='email']" "user@example.com" "input[name='password']" "secret"
```

### From Claude Code Session

When running in Claude Code, you can use these commands directly:

```bash
# Take screenshot of current page
./claude-navigate.js screenshot

# Highlight search box
./claude-navigate.js highlight "input[type='search']" green

# Click login button
./claude-navigate.js click "#login"

# Type in search field
./claude-navigate.js type "#search" "Claude Code integration"
```

## File Locations

- **Screenshots**: `firefox-extension/server/data/screenshot-*.png`
- **Page HTML**: `firefox-extension/server/data/page-*.html`
- **Page Metadata**: `firefox-extension/server/data/page-*.json`
- **Clipboard**: `firefox-extension/server/data/clipboard.txt`

## Troubleshooting

### Extension not connecting
- Check WebSocket server is running on port 8765
- Check browser console for errors (F12)
- Ensure no firewall blocking localhost:8765

### Commands not working
- Verify element selectors are correct
- Check if page has finished loading
- Look at server console for error messages

### Screenshot not saving
- Check permissions in manifest.json
- Ensure data directory exists and is writable

## Security Notes

- Extension runs only on local WebSocket (localhost:8765)
- No external connections made
- Screenshots and data stored locally only
- Clear data regularly: `rm -rf firefox-extension/server/data/*`

## Development

### Testing Commands
```bash
# Start server in dev mode
cd firefox-extension/server
npm run dev

# Test commands directly
node websocket-server.js
# Then type: help
```

### Modifying Extension
1. Edit files in `firefox-extension/`
2. Reload extension in Firefox (about:debugging)
3. Refresh target webpage

## Integration with Claude Flow

Add to your Claude Flow configuration:

```javascript
// In your SPARC workflow
const navigator = require('./claude-navigate');

// Use in your automation
await navigator.click('#submit');
await navigator.screenshot();
```

#!/bin/bash

# Installation script for Claude Code Navigator Firefox Extension

echo "🚀 Claude Code Navigator - Firefox Extension Installer"
echo "======================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running on Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo -e "${RED}This script is designed for Linux (Pop!_OS). Please modify for your OS.${NC}"
    exit 1
fi

# Create icons directory
echo -e "${YELLOW}Creating extension icons...${NC}"
mkdir -p firefox-extension/icons

# Generate simple SVG icons
cat > firefox-extension/icons/icon.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" fill="#4A90E2"/>
  <text x="64" y="64" text-anchor="middle" dominant-baseline="middle" 
        font-family="Arial" font-size="48" font-weight="bold" fill="white">CC</text>
  <path d="M 20 90 L 40 70 L 30 70 L 50 50 L 40 50 L 64 30 L 88 50 L 78 50 L 98 70 L 88 70 L 108 90" 
        stroke="white" stroke-width="2" fill="none"/>
</svg>
EOF

# Convert SVG to PNG (requires imagemagick)
if command -v convert &> /dev/null; then
    convert -background none firefox-extension/icons/icon.svg -resize 16x16 firefox-extension/icons/icon-16.png
    convert -background none firefox-extension/icons/icon.svg -resize 48x48 firefox-extension/icons/icon-48.png
    convert -background none firefox-extension/icons/icon.svg -resize 128x128 firefox-extension/icons/icon-128.png
    echo -e "${GREEN}✓ Icons created${NC}"
else
    echo -e "${YELLOW}ImageMagick not found. Using placeholder icons.${NC}"
    # Create placeholder icons
    for size in 16 48 128; do
        echo "placeholder" > firefox-extension/icons/icon-${size}.png
    done
fi

# Install server dependencies
echo -e "${YELLOW}Installing WebSocket server dependencies...${NC}"
cd firefox-extension/server
npm install
cd ../..
echo -e "${GREEN}✓ Server dependencies installed${NC}"

# Create launcher script
echo -e "${YELLOW}Creating launcher script...${NC}"
cat > start-navigator.sh << 'EOF'
#!/bin/bash

# Start Claude Code Navigator

echo "Starting Claude Code Navigator Server..."

# Start WebSocket server
cd firefox-extension/server
node websocket-server.js &
SERVER_PID=$!

echo "Server started with PID: $SERVER_PID"
echo "WebSocket server running on ws://localhost:8765"
echo ""
echo "To stop the server, run: kill $SERVER_PID"
echo ""
echo "Next steps:"
echo "1. Load the extension in Firefox (see README)"
echo "2. Navigate to any webpage"
echo "3. Click the extension icon to connect"
echo "4. Use Claude Code to control the browser"

# Keep script running
wait $SERVER_PID
EOF

chmod +x start-navigator.sh
echo -e "${GREEN}✓ Launcher script created${NC}"

# Create Claude Code integration script
echo -e "${YELLOW}Creating Claude Code integration...${NC}"
cat > claude-navigate.js << 'EOF'
#!/usr/bin/env node

// Claude Code Browser Navigation Interface
const ClaudeNavigator = require('./firefox-extension/server/claude-integration');
const navigator = new ClaudeNavigator();

// Parse command from Claude Code
const command = process.argv[2];
const args = process.argv.slice(3);

// Execute navigation commands
async function execute() {
  switch(command) {
    case 'highlight':
      return navigator.highlight(args[0], args[1]);
    
    case 'click':
      return navigator.click(args[0]);
    
    case 'type':
      return navigator.type(args[0], args.slice(1).join(' '));
    
    case 'copy':
      return navigator.copy(args[0]);
    
    case 'box':
      return navigator.box(args[0], args[1], args.slice(2).join(' '));
    
    case 'arrow':
      return navigator.arrow(parseInt(args[0]), parseInt(args[1]), args.slice(2).join(' '));
    
    case 'screenshot':
      return navigator.screenshot();
    
    case 'scrape':
      return navigator.scrape();
    
    case 'clear':
      return navigator.clear();
    
    case 'fill-form':
      const formData = {};
      for (let i = 0; i < args.length; i += 2) {
        formData[args[i]] = args[i + 1];
      }
      return navigator.fillForm(formData);
    
    default:
      console.log('Usage: node claude-navigate.js <command> [args]');
      console.log('Commands: highlight, click, type, copy, box, arrow, screenshot, scrape, clear, fill-form');
      process.exit(1);
  }
}

execute().then(result => {
  console.log(result);
}).catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
EOF

chmod +x claude-navigate.js
echo -e "${GREEN}✓ Claude Code integration created${NC}"

# Create README
echo -e "${YELLOW}Creating documentation...${NC}"
cat > README-EXTENSION.md << 'EOF'
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
EOF

echo -e "${GREEN}✓ Documentation created${NC}"

# Final instructions
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Installation Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Next steps:"
echo "1. Start the server: ${GREEN}./start-navigator.sh${NC}"
echo "2. Load extension in Firefox:"
echo "   - Open Firefox"
echo "   - Go to ${YELLOW}about:debugging${NC}"
echo "   - Click 'Load Temporary Add-on'"
echo "   - Select ${YELLOW}firefox-extension/manifest.json${NC}"
echo "3. Navigate to any webpage"
echo "4. Click extension icon and connect"
echo "5. Use from Claude Code:"
echo "   ${GREEN}node claude-navigate.js screenshot${NC}"
echo ""
echo "For more info, see ${YELLOW}README-EXTENSION.md${NC}"
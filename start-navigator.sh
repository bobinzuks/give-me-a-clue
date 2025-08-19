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

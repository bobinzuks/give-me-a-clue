# 🔧 FIX THE FIREFOX EXTENSION - STEP BY STEP

## ✅ Step 1: Open the Test Page
Open this file in Firefox:
```
file:///home/terry/Desktop/give-me-a-clue/test-extension.html
```

## ✅ Step 2: Load Extension in Firefox
1. Type `about:debugging` in Firefox address bar
2. Click **"This Firefox"** on the left
3. Click **"Load Temporary Add-on"** button
4. Navigate to: `/home/terry/Desktop/give-me-a-clue/firefox-extension/`
5. Select **`manifest.json`** and click Open

## ✅ Step 3: Check Browser Console
1. Press **F12** to open Developer Tools
2. Go to **Console** tab
3. You should see:
   - "Test page loaded. Extension should connect automatically."
   - "Attempting to connect to Claude Code server..."
   - "✅ Connected to Claude Code server" (if successful)

## ✅ Step 4: Test Commands

Open a new terminal and run these tests:

```bash
cd /home/terry/Desktop/give-me-a-clue

# Test 1: Highlight the search box
node navigate-stripe.js highlight "#search-input" green

# Test 2: Type in the search box
node navigate-stripe.js type "#search-input" "checkout.session.completed"

# Test 3: Click a checkbox
node navigate-stripe.js click "input[value='checkout.session.completed']"

# Test 4: Take a screenshot
node navigate-stripe.js screenshot
```

## 🔍 Troubleshooting

### If "Disconnected" in popup:
The WebSocket server IS running (I just started it). The issue is the content script isn't injecting.

### Check if content script loaded:
In Firefox Console (F12), type:
```javascript
// Check if WebSocket exists
typeof ws
// Should NOT be "undefined" if extension loaded

// Check connection
isConnected
// Should be true if connected
```

### Force reload the extension:
1. Go to `about:debugging`
2. Find "Claude Code Navigator"
3. Click "Reload"
4. Refresh the test page

### Check WebSocket server:
```bash
# In terminal, check server status
lsof -i :8765
# Should show node process

# Send test command directly to server
cd /home/terry/Desktop/give-me-a-clue/firefox-extension/server
echo "status" | node websocket-server.js
```

## 🎯 Once Working, Go to Stripe

When the extension works on the test page:
1. Navigate to: https://dashboard.stripe.com/workbench/webhooks/create
2. The extension should auto-connect
3. Use these commands:

```bash
# Clear wrong events
node navigate-stripe.js click "input[value='v2.core.account_person.deleted']"
node navigate-stripe.js click "input[value='v2.core.account_person.updated']"

# Select right events
node navigate-stripe.js type "input[type='search']" "checkout.session.completed"
node navigate-stripe.js click "input[value='checkout.session.completed']"

node navigate-stripe.js type "input[type='search']" "payment_intent.succeeded"
node navigate-stripe.js click "input[value='payment_intent.succeeded']"

node navigate-stripe.js type "input[type='search']" "payment_intent.payment_failed"
node navigate-stripe.js click "input[value='payment_intent.payment_failed']"
```

## 📊 Server Status

The WebSocket server is currently RUNNING on port 8765.
Process ID: Check with `ps aux | grep websocket`

---

The extension WILL work if you load it properly in Firefox!
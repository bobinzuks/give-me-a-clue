#!/bin/bash

# Quick Visual Proof System Demonstration
echo "🎯 CLAUDE CODE VISUAL PROOF SYSTEM DEMO"
echo "========================================"
echo ""

cd "$(dirname "$0")"

echo "🚀 Starting Enhanced Visual Proof Server..."
# Kill existing server
pkill -f "visual-proof-server.js" 2>/dev/null
sleep 1

# Start visual proof server
node visual-proof-server.js > /dev/null 2>&1 &
SERVER_PID=$!
sleep 3

echo "✅ Server running (PID: $SERVER_PID)"
echo "🌐 WebSocket server: ws://localhost:8765"
echo ""

# Create proof directories
mkdir -p proof/{screenshots,logs}

# Create test page
echo "📄 Creating comprehensive test page..."
cat > proof/visual-proof-test.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎯 Visual Proof System - Live Demo</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .section {
            padding: 30px;
            border-bottom: 1px solid #eee;
        }
        .section:last-child { border-bottom: none; }
        .demo-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .demo-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #ddd;
        }
        button {
            background: linear-gradient(45deg, #FF6B6B, #FF8E8E);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            cursor: pointer;
            font-weight: bold;
            margin: 5px;
            transition: transform 0.2s;
        }
        button:hover { transform: translateY(-2px); }
        button.secondary { background: linear-gradient(45deg, #4ECDC4, #6EE3E7); }
        button.accent { background: linear-gradient(45deg, #45B7D1, #96E6A1); }
        input, select, textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 8px;
            margin: 8px 0;
            font-size: 14px;
        }
        input:focus, select:focus, textarea:focus {
            border-color: #4ECDC4;
            outline: none;
        }
        .highlight-demo {
            background: linear-gradient(45deg, #FFE66D, #FFB74D);
            padding: 20px;
            border-radius: 10px;
            margin: 10px 0;
        }
        .nav-demo {
            background: #2C3E50;
            color: white;
            padding: 15px;
            border-radius: 8px;
            display: flex;
            gap: 20px;
            align-items: center;
        }
        .nav-demo a {
            color: white;
            text-decoration: none;
            padding: 8px 16px;
            background: rgba(255,255,255,0.2);
            border-radius: 5px;
            transition: background 0.3s;
        }
        .nav-demo a:hover {
            background: rgba(255,255,255,0.3);
        }
        .status-area {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 15px;
            border-radius: 10px;
            font-family: monospace;
            font-size: 12px;
            z-index: 1000;
        }
        .interactive-zone {
            border: 3px dashed #FF6B6B;
            padding: 20px;
            margin: 15px 0;
            border-radius: 10px;
            background: rgba(255, 107, 107, 0.05);
        }
    </style>
</head>
<body>
    <div class="status-area" id="status">
        🎯 Visual Proof System<br>
        Status: <span id="connection">Connecting...</span><br>
        Actions: <span id="actions">0</span>
    </div>

    <div class="container">
        <div class="header">
            <h1>🎯 Visual Proof System Live Demo</h1>
            <p>This page demonstrates comprehensive visual proof capabilities</p>
            <p><strong>Watch for:</strong> Multi-color highlights • Text overlays • Breadcrumb trails • Screenshots</p>
        </div>

        <div class="section">
            <h2>🎨 Multi-Color Highlighting Demo</h2>
            <div class="demo-grid">
                <div class="demo-card">
                    <h3>Primary Actions</h3>
                    <button id="btn1" onclick="logAction('Primary button clicked')">Primary Button</button>
                    <button id="btn2" class="secondary" onclick="logAction('Secondary button clicked')">Secondary Button</button>
                    <button id="btn3" class="accent" onclick="logAction('Accent button clicked')">Accent Button</button>
                </div>
                <div class="demo-card">
                    <h3>Form Inputs</h3>
                    <input type="text" id="text1" placeholder="Text input field">
                    <input type="email" id="email1" placeholder="Email input field">
                    <input type="password" id="pwd1" placeholder="Password field">
                    <select id="select1">
                        <option>Select option 1</option>
                        <option>Select option 2</option>
                        <option>Select option 3</option>
                    </select>
                </div>
                <div class="demo-card">
                    <h3>Interactive Elements</h3>
                    <div class="highlight-demo">
                        <p>🎯 This area will be highlighted</p>
                        <a href="#" onclick="logAction('Link 1 clicked'); return false;">Demo Link 1</a> |
                        <a href="#" onclick="logAction('Link 2 clicked'); return false;">Demo Link 2</a> |
                        <a href="#" onclick="logAction('Link 3 clicked'); return false;">Demo Link 3</a>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>🗺️ Navigation Breadcrumb Demo</h2>
            <div class="nav-demo">
                <span>Navigation:</span>
                <a href="#section1" onclick="logAction('Navigated to Section 1')">Section 1</a>
                <a href="#section2" onclick="logAction('Navigated to Section 2')">Section 2</a>
                <a href="#section3" onclick="logAction('Navigated to Section 3')">Section 3</a>
                <a href="#demo" onclick="logAction('Navigated to Demo')">Demo Area</a>
            </div>
        </div>

        <div class="section" id="interactive-demo">
            <h2>⚡ Interactive Demo Zone</h2>
            <div class="interactive-zone">
                <h3>🎯 Automation Test Area</h3>
                <p>This area is designed for automation testing and visual proof:</p>
                
                <div class="demo-grid">
                    <div>
                        <h4>📝 Form Demo</h4>
                        <form id="demo-form">
                            <input type="text" name="fullname" placeholder="Full Name" id="demo-name">
                            <input type="email" name="email" placeholder="Email Address" id="demo-email">
                            <textarea name="message" placeholder="Message" rows="3" id="demo-message"></textarea>
                            <button type="submit" onclick="event.preventDefault(); logAction('Form submitted');">Submit Form</button>
                        </form>
                    </div>
                    
                    <div>
                        <h4>🔘 Action Buttons</h4>
                        <button onclick="triggerVisualProof()" id="visual-proof-btn">🎯 Trigger Visual Proof</button>
                        <button onclick="highlightElements()" class="secondary" id="highlight-btn">🎨 Highlight Elements</button>
                        <button onclick="showStatus()" class="accent" id="status-btn">📊 Show Status</button>
                    </div>
                </div>

                <div style="margin-top: 20px;">
                    <h4>📊 Custom Interactive Elements</h4>
                    <div role="button" tabindex="0" onclick="logAction('Custom button clicked')" 
                         style="background: #FF6B6B; color: white; padding: 15px; border-radius: 8px; cursor: pointer; display: inline-block; margin: 5px;"
                         id="custom-btn-1">Custom Button 1</div>
                    <div role="button" tabindex="0" onclick="logAction('Custom button 2 clicked')" 
                         style="background: #4ECDC4; color: white; padding: 15px; border-radius: 8px; cursor: pointer; display: inline-block; margin: 5px;"
                         id="custom-btn-2">Custom Button 2</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>📸 Screenshot Documentation Area</h2>
            <p>This section will be captured in automated screenshots with visual annotations.</p>
            <div class="highlight-demo">
                <h3>🎯 Key Visual Elements:</h3>
                <ul>
                    <li><span style="color: #FF6B6B;">●</span> Red highlights for primary actions</li>
                    <li><span style="color: #4ECDC4;">●</span> Teal highlights for navigation</li>
                    <li><span style="color: #45B7D1;">●</span> Blue highlights for information</li>
                    <li><span style="color: #FFE66D;">●</span> Yellow highlights for warnings</li>
                    <li><span style="color: #96E6A1;">●</span> Green highlights for success</li>
                </ul>
            </div>
        </div>

        <footer style="text-align: center; padding: 30px; background: #f8f9fa; color: #666;">
            <p>🎯 <strong>Visual Proof System</strong> - Making automation visually obvious</p>
            <p>Action Log: <span id="action-log">Ready for testing...</span></p>
        </footer>
    </div>

    <script>
        let actionCount = 0;
        let actions = [];

        function logAction(action) {
            actionCount++;
            actions.push({action, timestamp: new Date().toLocaleTimeString()});
            
            document.getElementById('actions').textContent = actionCount;
            document.getElementById('action-log').textContent = `Last: ${action} (${actionCount} total)`;
            
            console.log(`🎯 Action ${actionCount}: ${action}`);
        }

        function triggerVisualProof() {
            logAction('Visual proof system triggered');
            // This would trigger the visual proof system
        }

        function highlightElements() {
            logAction('Element highlighting requested');
            // This would trigger highlighting
        }

        function showStatus() {
            logAction('Status display requested');
            // This would show system status
        }

        // Simulate connection status
        setTimeout(() => {
            document.getElementById('connection').textContent = 'Connected ✅';
            document.getElementById('connection').style.color = '#4ECDC4';
        }, 2000);

        // Auto-update action counter
        setInterval(() => {
            if (actionCount > 0) {
                document.getElementById('actions').textContent = actionCount;
            }
        }, 1000);

        console.log('🎯 Visual Proof Test Page loaded and ready');
        console.log('This page is designed to demonstrate comprehensive visual proof capabilities');
    </script>
</body>
</html>
EOF

echo "✅ Test page created: proof/visual-proof-test.html"
echo ""

# Show system info
echo "📊 VISUAL PROOF SYSTEM READY"
echo "============================="
echo "🌐 Server: ws://localhost:8765 (PID: $SERVER_PID)"
echo "📄 Test Page: file://$(pwd)/proof/visual-proof-test.html"
echo "📁 Proof Directory: $(pwd)/proof/"
echo ""

echo "🦊 FIREFOX EXTENSION SETUP:"
echo "1. Open Firefox"
echo "2. Go to about:debugging"  
echo "3. Click 'This Firefox' → 'Load Temporary Add-on'"
echo "4. Select: $(pwd)/firefox-extension/manifest.json"
echo ""

echo "🎬 DEMO COMMANDS:"
echo "node visual-proof-demo.js full        # Complete demo"
echo "node visual-proof-demo.js highlight   # Multi-color highlighting"
echo "node visual-proof-demo.js screenshot  # Screenshot documentation"
echo "node visual-proof-demo.js clear       # Clear overlays"
echo ""

# Check if we should run auto demo
if [ "$1" = "--auto" ]; then
    echo "🤖 AUTO DEMO MODE - Starting in 10 seconds..."
    echo "   Make sure Firefox is open with the extension loaded!"
    
    for i in {10..1}; do
        echo -ne "\r⏰ Demo starting in $i seconds... "
        sleep 1
    done
    echo ""
    echo ""
    
    echo "🎬 Starting Visual Proof Demonstration..."
    node visual-proof-demo.js full
fi

echo ""
echo "🎯 Visual Proof System is READY!"
echo "Open the test page in Firefox and run demos to see the magic happen!"

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Stopping Visual Proof Server..."
    kill $SERVER_PID 2>/dev/null
    echo "✅ Shutdown complete"
    exit 0
}

trap cleanup INT TERM

if [ "$1" != "--auto" ]; then
    echo ""
    echo "Press Ctrl+C to stop the server"
    wait $SERVER_PID
fi
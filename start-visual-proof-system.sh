#!/bin/bash

# Visual Proof System Startup Script
echo "🎯 Starting Claude Code Visual Proof System"
echo "============================================="

# Set the working directory
cd "$(dirname "$0")"
PROOF_DIR="$(pwd)"
echo "📁 Working directory: $PROOF_DIR"

# Create necessary directories
echo "📂 Creating proof directories..."
mkdir -p proof/screenshots
mkdir -p proof/logs
mkdir -p proof/reports

# Function to check if a process is running
check_process() {
    if pgrep -f "$1" > /dev/null; then
        echo "✅ $2 is running"
        return 0
    else
        echo "❌ $2 is not running"
        return 1
    fi
}

# Function to start the visual proof server
start_server() {
    echo "🚀 Starting Visual Proof Server..."
    
    # Kill existing server if running
    pkill -f "visual-proof-server.js" 2>/dev/null
    
    # Start new server
    node visual-proof-server.js > proof/logs/server.log 2>&1 &
    SERVER_PID=$!
    echo "📡 Server started with PID: $SERVER_PID"
    
    # Wait for server to be ready
    sleep 3
    
    if check_process "visual-proof-server.js" "Visual Proof Server"; then
        echo "✅ Server is ready on ws://localhost:8765"
    else
        echo "❌ Failed to start server"
        exit 1
    fi
}

# Function to copy visual proof content script to extension
setup_extension() {
    echo "🔧 Setting up Firefox extension..."
    
    if [ -f "visual-proof-content.js" ] && [ -d "firefox-extension" ]; then
        # Copy the visual proof content script
        cp visual-proof-content.js firefox-extension/
        
        # Update manifest if visual-proof-manifest exists
        if [ -f "visual-proof-manifest.json" ]; then
            cp visual-proof-manifest.json firefox-extension/manifest.json
            echo "✅ Updated extension manifest for visual proof system"
        fi
        
        echo "✅ Visual proof content script copied to extension"
    else
        echo "❌ Extension files not found"
        return 1
    fi
}

# Function to show extension installation instructions
show_extension_instructions() {
    echo ""
    echo "🦊 Firefox Extension Installation Instructions:"
    echo "=============================================="
    echo "1. Open Firefox"
    echo "2. Type 'about:debugging' in the address bar"
    echo "3. Click 'This Firefox' in the left sidebar"
    echo "4. Click 'Load Temporary Add-on...'"
    echo "5. Navigate to: $PROOF_DIR/firefox-extension/"
    echo "6. Select the 'manifest.json' file"
    echo "7. Click 'Open'"
    echo ""
    echo "The extension should now be loaded and active!"
    echo ""
}

# Function to run the visual proof demonstration
run_demo() {
    echo "🎬 Starting Visual Proof Demonstration..."
    echo "========================================"
    
    if [ "$1" = "--auto" ]; then
        echo "🤖 Running automated demo in 10 seconds..."
        echo "   Make sure Firefox is open and extension is loaded!"
        sleep 10
        node visual-proof-demo.js full
    else
        echo "Available demo commands:"
        echo "  node visual-proof-demo.js full      - Complete demonstration"
        echo "  node visual-proof-demo.js highlight - Multi-color highlighting"
        echo "  node visual-proof-demo.js text      - Text overlays demo"
        echo "  node visual-proof-demo.js screenshot - Screenshot documentation"
        echo "  node visual-proof-demo.js clear     - Clear all overlays"
        echo ""
        echo "Run demos manually after setting up the extension!"
    fi
}

# Function to create a test HTML page
create_test_page() {
    echo "📄 Creating test page..."
    
    cat > proof/test-page.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visual Proof System Test Page</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            background: white;
            padding: 20px;
            border-radius: 10px;
            max-width: 800px;
            margin: 0 auto;
        }
        .section {
            margin: 20px 0;
            padding: 15px;
            border: 2px solid #ddd;
            border-radius: 8px;
        }
        button {
            background: #4CAF50;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
        }
        button:hover { background: #45a049; }
        input, select, textarea {
            padding: 8px;
            margin: 5px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .highlight-demo { background: #ffeb3b; padding: 10px; border-radius: 5px; }
        .navigation { background: #2196F3; color: white; padding: 10px; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🎯 Visual Proof System Test Page</h1>
            <p>This page is designed to demonstrate the visual proof system capabilities.</p>
        </header>

        <nav class="navigation">
            <a href="#section1" style="color: white; margin-right: 15px;">Section 1</a>
            <a href="#section2" style="color: white; margin-right: 15px;">Section 2</a>
            <a href="#section3" style="color: white; margin-right: 15px;">Section 3</a>
        </nav>

        <main>
            <div id="section1" class="section">
                <h2>🎨 Interactive Elements Section</h2>
                <button onclick="alert('Button 1 clicked!')">Primary Button</button>
                <button onclick="alert('Button 2 clicked!')">Secondary Button</button>
                <button onclick="alert('Button 3 clicked!')">Action Button</button>
                
                <div style="margin-top: 15px;">
                    <input type="text" placeholder="Text input field">
                    <input type="email" placeholder="Email input field">
                    <input type="password" placeholder="Password field">
                </div>
            </div>

            <div id="section2" class="section">
                <h2>📝 Form Elements Section</h2>
                <form>
                    <div>
                        <label>Name: <input type="text" name="name"></label>
                    </div>
                    <div>
                        <label>Category: 
                            <select name="category">
                                <option>Option 1</option>
                                <option>Option 2</option>
                                <option>Option 3</option>
                            </select>
                        </label>
                    </div>
                    <div>
                        <label>Description: <textarea name="description" rows="3"></textarea></label>
                    </div>
                    <button type="submit">Submit Form</button>
                </form>
            </div>

            <div id="section3" class="section">
                <h2>🔗 Links and Navigation</h2>
                <div class="highlight-demo">
                    <p>This section contains various clickable elements:</p>
                    <a href="#" onclick="return false;">Link 1</a> | 
                    <a href="#" onclick="return false;">Link 2</a> | 
                    <a href="#" onclick="return false;">Link 3</a>
                </div>
                
                <div style="margin-top: 15px;">
                    <div role="button" tabindex="0" style="background: #FF9800; color: white; padding: 10px; display: inline-block; border-radius: 5px; cursor: pointer;">
                        Custom Button Element
                    </div>
                </div>
            </div>
        </main>

        <footer style="margin-top: 30px; text-align: center; color: #666;">
            <p>Visual Proof System Test Environment</p>
            <p>Use this page to test highlighting, overlays, and automation features.</p>
        </footer>
    </div>

    <script>
        // Add some interactive behavior
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🎯 Visual Proof Test Page loaded');
            
            // Add click handlers
            document.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', function() {
                    console.log('Button clicked:', this.textContent);
                });
            });
        });
    </script>
</body>
</html>
EOF

    echo "✅ Test page created at: $PROOF_DIR/proof/test-page.html"
}

# Function to show system status
show_status() {
    echo ""
    echo "📊 Visual Proof System Status"
    echo "============================="
    
    check_process "visual-proof-server.js" "Visual Proof Server"
    
    echo ""
    echo "📁 Directory structure:"
    echo "  📂 $PROOF_DIR/"
    echo "    📄 visual-proof-server.js     - Enhanced WebSocket server"
    echo "    📄 visual-proof-content.js    - Enhanced content script"
    echo "    📄 visual-proof-demo.js       - Demo controller"
    echo "    📂 firefox-extension/         - Firefox extension files"
    echo "    📂 proof/                     - Proof artifacts"
    echo "      📂 screenshots/            - Annotated screenshots"
    echo "      📂 logs/                   - System logs"
    echo "      📄 test-page.html         - Test page"
    echo ""
    
    if [ -f "proof/logs/server.log" ]; then
        echo "📋 Recent server activity:"
        tail -5 proof/logs/server.log | sed 's/^/    /'
    fi
}

# Function to show help
show_help() {
    echo ""
    echo "🎯 Visual Proof System Commands"
    echo "==============================="
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  start          - Start the visual proof server"
    echo "  setup          - Set up Firefox extension"
    echo "  demo           - Show demo instructions"
    echo "  demo --auto    - Run automated demo (requires extension)"
    echo "  test-page      - Create test HTML page"
    echo "  status         - Show system status"
    echo "  stop           - Stop all services"
    echo "  help           - Show this help message"
    echo ""
    echo "Complete setup process:"
    echo "  1. $0 start"
    echo "  2. $0 setup"
    echo "  3. Install Firefox extension manually"
    echo "  4. $0 test-page"
    echo "  5. Open test-page.html in Firefox"
    echo "  6. $0 demo --auto"
    echo ""
}

# Function to stop services
stop_services() {
    echo "🛑 Stopping Visual Proof System..."
    pkill -f "visual-proof-server.js" 2>/dev/null
    pkill -f "visual-proof-demo.js" 2>/dev/null
    echo "✅ Services stopped"
}

# Main execution logic
case "${1:-help}" in
    "start")
        start_server
        ;;
    "setup")
        setup_extension
        show_extension_instructions
        ;;
    "demo")
        run_demo "$2"
        ;;
    "test-page")
        create_test_page
        echo ""
        echo "🌐 Open this URL in Firefox:"
        echo "file://$PROOF_DIR/proof/test-page.html"
        ;;
    "status")
        show_status
        ;;
    "stop")
        stop_services
        ;;
    "all"|"full")
        echo "🚀 Complete Visual Proof System Setup"
        echo "===================================="
        start_server
        setup_extension
        create_test_page
        show_extension_instructions
        echo ""
        echo "🎉 Setup complete! Follow the extension installation steps above."
        ;;
    "help"|*)
        show_help
        ;;
esac

# Cleanup on exit
trap 'echo ""; echo "👋 Shutting down..."; stop_services; exit 0' INT TERM
#!/bin/bash

# ============================================
# After Effects MCP Server - Easy Starter
# ============================================

clear

echo "🎬 After Effects MCP Server"
echo "============================"
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "   Please install Node.js from https://nodejs.org"
    exit 1
fi

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if build exists
if [ ! -f "build/index.js" ]; then
    echo "🔨 Building project..."
    npm run build
    echo ""
fi

echo "✅ Starting MCP Server..."
echo ""
echo "📋 Quick Guide:"
echo "   1. Open After Effects"
echo "   2. Go to Window > mcp-bridge-auto.jsx"
echo "   3. Enable 'Auto-run commands' checkbox"
echo "   4. Use Claude/Cursor to control After Effects!"
echo ""
echo "Press Ctrl+C to stop the server"
echo "============================"
echo ""

# Start the server
node build/index.js

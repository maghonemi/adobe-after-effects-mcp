#!/bin/bash

# ============================================
# After Effects MCP Server - Full Setup Script
# ============================================

clear

echo "🎬 After Effects MCP Server - Setup"
echo "===================================="
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if node is installed
echo "🔍 Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "   Please install Node.js from https://nodejs.org"
    exit 1
fi
NODE_VERSION=$(node -v)
echo "   ✅ Node.js $NODE_VERSION found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "   ✅ Dependencies installed"
echo ""

# Build project
echo "🔨 Building project..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "   ✅ Build complete"
echo ""

# Install bridge to After Effects
echo "🔗 Installing After Effects bridge..."
npm run install-bridge
if [ $? -ne 0 ]; then
    echo "⚠️  Could not auto-install bridge."
    echo "   Please manually copy 'src/scripts/mcp-bridge-auto.jsx'"
    echo "   to your After Effects Scripts folder"
fi
echo ""

# Show MCP config
echo "📋 MCP Configuration"
echo "===================="
echo ""
echo "Add this to your Claude/Cursor MCP config:"
echo ""
echo "{"
echo "  \"mcpServers\": {"
echo "    \"AfterEffectsMCP\": {"
echo "      \"command\": \"node\","
echo "      \"args\": [\"$SCRIPT_DIR/build/index.js\"]"
echo "    }"
echo "  }"
echo "}"
echo ""
echo "===================="
echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the server, run:"
echo "   ./start.sh"
echo ""
echo "Or use:"
echo "   npm start"
echo ""

#!/bin/bash
# Install MCP Bridge to After Effects 2026 (macOS)
# Run this in Terminal - you will be prompted for your password.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE="$SCRIPT_DIR/build/scripts/mcp-bridge-auto.jsx"
TARGET="/Applications/Adobe After Effects 2026/Scripts/ScriptUI Panels/mcp-bridge-auto.jsx"

echo "🎬 Installing MCP Bridge to After Effects 2026..."
echo ""

if [ ! -f "$SOURCE" ]; then
  echo "❌ Build not found. Run: npm run build"
  exit 1
fi

if [ ! -d "$(dirname "$TARGET")" ]; then
  echo "❌ After Effects ScriptUI Panels folder not found."
  echo "   Expected: $(dirname "$TARGET")"
  exit 1
fi

echo "Copying: $SOURCE"
echo "     to: $TARGET"
echo ""
echo "You may be asked for your Mac password (admin):"
echo ""

sudo cp "$SOURCE" "$TARGET"

echo ""
echo "✅ Done! Next steps:"
echo "   1. Quit After Effects completely (if it's open)"
echo "   2. Open After Effects again"
echo "   3. Go to Window menu → mcp-bridge-auto.jsx"
echo "   4. Check 'Auto-run commands'"
echo ""

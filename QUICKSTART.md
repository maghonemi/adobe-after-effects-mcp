# 🚀 Quick Start Guide

## ⚠️ Required: Allow Scripts in After Effects

The MCP bridge reads/writes command files. You **must** enable:

1. In After Effects: **After Effects** menu (or **Edit** on Windows) → **Preferences** → **Scripting & Expressions**
2. Check: **Allow Scripts to Write Files and Access Network**
3. Click **OK** and **restart After Effects** if it asks.

Without this, you’ll see: `Error checking for commands: Permission denied`.

---

## One-Command Setup

### macOS / Linux
```bash
./setup.sh
```

### Windows
```batch
setup.bat
```

---

## Manual Setup (3 Steps)

### Step 1: Install & Build
```bash
npm install
```

### Step 2: Install After Effects Bridge

**macOS** (needs password to copy into Applications):
```bash
./install-bridge-mac.sh
```

**Windows** (or if install-bridge works on your Mac):
```bash
npm run install-bridge
```

### Step 3: Start the Server
```bash
npm start
```

---

## Configure Your AI Client

Add this to your MCP configuration:

### For Cursor (recommended: set bridge path so commands are found)

Edit your MCP config and add the **env** entry so the server uses the same folder as the After Effects panel (use the path shown in the panel’s “Command path” line):

```json
{
  "mcpServers": {
    "AfterEffectsMCP": {
      "command": "node",
      "args": ["/Users/YOUR_USERNAME/Desktop/after-effects-mcp/build/index.js"],
      "env": {
        "MCP_AE_BRIDGE_DIR": "/Users/YOUR_USERNAME/.after-effects-mcp"
      }
    }
  }
}
```

Replace `YOUR_USERNAME` with your Mac username so the path matches the one shown in the After Effects panel (e.g. if the panel shows `/Users/jane/.after-effects-mcp/ae_command.json`, use `MCP_AE_BRIDGE_DIR": "/Users/jane/.after-effects-mcp"`).

### For Claude Desktop
Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
or `%APPDATA%\Claude\claude_desktop_config.json` (Windows) and add the same `env` block if needed.

---

## Using the Server

### 1. Start the MCP Server
```bash
./start.sh      # macOS/Linux
start.bat       # Windows
npm start       # Any platform
```

### 2. Open After Effects
- Go to **Window** menu
- Select **mcp-bridge-auto.jsx**
- Check **"Auto-run commands"**

### 3. Use AI to Control After Effects!

Example prompts:
```
"Create a 1920x1080 composition called 'My Video' at 30fps for 10 seconds"

"Add text 'Hello World' in the center with a bounce animation"

"Create a lower third with name 'John Doe' and title 'CEO'"

"Export the composition as H.264 MP4"
```

---

## Quick Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start the MCP server |
| `npm run build` | Rebuild the project |
| `npm run setup` | Full setup (install + build + bridge) |
| `./start.sh` | Easy start (macOS/Linux) |
| `start.bat` | Easy start (Windows) |

---

## Troubleshooting

### "Bridge not connecting"
1. Make sure After Effects is open
2. Check that mcp-bridge-auto.jsx panel is visible
3. Enable "Auto-run commands" checkbox

### "Command not found: node"
Install Node.js from https://nodejs.org

### "Build errors"
```bash
rm -rf node_modules
npm install
npm run build
```

---

## Need Help?

See the `docs/` folder:
- `MASTER_VIDEO_PRODUCTION_GUIDE.md` - Complete guide
- `AI_PROMPT_LIBRARY.md` - Ready-to-use prompts
- `PROJECT_WORKFLOWS.md` - Step-by-step workflows

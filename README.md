# After Effects MCP Server

[![Node.js](https://img.shields.io/badge/node-%3E%3D18.x-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/github/license/Dakkshin/after-effects-mcp)](LICENSE)
[![MCP](https://img.shields.io/badge/MCP-122%20tools-blue)](https://modelcontextprotocol.io/)

**Control Adobe After Effects from AI assistants and apps** via the [Model Context Protocol](https://modelcontextprotocol.io/). Create compositions, layers, keyframes, effects, and full video projects through natural language or any MCP client.

---

## Table of contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Quick start](#-quick-start)
- [Installation](#-installation)
- [MCP client configuration](#-mcp-client-configuration)
- [Running and using](#-running-and-using)
- [Project structure](#-project-structure)
- [Scripts](#-scripts)
- [Documentation](#-documentation)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [Credits & license](#-credits--license)

---

## Features

**122 tools** · **5 resources** · **8 prompts**

| Area | Capabilities |
|------|--------------|
| **Project** | Create, open, save; settings (bit depth, color space); delete/rename items; remove unused footage; collect files |
| **Compositions** | Create, duplicate, **delete by name or index**, rename; work area; selected layers; motion blur, 3D, frame blending |
| **Layers** | Text, shapes, solids, adjustment, nulls, cameras, lights, audio; duplicate, delete, rename, move, split, parent, precompose |
| **Transform** | Position, scale, rotation (2D/3D); center/fit to comp; material options; blend modes; track mattes |
| **Animation** | Keyframes; easing presets; motion paths; fade/slide/scale/rotate/blur presets; stagger; expression templates |
| **Effects** | Apply by match name; templates (glow, blur, color, etc.); presets; animate effect properties |
| **Masks** | Rectangle, ellipse, path; feather, opacity, expansion; mask reveal animations |
| **Shapes** | Paths, modifiers (trim, repeater, wiggle, etc.); morphing |
| **Render** | Add to queue; start render; export H.264, ProRes; single frames |
| **Import** | Import files; replace footage; interpretation; reload; missing footage list |
| **Scene & render** | get-scene-summary, get-render-progress, get-layer-tree, setup-project, list-available-fonts, get/set-keyframe-interpolation |
| **Viewport / vision** | **get-viewport-screenshot** – capture the current comp as a PNG so the AI can “see” the scene (like [Blender MCP](https://github.com/maghonemi/blender-mcp) viewport screenshot) |

See [docs/COMPLETE_FEATURE_COVERAGE.md](docs/COMPLETE_FEATURE_COVERAGE.md) and [docs/BLENDER_MCP_COMPARISON_AND_ROADMAP.md](docs/BLENDER_MCP_COMPARISON_AND_ROADMAP.md) for full coverage.

---

## Prerequisites

- **Adobe After Effects** 2022 or later
- **Node.js** 18 or later
- **npm** (or yarn)

---

## Quick start

```bash
git clone https://github.com/Dakkshin/after-effects-mcp.git
cd after-effects-mcp
npm install
npm run build
```

Then install the bridge into After Effects (see [Installation](#-installation)), configure your MCP client with `MCP_AE_BRIDGE_DIR`, open the **mcp-bridge-auto.jsx** panel in AE, enable **Auto-run commands**, and start sending commands from your AI client.

---

## Installation

### 1. Clone and build

```bash
git clone https://github.com/Dakkshin/after-effects-mcp.git
cd after-effects-mcp
npm install
npm run build
```

**Windows:** If `npm run build` fails on copy, use `npm run build:win` instead.

### 2. Install the After Effects bridge

The MCP server talks to After Effects via a **bridge script** that must live in AE’s ScriptUI Panels folder.

| Platform | Command | Notes |
|----------|---------|--------|
| **macOS** | `./install-bridge-mac.sh` | Uses `sudo`; installs into AE 2026. You’ll be prompted for your password. |
| **Windows** | `npm run install-bridge` | Copies to the first detected AE version. Run as Administrator if you get permission errors. |
| **macOS (no sudo)** | `npm run install-bridge` | Tries to copy without sudo; if it fails, use `install-bridge-mac.sh`. |

**Reinstall after code changes:** Run `npm run build`, then run the install step again (e.g. `npm run install-bridge` or `./install-bridge-mac.sh`).

### 3. Allow scripts in After Effects

1. **After Effects** (macOS) or **Edit** (Windows) → **Preferences** → **Scripting & Expressions**
2. Enable **Allow Scripts to Write Files and Access Network**
3. Click **OK** and restart After Effects if prompted

Without this, the bridge will not be able to read/write command files.

### 4. One-command setup (optional)

- **macOS / Linux:** `./setup.sh` — installs deps, builds, and runs the bridge installer
- **Windows:** `setup.bat` — same idea

---

## MCP client configuration

Add the server to your MCP config (e.g. Cursor, Claude Desktop). Use the **absolute path** to `build/index.js` and set the **bridge directory** so the server and After Effects use the same folder.

**Example (Cursor `mcp.json` or settings):**

```json
{
  "mcpServers": {
    "AfterEffectsMCP": {
      "command": "node",
      "args": ["/absolute/path/to/after-effects-mcp/build/index.js"],
      "env": {
        "MCP_AE_BRIDGE_DIR": "/Users/YOUR_USERNAME/.after-effects-mcp"
      }
    }
  }
}
```

- Replace `/absolute/path/to/after-effects-mcp` with your real project path.
- Replace `YOUR_USERNAME` with your OS username. The bridge panel in AE shows the path it uses (e.g. **Command path:** `.../.after-effects-mcp/ae_command.json`). Set `MCP_AE_BRIDGE_DIR` to that directory (without the filename).

---

## Running and using

1. **Start the MCP server**  
   Your client may start it automatically, or run: `npm start`

2. **Open the bridge in After Effects**  
   **Window** → **mcp-bridge-auto.jsx**

3. **Enable Auto-run commands** in the panel so AE executes incoming commands

4. **Use your AI client**  
   Example: *“Create a composition named Intro, 1920×1080, 30fps, 10 seconds”* or *“Delete the composition named Test.”*

---

## Project structure

```
after-effects-mcp/
├── build/                 # Compiled output (after npm run build)
│   ├── index.js           # MCP server entry
│   └── scripts/           # ExtendScript (e.g. mcp-bridge-auto.jsx)
├── src/
│   ├── index.ts           # Server and tool definitions
│   └── scripts/           # Source for bridge and helpers
├── docs/                  # Guides and API reference
├── install-bridge.js      # Cross-platform bridge installer
├── install-bridge-mac.sh  # macOS installer (sudo for AE 2026)
├── setup.sh / setup.bat   # One-command setup
├── start.sh / start.bat   # Start server
└── QUICKSTART.md          # Short setup and usage guide
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript and copy `src/scripts` to `build/` |
| `npm run build:win` | Same as build on Windows (uses `xcopy`) |
| `npm start` | Run the MCP server (`node build/index.js`) |
| `npm run dev` | Build then start |
| `npm run install-bridge` | Install bridge script into AE ScriptUI Panels (Node script) |
| `npm run setup` | `npm install` + `npm run build` + `npm run install-bridge` |

---

## Documentation

| Document | Description |
|----------|-------------|
| [QUICKSTART.md](QUICKSTART.md) | Minimal setup and first commands |
| [docs/RUN_THIS_VIDEO_PROMPT.md](docs/RUN_THIS_VIDEO_PROMPT.md) | **Copy-paste prompt to create a video in AE** (from AI Prompt Library) |
| [docs/MASTER_VIDEO_PRODUCTION_GUIDE.md](docs/MASTER_VIDEO_PRODUCTION_GUIDE.md) | End-to-end video creation |
| [docs/AI_PROMPT_LIBRARY.md](docs/AI_PROMPT_LIBRARY.md) | Ready-to-use prompts |
| [docs/PROJECT_WORKFLOWS.md](docs/PROJECT_WORKFLOWS.md) | Step-by-step workflows |
| [docs/COMPLETE_FEATURE_COVERAGE.md](docs/COMPLETE_FEATURE_COVERAGE.md) | Full feature list |
| [docs/BLENDER_MCP_COMPARISON_AND_ROADMAP.md](docs/BLENDER_MCP_COMPARISON_AND_ROADMAP.md) | Blender MCP comparison & what else can be added |
| [docs/API_REFERENCE.md](docs/API_REFERENCE.md) | API reference |
| [docs/EFFECT_LIBRARY.md](docs/EFFECT_LIBRARY.md) | Effects reference |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture |

---

## Troubleshooting

| Issue | What to do |
|-------|------------|
| **“Permission denied” when installing bridge** | macOS: run `./install-bridge-mac.sh` (sudo). Windows: run Terminal/CMD as Administrator, then `npm run install-bridge`. |
| **Commands not running / “command not found”** | Ensure `MCP_AE_BRIDGE_DIR` in your MCP config matches the directory shown in the bridge panel (e.g. `~/.after-effects-mcp`). Restart the MCP server and AE. |
| **“Allow Scripts to Write Files and Access Network”** | Enable it in **Preferences → Scripting & Expressions**, then restart After Effects. |
| **Panel or script not found in AE** | Reinstall: `npm run build` then `npm run install-bridge` (or `./install-bridge-mac.sh`). Restart AE and check **Window** for **mcp-bridge-auto.jsx**. |
| **Build fails on Windows** | Use `npm run build:win` instead of `npm run build`. |

---

## Contributing

Contributions are welcome. Open an issue or submit a pull request.

---

## Credits & license

- **Original project:** [Dakkshin/after-effects-mcp](https://github.com/Dakkshin/after-effects-mcp)
- **Extended and maintained by:** [Intrazero](https://intrazero.com) — 122 tools, video production workflows, documentation, and install scripts.

Licensed under the [MIT License](LICENSE).

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { execSync } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { z } from "zod";
import { fileURLToPath } from 'url';
import sharp from 'sharp';

// Shared folder so Node and After Effects use the SAME path.
// Set MCP_AE_BRIDGE_DIR in your MCP config to the path shown in the AE panel.
function getBridgeDir(): string {
  const explicit = process.env.MCP_AE_BRIDGE_DIR;
  if (explicit && String(explicit).trim()) {
    const dir = path.normalize(String(explicit).trim());
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (_) {}
    }
    return dir;
  }
  const home = process.env.HOME || process.env.USERPROFILE || os.homedir?.() || "";
  const dir = path.join(home, ".after-effects-mcp");
  if (home && !fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (_) {}
  }
  return dir;
}

// Create an MCP server
const server = new McpServer({
  name: "AfterEffectsServer",
  version: "1.0.0"
});

// ES Modules replacement for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const SCRIPTS_DIR = path.join(__dirname, "scripts");
const TEMP_DIR = path.join(__dirname, "temp");

/** Skills directory: drop .md files here to expose them as MCP resources. Override with MCP_AE_SKILLS_DIR. */
function getSkillsDir(): string {
  const explicit = process.env.MCP_AE_SKILLS_DIR;
  if (explicit && String(explicit).trim()) {
    return path.normalize(String(explicit).trim());
  }
  return path.join(__dirname, "..", "skills");
}

/** Slug from filename: my-skill.md -> my-skill */
function skillSlug(filename: string): string {
  return path.basename(filename, path.extname(filename));
}

/** Register MCP resources for each .md file in the skills folder. Call before server.connect(). */
function registerSkillsResources(): void {
  const skillsDir = getSkillsDir();
  if (!fs.existsSync(skillsDir)) {
    try {
      fs.mkdirSync(skillsDir, { recursive: true });
    } catch (_) {}
  }
  if (!fs.existsSync(skillsDir)) {
    console.error(`Skills directory not found: ${skillsDir}`);
    return;
  }
  const files = fs.readdirSync(skillsDir).filter((f) => f.endsWith(".md"));
  for (const file of files) {
    const slug = skillSlug(file);
    const filePath = path.join(skillsDir, file);
    const uri = `aftereffects://skills/${slug}`;
    server.resource(`skill-${slug}`, uri, async () => {
      try {
        const text = fs.readFileSync(filePath, "utf8");
        return {
          contents: [{ uri, mimeType: "text/markdown", text }]
        };
      } catch (e) {
        return {
          contents: [{ uri, mimeType: "text/plain", text: `Error reading skill: ${e}` }]
        };
      }
    });
    console.error(`Registered skill resource: ${uri}`);
  }
}

// Headless CLI execution has been removed. All interactions are routed through the Bridge panel.

// Helper function to read results from After Effects temp file
function readResultsFromTempFile(): string {
  try {
    const tempFilePath = path.join(getBridgeDir(), 'ae_mcp_result.json');
    
    // Add debugging info
    console.error(`Checking for results at: ${tempFilePath}`);
    
    if (fs.existsSync(tempFilePath)) {
      // Get file stats to check modification time
      const stats = fs.statSync(tempFilePath);
      console.error(`Result file exists, last modified: ${stats.mtime.toISOString()}`);
      
      const content = fs.readFileSync(tempFilePath, 'utf8');
      console.error(`Result file content length: ${content.length} bytes`);
      
      // If the result file is older than 30 seconds, warn the user
      const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
      if (stats.mtime < thirtySecondsAgo) {
        console.error(`WARNING: Result file is older than 30 seconds. After Effects may not be updating results.`);
        return JSON.stringify({ 
          warning: "Result file appears to be stale (not recently updated).",
          message: "This could indicate After Effects is not properly writing results or the MCP Bridge Auto panel isn't running.",
          lastModified: stats.mtime.toISOString(),
          originalContent: content
        });
      }
      
      return content;
    } else {
      console.error(`Result file not found at: ${tempFilePath}`);
      return JSON.stringify({ error: "No results file found. Please run a script in After Effects first." });
    }
  } catch (error) {
    console.error("Error reading results file:", error);
    return JSON.stringify({ error: `Failed to read results: ${String(error)}` });
  }
}

// Helper to wait for a fresh result produced by a specific command
async function waitForBridgeResult(expectedCommand?: string, timeoutMs: number = 5000, pollMs: number = 250): Promise<string> {
  const start = Date.now();
  const resultPath = path.join(getBridgeDir(), 'ae_mcp_result.json');
  let lastSize = -1;

  while (Date.now() - start < timeoutMs) {
    if (fs.existsSync(resultPath)) {
      try {
        const content = fs.readFileSync(resultPath, 'utf8');
        if (content && content.length > 0 && content.length !== lastSize) {
          lastSize = content.length;
          try {
            const parsed = JSON.parse(content);
            const cmd = parsed._commandExecuted ?? parsed.command;
            if (!expectedCommand || cmd === expectedCommand) {
              return content;
            }
          } catch {
            // not JSON yet; continue polling
          }
        }
      } catch {
        // transient read error; continue polling
      }
    }
    await new Promise(r => setTimeout(r, pollMs));
  }
  return JSON.stringify({ error: `Timed out waiting for bridge result${expectedCommand ? ` for command '${expectedCommand}'` : ''}.` });
}

// Helper function to write command to file
function writeCommandFile(command: string, args: Record<string, any> = {}): void {
  try {
    const commandFile = path.join(getBridgeDir(), 'ae_command.json');
    const commandData = {
      command,
      args,
      timestamp: new Date().toISOString(),
      status: "pending"  // pending, running, completed, error
    };
    fs.writeFileSync(commandFile, JSON.stringify(commandData, null, 2));
    console.error(`Command "${command}" written to ${commandFile}`);
  } catch (error) {
    console.error("Error writing command file:", error);
  }
}

// Helper function to clear the results file to avoid stale cache
function clearResultsFile(): void {
  try {
    const resultFile = path.join(getBridgeDir(), 'ae_mcp_result.json');
    
    // Write a placeholder message to indicate the file is being reset
    const resetData = {
      status: "waiting",
      message: "Waiting for new result from After Effects...",
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(resultFile, JSON.stringify(resetData, null, 2));
    console.error(`Results file cleared at ${resultFile}`);
  } catch (error) {
    console.error("Error clearing results file:", error);
  }
}

// Add a resource to expose project compositions
server.resource(
  "compositions",
  "aftereffects://compositions",
  async (uri) => {
    // Clear old results, queue the command, and wait for bridge output
    clearResultsFile();
    writeCommandFile("listCompositions", {});
    const result = await waitForBridgeResult("listCompositions", 6000, 250);

    return {
      contents: [{
        uri: uri.href,
        mimeType: "application/json",
        text: result
      }]
    };
  }
);

// Add a tool for running read-only scripts
server.tool(
  "run-script",
  "Run a read-only script in After Effects",
  {
    script: z.string().describe("Name of the predefined script to run"),
    parameters: z.record(z.any()).optional().describe("Optional parameters for the script")
  },
  async ({ script, parameters = {} }) => {
    // Validate that script is safe (only allow predefined scripts)
    const allowedScripts = [
      // Original scripts
      "listCompositions", "getProjectInfo", "getLayerInfo", 
      "createComposition", "createTextLayer", "createShapeLayer", "createSolidLayer",
      "setLayerProperties", "setLayerKeyframe", "setLayerExpression",
      "applyEffect", "applyEffectTemplate", "test-animation", "bridgeTestEffects",
      // New layer operations
      "createNullLayer", "duplicateLayer", "parentLayer", "precomposeLayers", "addCompAsLayer",
      "setBlendMode", "setTrackMatte", "convertTo3D",
      // Camera and light
      "createCamera", "createLight",
      // Keyframe and animation
      "setKeyframes", "applyEasing", "applyExpressionTemplate",
      // Effects
      "applyEffectPreset",
      // Text animation
      "addTextAnimator", "applyTextAnimation",
      // Masks
      "createMask", "applyMaskAnimation",
      // Render
      "addToRenderQueue", "startRender", "exportComposition", "exportFrame", "captureViewport",
      // Project
      "saveProject", "createProjectFolder",
      // Import
      "importFile", "replaceFootage",
      // Utility
      "getLayerDetails", "findLayers", "purgeMemory", "setCompositionSettings",
      // Project operations
      "projectNew", "projectOpen", "projectClose", "projectGetSettings", "projectSetSettings",
      "projectDeleteItem", "projectRenameItem", "projectMoveItem", "projectCollectFiles",
      "projectRemoveUnused", "projectConsolidateFootage",
      // Composition operations
      "compDuplicate", "compDelete", "compSetActive", "compGetWorkArea", "compSetWorkArea",
      "compGetSelectedLayers",
      // Layer operations
      "layerDelete", "layerRename", "layerSelect", "layerDeselectAll", "layerMove",
      "layerSplit", "layerSetTiming", "layerToggle", "layerSetQuality", "layerSetLabel",
      "layerAutoOrient",
      // Audio
      "createAudioLayer", "setAudioLevels", "audioKeyframe",
      // Markers
      "addMarker", "getMarkers", "removeMarker",
      // Layer styles
      "addLayerStyle", "removeLayerStyles",
      // Shape operations
      "addShapePath", "addShapeModifier", "animateShapePath",
      // Time remapping
      "enableTimeRemapping", "setTimeRemapKeyframe", "applyTimeEffect",
      // Motion path
      "createMotionPath", "copyAnimation",
      // Keyframe operations
      "keyframeRemove", "keyframeRemoveAll", "keyframeGetAll", "keyframeReverse",
      // Footage
      "footageSetInterpretation", "footageReload", "footageGetMissing",
      // Effect operations
      "effectRemove", "effectDuplicate", "effectToggle", "effectSetProperty", "effectKeyframe",
      // Mask operations
      "maskRemove", "maskSetProperties", "maskKeyframe",
      // Resources
      "getProjectState", "getActiveComposition", "getAvailableEffects", "getAvailableFonts",
      "getRenderProgress", "getSceneSummary", "getLayerTree", "getKeyframeInterpolation", "setKeyframeInterpolation", "setupProject",
      // Transform
      "transformSetAll", "transformReset", "transformCenterInComp", "transformFitToComp",
      // Expression
      "expressionSet", "expressionRemove", "expressionToggle", "expressionGet", "addExpressionControl",
      // Animation helpers
      "sequenceLayers", "staggerAnimation", "createAnimationPreset",
      // 3D
      "set3DPosition", "set3DRotation", "setMaterialOptions",
      // Text
      "setTextContent", "setTextStyle",
      // Other
      "createAdjustmentLayer", "setGuideLayer", "setCurrentTime", "previewPlay"
    ];
    
    if (!allowedScripts.includes(script)) {
      return {
        content: [
          {
            type: "text",
            text: `Error: Script "${script}" is not allowed. Allowed scripts are: ${allowedScripts.join(", ")}`
          }
        ],
        isError: true
      };
    }

    try {
      // Clear any stale result data
      clearResultsFile();
      
      // Write command to file for After Effects to pick up
      writeCommandFile(script, parameters);
      
      return {
        content: [
          {
            type: "text",
            text: `Command to run "${script}" has been queued.\n` +
                  `Please ensure the "MCP Bridge Auto" panel is open in After Effects.\n` +
                  `Use the "get-results" tool after a few seconds to check for results.`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error queuing command: ${String(error)}`
          }
        ],
        isError: true
      };
    }
  }
);

// Add a tool to get the results from the last script executed in After Effects
server.tool(
  "get-results",
  "Get results from the last script executed in After Effects",
  {},
  async () => {
    try {
      const result = readResultsFromTempFile();
      return {
        content: [
          {
            type: "text",
            text: result
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting results: ${String(error)}`
          }
        ],
        isError: true
      };
    }
  }
);

// List available skill resources (MD files in the skills folder)
server.tool(
  "list-skills",
  "List all available skill resources. Skills are markdown files in the skills folder; each is exposed as an MCP resource (aftereffects://skills/<name>) that the AI can read.",
  {},
  async () => {
    try {
      const skillsDir = getSkillsDir();
      if (!fs.existsSync(skillsDir)) {
        return {
          content: [{ type: "text", text: `Skills directory not found: ${skillsDir}\nCreate it or set MCP_AE_SKILLS_DIR.` }]
        };
      }
      const files = fs.readdirSync(skillsDir).filter((f) => f.endsWith(".md"));
      if (files.length === 0) {
        return {
          content: [{
            type: "text",
            text: `No .md files in skills folder.\n\nSkills dir: ${skillsDir}\nAdd .md files here; each will be exposed as aftereffects://skills/<filename-without-ext>`
          }]
        };
      }
      const lines = [
        `Skills directory: ${skillsDir}`,
        "",
        "Available skills (read these as MCP resources):",
        ...files.map((f) => {
          const slug = skillSlug(f);
          return `  - ${slug}\n    URI: aftereffects://skills/${slug}\n    File: ${f}`;
        }),
        "",
        "The AI can read any of these URIs to inject the skill content into context."
      ];
      return {
        content: [{ type: "text", text: lines.join("\n") }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// Read a specific skill file by name
server.tool(
  "read-skill",
  "Read the content of a specific skill file. Use list-skills first to see available skills.",
  {
    name: z.string().describe("The skill name (without .md extension), e.g., 'core-concepts', 'animation-basics'")
  },
  async ({ name }) => {
    try {
      const skillsDir = getSkillsDir();
      const filePath = path.join(skillsDir, `${name}.md`);

      if (!fs.existsSync(filePath)) {
        // Try to find similar skills
        const files = fs.existsSync(skillsDir)
          ? fs.readdirSync(skillsDir).filter((f) => f.endsWith(".md"))
          : [];
        const available = files.map((f) => skillSlug(f)).join(", ");
        return {
          content: [{
            type: "text",
            text: `Skill "${name}" not found.\n\nAvailable skills: ${available || "(none)"}`
          }],
          isError: true
        };
      }

      const content = fs.readFileSync(filePath, "utf8");
      return {
        content: [{
          type: "text",
          text: content
        }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error reading skill: ${String(error)}` }],
        isError: true
      };
    }
  }
);

// Diagnostic: verify bridge path and whether command file exists (so user can compare with AE panel)
server.tool(
  "bridge-status",
  "Check MCP bridge path and whether command/result files exist (for troubleshooting)",
  {},
  async () => {
    try {
      const dir = getBridgeDir();
      const commandPath = path.join(dir, "ae_command.json");
      const resultPath = path.join(dir, "ae_mcp_result.json");
      const viewportPath = path.join(dir, "ae_viewport.png");
      const dirExists = fs.existsSync(dir);
      const commandExists = fs.existsSync(commandPath);
      const resultExists = fs.existsSync(resultPath);
      const viewportExists = fs.existsSync(viewportPath);
      let commandContent = "";
      let resultContent = "";
      let commandMtime = "";
      let resultMtime = "";
      let viewportMtime = "";
      let viewportSize = 0;
      if (commandExists) {
        try {
          commandContent = fs.readFileSync(commandPath, "utf8");
          const s = fs.statSync(commandPath);
          commandMtime = s.mtime.toISOString();
        } catch (e) {
          commandContent = String(e);
        }
      }
      if (resultExists) {
        try {
          resultContent = fs.readFileSync(resultPath, "utf8");
          const s = fs.statSync(resultPath);
          resultMtime = s.mtime.toISOString();
        } catch (e) {
          resultContent = String(e);
        }
      }
      if (viewportExists) {
        try {
          const s = fs.statSync(viewportPath);
          viewportMtime = s.mtime.toISOString();
          viewportSize = s.size;
        } catch (_) {}
      }
      
      // Detect environment info for debugging
      const envInfo = [
        `HOME: ${process.env.HOME || "(not set)"}`,
        `USERPROFILE: ${process.env.USERPROFILE || "(not set)"}`,
        `MCP_AE_BRIDGE_DIR: ${process.env.MCP_AE_BRIDGE_DIR || "(not set - using default)"}`,
      ];
      
      // Try to get bridge version (with short timeout)
      let bridgeVersion = "(unknown - bridge not responding)";
      let bridgeDirFromAE = "";
      try {
        clearResultsFile();
        writeCommandFile("getBridgeVersion", {});
        const versionResult = await waitForBridgeResult("getBridgeVersion", 3000, 200);
        const parsed = JSON.parse(versionResult);
        if (parsed.version) {
          bridgeVersion = parsed.version;
          bridgeDirFromAE = parsed.bridgeDir || "";
        }
      } catch (_) {
        // Bridge didn't respond, that's ok for status check
      }
      
      const pathMatch = bridgeDirFromAE && bridgeDirFromAE === dir ? "✓ MATCH" : (bridgeDirFromAE ? "✗ MISMATCH!" : "");
      
      const report = [
        "=== MCP Bridge Status ===",
        "",
        "Bridge version: " + bridgeVersion,
        "",
        "Node bridge directory:",
        `  ${dir}`,
        bridgeDirFromAE ? `After Effects bridge directory:` : "",
        bridgeDirFromAE ? `  ${bridgeDirFromAE} ${pathMatch}` : "",
        "",
        "Directory exists: " + dirExists,
        "Command file exists: " + commandExists + (commandMtime ? " (modified: " + commandMtime + ")" : ""),
        "Result file exists: " + resultExists + (resultMtime ? " (modified: " + resultMtime + ")" : ""),
        "Viewport PNG exists: " + viewportExists + (viewportMtime ? ` (${viewportSize} bytes, modified: ${viewportMtime})` : ""),
        "",
        "Full paths:",
        `  Command: ${commandPath}`,
        `  Result:  ${resultPath}`,
        `  Viewport: ${viewportPath}`,
        "",
        "Environment:",
        ...envInfo.map(e => `  ${e}`),
        "",
        "=== Troubleshooting ===",
        "If bridge is not responding:",
        "1. Open After Effects and ensure 'MCP Bridge Auto' panel is visible",
        "2. Check the panel shows the same path as above",
        "3. If paths differ, set MCP_AE_BRIDGE_DIR in your MCP client config",
        "4. Reinstall bridge: copy mcp-bridge-auto.jsx to AE ScriptUI Panels folder",
        "",
        ...(commandContent ? ["Last command (first 500 chars):", commandContent.slice(0, 500), ""] : []),
        ...(resultContent ? ["Last result (first 500 chars):", resultContent.slice(0, 500)] : [])
      ].filter(Boolean).join("\n");
      return {
        content: [{ type: "text", text: report }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: "bridge-status error: " + String(error) }],
        isError: true
      };
    }
  }
);

// Add prompts for common After Effects tasks
server.prompt(
  "list-compositions",
  "List compositions in the current After Effects project",
  () => {
    return {
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: "Please list all compositions in the current After Effects project."
        }
      }]
    };
  }
);

server.prompt(
  "analyze-composition",
  {
    compositionName: z.string().describe("Name of the composition to analyze")
  },
  (args) => {
    return {
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `Please analyze the composition named "${args.compositionName}" in the current After Effects project. Provide details about its duration, frame rate, resolution, and layers.`
        }
      }]
    };
  }
);

// Add a prompt for creating compositions
server.prompt(
  "create-composition",
  "Create a new composition with specified settings",
  () => {
    return {
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `Please create a new composition with custom settings. You can specify parameters like name, width, height, frame rate, etc.`
        }
      }]
    };
  }
);

// Add a tool to provide help and instructions
server.tool(
  "get-help",
  "Get help on using the After Effects MCP integration",
  {},
  async () => {
    return {
      content: [
        {
          type: "text",
          text: `# After Effects MCP Integration Help

To use this integration with After Effects, follow these steps:

 1. **Install the scripts in After Effects**
   - Run \`node install-bridge.js\` with administrator privileges
   - This copies the necessary scripts to your After Effects installation

2. **Open After Effects**
   - Launch Adobe After Effects 
   - Open a project that you want to work with

3. **Open the MCP Bridge Auto panel**
   - In After Effects, go to Window > mcp-bridge-auto.jsx
   - The panel will automatically check for commands every few seconds

4. **Run scripts through MCP**
   - Use the \`run-script\` tool to queue a command
   - The Auto panel will detect and run the command automatically
   - Results will be saved to a temp file

5. **Get results through MCP**
   - After a command is executed, use the \`get-results\` tool
   - This will retrieve the results from After Effects

Available scripts:
- getProjectInfo: Information about the current project
- listCompositions: List all compositions in the project
- getLayerInfo: Information about layers in the active composition
- createComposition: Create a new composition
- createTextLayer: Create a new text layer
- createShapeLayer: Create a new shape layer
- createSolidLayer: Create a new solid layer
- setLayerProperties: Set properties for a layer
- setLayerKeyframe: Set a keyframe for a layer property
- setLayerExpression: Set an expression for a layer property
- applyEffect: Apply an effect to a layer
- applyEffectTemplate: Apply a predefined effect template to a layer

Effect Templates:
- gaussian-blur: Simple Gaussian blur effect
- directional-blur: Motion blur in a specific direction
- color-balance: Adjust hue, lightness, and saturation
- brightness-contrast: Basic brightness and contrast adjustment
- curves: Advanced color adjustment using curves
- glow: Add a glow effect to elements
- drop-shadow: Add a customizable drop shadow
- cinematic-look: Combination of effects for a cinematic appearance
- text-pop: Effects to make text stand out (glow and shadow)

Note: The auto-running panel can be left open in After Effects to continuously listen for commands from external applications.`
        }
      ]
    };
  }
);

// Add a tool specifically for creating compositions
server.tool(
  "create-composition",
  "Create a new composition in After Effects with specified parameters",
  {
    name: z.string().describe("Name of the composition"),
    width: z.number().int().positive().describe("Width of the composition in pixels"),
    height: z.number().int().positive().describe("Height of the composition in pixels"),
    pixelAspect: z.number().positive().optional().describe("Pixel aspect ratio (default: 1.0)"),
    duration: z.number().positive().optional().describe("Duration in seconds (default: 10.0)"),
    frameRate: z.number().positive().optional().describe("Frame rate in frames per second (default: 30.0)"),
    backgroundColor: z.object({
      r: z.number().int().min(0).max(255),
      g: z.number().int().min(0).max(255),
      b: z.number().int().min(0).max(255)
    }).optional().describe("Background color of the composition (RGB values 0-255)")
  },
  async (params) => {
    try {
      // Write command to file for After Effects to pick up
      writeCommandFile("createComposition", params);
      
      return {
        content: [
          {
            type: "text",
            text: `Command to create composition "${params.name}" has been queued.\n` +
                  `Please ensure the "MCP Bridge Auto" panel is open in After Effects.\n` +
                  `Use the "get-results" tool after a few seconds to check for results.`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error queuing composition creation: ${String(error)}`
          }
        ],
        isError: true
      };
    }
  }
);

// --- BEGIN NEW TOOLS --- 

// Zod schema for common layer identification
const LayerIdentifierSchema = {
  compIndex: z.number().int().positive().describe("1-based index of the target composition in the project panel."),
  layerIndex: z.number().int().positive().describe("1-based index of the target layer within the composition.")
};

// Zod schema for keyframe value (more specific types might be needed depending on property)
// Using z.any() for flexibility, but can be refined (e.g., z.array(z.number()) for position/scale)
const KeyframeValueSchema = z.any().describe("The value for the keyframe (e.g., [x,y] for Position, [w,h] for Scale, angle for Rotation, percentage for Opacity)");

// Tool for setting a layer keyframe
server.tool(
  "setLayerKeyframe", // Corresponds to the function name in ExtendScript
  "Set a keyframe for a specific layer property at a given time.",
  {
    ...LayerIdentifierSchema, // Reuse common identifiers
    propertyName: z.string().describe("Name of the property to keyframe (e.g., 'Position', 'Scale', 'Rotation', 'Opacity')."),
    timeInSeconds: z.number().describe("The time (in seconds) for the keyframe."),
    value: KeyframeValueSchema
  },
  async (parameters) => {
    try {
      // Queue the command for After Effects
      writeCommandFile("setLayerKeyframe", parameters);
      
      return {
        content: [
          {
            type: "text",
            text: `Command to set keyframe for "${parameters.propertyName}" on layer ${parameters.layerIndex} in comp ${parameters.compIndex} has been queued.\n` +
                  `Use the "get-results" tool after a few seconds to check for confirmation.`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error queuing setLayerKeyframe command: ${String(error)}`
          }
        ],
        isError: true
      };
    }
  }
);

// Tool for setting a layer expression
server.tool(
  "setLayerExpression", // Corresponds to the function name in ExtendScript
  "Set or remove an expression for a specific layer property.",
  {
    ...LayerIdentifierSchema, // Reuse common identifiers
    propertyName: z.string().describe("Name of the property to apply the expression to (e.g., 'Position', 'Scale', 'Rotation', 'Opacity')."),
    expressionString: z.string().describe("The JavaScript expression string. Provide an empty string (\"\") to remove the expression.")
  },
  async (parameters) => {
    try {
      // Queue the command for After Effects
      writeCommandFile("setLayerExpression", parameters);
      
      return {
        content: [
          {
            type: "text",
            text: `Command to set expression for "${parameters.propertyName}" on layer ${parameters.layerIndex} in comp ${parameters.compIndex} has been queued.\n` +
                  `Use the "get-results" tool after a few seconds to check for confirmation.`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error queuing setLayerExpression command: ${String(error)}`
          }
        ],
        isError: true
      };
    }
  }
);

// --- END NEW TOOLS --- 

// --- BEGIN NEW TESTING TOOL --- 
// Add a special tool for directly testing the keyframe functionality
server.tool(
  "test-animation",
  "Test animation functionality in After Effects",
  {
    operation: z.enum(["keyframe", "expression"]).describe("The animation operation to test"),
    compIndex: z.number().int().positive().describe("Composition index (usually 1)"),
    layerIndex: z.number().int().positive().describe("Layer index (usually 1)")
  },
  async (params) => {
    try {
      // Generate a unique timestamp
      const timestamp = new Date().getTime();
      const tempFile = path.join(process.env.TEMP || process.env.TMP || '', `ae_test_${timestamp}.jsx`);
      
      // Create a direct test script that doesn't rely on command files
      let scriptContent = "";
      if (params.operation === "keyframe") {
        scriptContent = `
          // Direct keyframe test script
          try {
            var comp = app.project.items[${params.compIndex}];
            var layer = comp.layers[${params.layerIndex}];
            var prop = layer.property("Transform").property("Opacity");
            var time = 1; // 1 second
            var value = 25; // 25% opacity
            
            // Set a keyframe
            prop.setValueAtTime(time, value);
            
            // Write direct result
            var resultFile = new File("${path.join(process.env.TEMP || process.env.TMP || '', 'ae_test_result.txt').replace(/\\/g, '\\\\')}");
            resultFile.open("w");
            resultFile.write("SUCCESS: Added keyframe at time " + time + " with value " + value);
            resultFile.close();
            
            // Visual feedback
            alert("Test successful: Added opacity keyframe at " + time + "s with value " + value + "%");
          } catch (e) {
            var errorFile = new File("${path.join(process.env.TEMP || process.env.TMP || '', 'ae_test_error.txt').replace(/\\/g, '\\\\')}");
            errorFile.open("w");
            errorFile.write("ERROR: " + e.toString());
            errorFile.close();
            
            alert("Test failed: " + e.toString());
          }
        `;
      } else if (params.operation === "expression") {
        scriptContent = `
          // Direct expression test script
          try {
            var comp = app.project.items[${params.compIndex}];
            var layer = comp.layers[${params.layerIndex}];
            var prop = layer.property("Transform").property("Position");
            var expression = "wiggle(3, 30)";
            
            // Set the expression
            prop.expression = expression;
            
            // Write direct result
            var resultFile = new File("${path.join(process.env.TEMP || process.env.TMP || '', 'ae_test_result.txt').replace(/\\/g, '\\\\')}");
            resultFile.open("w");
            resultFile.write("SUCCESS: Added expression: " + expression);
            resultFile.close();
            
            // Visual feedback
            alert("Test successful: Added position expression: " + expression);
          } catch (e) {
            var errorFile = new File("${path.join(process.env.TEMP || process.env.TMP || '', 'ae_test_error.txt').replace(/\\/g, '\\\\')}");
            errorFile.open("w");
            errorFile.write("ERROR: " + e.toString());
            errorFile.close();
            
            alert("Test failed: " + e.toString());
          }
        `;
      }
      
      // Write the script to a temp file
      fs.writeFileSync(tempFile, scriptContent);
      console.error(`Written test script to: ${tempFile}`);
      
      // Tell the user what to do
      return {
        content: [
          {
            type: "text",
            text: `I've created a direct test script for the ${params.operation} operation.

Please run this script manually in After Effects:
1. In After Effects, go to File > Scripts > Run Script File...
2. Navigate to: ${tempFile}
3. You should see an alert confirming the result.

This bypasses the MCP Bridge Auto panel and will directly modify the specified layer.`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error creating test script: ${String(error)}`
          }
        ],
        isError: true
      };
    }
  }
);
// --- END NEW TESTING TOOL --- 

// --- BEGIN NEW EFFECTS TOOLS ---

// Add a tool for applying effects to layers
server.tool(
  "apply-effect",
  "Apply an effect to a layer. Prefer compName (from list-compositions) or omit comp to use active composition; compIndex is the project panel row over ALL items (folders, footage, comps) and often wrong. Effects only on Solid, Text, Footage, or Adjustment layers—not Shape, Null, Camera, or Light.",
  {
    compIndex: z.number().int().positive().optional().describe("1-based project item index (all types)—unreliable; prefer compName or omit for active comp"),
    compName: z.string().optional().describe("Composition name from list-compositions (recommended)"),
    layerIndex: z.number().int().positive().optional().describe("1-based index of the target layer (or use layerName)"),
    layerName: z.string().optional().describe("Name of the target layer (alternative to layerIndex)"),
    effectName: z.string().optional().describe("Display name of the effect to apply (e.g., 'Gaussian Blur')."),
    effectMatchName: z.string().optional().describe("After Effects internal name for the effect (more reliable, e.g., 'ADBE Gaussian Blur 2')."),
    effectCategory: z.string().optional().describe("Optional category for filtering effects."),
    presetPath: z.string().optional().describe("Optional path to an effect preset file (.ffx)."),
    effectSettings: z.record(z.any()).optional().describe("Optional parameters for the effect (e.g., { 'Blurriness': 25 }).")
  },
  async (parameters) => {
    try {
      // Queue the command for After Effects
      writeCommandFile("applyEffect", parameters);
      
      const target = parameters.compName || `comp ${parameters.compIndex || 'active'}`;
      const layer = parameters.layerName || `layer ${parameters.layerIndex || 1}`;
      return {
        content: [
          {
            type: "text",
            text: `Command to apply effect to ${layer} in ${target} has been queued.\n` +
                  `Use the "get-results" tool after a few seconds to check for confirmation.`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error queuing apply-effect command: ${String(error)}`
          }
        ],
        isError: true
      };
    }
  }
);

// Add a tool for applying effect templates
server.tool(
  "apply-effect-template",
  "Apply a predefined effect template. IMPORTANT: Effects can only be applied to Solid, Text, Footage, or Adjustment layers. They CANNOT be applied to Shape layers, Null objects, Cameras, or Lights.",
  {
    compIndex: z.number().int().positive().optional().describe("1-based composition index (or use compName)"),
    compName: z.string().optional().describe("Composition name (alternative to compIndex)"),
    layerIndex: z.number().int().positive().optional().describe("1-based layer index (or use layerName)"),
    layerName: z.string().optional().describe("Layer name (alternative to layerIndex)"),
    templateName: z.enum([
      "gaussian-blur", 
      "directional-blur", 
      "color-balance", 
      "brightness-contrast",
      "curves",
      "glow",
      "drop-shadow",
      "cinematic-look",
      "text-pop"
    ]).describe("Name of the effect template to apply."),
    customSettings: z.record(z.any()).optional().describe("Optional custom settings to override defaults.")
  },
  async (parameters) => {
    try {
      // Queue the command for After Effects
      writeCommandFile("applyEffectTemplate", parameters);
      
      const target = parameters.compName || `comp ${parameters.compIndex || 'active'}`;
      const layer = parameters.layerName || `layer ${parameters.layerIndex || 1}`;
      return {
        content: [
          {
            type: "text",
            text: `Command to apply effect template '${parameters.templateName}' to ${layer} in ${target} has been queued.\n` +
                  `Use the "get-results" tool after a few seconds to check for confirmation.`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error queuing apply-effect-template command: ${String(error)}`
          }
        ],
        isError: true
      };
    }
  }
);

// --- END NEW EFFECTS TOOLS ---

// Add direct MCP function for applying effects
server.tool(
  "mcp_aftereffects_applyEffect",
  "Apply an effect to a layer in After Effects",
  {
    compIndex: z.number().int().positive().describe("1-based index of the target composition in the project panel."),
    layerIndex: z.number().int().positive().describe("1-based index of the target layer within the composition."),
    effectName: z.string().optional().describe("Display name of the effect to apply (e.g., 'Gaussian Blur')."),
    effectMatchName: z.string().optional().describe("After Effects internal name for the effect (more reliable, e.g., 'ADBE Gaussian Blur 2')."),
    effectSettings: z.record(z.any()).optional().describe("Optional parameters for the effect (e.g., { 'Blurriness': 25 }).")
  },
  async (parameters) => {
    try {
      // Queue the command for After Effects
      writeCommandFile("applyEffect", parameters);
      
      // Wait a bit for After Effects to process the command
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the results
      const result = readResultsFromTempFile();
      
      return {
        content: [
          {
            type: "text",
            text: result
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error applying effect: ${String(error)}`
          }
        ],
        isError: true
      };
    }
  }
);

// Add direct MCP function for applying effect templates
server.tool(
  "mcp_aftereffects_applyEffectTemplate",
  "Apply a predefined effect template to a layer in After Effects",
  {
    compIndex: z.number().int().positive().describe("1-based index of the target composition in the project panel."),
    layerIndex: z.number().int().positive().describe("1-based index of the target layer within the composition."),
    templateName: z.enum([
      "gaussian-blur", 
      "directional-blur", 
      "color-balance", 
      "brightness-contrast",
      "curves",
      "glow",
      "drop-shadow",
      "cinematic-look",
      "text-pop"
    ]).describe("Name of the effect template to apply."),
    customSettings: z.record(z.any()).optional().describe("Optional custom settings to override defaults.")
  },
  async (parameters) => {
    try {
      // Queue the command for After Effects
      writeCommandFile("applyEffectTemplate", parameters);
      
      // Wait a bit for After Effects to process the command
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the results
      const result = readResultsFromTempFile();
      
      return {
        content: [
          {
            type: "text",
            text: result
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error applying effect template: ${String(error)}`
          }
        ],
        isError: true
      };
    }
  }
);

// Update help information to include the new effects tools
server.tool(
  "mcp_aftereffects_get_effects_help",
  "Get help on using After Effects effects",
  {},
  async () => {
    return {
      content: [
        {
          type: "text",
          text: `# After Effects Effects Help

## Common Effect Match Names
These are internal names used by After Effects that can be used with the \`effectMatchName\` parameter:

### Blur & Sharpen
- Gaussian Blur: "ADBE Gaussian Blur 2"
- Camera Lens Blur: "ADBE Camera Lens Blur"
- Directional Blur: "ADBE Directional Blur"
- Radial Blur: "ADBE Radial Blur"
- Smart Blur: "ADBE Smart Blur"
- Unsharp Mask: "ADBE Unsharp Mask"

### Color Correction
- Brightness & Contrast: "ADBE Brightness & Contrast 2"
- Color Balance: "ADBE Color Balance (HLS)"
- Color Balance (RGB): "ADBE Pro Levels2"
- Curves: "ADBE CurvesCustom"
- Exposure: "ADBE Exposure2"
- Hue/Saturation: "ADBE HUE SATURATION"
- Levels: "ADBE Pro Levels2"
- Vibrance: "ADBE Vibrance"

### Stylistic
- Glow: "ADBE Glow"
- Drop Shadow: "ADBE Drop Shadow"
- Bevel Alpha: "ADBE Bevel Alpha"
- Noise: "ADBE Noise"
- Fractal Noise: "ADBE Fractal Noise"
- CC Particle World: "CC Particle World"
- CC Light Sweep: "CC Light Sweep"

## Effect Templates
The following predefined effect templates are available:

- \`gaussian-blur\`: Simple Gaussian blur effect
- \`directional-blur\`: Motion blur in a specific direction
- \`color-balance\`: Adjust hue, lightness, and saturation
- \`brightness-contrast\`: Basic brightness and contrast adjustment
- \`curves\`: Advanced color adjustment using curves
- \`glow\`: Add a glow effect to elements
- \`drop-shadow\`: Add a customizable drop shadow
- \`cinematic-look\`: Combination of effects for a cinematic appearance
- \`text-pop\`: Effects to make text stand out (glow and shadow)

## Example Usage
To apply a Gaussian blur effect:

\`\`\`json
{
  "compIndex": 1,
  "layerIndex": 1,
  "effectMatchName": "ADBE Gaussian Blur 2",
  "effectSettings": {
    "Blurriness": 25
  }
}
\`\`\`

To apply the "cinematic-look" template:

\`\`\`json
{
  "compIndex": 1,
  "layerIndex": 1,
  "templateName": "cinematic-look"
}
\`\`\`
`
        }
      ]
    };
  }
);

// Add a direct tool for our bridge test effects
server.tool(
  "run-bridge-test",
  "Run the bridge test effects script to verify communication and apply test effects",
  {},
  async () => {
    try {
      // Clear any stale result data
      clearResultsFile();
      
      // Write command to file for After Effects to pick up
      writeCommandFile("bridgeTestEffects", {});
      
      return {
        content: [
          {
            type: "text",
            text: `Bridge test effects command has been queued.\n` +
                  `Please ensure the "MCP Bridge Auto" panel is open in After Effects.\n` +
                  `Use the "get-results" tool after a few seconds to check for the test results.`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error queuing bridge test command: ${String(error)}`
          }
        ],
        isError: true
      };
    }
  }
);

// ============================================================================
// NEW ENHANCED TOOLS - Phase 1: Core Layer Operations
// ============================================================================

// Create Null Layer
server.tool(
  "create-null-layer",
  "Create a null object layer for animation control and parenting",
  {
    compIndex: z.number().int().positive().optional().describe("1-based composition index (uses active comp if not specified)"),
    compName: z.string().optional().describe("Composition name (alternative to compIndex)"),
    name: z.string().optional().describe("Name for the null layer"),
    position: z.array(z.number()).optional().describe("Position [x, y] or [x, y, z]"),
    is3D: z.boolean().optional().describe("Make the null a 3D layer")
  },
  async (params) => {
    try {
      writeCommandFile("createNullLayer", params);
      return {
        content: [{
          type: "text",
          text: `Command to create null layer has been queued. Use "get-results" to check the result.`
        }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// Duplicate Layer
server.tool(
  "duplicate-layer",
  "Duplicate a layer in a composition",
  {
    compIndex: z.number().int().positive().describe("1-based composition index"),
    layerIndex: z.number().int().positive().describe("1-based layer index to duplicate"),
    count: z.number().int().positive().optional().describe("Number of duplicates to create (default: 1)"),
    offsetPosition: z.array(z.number()).optional().describe("Position offset for each duplicate [x, y]"),
    offsetTime: z.number().optional().describe("Time offset in seconds for each duplicate")
  },
  async (params) => {
    try {
      writeCommandFile("duplicateLayer", params);
      return {
        content: [{
          type: "text",
          text: `Command to duplicate layer ${params.layerIndex} has been queued.`
        }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// Parent Layer
server.tool(
  "parent-layer",
  "Set or remove parent relationship between layers",
  {
    compIndex: z.number().int().positive().describe("1-based composition index"),
    childLayerIndex: z.number().int().positive().describe("1-based index of child layer"),
    parentLayerIndex: z.number().int().nullable().describe("1-based index of parent layer (null to remove parenting)")
  },
  async (params) => {
    try {
      writeCommandFile("parentLayer", params);
      return {
        content: [{
          type: "text",
          text: params.parentLayerIndex 
            ? `Command to parent layer ${params.childLayerIndex} to layer ${params.parentLayerIndex} has been queued.`
            : `Command to remove parenting from layer ${params.childLayerIndex} has been queued.`
        }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// Precompose Layers
server.tool(
  "precompose-layers",
  "Precompose one or more layers into a new composition",
  {
    compIndex: z.number().int().positive().describe("1-based composition index"),
    layerIndices: z.array(z.number().int().positive()).describe("Array of 1-based layer indices to precompose"),
    newCompName: z.string().describe("Name for the new precomp"),
    moveAttributes: z.boolean().optional().describe("Move attributes into new composition (default: true)"),
    adjustDuration: z.boolean().optional().describe("Adjust composition duration to match layers")
  },
  async (params) => {
    try {
      writeCommandFile("precomposeLayers", params);
      return {
        content: [{
          type: "text",
          text: `Command to precompose layers [${params.layerIndices.join(', ')}] into "${params.newCompName}" has been queued.`
        }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// Add composition as layer
server.tool(
  "add-comp-as-layer",
  "Add an existing composition as a layer into another composition (nest a comp inside another comp)",
  {
    targetCompIndex: z.number().int().positive().optional().describe("1-based index of the composition to add the layer INTO (or use targetCompName; omit for active comp)"),
    targetCompName: z.string().optional().describe("Name of the target composition (alternative to targetCompIndex)"),
    sourceCompIndex: z.number().int().positive().optional().describe("1-based index of the composition to add AS a layer (or use sourceCompName)"),
    sourceCompName: z.string().optional().describe("Name of the source composition to add as a layer (alternative to sourceCompIndex)"),
    layerName: z.string().optional().describe("Optional name for the new layer (defaults to source comp name)"),
    position: z.number().int().positive().optional().describe("1-based layer position (1 = top). Omit to add on top.")
  },
  async (params) => {
    try {
      if (!params.sourceCompIndex && !params.sourceCompName) {
        return { content: [{ type: "text", text: "Error: Must provide either sourceCompIndex or sourceCompName" }], isError: true };
      }
      writeCommandFile("addCompAsLayer", params);
      const target = params.targetCompName || (params.targetCompIndex ? "comp " + params.targetCompIndex : "active comp");
      const source = params.sourceCompName || "comp " + params.sourceCompIndex;
      return {
        content: [{ type: "text", text: `Command to add composition "${source}" as layer into ${target} has been queued. Use get-results to confirm.` }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// Set Layer Blend Mode
server.tool(
  "set-blend-mode",
  "Set the blending mode for a layer",
  {
    compIndex: z.number().int().positive().describe("1-based composition index"),
    layerIndex: z.number().int().positive().describe("1-based layer index"),
    blendMode: z.enum([
      "normal", "dissolve", "darken", "multiply", "color-burn", "linear-burn", "darker-color",
      "add", "lighten", "screen", "color-dodge", "linear-dodge", "lighter-color",
      "overlay", "soft-light", "hard-light", "vivid-light", "linear-light", "pin-light", "hard-mix",
      "difference", "exclusion", "subtract", "divide",
      "hue", "saturation", "color", "luminosity",
      "stencil-alpha", "stencil-luma", "silhouette-alpha", "silhouette-luma",
      "alpha-add", "luminescent-premul"
    ]).describe("Blending mode to apply")
  },
  async (params) => {
    try {
      writeCommandFile("setBlendMode", params);
      return {
        content: [{
          type: "text",
          text: `Command to set blend mode "${params.blendMode}" on layer ${params.layerIndex} has been queued.`
        }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// Set Track Matte
server.tool(
  "set-track-matte",
  "Set track matte relationship between layers",
  {
    compIndex: z.number().int().positive().describe("1-based composition index"),
    layerIndex: z.number().int().positive().describe("1-based index of layer to receive the matte"),
    matteType: z.enum(["none", "alpha", "alpha-inverted", "luma", "luma-inverted"]).describe("Track matte type")
  },
  async (params) => {
    try {
      writeCommandFile("setTrackMatte", params);
      return {
        content: [{
          type: "text",
          text: `Command to set track matte "${params.matteType}" on layer ${params.layerIndex} has been queued.`
        }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// Convert to 3D Layer
server.tool(
  "convert-to-3d",
  "Convert a 2D layer to 3D or vice versa",
  {
    compIndex: z.number().int().positive().describe("1-based composition index"),
    layerIndex: z.number().int().positive().describe("1-based layer index"),
    enable3D: z.boolean().describe("True to enable 3D, false to disable")
  },
  async (params) => {
    try {
      writeCommandFile("convertTo3D", params);
      return {
        content: [{
          type: "text",
          text: `Command to ${params.enable3D ? 'enable' : 'disable'} 3D on layer ${params.layerIndex} has been queued.`
        }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// ============================================================================
// NEW ENHANCED TOOLS - Phase 2: Camera and Light Support
// ============================================================================

// Create Camera
server.tool(
  "create-camera",
  "Create a camera layer in the composition",
  {
    compIndex: z.number().int().positive().optional().describe("1-based composition index"),
    compName: z.string().optional().describe("Composition name"),
    name: z.string().optional().describe("Camera name"),
    cameraType: z.enum(["one-node", "two-node"]).optional().describe("Camera type (default: two-node)"),
    zoom: z.number().positive().optional().describe("Camera zoom value"),
    position: z.array(z.number()).optional().describe("Camera position [x, y, z]"),
    pointOfInterest: z.array(z.number()).optional().describe("Point of interest [x, y, z] for two-node camera"),
    depthOfField: z.boolean().optional().describe("Enable depth of field"),
    focusDistance: z.number().optional().describe("Focus distance"),
    aperture: z.number().optional().describe("Aperture value"),
    blurLevel: z.number().optional().describe("Blur level (0-100)")
  },
  async (params) => {
    try {
      writeCommandFile("createCamera", params);
      return {
        content: [{
          type: "text",
          text: `Command to create ${params.cameraType || 'two-node'} camera "${params.name || 'Camera'}" has been queued.`
        }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// Create Light
server.tool(
  "create-light",
  "Create a light layer in the composition",
  {
    compIndex: z.number().int().positive().optional().describe("1-based composition index"),
    compName: z.string().optional().describe("Composition name"),
    name: z.string().optional().describe("Light name"),
    lightType: z.enum(["parallel", "spot", "point", "ambient"]).describe("Type of light"),
    color: z.array(z.number()).optional().describe("Light color [r, g, b] values 0-1"),
    intensity: z.number().optional().describe("Light intensity (default: 100)"),
    position: z.array(z.number()).optional().describe("Light position [x, y, z]"),
    pointOfInterest: z.array(z.number()).optional().describe("Point of interest for spot light"),
    coneAngle: z.number().optional().describe("Cone angle for spot light (0-180)"),
    coneFeather: z.number().optional().describe("Cone feather percentage (0-100)"),
    castsShadows: z.boolean().optional().describe("Whether light casts shadows"),
    shadowDarkness: z.number().optional().describe("Shadow darkness (0-100)"),
    shadowDiffusion: z.number().optional().describe("Shadow diffusion")
  },
  async (params) => {
    try {
      writeCommandFile("createLight", params);
      return {
        content: [{
          type: "text",
          text: `Command to create ${params.lightType} light "${params.name || 'Light'}" has been queued.`
        }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// ============================================================================
// NEW ENHANCED TOOLS - Phase 3: Advanced Keyframe System
// ============================================================================

// Set Multiple Keyframes with Easing
server.tool(
  "set-keyframes",
  "Set multiple keyframes for a property with easing options",
  {
    compIndex: z.number().int().positive().describe("1-based composition index"),
    layerIndex: z.number().int().positive().describe("1-based layer index"),
    propertyPath: z.string().describe("Property path (e.g., 'Position', 'Scale', 'Opacity', 'Effects.Gaussian Blur.Blurriness')"),
    keyframes: z.array(z.object({
      time: z.number().describe("Time in seconds"),
      value: z.any().describe("Value at this keyframe"),
      easing: z.enum([
        "linear", "ease", "ease-in", "ease-out", "ease-in-out",
        "ease-in-quad", "ease-out-quad", "ease-in-out-quad",
        "ease-in-cubic", "ease-out-cubic", "ease-in-out-cubic",
        "ease-in-quart", "ease-out-quart", "ease-in-out-quart",
        "ease-in-expo", "ease-out-expo", "ease-in-out-expo",
        "ease-in-back", "ease-out-back", "ease-in-out-back",
        "ease-in-bounce", "ease-out-bounce", "ease-in-out-bounce",
        "hold"
      ]).optional().describe("Easing preset for this keyframe")
    })).describe("Array of keyframe objects")
  },
  async (params) => {
    try {
      writeCommandFile("setKeyframes", params);
      return {
        content: [{
          type: "text",
          text: `Command to set ${params.keyframes.length} keyframes on "${params.propertyPath}" has been queued.`
        }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// Apply Easing Preset
server.tool(
  "apply-easing",
  "Apply easing preset to existing keyframes",
  {
    compIndex: z.number().int().positive().describe("1-based composition index"),
    layerIndex: z.number().int().positive().describe("1-based layer index"),
    propertyPath: z.string().describe("Property path"),
    keyframeIndices: z.array(z.number().int().positive()).optional().describe("Keyframe indices to modify (all if not specified)"),
    easing: z.enum([
      "linear", "easy-ease", "easy-ease-in", "easy-ease-out",
      "bezier", "hold"
    ]).describe("Easing type to apply"),
    influence: z.number().min(0.1).max(100).optional().describe("Influence percentage for bezier (default: 33.33)")
  },
  async (params) => {
    try {
      writeCommandFile("applyEasing", params);
      return {
        content: [{
          type: "text",
          text: `Command to apply "${params.easing}" easing has been queued.`
        }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// ============================================================================
// NEW ENHANCED TOOLS - Phase 4: Expression Templates
// ============================================================================

// Apply Expression Template
server.tool(
  "apply-expression-template",
  "Apply a predefined expression template to a property",
  {
    compIndex: z.number().int().positive().describe("1-based composition index"),
    layerIndex: z.number().int().positive().describe("1-based layer index"),
    propertyPath: z.string().describe("Property path (e.g., 'Position', 'Rotation', 'Opacity')"),
    template: z.enum([
      // Motion
      "wiggle", "wiggle-smooth", "wiggle-separate-xy",
      "bounce", "elastic", "inertia", "overshoot",
      // Looping
      "loop-cycle", "loop-pingpong", "loop-offset", "loop-continue",
      // Time-based
      "continuous-rotation", "oscillate-sine", "oscillate-cos", "pulse",
      // Layer linking
      "link-to-layer", "link-with-delay", "follow-null",
      // Random
      "random", "random-hold",
      // Text
      "typewriter", "counter", "countdown",
      // Advanced
      "orbit", "look-at", "stagger-delay"
    ]).describe("Expression template to apply"),
    parameters: z.record(z.any()).optional().describe("Template parameters (varies by template)")
  },
  async (params) => {
    try {
      writeCommandFile("applyExpressionTemplate", params);
      return {
        content: [{
          type: "text",
          text: `Command to apply "${params.template}" expression template has been queued.`
        }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// ============================================================================
// NEW ENHANCED TOOLS - Phase 5: Extended Effect Templates
// ============================================================================

// Apply Extended Effect Template
server.tool(
  "apply-effect-preset",
  "Apply an effect preset. IMPORTANT: Effects can only be applied to Solid, Text, Footage, or Adjustment layers. They CANNOT be applied to Shape layers, Null objects, Cameras, or Lights.",
  {
    compIndex: z.number().int().positive().optional().describe("1-based composition index (or use compName)"),
    compName: z.string().optional().describe("Composition name (alternative to compIndex)"),
    layerIndex: z.number().int().positive().optional().describe("1-based layer index (or use layerName)"),
    layerName: z.string().optional().describe("Layer name (alternative to layerIndex)"),
    preset: z.enum([
      // Original presets
      "gaussian-blur", "directional-blur", "color-balance", "brightness-contrast",
      "curves", "glow", "drop-shadow", "cinematic-look", "text-pop",
      // New blur presets
      "radial-blur", "zoom-blur", "spin-blur", "camera-lens-blur", "tilt-shift",
      // New color presets  
      "vintage-film", "film-noir", "blockbuster-teal-orange", "bleach-bypass",
      "cross-process", "infrared", "sepia-tone", "cool-tone", "warm-tone",
      "high-contrast-bw", "low-contrast-fade", "vibrant-pop", "muted-pastel",
      // Stylize presets
      "vhs-retro", "glitch-digital", "chromatic-aberration", "halftone-dots",
      "sketch-pencil", "posterize-comic", "neon-glow", "glass-morphism",
      "frosted-glass", "pixelate-mosaic", "oil-paint", "watercolor",
      // VFX presets
      "lens-flare", "light-leak", "film-grain", "dust-scratches",
      "vignette-dark", "vignette-light", "letterbox-cinematic",
      // Motion presets
      "motion-trail", "echo-ghosting", "time-freeze",
      // Transition presets
      "fade-to-black", "fade-to-white", "dissolve", "wipe-linear"
    ]).describe("Effect preset to apply"),
    intensity: z.number().min(0).max(100).optional().describe("Effect intensity (0-100, default: 100)"),
    customSettings: z.record(z.any()).optional().describe("Override default preset settings")
  },
  async (params) => {
    try {
      writeCommandFile("applyEffectPreset", params);
      return {
        content: [{
          type: "text",
          text: `Command to apply "${params.preset}" effect preset has been queued.`
        }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// ============================================================================
// NEW ENHANCED TOOLS - Phase 6: Text Animation
// ============================================================================

// Add Text Animator
server.tool(
  "add-text-animator",
  "Add a text animator to a text layer",
  {
    compIndex: z.number().int().positive().describe("1-based composition index"),
    layerIndex: z.number().int().positive().describe("1-based layer index (must be a text layer)"),
    animatorName: z.string().optional().describe("Name for the animator"),
    property: z.enum([
      "position", "scale", "rotation", "opacity", "fill-color", "stroke-color",
      "stroke-width", "tracking", "line-anchor", "line-spacing", "character-offset", "blur"
    ]).describe("Property to animate"),
    rangeType: z.enum(["characters", "words", "lines"]).optional().describe("Range selector based on"),
    rangeStart: z.number().optional().describe("Range start (0-100%)"),
    rangeEnd: z.number().optional().describe("Range end (0-100%)"),
    rangeOffset: z.number().optional().describe("Range offset"),
    value: z.any().describe("Animation value")
  },
  async (params) => {
    try {
      writeCommandFile("addTextAnimator", params);
      return {
        content: [{
          type: "text",
          text: `Command to add "${params.property}" text animator has been queued.`
        }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// Apply Text Animation Preset
server.tool(
  "apply-text-animation",
  "Apply a predefined text animation preset",
  {
    compIndex: z.number().int().positive().describe("1-based composition index"),
    layerIndex: z.number().int().positive().describe("1-based layer index"),
    animation: z.enum([
      // Animate In
      "typewriter", "fade-in-characters", "fade-up-characters", "fade-up-words", "fade-up-lines",
      "scale-in-characters", "scale-in-words", "blur-in", "fly-in-left", "fly-in-right",
      "fly-in-bottom", "fly-in-top", "drop-in", "bounce-in", "swing-in", "spin-in",
      "random-fade-in", "decode-reveal", "glitch-in", "3d-flip-in", "split-reveal",
      // Animate Out
      "typewriter-out", "fade-out-characters", "scale-out", "fly-out", "blur-out",
      // Continuous
      "wiggle-text", "wave-text", "pulse-text", "bounce-loop", "color-cycle", "neon-flicker"
    ]).describe("Text animation preset to apply"),
    duration: z.number().positive().optional().describe("Animation duration in seconds"),
    delay: z.number().optional().describe("Delay between characters/words in frames"),
    direction: z.enum(["forward", "reverse", "random"]).optional().describe("Animation direction")
  },
  async (params) => {
    try {
      writeCommandFile("applyTextAnimation", params);
      return {
        content: [{
          type: "text",
          text: `Command to apply "${params.animation}" text animation has been queued.`
        }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// ============================================================================
// NEW ENHANCED TOOLS - Phase 7: Mask Operations
// ============================================================================

// Create Mask
server.tool(
  "create-mask",
  "Create a mask on a layer",
  {
    compIndex: z.number().int().positive().describe("1-based composition index"),
    layerIndex: z.number().int().positive().describe("1-based layer index"),
    maskShape: z.enum(["rectangle", "ellipse", "path"]).describe("Type of mask shape"),
    maskData: z.object({
      position: z.array(z.number()).optional().describe("Center position [x, y]"),
      size: z.array(z.number()).optional().describe("Size [width, height]"),
      vertices: z.array(z.array(z.number())).optional().describe("Path vertices for custom path"),
      inTangents: z.array(z.array(z.number())).optional().describe("In tangents for bezier"),
      outTangents: z.array(z.array(z.number())).optional().describe("Out tangents for bezier"),
      closed: z.boolean().optional().describe("Whether path is closed")
    }).describe("Mask shape data"),
    maskMode: z.enum(["none", "add", "subtract", "intersect", "lighten", "darken", "difference"]).optional(),
    feather: z.number().optional().describe("Mask feather amount"),
    opacity: z.number().optional().describe("Mask opacity (0-100)"),
    expansion: z.number().optional().describe("Mask expansion"),
    inverted: z.boolean().optional().describe("Invert the mask")
  },
  async (params) => {
    try {
      writeCommandFile("createMask", params);
      return {
        content: [{
          type: "text",
          text: `Command to create ${params.maskShape} mask has been queued.`
        }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// Apply Mask Animation Preset
server.tool(
  "apply-mask-animation",
  "Apply a mask reveal/animation preset",
  {
    compIndex: z.number().int().positive().describe("1-based composition index"),
    layerIndex: z.number().int().positive().describe("1-based layer index"),
    animation: z.enum([
      "wipe-left", "wipe-right", "wipe-up", "wipe-down",
      "wipe-diagonal-tl", "wipe-diagonal-tr", "wipe-diagonal-bl", "wipe-diagonal-br",
      "iris-circle", "iris-square", "iris-diamond", "iris-star",
      "split-horizontal", "split-vertical", "barn-doors",
      "venetian-blinds-h", "venetian-blinds-v",
      "spiral-in", "spiral-out", "radial-wipe",
      "dissolve-random", "dissolve-blocks"
    ]).describe("Mask animation preset"),
    duration: z.number().positive().optional().describe("Animation duration in seconds"),
    startTime: z.number().optional().describe("Start time in seconds"),
    reverse: z.boolean().optional().describe("Reverse the animation")
  },
  async (params) => {
    try {
      writeCommandFile("applyMaskAnimation", params);
      return {
        content: [{
          type: "text",
          text: `Command to apply "${params.animation}" mask animation has been queued.`
        }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// ============================================================================
// NEW ENHANCED TOOLS - Phase 8: Render Queue
// ============================================================================

// List Output Module Templates
server.tool(
  "list-output-templates",
  "List all available output module templates and render settings templates in After Effects. Use this to see what export formats are available before rendering.",
  {},
  async () => {
    try {
      clearResultsFile();
      writeCommandFile("listOutputModuleTemplates", {});
      const resultStr = await waitForBridgeResult("listOutputModuleTemplates", 8000, 300);
      let result: { status?: string; message?: string; outputModuleTemplates?: string[]; renderSettingsTemplates?: string[] };
      try {
        result = JSON.parse(resultStr);
      } catch {
        return {
          content: [{ type: "text", text: `Bridge did not return valid JSON. Raw: ${resultStr.slice(0, 500)}` }],
          isError: true
        };
      }
      if (result.status !== "success") {
        return {
          content: [{ type: "text", text: result.message || "Failed to list templates" }],
          isError: true
        };
      }
      
      const outputTemplates = result.outputModuleTemplates || [];
      const renderTemplates = result.renderSettingsTemplates || [];
      
      const report = [
        "=== Available Output Module Templates ===",
        "(Use these with add-to-render-queue's outputModule parameter or export-composition)",
        "",
        ...outputTemplates.map((t: string) => `  - ${t}`),
        "",
        "=== Available Render Settings Templates ===",
        "(Use these with add-to-render-queue's renderSettings parameter)",
        "",
        ...renderTemplates.map((t: string) => `  - ${t}`),
        "",
        "=== Common Compressed Formats ===",
        "Look for these in your templates:",
        "  - H.264 variants: H.264, H.264 High Bitrate, etc.",
        "  - ProRes: Apple ProRes 422, Apple ProRes 4444",
        "  - DNxHD/DNxHR: for Avid compatibility",
        "  - QuickTime: various codecs",
        "",
        "If H.264 templates are missing, install Adobe Media Encoder for more options."
      ].join("\n");
      
      return {
        content: [{ type: "text", text: report }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// Add to Render Queue
server.tool(
  "add-to-render-queue",
  "Add a composition to the render queue. Use list-output-templates first to see available templates for compressed export.",
  {
    compIndex: z.number().int().positive().describe("1-based composition index"),
    outputPath: z.string().describe("Output file path"),
    outputModule: z.string().optional().describe("Output module template name (from list-output-templates)"),
    renderSettings: z.string().optional().describe("Render settings template name")
  },
  async (params) => {
    try {
      clearResultsFile();
      writeCommandFile("addToRenderQueue", params);
      const resultStr = await waitForBridgeResult("addToRenderQueue", 8000, 300);
      let result: { status?: string; message?: string; warning?: string; appliedTemplate?: string; queueItem?: { index: number } };
      try {
        result = JSON.parse(resultStr);
      } catch {
        return {
          content: [{ type: "text", text: `Command queued. Use get-results to check status.` }]
        };
      }
      
      if (result.status !== "success") {
        return {
          content: [{ type: "text", text: result.message || "Failed to add to render queue" }],
          isError: true
        };
      }
      
      let response = `Added to render queue (item ${result.queueItem?.index || "?"}). Template: ${result.appliedTemplate || "default"}`;
      if (result.warning) {
        response += `\n\nWarning: ${result.warning}`;
      }
      
      return {
        content: [{ type: "text", text: response }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// Start Render
server.tool(
  "start-render",
  "Start rendering all items in the render queue",
  {},
  async () => {
    try {
      writeCommandFile("startRender", {});
      return {
        content: [{
          type: "text",
          text: `Command to start rendering has been queued.`
        }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// Export with Preset
server.tool(
  "export-composition",
  "Export composition with a preset configuration. The preset maps to available After Effects templates. Use list-output-templates to see what's available on your system.",
  {
    compIndex: z.number().int().positive().describe("1-based composition index"),
    preset: z.enum([
      "h264-high", "h264-medium", "h264-low", "h264-youtube", "h264-vimeo", "h264-instagram",
      "prores-422", "prores-422-hq", "prores-4444", "prores-4444-xq",
      "dnxhd", "dnxhr-hq", "cineform",
      "png-sequence", "tiff-sequence", "exr-sequence", "jpeg-sequence",
      "gif-high", "gif-medium", "gif-low",
      "mp3-320", "wav-48k", "aac-256",
      "lossless", "lossless-alpha"
    ]).describe("Export preset - maps to After Effects output templates"),
    outputPath: z.string().describe("Output file/folder path"),
    startFrame: z.number().int().optional().describe("Start frame (work area if not specified)"),
    endFrame: z.number().int().optional().describe("End frame (work area if not specified)")
  },
  async (params) => {
    try {
      clearResultsFile();
      writeCommandFile("exportComposition", params);
      const resultStr = await waitForBridgeResult("exportComposition", 8000, 300);
      let result: { status?: string; message?: string; warning?: string; note?: string; appliedTemplate?: string; preset?: string; outputPath?: string; queueItem?: { index: number } };
      try {
        result = JSON.parse(resultStr);
      } catch {
        return {
          content: [{
            type: "text",
            text: `Command to export with "${params.preset}" preset has been queued. Use get-results to check status.`
          }]
        };
      }
      
      if (result.status !== "success") {
        return {
          content: [{ type: "text", text: result.message || "Export configuration failed" }],
          isError: true
        };
      }
      
      let response = `Export configured with preset "${params.preset}"`;
      response += `\n  Output: ${result.outputPath || params.outputPath}`;
      response += `\n  Applied template: ${result.appliedTemplate || "default"}`;
      response += `\n  Render queue item: ${result.queueItem?.index || "?"}`;
      
      if (result.note) {
        response += `\n\nNote: ${result.note}`;
      }
      if (result.warning) {
        response += `\n\nWarning: ${result.warning}`;
      }
      
      response += `\n\nUse start-render to begin rendering, or get-render-progress to check status.`;
      
      return {
        content: [{ type: "text", text: response }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// Export Frame
server.tool(
  "export-frame",
  "Export a single frame from the composition",
  {
    compIndex: z.number().int().positive().describe("1-based composition index"),
    time: z.number().describe("Time in seconds to export"),
    format: z.enum(["png", "jpg", "tiff", "psd", "exr"]).describe("Output format"),
    outputPath: z.string().describe("Output file path"),
    quality: z.number().min(0).max(100).optional().describe("Quality for JPEG (0-100)")
  },
  async (params) => {
    try {
      writeCommandFile("exportFrame", params);
      return {
        content: [{
          type: "text",
          text: `Command to export frame at ${params.time}s as ${params.format} has been queued.`
        }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// Get viewport screenshot (vision of scene – like Blender MCP get_viewport_screenshot)
server.tool(
  "get-viewport-screenshot",
  "Capture the current composition view as an image so the AI can 'see' the scene. Uses active composition by default, or specify compIndex/compName and optional time. Returns a PNG image.",
  {
    compIndex: z.number().int().positive().optional().describe("1-based composition index (omit to use active comp)"),
    compName: z.string().optional().describe("Composition name (omit to use active comp)"),
    time: z.number().min(0).optional().describe("Time in seconds to capture (omit for current time)")
  },
  async (params) => {
    try {
      const bridgeDir = getBridgeDir();
      const outputPath = path.join(bridgeDir, "ae_viewport.png");
      
      // Log for debugging (stderr goes to MCP client logs)
      console.error(`[get-viewport-screenshot] Bridge dir: ${bridgeDir}`);
      console.error(`[get-viewport-screenshot] Output path: ${outputPath}`);
      
      // Delete existing file first to ensure we get a fresh capture
      try {
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
          console.error(`[get-viewport-screenshot] Deleted existing file`);
        }
      } catch (e) {
        console.error(`[get-viewport-screenshot] Could not delete existing file: ${e}`);
      }
      
      clearResultsFile();
      writeCommandFile("captureViewport", {
        outputPath,
        compIndex: params.compIndex,
        compName: params.compName,
        time: params.time
      });
      
      // Longer timeout for slow systems
      const resultStr = await waitForBridgeResult("captureViewport", 20000, 300);
      let result: { status?: string; message?: string; outputPath?: string; compName?: string; time?: number };
      try {
        result = JSON.parse(resultStr);
      } catch {
        return {
          content: [{ type: "text", text: `Bridge did not return valid JSON. Raw: ${resultStr.slice(0, 500)}\n\nNode bridge dir: ${bridgeDir}\nMake sure After Effects bridge panel shows the same path.` }],
          isError: true
        };
      }
      if (result.status !== "success") {
        // Add path info to error for debugging
        const pathInfo = `\n\nNode expects file at: ${outputPath}\nBridge reported path: ${result.outputPath || "(not reported)"}\nBridge dir: ${bridgeDir}`;
        return {
          content: [{ type: "text", text: (result.message || "Capture failed.") + pathInfo }],
          isError: true
        };
      }
      const imagePath = result.outputPath || outputPath;
      console.error(`[get-viewport-screenshot] Bridge reported success, checking file at: ${imagePath}`);
      
      // Wait for file to exist and have content with multiple retries
      let imageBuffer: Buffer | null = null;
      const maxRetries = 5;
      const retryDelays = [100, 200, 500, 1000, 2000]; // Exponential backoff
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        if (!fs.existsSync(imagePath)) {
          if (attempt < maxRetries - 1) {
            await new Promise((resolve) => setTimeout(resolve, retryDelays[attempt]));
            continue;
          }
          return {
            content: [{ type: "text", text: `Image file not found at ${imagePath} after ${maxRetries} attempts. Bridge may use a different path.` }],
            isError: true
          };
        }
        
        const buffer = fs.readFileSync(imagePath);
        if (buffer.length > 0) {
          imageBuffer = buffer;
          break;
        }
        
        // File exists but is empty, wait and retry
        if (attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, retryDelays[attempt]));
        }
      }
      
      const compInfo = result.compName != null ? ` (${result.compName} at ${result.time ?? "current"}s)` : "";
      
      // Final check: if we still don't have valid image data, return error without image block
      if (!imageBuffer || imageBuffer.length === 0) {
        return {
          content: [{
            type: "text",
            text: `Viewport capture reported success${compInfo}, but the image file was empty after ${maxRetries} retries (${imagePath}). This can happen if:\n- The composition has no visible content\n- After Effects didn't finish writing the file\n- saveFrameToPng failed silently\n\nTry again or check that the composition has visible layers.`
          }],
          isError: true
        };
      }
      
      // Re-encode PNG so the API can process it. AE sometimes writes PNGs that libspng (sharp) can't read.
      let processedBuffer: Buffer;
      try {
        processedBuffer = await sharp(imageBuffer)
          .png({ compressionLevel: 6 })
          .toBuffer();
      } catch (sharpErr) {
        try {
          processedBuffer = await sharp(imageBuffer)
            .jpeg({ quality: 90 })
            .toBuffer();
          const base64Jpeg = processedBuffer.toString("base64");
          return {
            content: [
              { type: "text", text: `Viewport captured${compInfo}. (Converted to JPEG due to PNG issue)` },
              { type: "image", data: base64Jpeg, mimeType: "image/jpeg" as const }
            ]
          };
        } catch {
          // Sharp failed (e.g. libspng read error). Try Jimp - different PNG decoder, often accepts AE output.
          try {
            const { Jimp } = await import("jimp");
            const image = await Jimp.read(imagePath);
            const jpegBuffer = await image.getBuffer("image/jpeg", { quality: 90 });
            const base64Jpeg = jpegBuffer.toString("base64");
            return {
              content: [
                { type: "text", text: `Viewport captured${compInfo}. (Decoded with Jimp fallback.)` },
                { type: "image", data: base64Jpeg, mimeType: "image/jpeg" as const }
              ]
            };
          } catch (jimpErr) {
            return {
              content: [{
                type: "text",
                text: `Viewport capture${compInfo}: Image file exists (${imageBuffer.length} bytes) but could not be decoded. Sharp: ${sharpErr}. Jimp fallback: ${jimpErr}. AE may be writing a PNG variant that neither library supports.`
              }],
              isError: true
            };
          }
        }
      }
      
      const base64 = processedBuffer.toString("base64");
      
      // Triple-check: ensure base64 string is not empty before returning image
      if (!base64 || base64.length === 0) {
        return {
          content: [{
            type: "text",
            text: `Viewport capture${compInfo}: Image buffer had ${processedBuffer.length} bytes but base64 encoding failed. This is unexpected.`
          }],
          isError: true
        };
      }
      
      return {
        content: [
          { type: "text", text: `Viewport captured${compInfo}. Use the image to see the current composition.` },
          { type: "image", data: base64, mimeType: "image/png" as const }
        ]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// ============================================================================
// NEW ENHANCED TOOLS - Phase 9: Project Management
// ============================================================================

// Save Project
server.tool(
  "save-project",
  "Save the current project",
  {
    savePath: z.string().optional().describe("Path for Save As (omit to save to current location)")
  },
  async (params) => {
    try {
      writeCommandFile("saveProject", params);
      return {
        content: [{
          type: "text",
          text: params.savePath 
            ? `Command to save project as "${params.savePath}" has been queued.`
            : `Command to save project has been queued.`
        }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// Create Folder
server.tool(
  "create-project-folder",
  "Create a folder in the project panel",
  {
    name: z.string().describe("Folder name"),
    parentFolderIndex: z.number().int().positive().optional().describe("Parent folder index (root if not specified)")
  },
  async (params) => {
    try {
      writeCommandFile("createProjectFolder", params);
      return {
        content: [{
          type: "text",
          text: `Command to create folder "${params.name}" has been queued.`
        }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// ============================================================================
// NEW ENHANCED TOOLS - Phase 10: Import Operations
// ============================================================================

// Import File
server.tool(
  "import-file",
  "Import a file into the project",
  {
    filePath: z.string().describe("Path to the file to import"),
    importAs: z.enum(["footage", "composition", "composition-cropped"]).optional().describe("How to import"),
    sequence: z.boolean().optional().describe("Import as image sequence"),
    framerate: z.number().positive().optional().describe("Framerate for sequences"),
    targetFolderIndex: z.number().int().positive().optional().describe("Target folder in project")
  },
  async (params) => {
    try {
      writeCommandFile("importFile", params);
      return {
        content: [{
          type: "text",
          text: `Command to import "${params.filePath}" has been queued.`
        }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// Replace Footage
server.tool(
  "replace-footage",
  "Replace footage item with a new file",
  {
    footageIndex: z.number().int().positive().describe("1-based index of footage item"),
    newFilePath: z.string().describe("Path to replacement file")
  },
  async (params) => {
    try {
      writeCommandFile("replaceFootage", params);
      return {
        content: [{
          type: "text",
          text: `Command to replace footage has been queued.`
        }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// ============================================================================
// NEW ENHANCED TOOLS - Utility Operations
// ============================================================================

// Get Layer Details
server.tool(
  "get-layer-details",
  "Get detailed information about a specific layer",
  {
    compIndex: z.number().int().positive().describe("1-based composition index"),
    layerIndex: z.number().int().positive().describe("1-based layer index"),
    includeEffects: z.boolean().optional().describe("Include effect information"),
    includeKeyframes: z.boolean().optional().describe("Include keyframe data"),
    includeMasks: z.boolean().optional().describe("Include mask information"),
    includeExpressions: z.boolean().optional().describe("Include expression data")
  },
  async (params) => {
    try {
      writeCommandFile("getLayerDetails", params);
      return {
        content: [{
          type: "text",
          text: `Command to get layer details has been queued.`
        }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// Find Layers
server.tool(
  "find-layers",
  "Find layers matching specific criteria",
  {
    compIndex: z.number().int().positive().describe("1-based composition index"),
    name: z.string().optional().describe("Layer name to match"),
    namePattern: z.string().optional().describe("Regex pattern for name matching"),
    layerType: z.enum(["all", "text", "shape", "solid", "footage", "camera", "light", "null", "adjustment"]).optional(),
    has3D: z.boolean().optional().describe("Filter by 3D status"),
    hasEffects: z.boolean().optional().describe("Filter by whether layer has effects"),
    hasExpressions: z.boolean().optional().describe("Filter by whether layer has expressions"),
    isVisible: z.boolean().optional().describe("Filter by visibility")
  },
  async (params) => {
    try {
      writeCommandFile("findLayers", params);
      return {
        content: [{
          type: "text",
          text: `Command to find layers has been queued.`
        }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// Purge Memory
server.tool(
  "purge-memory",
  "Purge After Effects caches and memory",
  {
    purgeType: z.enum(["all", "image-cache", "undo", "snapshot", "disk-cache"]).describe("Type of cache to purge")
  },
  async (params) => {
    try {
      writeCommandFile("purgeMemory", params);
      return {
        content: [{
          type: "text",
          text: `Command to purge ${params.purgeType} has been queued.`
        }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// Set Composition Settings
server.tool(
  "set-composition-settings",
  "Modify composition settings",
  {
    compIndex: z.number().int().positive().describe("1-based composition index"),
    name: z.string().optional().describe("New composition name"),
    width: z.number().int().positive().optional().describe("New width"),
    height: z.number().int().positive().optional().describe("New height"),
    frameRate: z.number().positive().optional().describe("New frame rate"),
    duration: z.number().positive().optional().describe("New duration in seconds"),
    backgroundColor: z.object({
      r: z.number().min(0).max(255),
      g: z.number().min(0).max(255),
      b: z.number().min(0).max(255)
    }).optional().describe("New background color"),
    motionBlur: z.boolean().optional().describe("Enable/disable motion blur"),
    shutterAngle: z.number().min(0).max(720).optional().describe("Shutter angle for motion blur"),
    renderer: z.enum(["classic-3d", "cinema-4d", "ray-traced"]).optional().describe("3D renderer")
  },
  async (params) => {
    try {
      writeCommandFile("setCompositionSettings", params);
      return {
        content: [{
          type: "text",
          text: `Command to update composition settings has been queued.`
        }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// ============================================================================
// COMPLETE 100% COVERAGE - All Remaining Tools
// ============================================================================

// ==================== PROJECT OPERATIONS ====================

server.tool(
  "project-new",
  "Create a new After Effects project",
  {},
  async () => {
    try {
      writeCommandFile("projectNew", {});
      return { content: [{ type: "text", text: "Command to create new project queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "project-open",
  "Open an existing After Effects project",
  { projectPath: z.string().describe("Path to the .aep file") },
  async (params) => {
    try {
      writeCommandFile("projectOpen", params);
      return { content: [{ type: "text", text: `Command to open project queued.` }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "project-close",
  "Close the current project",
  { save: z.boolean().optional().describe("Save before closing") },
  async (params) => {
    try {
      writeCommandFile("projectClose", params);
      return { content: [{ type: "text", text: "Command to close project queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "project-get-settings",
  "Get all project settings",
  {},
  async () => {
    try {
      writeCommandFile("projectGetSettings", {});
      return { content: [{ type: "text", text: "Command to get project settings queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "project-set-settings",
  "Set project settings",
  {
    bitsPerChannel: z.enum(["8", "16", "32"]).optional(),
    expressionEngine: z.enum(["extendscript", "javascript"]).optional(),
    gpuAcceleration: z.enum(["mercury-gpu", "software"]).optional(),
    startFrame: z.number().optional(),
    framesCountType: z.enum(["startFrom0", "startFrom1", "timecode"]).optional()
  },
  async (params) => {
    try {
      writeCommandFile("projectSetSettings", params);
      return { content: [{ type: "text", text: "Command to set project settings queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "project-delete-item",
  "Delete an item from the project",
  { itemIndex: z.number().int().positive().describe("1-based item index") },
  async (params) => {
    try {
      writeCommandFile("projectDeleteItem", params);
      return { content: [{ type: "text", text: "Command to delete item queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "project-rename-item",
  "Rename an item in the project",
  {
    itemIndex: z.number().int().positive(),
    newName: z.string()
  },
  async (params) => {
    try {
      writeCommandFile("projectRenameItem", params);
      return { content: [{ type: "text", text: "Command to rename item queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "project-move-item",
  "Move an item to a folder",
  {
    itemIndex: z.number().int().positive(),
    targetFolderIndex: z.number().int().positive()
  },
  async (params) => {
    try {
      writeCommandFile("projectMoveItem", params);
      return { content: [{ type: "text", text: "Command to move item queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "project-collect-files",
  "Collect files to package the project",
  {
    outputFolder: z.string(),
    collectSourceFiles: z.boolean().optional(),
    generateReport: z.boolean().optional()
  },
  async (params) => {
    try {
      writeCommandFile("projectCollectFiles", params);
      return { content: [{ type: "text", text: "Command to collect files queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "project-remove-unused",
  "Remove unused footage from project",
  {},
  async () => {
    try {
      writeCommandFile("projectRemoveUnused", {});
      return { content: [{ type: "text", text: "Command to remove unused footage queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "project-consolidate-footage",
  "Consolidate duplicate footage items",
  {},
  async () => {
    try {
      writeCommandFile("projectConsolidateFootage", {});
      return { content: [{ type: "text", text: "Command to consolidate footage queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// ==================== COMPOSITION OPERATIONS ====================

server.tool(
  "comp-duplicate",
  "Duplicate a composition",
  {
    compIndex: z.number().int().positive(),
    newName: z.string().optional()
  },
  async (params) => {
    try {
      writeCommandFile("compDuplicate", params);
      return { content: [{ type: "text", text: "Command to duplicate composition queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "comp-delete",
  "Delete a composition by project index or by name. Provide compName (e.g. 'Test') or compIndex (1-based project item index).",
  {
    compIndex: z.number().int().positive().optional(),
    compName: z.string().optional(),
  },
  async (params) => {
    if (params.compIndex == null && !params.compName) {
      return { content: [{ type: "text", text: "Error: Provide compIndex or compName." }], isError: true };
    }
    try {
      writeCommandFile("compDelete", params);
      return { content: [{ type: "text", text: "Command to delete composition queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "comp-set-active",
  "Set the active composition (the one shown in the viewer)",
  {
    compIndex: z.number().int().positive().optional().describe("1-based project item index (prefer compName)"),
    compName: z.string().optional().describe("Composition name (recommended)")
  },
  async (params) => {
    try {
      if (!params.compIndex && !params.compName) {
        return { content: [{ type: "text", text: "Error: Must provide either compIndex or compName" }], isError: true };
      }
      writeCommandFile("compSetActive", params);
      return { content: [{ type: "text", text: "Command to set active composition queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "comp-get-work-area",
  "Get work area in and out points",
  { compIndex: z.number().int().positive() },
  async (params) => {
    try {
      writeCommandFile("compGetWorkArea", params);
      return { content: [{ type: "text", text: "Command to get work area queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "comp-set-work-area",
  "Set work area in and out points",
  {
    compIndex: z.number().int().positive(),
    startTime: z.number(),
    endTime: z.number()
  },
  async (params) => {
    try {
      writeCommandFile("compSetWorkArea", params);
      return { content: [{ type: "text", text: "Command to set work area queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "comp-get-selected-layers",
  "Get selected layers in a composition",
  { compIndex: z.number().int().positive().optional() },
  async (params) => {
    try {
      writeCommandFile("compGetSelectedLayers", params);
      return { content: [{ type: "text", text: "Command to get selected layers queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// ==================== LAYER OPERATIONS ====================

server.tool(
  "layer-delete",
  "Delete a layer from a composition",
  {
    compIndex: z.number().int().positive().optional().describe("1-based composition index (prefer compName)"),
    compName: z.string().optional().describe("Composition name (recommended)"),
    layerIndex: z.number().int().positive().optional().describe("1-based layer index (or use layerName)"),
    layerName: z.string().optional().describe("Layer name (recommended)")
  },
  async (params) => {
    try {
      if (!params.compIndex && !params.compName) {
        return { content: [{ type: "text", text: "Error: Must provide either compIndex or compName" }], isError: true };
      }
      if (!params.layerIndex && !params.layerName) {
        return { content: [{ type: "text", text: "Error: Must provide either layerIndex or layerName" }], isError: true };
      }
      writeCommandFile("layerDelete", params);
      return { content: [{ type: "text", text: "Command to delete layer queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "layer-rename",
  "Rename a layer",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    newName: z.string()
  },
  async (params) => {
    try {
      writeCommandFile("layerRename", params);
      return { content: [{ type: "text", text: "Command to rename layer queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "layer-select",
  "Select layers",
  {
    compIndex: z.number().int().positive(),
    layerIndices: z.array(z.number().int().positive()),
    addToSelection: z.boolean().optional()
  },
  async (params) => {
    try {
      writeCommandFile("layerSelect", params);
      return { content: [{ type: "text", text: "Command to select layers queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "layer-deselect-all",
  "Deselect all layers",
  { compIndex: z.number().int().positive() },
  async (params) => {
    try {
      writeCommandFile("layerDeselectAll", params);
      return { content: [{ type: "text", text: "Command to deselect all layers queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "layer-move",
  "Move a layer to a new index in the layer stack",
  {
    compIndex: z.number().int().positive().optional().describe("1-based composition index"),
    compName: z.string().optional().describe("Composition name (alternative to compIndex)"),
    layerIndex: z.number().int().positive().optional().describe("1-based layer index"),
    layerName: z.string().optional().describe("Layer name (alternative to layerIndex)"),
    newIndex: z.number().int().positive().describe("New 1-based layer index position")
  },
  async (params) => {
    try {
      if (!params.compIndex && !params.compName) {
        return { content: [{ type: "text", text: "Error: Must provide either compIndex or compName" }], isError: true };
      }
      if (!params.layerIndex && !params.layerName) {
        return { content: [{ type: "text", text: "Error: Must provide either layerIndex or layerName" }], isError: true };
      }
      writeCommandFile("layerMove", params);
      return { content: [{ type: "text", text: "Command to move layer queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "layer-split",
  "Split a layer at a time",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    splitTime: z.number()
  },
  async (params) => {
    try {
      writeCommandFile("layerSplit", params);
      return { content: [{ type: "text", text: "Command to split layer queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "layer-set-timing",
  "Set layer timing. All times in seconds. Use duration to set visible length (outPoint = inPoint + duration). Avoid setting only inPoint/outPoint to the same value (zero duration).",
  {
    compIndex: z.number().int().positive().optional().describe("1-based composition index"),
    compName: z.string().optional().describe("Composition name (alternative to compIndex)"),
    layerIndex: z.number().int().positive().optional().describe("1-based layer index"),
    layerName: z.string().optional().describe("Layer name (alternative to layerIndex)"),
    inPoint: z.number().optional().describe("Layer in point (seconds) - start of visible segment"),
    outPoint: z.number().optional().describe("Layer out point (seconds) - end of visible segment; must be > inPoint"),
    duration: z.number().min(0).optional().describe("Visible duration in seconds. Sets outPoint = inPoint + duration. Use this to avoid zero-length layers."),
    startTime: z.number().optional().describe("When the layer starts in the composition timeline (seconds)"),
    stretch: z.number().optional().describe("Time stretch percentage (100 = normal)")
  },
  async (params) => {
    try {
      if (!params.compIndex && !params.compName) {
        return { content: [{ type: "text", text: "Error: Must provide either compIndex or compName" }], isError: true };
      }
      if (!params.layerIndex && !params.layerName) {
        return { content: [{ type: "text", text: "Error: Must provide either layerIndex or layerName" }], isError: true };
      }
      writeCommandFile("layerSetTiming", params);
      return { content: [{ type: "text", text: "Command to set layer timing queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "layer-toggle",
  "Toggle layer switches",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    toggle: z.enum(["visibility", "audio", "solo", "lock", "shy", "effects", "motionBlur", "frameBlending", "collapse"]),
    value: z.boolean().optional()
  },
  async (params) => {
    try {
      writeCommandFile("layerToggle", params);
      return { content: [{ type: "text", text: `Command to toggle ${params.toggle} queued.` }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "layer-set-quality",
  "Set layer quality",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    quality: z.enum(["best", "draft", "wireframe"])
  },
  async (params) => {
    try {
      writeCommandFile("layerSetQuality", params);
      return { content: [{ type: "text", text: "Command to set layer quality queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "layer-set-label",
  "Set layer label color",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    label: z.number().int().min(0).max(16)
  },
  async (params) => {
    try {
      writeCommandFile("layerSetLabel", params);
      return { content: [{ type: "text", text: "Command to set layer label queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "layer-auto-orient",
  "Set layer auto-orientation",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    orientation: z.enum(["off", "along-path", "towards-camera", "towards-poi"])
  },
  async (params) => {
    try {
      writeCommandFile("layerAutoOrient", params);
      return { content: [{ type: "text", text: "Command to set auto-orient queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// ==================== AUDIO OPERATIONS ====================

server.tool(
  "create-audio-layer",
  "Create an audio layer from file",
  {
    compIndex: z.number().int().positive().optional(),
    audioPath: z.string(),
    startTime: z.number().optional(),
    name: z.string().optional()
  },
  async (params) => {
    try {
      writeCommandFile("createAudioLayer", params);
      return { content: [{ type: "text", text: "Command to create audio layer queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "set-audio-levels",
  "Set audio levels for a layer",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    levels: z.union([z.number(), z.array(z.number())]).describe("Single value or [left, right]")
  },
  async (params) => {
    try {
      writeCommandFile("setAudioLevels", params);
      return { content: [{ type: "text", text: "Command to set audio levels queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "audio-keyframe",
  "Set audio level keyframe",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    time: z.number(),
    levels: z.union([z.number(), z.array(z.number())])
  },
  async (params) => {
    try {
      writeCommandFile("audioKeyframe", params);
      return { content: [{ type: "text", text: "Command to set audio keyframe queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// ==================== MARKERS ====================

server.tool(
  "add-marker",
  "Add a marker to a layer or composition",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive().optional(),
    time: z.number(),
    comment: z.string().optional(),
    chapter: z.string().optional(),
    url: z.string().optional(),
    duration: z.number().optional(),
    label: z.number().optional()
  },
  async (params) => {
    try {
      writeCommandFile("addMarker", params);
      return { content: [{ type: "text", text: "Command to add marker queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "get-markers",
  "Get all markers from a layer or composition",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive().optional()
  },
  async (params) => {
    try {
      writeCommandFile("getMarkers", params);
      return { content: [{ type: "text", text: "Command to get markers queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "remove-marker",
  "Remove a marker",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive().optional(),
    markerIndex: z.number().int().positive()
  },
  async (params) => {
    try {
      writeCommandFile("removeMarker", params);
      return { content: [{ type: "text", text: "Command to remove marker queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// ==================== LAYER STYLES ====================

server.tool(
  "add-layer-style",
  "Add a layer style",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    style: z.enum([
      "drop-shadow", "inner-shadow", "outer-glow", "inner-glow",
      "bevel-emboss", "satin", "color-overlay", "gradient-overlay",
      "pattern-overlay", "stroke"
    ]),
    settings: z.record(z.any()).optional()
  },
  async (params) => {
    try {
      writeCommandFile("addLayerStyle", params);
      return { content: [{ type: "text", text: `Command to add ${params.style} style queued.` }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "remove-layer-style",
  "Remove all layer styles",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive()
  },
  async (params) => {
    try {
      writeCommandFile("removeLayerStyles", params);
      return { content: [{ type: "text", text: "Command to remove layer styles queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// ==================== SHAPE LAYER OPERATIONS ====================

server.tool(
  "add-shape-path",
  "Add a path to a shape layer",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    vertices: z.array(z.array(z.number())),
    inTangents: z.array(z.array(z.number())).optional(),
    outTangents: z.array(z.array(z.number())).optional(),
    closed: z.boolean().optional()
  },
  async (params) => {
    try {
      writeCommandFile("addShapePath", params);
      return { content: [{ type: "text", text: "Command to add shape path queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "add-shape-modifier",
  "Add a shape modifier",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    modifier: z.enum([
      "trim-paths", "pucker-bloat", "repeater", "round-corners",
      "wiggle-paths", "wiggle-transform", "twist", "zig-zag",
      "offset-paths", "merge-paths"
    ]),
    settings: z.record(z.any()).optional()
  },
  async (params) => {
    try {
      writeCommandFile("addShapeModifier", params);
      return { content: [{ type: "text", text: `Command to add ${params.modifier} modifier queued.` }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "animate-shape-path",
  "Animate shape path with morphing",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    pathKeyframes: z.array(z.object({
      time: z.number(),
      vertices: z.array(z.array(z.number())),
      inTangents: z.array(z.array(z.number())).optional(),
      outTangents: z.array(z.array(z.number())).optional()
    }))
  },
  async (params) => {
    try {
      writeCommandFile("animateShapePath", params);
      return { content: [{ type: "text", text: "Command to animate shape path queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// ==================== TIME REMAPPING ====================

server.tool(
  "enable-time-remapping",
  "Enable time remapping on a layer",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive()
  },
  async (params) => {
    try {
      writeCommandFile("enableTimeRemapping", params);
      return { content: [{ type: "text", text: "Command to enable time remapping queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "set-time-remap-keyframe",
  "Set a time remap keyframe",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    time: z.number(),
    remappedTime: z.number()
  },
  async (params) => {
    try {
      writeCommandFile("setTimeRemapKeyframe", params);
      return { content: [{ type: "text", text: "Command to set time remap keyframe queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "apply-time-effect",
  "Apply a time effect preset",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    effect: z.enum(["reverse", "slow-motion", "speed-ramp", "freeze-frame", "loop", "pingpong"]),
    speed: z.number().optional(),
    freezeAt: z.number().optional(),
    loopCount: z.number().optional()
  },
  async (params) => {
    try {
      writeCommandFile("applyTimeEffect", params);
      return { content: [{ type: "text", text: `Command to apply ${params.effect} effect queued.` }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// ==================== MOTION PATH ====================

server.tool(
  "create-motion-path",
  "Create a motion path animation",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    pathType: z.enum(["bezier", "circle", "spiral", "figure-8", "custom"]),
    duration: z.number(),
    center: z.array(z.number()).optional(),
    radius: z.number().optional(),
    turns: z.number().optional(),
    points: z.array(z.object({
      position: z.array(z.number()),
      inTangent: z.array(z.number()).optional(),
      outTangent: z.array(z.number()).optional()
    })).optional(),
    orientToPath: z.boolean().optional()
  },
  async (params) => {
    try {
      writeCommandFile("createMotionPath", params);
      return { content: [{ type: "text", text: `Command to create ${params.pathType} motion path queued.` }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "copy-animation",
  "Copy animation from one layer to another",
  {
    sourceCompIndex: z.number().int().positive(),
    sourceLayerIndex: z.number().int().positive(),
    sourceProperty: z.string().optional(),
    targetCompIndex: z.number().int().positive(),
    targetLayerIndex: z.number().int().positive(),
    targetProperty: z.string().optional(),
    timeOffset: z.number().optional()
  },
  async (params) => {
    try {
      writeCommandFile("copyAnimation", params);
      return { content: [{ type: "text", text: "Command to copy animation queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// ==================== KEYFRAME OPERATIONS ====================

server.tool(
  "keyframe-remove",
  "Remove a keyframe",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    propertyPath: z.string(),
    keyframeIndex: z.number().int().positive()
  },
  async (params) => {
    try {
      writeCommandFile("keyframeRemove", params);
      return { content: [{ type: "text", text: "Command to remove keyframe queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "keyframe-remove-all",
  "Remove all keyframes from a property",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    propertyPath: z.string()
  },
  async (params) => {
    try {
      writeCommandFile("keyframeRemoveAll", params);
      return { content: [{ type: "text", text: "Command to remove all keyframes queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "keyframe-get-all",
  "Get all keyframes for a property",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    propertyPath: z.string()
  },
  async (params) => {
    try {
      writeCommandFile("keyframeGetAll", params);
      return { content: [{ type: "text", text: "Command to get all keyframes queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "keyframe-reverse",
  "Reverse keyframes for a property",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    propertyPath: z.string()
  },
  async (params) => {
    try {
      writeCommandFile("keyframeReverse", params);
      return { content: [{ type: "text", text: "Command to reverse keyframes queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// ==================== FOOTAGE OPERATIONS ====================

server.tool(
  "footage-set-interpretation",
  "Set footage interpretation settings",
  {
    footageIndex: z.number().int().positive(),
    frameRate: z.number().optional(),
    alphaMode: z.enum(["ignore", "straight", "premultiplied"]).optional(),
    fieldSeparation: z.enum(["off", "upper-first", "lower-first"]).optional(),
    loopTimes: z.number().optional()
  },
  async (params) => {
    try {
      writeCommandFile("footageSetInterpretation", params);
      return { content: [{ type: "text", text: "Command to set footage interpretation queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "footage-reload",
  "Reload footage from disk",
  { footageIndex: z.number().int().positive() },
  async (params) => {
    try {
      writeCommandFile("footageReload", params);
      return { content: [{ type: "text", text: "Command to reload footage queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "footage-get-missing",
  "Get list of missing footage in the project. Returns paths/names of missing files.",
  {},
  async () => {
    try {
      clearResultsFile();
      writeCommandFile("footageGetMissing", {});
      const result = await waitForBridgeResult("footageGetMissing", 6000, 250);
      return { content: [{ type: "text", text: result }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// ==================== EFFECT OPERATIONS ====================

server.tool(
  "effect-remove",
  "Remove an effect from a layer",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    effectIndex: z.number().int().positive()
  },
  async (params) => {
    try {
      writeCommandFile("effectRemove", params);
      return { content: [{ type: "text", text: "Command to remove effect queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "effect-duplicate",
  "Duplicate an effect",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    effectIndex: z.number().int().positive()
  },
  async (params) => {
    try {
      writeCommandFile("effectDuplicate", params);
      return { content: [{ type: "text", text: "Command to duplicate effect queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "effect-toggle",
  "Toggle effect enabled state",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    effectIndex: z.number().int().positive(),
    enabled: z.boolean().optional()
  },
  async (params) => {
    try {
      writeCommandFile("effectToggle", params);
      return { content: [{ type: "text", text: "Command to toggle effect queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "effect-set-property",
  "Set an effect property value on a layer",
  {
    compIndex: z.number().int().positive().optional().describe("1-based composition index (or use compName)"),
    compName: z.string().optional().describe("Composition name (alternative to compIndex)"),
    layerIndex: z.number().int().positive().optional().describe("1-based layer index (or use layerName)"),
    layerName: z.string().optional().describe("Layer name (alternative to layerIndex)"),
    effectIndex: z.number().int().positive().describe("1-based effect index on the layer"),
    propertyName: z.string().describe("Effect property name to set"),
    value: z.any().describe("Value to set")
  },
  async (params) => {
    try {
      if (!params.compIndex && !params.compName) {
        return { content: [{ type: "text", text: "Error: Must provide either compIndex or compName" }], isError: true };
      }
      if (!params.layerIndex && !params.layerName) {
        return { content: [{ type: "text", text: "Error: Must provide either layerIndex or layerName" }], isError: true };
      }
      writeCommandFile("effectSetProperty", params);
      return { content: [{ type: "text", text: "Command to set effect property queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "effect-keyframe",
  "Add keyframe to effect property",
  {
    compIndex: z.number().int().positive().optional().describe("1-based composition index (or use compName)"),
    compName: z.string().optional().describe("Composition name (alternative to compIndex)"),
    layerIndex: z.number().int().positive().optional().describe("1-based layer index (or use layerName)"),
    layerName: z.string().optional().describe("Layer name (alternative to layerIndex)"),
    effectIndex: z.number().int().positive(),
    propertyName: z.string(),
    time: z.number(),
    value: z.any()
  },
  async (params) => {
    try {
      if (!params.compIndex && !params.compName) {
        return { content: [{ type: "text", text: "Error: Must provide either compIndex or compName" }], isError: true };
      }
      if (!params.layerIndex && !params.layerName) {
        return { content: [{ type: "text", text: "Error: Must provide either layerIndex or layerName" }], isError: true };
      }
      writeCommandFile("effectKeyframe", params);
      return { content: [{ type: "text", text: "Command to add effect keyframe queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// ==================== MASK OPERATIONS ====================

server.tool(
  "mask-remove",
  "Remove a mask",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    maskIndex: z.number().int().positive()
  },
  async (params) => {
    try {
      writeCommandFile("maskRemove", params);
      return { content: [{ type: "text", text: "Command to remove mask queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "mask-set-properties",
  "Set mask properties",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    maskIndex: z.number().int().positive(),
    mode: z.enum(["none", "add", "subtract", "intersect", "lighten", "darken", "difference"]).optional(),
    feather: z.number().optional(),
    opacity: z.number().optional(),
    expansion: z.number().optional(),
    inverted: z.boolean().optional()
  },
  async (params) => {
    try {
      writeCommandFile("maskSetProperties", params);
      return { content: [{ type: "text", text: "Command to set mask properties queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "mask-keyframe",
  "Animate mask path",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    maskIndex: z.number().int().positive(),
    time: z.number(),
    vertices: z.array(z.array(z.number())),
    inTangents: z.array(z.array(z.number())).optional(),
    outTangents: z.array(z.array(z.number())).optional()
  },
  async (params) => {
    try {
      writeCommandFile("maskKeyframe", params);
      return { content: [{ type: "text", text: "Command to keyframe mask queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// ==================== TRANSFORM OPERATIONS ====================

server.tool(
  "transform-set-all",
  "Set all transform properties at once",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    position: z.array(z.number()).optional(),
    anchorPoint: z.array(z.number()).optional(),
    scale: z.array(z.number()).optional(),
    rotation: z.number().optional(),
    opacity: z.number().min(0).max(100).optional()
  },
  async (params) => {
    try {
      writeCommandFile("transformSetAll", params);
      return { content: [{ type: "text", text: "Command to set transform properties queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "transform-reset",
  "Reset transform properties to default",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    property: z.enum(["all", "position", "anchorPoint", "scale", "rotation", "opacity"]).optional()
  },
  async (params) => {
    try {
      writeCommandFile("transformReset", params);
      return { content: [{ type: "text", text: "Command to reset transform queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "transform-center-in-comp",
  "Center a layer in the composition",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    horizontal: z.boolean().optional(),
    vertical: z.boolean().optional()
  },
  async (params) => {
    try {
      writeCommandFile("transformCenterInComp", params);
      return { content: [{ type: "text", text: "Command to center layer queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "transform-fit-to-comp",
  "Scale layer to fit composition",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    fitType: z.enum(["fill", "fit", "stretch"]).optional()
  },
  async (params) => {
    try {
      writeCommandFile("transformFitToComp", params);
      return { content: [{ type: "text", text: "Command to fit layer to comp queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// ==================== EXPRESSION MANAGEMENT ====================

server.tool(
  "expression-set",
  "Set an expression on a property",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    propertyPath: z.string(),
    expression: z.string()
  },
  async (params) => {
    try {
      writeCommandFile("expressionSet", params);
      return { content: [{ type: "text", text: "Command to set expression queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "expression-remove",
  "Remove an expression from a property",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    propertyPath: z.string()
  },
  async (params) => {
    try {
      writeCommandFile("expressionRemove", params);
      return { content: [{ type: "text", text: "Command to remove expression queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "expression-toggle",
  "Enable or disable an expression",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    propertyPath: z.string(),
    enabled: z.boolean().optional()
  },
  async (params) => {
    try {
      writeCommandFile("expressionToggle", params);
      return { content: [{ type: "text", text: "Command to toggle expression queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "expression-get",
  "Get an expression from a property",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    propertyPath: z.string()
  },
  async (params) => {
    try {
      writeCommandFile("expressionGet", params);
      return { content: [{ type: "text", text: "Command to get expression queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "add-expression-control",
  "Add expression control effect",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    controlType: z.enum(["slider", "checkbox", "color", "point", "angle", "dropdown", "layer"]),
    name: z.string().optional(),
    defaultValue: z.any().optional()
  },
  async (params) => {
    try {
      writeCommandFile("addExpressionControl", params);
      return { content: [{ type: "text", text: `Command to add ${params.controlType} control queued.` }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// ==================== ANIMATION HELPERS ====================

server.tool(
  "sequence-layers",
  "Sequence selected layers",
  {
    compIndex: z.number().int().positive(),
    layerIndices: z.array(z.number().int().positive()),
    overlap: z.number().optional().describe("Overlap in seconds (negative for gap)"),
    reverse: z.boolean().optional()
  },
  async (params) => {
    try {
      writeCommandFile("sequenceLayers", params);
      return { content: [{ type: "text", text: "Command to sequence layers queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "stagger-animation",
  "Apply staggered animation to multiple layers",
  {
    compIndex: z.number().int().positive(),
    layerIndices: z.array(z.number().int().positive()),
    property: z.string(),
    delay: z.number().describe("Delay between each layer in seconds"),
    startValue: z.any(),
    endValue: z.any(),
    duration: z.number()
  },
  async (params) => {
    try {
      writeCommandFile("staggerAnimation", params);
      return { content: [{ type: "text", text: "Command to create staggered animation queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "create-animation-preset",
  "Create a common animation preset",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    preset: z.enum([
      "fade-in", "fade-out", "fade-in-out",
      "slide-in-left", "slide-in-right", "slide-in-top", "slide-in-bottom",
      "slide-out-left", "slide-out-right", "slide-out-top", "slide-out-bottom",
      "scale-in", "scale-out", "scale-bounce",
      "rotate-in", "rotate-out",
      "blur-in", "blur-out",
      "typewriter", "glitch",
      "bounce-in", "elastic-in"
    ]),
    duration: z.number().optional(),
    startTime: z.number().optional()
  },
  async (params) => {
    try {
      writeCommandFile("createAnimationPreset", params);
      return { content: [{ type: "text", text: `Command to create ${params.preset} animation queued.` }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// ==================== 3D LAYER OPERATIONS ====================

server.tool(
  "set-3d-position",
  "Set 3D position for a layer",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    x: z.number().optional(),
    y: z.number().optional(),
    z: z.number().optional()
  },
  async (params) => {
    try {
      writeCommandFile("set3DPosition", params);
      return { content: [{ type: "text", text: "Command to set 3D position queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "set-3d-rotation",
  "Set 3D rotation for a layer",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    xRotation: z.number().optional(),
    yRotation: z.number().optional(),
    zRotation: z.number().optional(),
    orientation: z.array(z.number()).length(3).optional()
  },
  async (params) => {
    try {
      writeCommandFile("set3DRotation", params);
      return { content: [{ type: "text", text: "Command to set 3D rotation queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "set-material-options",
  "Set 3D material options for a layer",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    castsShadows: z.boolean().optional(),
    acceptsShadows: z.boolean().optional(),
    acceptsLights: z.boolean().optional(),
    ambient: z.number().min(0).max(100).optional(),
    diffuse: z.number().min(0).max(100).optional(),
    specularIntensity: z.number().min(0).max(100).optional(),
    specularShininess: z.number().min(0).max(100).optional(),
    metal: z.number().min(0).max(100).optional()
  },
  async (params) => {
    try {
      writeCommandFile("setMaterialOptions", params);
      return { content: [{ type: "text", text: "Command to set material options queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// ==================== TEXT LAYER OPERATIONS ====================

server.tool(
  "set-text-content",
  "Set text content of a text layer",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    text: z.string()
  },
  async (params) => {
    try {
      writeCommandFile("setTextContent", params);
      return { content: [{ type: "text", text: "Command to set text content queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "set-text-style",
  "Set text style properties",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    font: z.string().optional(),
    fontSize: z.number().optional(),
    fillColor: z.object({ r: z.number(), g: z.number(), b: z.number() }).optional(),
    strokeColor: z.object({ r: z.number(), g: z.number(), b: z.number() }).optional(),
    strokeWidth: z.number().optional(),
    tracking: z.number().optional(),
    leading: z.number().optional(),
    baselineShift: z.number().optional(),
    justification: z.enum(["left", "center", "right", "full"]).optional(),
    faux: z.object({
      bold: z.boolean().optional(),
      italic: z.boolean().optional()
    }).optional()
  },
  async (params) => {
    try {
      writeCommandFile("setTextStyle", params);
      return { content: [{ type: "text", text: "Command to set text style queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// ==================== ADJUSTMENT LAYER ====================

server.tool(
  "create-adjustment-layer",
  "Create an adjustment layer",
  {
    compIndex: z.number().int().positive().optional(),
    name: z.string().optional(),
    duration: z.number().optional()
  },
  async (params) => {
    try {
      writeCommandFile("createAdjustmentLayer", params);
      return { content: [{ type: "text", text: "Command to create adjustment layer queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// ==================== GUIDE LAYER ====================

server.tool(
  "set-guide-layer",
  "Set layer as guide layer",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    isGuide: z.boolean().optional()
  },
  async (params) => {
    try {
      writeCommandFile("setGuideLayer", params);
      return { content: [{ type: "text", text: "Command to set guide layer queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// ==================== PREVIEW CONTROLS ====================

server.tool(
  "set-current-time",
  "Set the current time indicator",
  {
    compIndex: z.number().int().positive().optional(),
    time: z.number()
  },
  async (params) => {
    try {
      writeCommandFile("setCurrentTime", params);
      return { content: [{ type: "text", text: "Command to set current time queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "preview-play",
  "Start or stop preview playback",
  {
    play: z.boolean().optional()
  },
  async (params) => {
    try {
      writeCommandFile("previewPlay", params);
      return { content: [{ type: "text", text: "Command to control preview queued." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// ==================== SCENE SUMMARY, RENDER PROGRESS, SETUP (Blender-style) ====================

server.tool(
  "get-render-progress",
  "Get render queue status: items in queue, current render progress, status per item (queued, rendering, done, error).",
  {},
  async () => {
    try {
      clearResultsFile();
      writeCommandFile("getRenderProgress", {});
      const result = await waitForBridgeResult("getRenderProgress", 12000, 300);
      return { content: [{ type: "text", text: result }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "get-scene-summary",
  "Get a single summary of the current project state: active composition, current time, layer count, selected layers, render queue length. Like Blender get_scene_info.",
  {},
  async () => {
    try {
      clearResultsFile();
      writeCommandFile("getSceneSummary", {});
      const result = await waitForBridgeResult("getSceneSummary", 6000, 250);
      return { content: [{ type: "text", text: result }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "list-available-fonts",
  "List all fonts available in After Effects (family, style). Returns JSON list.",
  {},
  async () => {
    try {
      clearResultsFile();
      writeCommandFile("getAvailableFonts", {});
      const result = await waitForBridgeResult("getAvailableFonts", 6000, 250);
      return { content: [{ type: "text", text: result }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "setup-project",
  "One-shot project setup: create a composition with given name, resolution, duration, frame rate, optional background. Like Blender setup_project.",
  {
    name: z.string().optional().describe("Composition name (default: Main)"),
    width: z.number().int().positive().optional().describe("Width (default: 1920)"),
    height: z.number().int().positive().optional().describe("Height (default: 1080)"),
    duration: z.number().positive().optional().describe("Duration in seconds (default: 30)"),
    frameRate: z.number().positive().optional().describe("Frame rate (default: 30)"),
    backgroundColor: z.object({
      r: z.number().int().min(0).max(255),
      g: z.number().int().min(0).max(255),
      b: z.number().int().min(0).max(255)
    }).optional(),
    setAsActive: z.boolean().optional().describe("Open the new comp in the viewer (default: true)")
  },
  async (params) => {
    try {
      const args: Record<string, unknown> = { setAsActive: params.setAsActive !== false };
      if (params.name) args.name = params.name;
      if (params.width) args.width = params.width;
      if (params.height) args.height = params.height;
      if (params.duration) args.duration = params.duration;
      if (params.frameRate) args.frameRate = params.frameRate;
      if (params.backgroundColor) args.backgroundColor = params.backgroundColor;
      clearResultsFile();
      writeCommandFile("setupProject", args);
      const result = await waitForBridgeResult("setupProject", 6000, 250);
      return { content: [{ type: "text", text: result }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "get-layer-tree",
  "Get full layer tree for a composition: index, name, type, in/out, parent. Use compIndex or compName; omit for active comp.",
  {
    compIndex: z.number().int().positive().optional(),
    compName: z.string().optional()
  },
  async (params) => {
    try {
      clearResultsFile();
      writeCommandFile("getLayerTree", params);
      const result = await waitForBridgeResult("getLayerTree", 6000, 250);
      return { content: [{ type: "text", text: result }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "get-keyframe-interpolation",
  "Get keyframe interpolation type (linear, bezier, hold) for a property keyframe.",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    propertyName: z.string().optional().describe("Transform property (default: Position)"),
    keyframeIndex: z.number().int().positive().optional().describe("Keyframe index 1-based (default: 1)")
  },
  async (params) => {
    try {
      clearResultsFile();
      writeCommandFile("getKeyframeInterpolation", params);
      const result = await waitForBridgeResult("getKeyframeInterpolation", 6000, 250);
      return { content: [{ type: "text", text: result }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

server.tool(
  "set-keyframe-interpolation",
  "Set keyframe interpolation to linear, bezier, or hold.",
  {
    compIndex: z.number().int().positive(),
    layerIndex: z.number().int().positive(),
    propertyName: z.string().optional().describe("Transform property (default: Position)"),
    keyframeIndex: z.number().int().positive().optional().describe("Keyframe index 1-based (default: 1)"),
    interpolation: z.enum(["linear", "bezier", "hold"])
  },
  async (params) => {
    try {
      writeCommandFile("setKeyframeInterpolation", params);
      return { content: [{ type: "text", text: `Command to set interpolation to ${params.interpolation} queued.` }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${String(error)}` }], isError: true };
    }
  }
);

// ==================== ADDITIONAL MCP RESOURCES ====================

server.resource(
  "project-state",
  "aftereffects://project/state",
  async (uri) => {
    clearResultsFile();
    writeCommandFile("getProjectState", {});
    const result = await waitForBridgeResult("getProjectState", 6000, 250);
    return { contents: [{ uri: uri.href, mimeType: "application/json", text: result }] };
  }
);

server.resource(
  "active-composition",
  "aftereffects://composition/active",
  async (uri) => {
    clearResultsFile();
    writeCommandFile("getActiveComposition", {});
    const result = await waitForBridgeResult("getActiveComposition", 6000, 250);
    return { contents: [{ uri: uri.href, mimeType: "application/json", text: result }] };
  }
);

server.resource(
  "available-effects",
  "aftereffects://effects/list",
  async (uri) => {
    clearResultsFile();
    writeCommandFile("getAvailableEffects", {});
    const result = await waitForBridgeResult("getAvailableEffects", 6000, 250);
    return { contents: [{ uri: uri.href, mimeType: "application/json", text: result }] };
  }
);

server.resource(
  "available-fonts",
  "aftereffects://fonts/list",
  async (uri) => {
    clearResultsFile();
    writeCommandFile("getAvailableFonts", {});
    const result = await waitForBridgeResult("getAvailableFonts", 6000, 250);
    return { contents: [{ uri: uri.href, mimeType: "application/json", text: result }] };
  }
);

// ==================== ADDITIONAL MCP PROMPTS ====================

server.prompt(
  "create-lower-third",
  {
    text: z.string().describe("Main text"),
    subtitle: z.string().optional().describe("Subtitle text"),
    style: z.enum(["minimal", "broadcast", "modern", "elegant"]).optional()
  },
  (args) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Create a lower third animation with text "${args.text}"${args.subtitle ? ` and subtitle "${args.subtitle}"` : ""} in ${args.style || "modern"} style.`
      }
    }]
  })
);

server.prompt(
  "create-title-sequence",
  {
    title: z.string().describe("Main title"),
    subtitle: z.string().optional(),
    duration: z.string().optional().describe("Duration in seconds")
  },
  (args) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Create a title sequence with "${args.title}"${args.subtitle ? ` and subtitle "${args.subtitle}"` : ""}${args.duration ? ` with ${args.duration} second duration` : ""}.`
      }
    }]
  })
);

server.prompt(
  "animate-logo",
  {
    animationType: z.enum(["reveal", "bounce", "elegant", "dynamic", "glitch"])
  },
  (args) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Animate the logo with a ${args.animationType} style animation.`
      }
    }]
  })
);

server.prompt(
  "create-social-video",
  {
    platform: z.enum(["instagram", "tiktok", "youtube", "twitter"]),
    content: z.string()
  },
  (args) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Create a video for ${args.platform} with content: ${args.content}`
      }
    }]
  })
);

server.prompt(
  "create-transition",
  {
    transitionType: z.enum(["fade", "wipe", "zoom", "slide", "glitch", "dissolve"])
  },
  (args) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Create a ${args.transitionType} transition between compositions.`
      }
    }]
  })
);

// Start the MCP server
async function main() {
  console.error("After Effects MCP Server starting...");
  console.error(`Scripts directory: ${SCRIPTS_DIR}`);
  console.error(`Temp directory: ${TEMP_DIR}`);
  console.error(`Skills directory: ${getSkillsDir()}`);

  registerSkillsResources();

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("After Effects MCP Server running...");
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});

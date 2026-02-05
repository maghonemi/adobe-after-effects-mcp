// install-bridge.js
// Install the After Effects MCP Bridge to the ScriptUI Panels folder
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { platform } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceScript = path.join(__dirname, 'build', 'scripts', 'mcp-bridge-auto.jsx');

if (!fs.existsSync(sourceScript)) {
  console.error(`Error: Source script not found at ${sourceScript}`);
  console.error('Please run "npm run build" first.');
  process.exit(1);
}

// macOS: Scripts folder is next to the .app (e.g. Adobe After Effects 2026/Scripts/ScriptUI Panels)
const macPaths = [
  '/Applications/Adobe After Effects 2026/Scripts/ScriptUI Panels',
  '/Applications/Adobe After Effects 2025/Scripts/ScriptUI Panels',
  '/Applications/Adobe After Effects 2024/Scripts/ScriptUI Panels',
  '/Applications/Adobe After Effects 2023/Scripts/ScriptUI Panels',
];

// Windows: Support Files inside the versioned folder
const winPaths = [
  'C:\\Program Files\\Adobe\\Adobe After Effects 2025\\Support Files\\Scripts\\ScriptUI Panels',
  'C:\\Program Files\\Adobe\\Adobe After Effects 2024\\Support Files\\Scripts\\ScriptUI Panels',
  'C:\\Program Files\\Adobe\\Adobe After Effects 2023\\Support Files\\Scripts\\ScriptUI Panels',
  'C:\\Program Files\\Adobe\\Adobe After Effects 2022\\Support Files\\Scripts\\ScriptUI Panels',
];

const possiblePaths = platform() === 'darwin' ? macPaths : winPaths;

let destinationFolder = null;
for (const testPath of possiblePaths) {
  if (fs.existsSync(testPath)) {
    destinationFolder = testPath;
    break;
  }
}

if (!destinationFolder) {
  console.error('Could not find After Effects ScriptUI Panels folder.');
  if (platform() === 'darwin') {
    console.error('\nOn macOS, run this in Terminal (you will be asked for your password):');
    console.error('  ./install-bridge-mac.sh');
    console.error('\nOr copy manually:');
    console.error(`  cp "${sourceScript}" "/Applications/Adobe After Effects 2026/Scripts/ScriptUI Panels/"`);
  } else {
    console.error('Target: C:\\Program Files\\Adobe\\Adobe After Effects [VERSION]\\Support Files\\Scripts\\ScriptUI Panels\\');
  }
  process.exit(1);
}

const destinationScript = path.join(destinationFolder, 'mcp-bridge-auto.jsx');

function tryCopy() {
  try {
    fs.copyFileSync(sourceScript, destinationScript);
    return true;
  } catch (err) {
    return false;
  }
}

if (tryCopy()) {
  console.log('Bridge script installed successfully at:');
  console.log('  ' + destinationScript);
  console.log('\nNext: Restart After Effects, then Window > mcp-bridge-auto.jsx');
} else {
  if (platform() === 'darwin') {
    console.error('Permission denied. Run in Terminal:');
    console.error('  ./install-bridge-mac.sh');
    console.error('\nYou will be prompted for your Mac password.');
  } else {
    console.error('Copy failed (try running as Administrator). Manual copy:');
    console.error('  From: ' + sourceScript);
    console.error('  To:   ' + destinationScript);
  }
  process.exit(1);
}

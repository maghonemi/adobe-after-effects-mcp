# Mobile App Promo Template - Skill Guide

This skill provides complete documentation for the "Mobile App Promo" After Effects template - a professional motion graphics template for creating mobile application promotional videos with animated photo galleries and text overlays.

---

## Template Overview

| Property | Value |
|----------|-------|
| **Resolution** | 1920x1080 (Full HD) |
| **Frame Rate** | 25 fps |
| **Duration** | 41 seconds |
| **Theme** | Pastel purple gradient |
| **Total Compositions** | 44 |
| **Total Folders** | 6 |
| **Design Style** | Modern, minimal, pastel gradients, rounded corners, 3D perspective |

---

## Project Structure

```
Template Structure:
├── 1-Editing (Folder)
│   ├── 1-Text Editing (Folder)
│   │   ├── Text Editing....01 - Title text
│   │   ├── Text Editing....02 - Description text
│   │   ├── Text Editing....03 - Description text
│   │   ├── Text Editing....04 - Section title
│   │   ├── Text Editing....05 - Feature title
│   │   ├── Text Editing....06 - Description text
│   │   ├── Text Editing....07 - Feature title
│   │   ├── Text Editing....08 - Description text
│   │   ├── Text Editing....09 - Description text
│   │   ├── Text Editing....10 - Website URL
│   │   ├── Text Editing....11 - Description text
│   │   ├── Text Editing....12 - Title text
│   │   └── Text Editing....13 - Website watermark
│   │
│   ├── 2-Photo Editing (Folder)
│   │   ├── Photo Editing....01 through Photo Editing....10
│   │   └── (Image placeholder compositions)
│   │
│   └── 3-Color Editing (Folder)
│       └── Color Editing - Global color controls
│
├── 2-Final Render (Folder)
│   └── Final Render - Main output composition
│
└── 3-Other (Folder)
    ├── Background - Gradient background
    ├── Main Comp - Scene assembly composition
    ├── Mobile Comp 1-7 - Individual mobile mockups
    ├── Mobile Scene 1-7 - Scene containers
    ├── Mobile Shape Mask - Phone frame shape
    └── Photo Anime Comp 1-8 - Animated photo layers
```

---

## Color Editing System

### Color Edit Layer (Adjustment Layer)

The template uses a centralized color control system via the **Color Editing** composition. This contains an adjustment layer named "Color Edit" with **7 Color Control effects** that control all colors throughout the template.

#### Color Control Effects

| Effect Name | Effect Index | Purpose | Controls |
|-------------|--------------|---------|----------|
| Text Color Edit | 1 | Main text color | All text layers via Fill effect |
| Solid Color Edit 1 | 2 | Primary accent color | Divider lines, accents |
| Solid Color Edit 2 | 3 | Secondary color | Background elements |
| Solid Color Edit 3 | 4 | Tertiary color | Card backgrounds |
| Solid Color Edit 4 | 5 | Quaternary color | Additional elements |
| Solid Color Edit 5 | 6 | Quinary color | Highlights |
| Solid Color Edit 6 | 7 | Senary color | Shadows/borders |

#### How to Change Colors

```yaml
# Method 1: Change text color
Tool: effect-set-property
Parameters:
  compName: "Color Editing"
  layerIndex: 1
  effectIndex: 1  # Text Color Edit
  propertyName: "Color"
  value: [255, 100, 50]  # RGB values 0-255

# Method 2: Change accent color
Tool: effect-set-property
Parameters:
  compName: "Color Editing"
  layerIndex: 1
  effectIndex: 2  # Solid Color Edit 1
  propertyName: "Color"
  value: [150, 100, 200]  # Purple accent
```

#### Color Linking System

The Color Edit adjustment layer sits on top of the Final Render composition, applying color changes globally. Individual text layers have a **Fill effect** that references the Color Control expressions.

---

## Animation System

### 3D Layer Architecture

The template uses a sophisticated 3D animation system:

#### Photo Anime Comp Structure

Each Photo Anime Comp contains:
- **Mobile Shape Mask** (disabled) - Phone frame shape for masking
- **Photo Editing....XX** - The actual photo placeholder

Photo Anime Comps are **3D layers** with these properties:
- Position: 3D coordinates [x, y, z]
- Scale: Uniform 3D scale (~12-13%)
- Rotation: 3D rotation capabilities
- Parent hierarchy for grouped movement

#### Layer 3D Properties (Example)

```
Photo Anime Comp 4:
├── is3D: true
├── Position: [39, -245, 0]
├── Scale: [12.44%, 12.44%, 12.44%]
├── Anchor Point: [540, 960, 0]
└── Parent: Null 1
```

### Parenting Hierarchy

The template uses extensive parenting for coordinated animations:

```
Main Comp Hierarchy:
Null 1 (Controller)
├── Photo Anime Comp 1
├── Photo Anime Comp 2-3
└── Photo Anime Comp 4

Mobile Comp 1 Hierarchy:
Null 1 (Controller)
├── Photo Anime Comp 6
│   ├── Photo Anime Comp 1
│   └── Photo Anime Comp 1
├── Photo Anime Comp 4
│   ├── Photo Anime Comp 7
│   └── Photo Anime Comp 7
└── Photo Anime Comp 8
    ├── Photo Anime Comp 5
    └── Photo Anime Comp 5
```

### Camera System

Each Mobile Comp includes a **Camera 1** layer for 3D perspective:
- Creates depth and parallax effects
- Enables dynamic viewing angles
- Works with 3D Photo Anime Comp layers

### Animation Techniques Used

| Technique | Location | Purpose |
|-----------|----------|---------|
| 3D Layer Transforms | Photo Anime Comps | Depth and perspective |
| Parenting | All comps | Coordinated group movement |
| Camera Movement | Mobile Comps | Dynamic perspective shifts |
| Layer Sequencing | Main Comp | Scene transitions |
| Fill Effect | Text layers | Color control linkage |
| Stroke Effect | Mobile Scenes | Outline/border effects |

---

## Scene Library

The template includes 7 mobile scenes that display sequentially:

### Scene Timeline

| Scene | Start Time | End Time | Duration | Content |
|-------|------------|----------|----------|---------|
| Intro | 0s | 4.2s | 4.2s | Photo gallery intro with 3D animation |
| Scene 1 | 4.2s | 8.56s | 4.36s | Mobile mockup with photo gallery |
| Scene 2 | 8.48s | 12.84s | 4.36s | Two-phone layout with text overlay |
| Scene 3 | 12.84s | 17.08s | 4.24s | Single mobile mockup |
| Scene 4 | 17.08s | 21.4s | 4.32s | Mobile with feature text |
| Scene 5 | 21.4s | 27.92s | 6.52s | Mobile with description |
| Scene 6 | 27.92s | 35.48s | 7.56s | Website/CTA display |
| Scene 7 | 33.16s | 41s | 8s | Closing with branding |

### Scene Transitions

Scenes use **overlapping timing** for smooth transitions:
- Scene 6 ends at 35.48s, Scene 7 starts at 33.16s (2.32s overlap)
- Scene 5 ends at 27.92s, Scene 6 starts at 27.92s (seamless)
- Opacity-based crossfades between scenes

---

## Text Composition Reference

### Editable Text Compositions

| Comp Name | Purpose | Default Content | Fill Effect |
|-----------|---------|-----------------|-------------|
| Text Editing....01 | Main title | "Mobile App Promo" | Yes |
| Text Editing....02 | Description | Lorem ipsum text | Yes |
| Text Editing....03 | Description | Lorem ipsum text | Yes |
| Text Editing....04 | Section title | "app-promo" | Yes |
| Text Editing....05 | Feature title | "Pastel Color Concept" | Yes |
| Text Editing....06 | Description | Lorem ipsum text | Yes |
| Text Editing....07 | Feature title | "User Friendly Template" | Yes |
| Text Editing....08 | Description | Lorem ipsum text | Yes |
| Text Editing....09 | Description | Lorem ipsum text | Yes |
| Text Editing....10 | Website URL | "www.envatomarket.com" | Yes |
| Text Editing....11 | Description | Lorem ipsum text | Yes |
| Text Editing....12 | Title | "Mobile App Promo" | Yes |
| Text Editing....13 | Watermark | "www.yourwebsite.com" | Yes |

### Text Layer Properties

Each text composition has:
- Single text layer (index 1)
- **Fill effect** linked to Color Edit controls
- Specific positioning for each scene
- Scale adjusted per composition (e.g., 64.28% for Text Editing....02)

---

## Photo Placeholder Reference

### Photo Editing Compositions

| Comp Name | Scene Used In | Purpose | Dimensions |
|-----------|---------------|---------|------------|
| Photo Editing....01 | Intro, Scene 1, 2 | Primary photo | 1080x1920 |
| Photo Editing....02 | Scene 1, 2 | Secondary photo | 1080x1920 |
| Photo Editing....03 | Scene 1, 2 | Gallery photo | 1080x1920 |
| Photo Editing....04 | Scene 1 | Gallery photo | 1080x1920 |
| Photo Editing....05 | Scene 1 | Gallery photo | 1080x1920 |
| Photo Editing....06 | Scene 4 | Featured photo | 1080x1920 |
| Photo Editing....07 | Scene 5 | Featured photo | 1080x1920 |
| Photo Editing....08 | Scene 1 | Gallery photo | 1080x1920 |
| Photo Editing....09 | Scene 6 | CTA photo | 1080x1920 |
| Photo Editing....10 | Scene 7 | Closing photo | 1080x1920 |

### Photo Animation Structure

Photos are displayed through **Photo Anime Comps** which contain:
1. **Mobile Shape Mask** - Rounded rectangle shape (disabled by default)
2. **Photo Editing....XX** - The photo placeholder layer

---

## Visual Design System

### Color Palette

| Element | Default Color | Controlled By |
|---------|---------------|---------------|
| Background | Pastel lavender-purple gradient | Background comp |
| Primary Text | Dark gray (#1a1a1a) | Text Color Edit |
| Accent Lines | Purple | Solid Color Edit 1 |
| Card/Panel BG | Light/White | Solid Color Edit 2-3 |
| Borders | Subtle purple | Stroke effects |
| Watermark | Dark text on pill shape | Text Color Edit |

### Design Elements

| Element | Implementation | Location |
|---------|----------------|----------|
| Rounded corners | Shape layers with rounded rect | Main container, cards |
| Gradient background | Solid with gradient effect | Background comp |
| Divider lines | Shape layers | Scene separators |
| Website pill | Rounded rectangle + text | Top-right (Text Editing....13) |
| Mobile frames | 3D comps with stroke | Mobile Comps |
| Photo masks | Mobile Shape Mask comp | Photo Anime Comps |

### Mobile Mockup Design

The mobile phone mockups feature:
- **Stroke effect** for device outline
- **3D positioning** for depth
- **Nested photo layers** with masking
- **Camera perspective** for dynamic angles

---

## Composition Hierarchy

### Final Render → Color Editing → Main Comp

```
Final Render (1 layer):
└── Total Comp (contains Color Editing result)

Color Editing (2 layers):
├── Layer 1: Color Edit (Adjustment layer with 7 Color Controls)
└── Layer 2: Final Render (nested)

Main Comp (15 layers):
├── Layer 1: Mobile Scene 7 (33.16s - 41s)
├── Layer 2: Mobile Scene 6 (27.92s - 35.48s)
├── Layer 3: Mobile Scene 5 (21.4s - 27.92s)
├── Layer 4: Mobile Scene 4 (17.08s - 21.4s)
├── Layer 5: Mobile Scene 3 (12.84s - 17.08s)
├── Layer 6: Mobile Scene 2 (8.48s - 12.84s)
├── Layer 7: Mobile Scene 1 (4.2s - 8.56s)
├── Layer 8: Text Editing....02 (0s - 4.2s) - Has Fill effect
├── Layer 9: Text Editing....01 (0s - 4.2s) - Has Fill effect
├── Layer 10: Null 1 (disabled - animation controller)
├── Layer 11: Camera 1
├── Layer 12: Photo Anime Comp 4 (3D, parent: Null 1)
├── Layer 13: Photo Anime Comp 2-3 (3D, parent: Null 1)
├── Layer 14: Photo Anime Comp 1 (3D, parent: Null 1)
└── Layer 15: Background
```

### Mobile Comp Layer Structure (Example: Mobile Comp 1)

```
Mobile Comp 1 (12 layers):
├── Layer 1: Camera 1
├── Layer 2: Null 1 (disabled - animation controller)
├── Layer 3: Photo Anime Comp 5 (3D, parent: Photo Anime Comp 8)
├── Layer 4: Photo Anime Comp 5 (3D, parent: Photo Anime Comp 8)
├── Layer 5: Photo Anime Comp 8 (3D)
├── Layer 6: Photo Anime Comp 7 (3D, parent: Photo Anime Comp 4)
├── Layer 7: Photo Anime Comp 7 (3D, parent: Photo Anime Comp 4)
├── Layer 8: Photo Anime Comp 4 (3D, parent: Null 1)
├── Layer 9: Photo Anime Comp 1 (3D, parent: Photo Anime Comp 6)
├── Layer 10: Photo Anime Comp 1 (3D, parent: Photo Anime Comp 6)
├── Layer 11: Photo Anime Comp 6 (3D, parent: Null 1)
└── Layer 12: Background
```

---

## Workflow: Complete Customization Guide

### Step 1: Update All Text Content

```yaml
# Update main title (appears in intro)
Tool: set-text-content
Parameters:
  compName: "Text Editing....01"
  layerIndex: 1
  text: "Your App Name"

# Update intro description
Tool: set-text-content
Parameters:
  compName: "Text Editing....02"
  layerIndex: 1
  text: "Your tagline or description"

# Update section title
Tool: set-text-content
Parameters:
  compName: "Text Editing....04"
  layerIndex: 1
  text: "your-app"

# Update feature titles
Tool: set-text-content
Parameters:
  compName: "Text Editing....05"
  layerIndex: 1
  text: "Feature One"

Tool: set-text-content
Parameters:
  compName: "Text Editing....07"
  layerIndex: 1
  text: "Feature Two"

# Update website URL (Scene 6)
Tool: set-text-content
Parameters:
  compName: "Text Editing....10"
  layerIndex: 1
  text: "www.yourapp.com"

# Update watermark (always visible)
Tool: set-text-content
Parameters:
  compName: "Text Editing....13"
  layerIndex: 1
  text: "www.yourapp.com"
```

### Step 2: Replace All Photos

```yaml
# Import your app screenshots
Tool: import-file
Parameters:
  filePath: "/path/to/screenshot1.jpg"
  importAs: "footage"

# Replace each photo placeholder
# Repeat for Photo Editing....01 through Photo Editing....10
Tool: replace-footage
Parameters:
  footageIndex: [get index from project]
  newFilePath: "/path/to/screenshot1.jpg"
```

### Step 3: Customize Colors

```yaml
# Change text color to dark blue
Tool: effect-set-property
Parameters:
  compName: "Color Editing"
  layerIndex: 1
  effectIndex: 1
  propertyName: "Color"
  value: [30, 50, 100]

# Change accent color to teal
Tool: effect-set-property
Parameters:
  compName: "Color Editing"
  layerIndex: 1
  effectIndex: 2
  propertyName: "Color"
  value: [0, 180, 180]

# Change secondary elements
Tool: effect-set-property
Parameters:
  compName: "Color Editing"
  layerIndex: 1
  effectIndex: 3
  propertyName: "Color"
  value: [240, 240, 250]
```

### Step 4: Adjust Background Gradient

```yaml
# Navigate to Background composition
Tool: comp-set-active
Parameters:
  compName: "Background"

# The background uses a solid with gradient
# Modify the solid color or add gradient effects
Tool: effect-set-property
Parameters:
  compName: "Background"
  layerIndex: 1
  effectIndex: 1
  propertyName: "Color"
  value: [200, 220, 255]
```

### Step 5: Preview and Render

```yaml
# Preview at different times
Tool: get-viewport-screenshot
Parameters:
  compName: "Final Render"
  time: 0

Tool: get-viewport-screenshot
Parameters:
  compName: "Final Render"
  time: 10

Tool: get-viewport-screenshot
Parameters:
  compName: "Final Render"
  time: 25

# Check available output templates
Tool: list-output-templates

# Add to render queue
Tool: add-to-render-queue
Parameters:
  compName: "Final Render"
  outputModule: "H.264 - Match Render Settings - 15 Mbps"
  outputPath: "/path/to/my-app-promo.mp4"

# Start render
Tool: start-render
```

---

## Advanced Animation Customization

### Modifying 3D Photo Positions

```yaml
# Get current position of a Photo Anime Comp
Tool: get-layer-details
Parameters:
  compIndex: 33  # Main Comp
  layerIndex: 14  # Photo Anime Comp 1
  includeKeyframes: true

# Modify 3D position
Tool: transform-set-all
Parameters:
  compIndex: 33
  layerIndex: 14
  position: [100, 100, 0]  # x, y, z
  scale: [15, 15, 15]  # Percentage
```

### Adjusting Camera Movement

```yaml
# Get camera details
Tool: get-layer-details
Parameters:
  compIndex: 34  # Mobile Comp 1
  layerIndex: 1  # Camera 1
  includeKeyframes: true

# Set camera keyframes for custom movement
Tool: set-keyframes
Parameters:
  compIndex: 34
  layerIndex: 1
  propertyPath: "Position"
  keyframes:
    - time: 0
      value: [960, 540, -2000]
    - time: 4
      value: [960, 540, -1500]
```

### Scene Timing Adjustments

```yaml
# Extend Scene 5 duration
Tool: layer-set-timing
Parameters:
  compName: "Main Comp"
  layerIndex: 3  # Mobile Scene 5
  inPoint: 21.4
  outPoint: 30  # Extended from 27.92
```

---

## Quick Command Reference

```yaml
# === PROJECT STATE ===
get-scene-summary
run-script: listCompositions
get-layer-tree:
  compName: "Main Comp"

# === TEXT EDITING ===
set-text-content:
  compName: "Text Editing....XX"
  layerIndex: 1
  text: "New text"

# === COLOR EDITING ===
effect-set-property:
  compName: "Color Editing"
  layerIndex: 1
  effectIndex: 1-7  # Pick color control
  propertyName: "Color"
  value: [R, G, B]

# === PHOTO REPLACEMENT ===
import-file:
  filePath: "/path/to/photo.jpg"
  importAs: "footage"

replace-footage:
  footageIndex: X
  newFilePath: "/path/to/photo.jpg"

# === PREVIEW ===
get-viewport-screenshot:
  compName: "Final Render"
  time: 15

# === RENDERING ===
list-output-templates
add-to-render-queue:
  compName: "Final Render"
  outputModule: "H.264 - Match Render Settings - 15 Mbps"
  outputPath: "/path/output.mp4"
start-render

# === SAVE ===
save-project:
  savePath: "/path/to/project.aep"
```

---

## Effects Reference

### Effects Used in Template

| Layer/Comp | Effect | Purpose |
|------------|--------|---------|
| Color Edit | Color Control (x7) | Global color management |
| Text layers | Fill | Color linking to controls |
| Mobile Scenes | Stroke | Device outline/border |
| Background | Solid color | Base gradient color |

### Color Control Expression Linking

Text layers use expressions in their Fill effect to reference the Color Edit controls:
```javascript
// Example expression (conceptual)
comp("Color Editing").layer("Color Edit").effect("Text Color Edit")("Color")
```

---

## Output Recommendations

| Use Case | Resolution | Output Module | Estimated Size |
|----------|------------|---------------|----------------|
| Social Media | 1920x1080 | H.264 - 5 Mbps | ~25 MB |
| Web/YouTube | 1920x1080 | H.264 - 15 Mbps | ~75 MB |
| High Quality | 1920x1080 | H.264 - 40 Mbps | ~200 MB |
| Master | 1920x1080 | ProRes 4444 | ~2 GB |

---

## Troubleshooting

### Text Not Updating
- Edit the correct "Text Editing...." composition
- Layer index is always 1 in text compositions
- Use `get-layer-tree` to verify the composition name

### Colors Not Changing
- Edit effects in "Color Editing" composition, layer 1
- Use correct effect index (1-7)
- Property name must be "Color"
- Values are RGB 0-255

### Photos Not Showing
- Ensure footage is imported correctly
- Check that Photo Editing comp has the footage layer enabled
- Verify parent Photo Anime Comp is visible and enabled

### 3D Layers Look Wrong
- Check camera position in Mobile Comps
- Verify 3D layer switch is enabled
- Check parent-child relationships

### Scene Timing Issues
- Check `layer-set-timing` parameters
- Verify inPoint and outPoint don't create zero duration
- Use `get-layer-tree` on Main Comp to see current timing

### Render Issues
- Use `list-output-templates` to see available formats
- Ensure output path exists and is writable
- Check `get-render-progress` for status

---

## Template Metadata

- **Template Name**: Mobile App Promo
- **Resolution**: 1920x1080 (Full HD)
- **Frame Rate**: 25 fps
- **Duration**: 41 seconds
- **Scenes**: 7 mobile scenes + intro
- **Text Placeholders**: 13
- **Photo Placeholders**: 10
- **Color Controls**: 7 (via Color Editing comp)
- **3D Layers**: Yes (Photo Anime Comps + Cameras)
- **Skill URI**: `aftereffects://skills/mobile-app-promo-template`

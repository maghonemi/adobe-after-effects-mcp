# After Effects MCP Server - Maximum Enhancement Plan

## Executive Summary

This document outlines a comprehensive plan to transform the After Effects MCP Server into an industry-leading AI-powered motion graphics automation tool. The plan covers new features, architectural improvements, and integration capabilities that will make this the most complete After Effects automation solution available.

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Architecture Enhancements](#architecture-enhancements)
3. [Layer Management Expansion](#layer-management-expansion)
4. [Advanced Animation System](#advanced-animation-system)
5. [Effects & Color Grading](#effects--color-grading)
6. [3D Environment](#3d-environment)
7. [Audio Integration](#audio-integration)
8. [Rendering & Export](#rendering--export)
9. [Project Management](#project-management)
10. [Text Animation System](#text-animation-system)
11. [Shape & Path Animation](#shape--path-animation)
12. [Masks & Mattes](#masks--mattes)
13. [Asset Management](#asset-management)
14. [MCP Resources & Prompts](#mcp-resources--prompts)
15. [Developer Experience](#developer-experience)
16. [Performance Optimization](#performance-optimization)
17. [Implementation Roadmap](#implementation-roadmap)

---

## Current State Analysis

### Existing Capabilities

| Category | Feature | Status |
|----------|---------|--------|
| Compositions | Create composition | ✅ Complete |
| Compositions | List compositions | ✅ Complete |
| Compositions | Get project info | ✅ Complete |
| Layers | Create text layer | ✅ Complete |
| Layers | Create shape layer | ✅ Complete |
| Layers | Create solid layer | ✅ Complete |
| Layers | Set layer properties | ✅ Complete |
| Animation | Set keyframe | ✅ Complete |
| Animation | Set expression | ✅ Complete |
| Effects | Apply effect | ✅ Complete |
| Effects | Apply effect template | ✅ Complete |

### Current Limitations

1. **Limited Layer Types**: No support for footage, camera, light, null, or audio layers
2. **Basic Animation**: No easing curves, motion blur, or time remapping
3. **No Render Queue**: Cannot render or export compositions
4. **No Asset Import**: Cannot import footage, images, or audio
5. **No Mask Support**: Cannot create or manipulate masks
6. **Limited 3D**: No camera or light control
7. **Basic Effects**: Limited effect templates and no effect animation
8. **No Audio**: Zero audio layer support
9. **No Project Management**: Cannot save, load, or manage projects
10. **Polling-Based Communication**: Inefficient command execution

---

## Architecture Enhancements

### 1. WebSocket-Based Communication

Replace the file-polling system with WebSocket for real-time bidirectional communication.

```
┌─────────────────┐     WebSocket      ┌─────────────────┐
│   MCP Server    │◄──────────────────►│  After Effects  │
│   (Node.js)     │   Port 8080        │   (ExtendScript)│
└─────────────────┘                    └─────────────────┘
```

**New Files:**
- `src/websocket-server.ts` - WebSocket server implementation
- `src/scripts/websocket-client.jsx` - ExtendScript WebSocket client

**Benefits:**
- Instant command execution
- Real-time progress feedback
- Bi-directional event streaming
- Better error reporting

### 2. Event System

Implement an event-driven architecture for After Effects state changes.

```typescript
// New event types
interface AEEvents {
  'composition:changed': { compId: number; name: string };
  'layer:added': { compId: number; layerIndex: number };
  'layer:removed': { compId: number; layerIndex: number };
  'render:progress': { frameNumber: number; totalFrames: number };
  'render:complete': { outputPath: string };
  'selection:changed': { layers: LayerInfo[] };
}
```

### 3. Streaming Tool Results

Implement MCP streaming for long-running operations.

```typescript
server.tool(
  "render-composition",
  // ... params
  async function* (params) {
    yield { progress: 0, status: "Starting render..." };
    // ... render logic with progress updates
    yield { progress: 100, status: "Complete", outputPath: "/path/to/file" };
  }
);
```

### 4. Connection Manager

Handle multiple After Effects instances and connection states.

```typescript
// src/connection-manager.ts
class ConnectionManager {
  connections: Map<string, AEConnection>;
  activeConnection: AEConnection | null;
  
  connect(instanceId: string): Promise<void>;
  disconnect(instanceId: string): Promise<void>;
  broadcast(command: Command): Promise<void>;
}
```

---

## Layer Management Expansion

### 1. New Layer Types

#### Footage Layer
```typescript
server.tool("create-footage-layer", {
  compName: z.string(),
  footagePath: z.string(),  // Path to image/video file
  position: z.array(z.number()).optional(),
  scale: z.array(z.number()).optional(),
  startTime: z.number().optional(),
  duration: z.number().optional(),
  loopTimes: z.number().optional(),
  timeRemap: z.boolean().optional()
});
```

#### Null Object Layer
```typescript
server.tool("create-null-layer", {
  compName: z.string(),
  name: z.string().optional(),
  position: z.array(z.number()).optional(),
  is3D: z.boolean().optional()
});
```

#### Camera Layer
```typescript
server.tool("create-camera", {
  compName: z.string(),
  name: z.string().optional(),
  type: z.enum(["one-node", "two-node"]),
  zoom: z.number().optional(),
  position: z.array(z.number()).optional(),
  pointOfInterest: z.array(z.number()).optional(),
  depthOfField: z.boolean().optional(),
  focusDistance: z.number().optional(),
  aperture: z.number().optional(),
  blurLevel: z.number().optional()
});
```

#### Light Layer
```typescript
server.tool("create-light", {
  compName: z.string(),
  name: z.string().optional(),
  lightType: z.enum(["parallel", "spot", "point", "ambient"]),
  color: z.array(z.number()),
  intensity: z.number().optional(),
  coneAngle: z.number().optional(),  // For spot lights
  coneFeather: z.number().optional(),
  castsShadows: z.boolean().optional(),
  shadowDarkness: z.number().optional(),
  shadowDiffusion: z.number().optional()
});
```

#### Audio Layer
```typescript
server.tool("create-audio-layer", {
  compName: z.string(),
  audioPath: z.string(),
  startTime: z.number().optional(),
  inPoint: z.number().optional(),
  outPoint: z.number().optional(),
  audioLevels: z.number().optional()  // dB
});
```

#### Adjustment Layer (Enhanced)
```typescript
server.tool("create-adjustment-layer", {
  compName: z.string(),
  name: z.string().optional(),
  position: z.array(z.number()).optional(),
  size: z.array(z.number()).optional(),  // Custom size
  mask: z.object({...}).optional(),  // Apply mask to limit effect area
  effects: z.array(z.string()).optional()  // Pre-apply effects
});
```

### 2. Layer Operations

#### Duplicate Layer
```typescript
server.tool("duplicate-layer", {
  compIndex: z.number(),
  layerIndex: z.number(),
  count: z.number().optional(),  // Number of duplicates
  offset: z.array(z.number()).optional()  // Position offset per duplicate
});
```

#### Parent Layer
```typescript
server.tool("parent-layer", {
  compIndex: z.number(),
  childLayerIndex: z.number(),
  parentLayerIndex: z.number().nullable()  // null to remove parenting
});
```

#### Precompose Layers
```typescript
server.tool("precompose-layers", {
  compIndex: z.number(),
  layerIndices: z.array(z.number()),
  newCompName: z.string(),
  moveAttributes: z.boolean().optional(),
  openNewComp: z.boolean().optional()
});
```

#### Layer Blending
```typescript
server.tool("set-layer-blend-mode", {
  compIndex: z.number(),
  layerIndex: z.number(),
  blendMode: z.enum([
    "normal", "dissolve", "darken", "multiply", "color-burn",
    "linear-burn", "darker-color", "add", "lighten", "screen",
    "color-dodge", "linear-dodge", "lighter-color", "overlay",
    "soft-light", "hard-light", "vivid-light", "linear-light",
    "pin-light", "hard-mix", "difference", "exclusion",
    "subtract", "divide", "hue", "saturation", "color", "luminosity"
  ])
});
```

#### Track Matte
```typescript
server.tool("set-track-matte", {
  compIndex: z.number(),
  layerIndex: z.number(),
  matteLayerIndex: z.number(),
  matteType: z.enum(["alpha", "alpha-inverted", "luma", "luma-inverted"])
});
```

### 3. Layer Query Tools

#### Get Detailed Layer Info
```typescript
server.tool("get-layer-details", {
  compIndex: z.number(),
  layerIndex: z.number(),
  includeEffects: z.boolean().optional(),
  includeKeyframes: z.boolean().optional(),
  includeMasks: z.boolean().optional(),
  includeExpressions: z.boolean().optional()
});
```

#### Find Layers
```typescript
server.tool("find-layers", {
  compIndex: z.number(),
  query: z.object({
    name: z.string().optional(),
    namePattern: z.string().optional(),  // Regex
    type: z.enum(["text", "shape", "solid", "footage", "camera", "light", "null", "audio"]).optional(),
    hasEffect: z.string().optional(),
    hasExpression: z.boolean().optional(),
    is3D: z.boolean().optional(),
    isVisible: z.boolean().optional()
  })
});
```

---

## Advanced Animation System

### 1. Enhanced Keyframe System

#### Set Multiple Keyframes
```typescript
server.tool("set-keyframes", {
  compIndex: z.number(),
  layerIndex: z.number(),
  propertyPath: z.string(),  // e.g., "Transform.Position" or "Effects.Gaussian Blur.Blurriness"
  keyframes: z.array(z.object({
    time: z.number(),
    value: z.any(),
    easing: z.object({
      type: z.enum(["linear", "bezier", "hold", "ease", "ease-in", "ease-out", "ease-in-out"]),
      inInfluence: z.number().optional(),
      inSpeed: z.number().optional(),
      outInfluence: z.number().optional(),
      outSpeed: z.number().optional(),
      // Bezier handles for custom curves
      inTangent: z.array(z.number()).optional(),
      outTangent: z.array(z.number()).optional()
    }).optional()
  }))
});
```

#### Keyframe Easing Presets
```typescript
server.tool("apply-easing-preset", {
  compIndex: z.number(),
  layerIndex: z.number(),
  propertyPath: z.string(),
  keyframeIndex: z.number(),
  preset: z.enum([
    "linear",
    "ease",
    "ease-in",
    "ease-out",
    "ease-in-out",
    "bounce",
    "elastic",
    "back-in",
    "back-out",
    "anticipation",
    "overshoot"
  ])
});
```

### 2. Expression Library

#### Expression Templates
```typescript
server.tool("apply-expression-template", {
  compIndex: z.number(),
  layerIndex: z.number(),
  propertyPath: z.string(),
  template: z.enum([
    "wiggle",
    "bounce",
    "elastic",
    "inertia",
    "decay",
    "loop-cycle",
    "loop-pingpong",
    "random",
    "time-based",
    "audio-reactive",
    "follow-null",
    "look-at",
    "orbit",
    "typewriter",
    "counter"
  ]),
  parameters: z.record(z.any()).optional()
});
```

#### Expression Builder
```typescript
server.tool("build-expression", {
  compIndex: z.number(),
  layerIndex: z.number(),
  propertyPath: z.string(),
  components: z.array(z.union([
    z.object({
      type: z.literal("wiggle"),
      frequency: z.number(),
      amplitude: z.number()
    }),
    z.object({
      type: z.literal("link"),
      targetLayer: z.string(),
      targetProperty: z.string(),
      offset: z.number().optional(),
      multiplier: z.number().optional()
    }),
    z.object({
      type: z.literal("condition"),
      condition: z.string(),
      ifTrue: z.any(),
      ifFalse: z.any()
    }),
    z.object({
      type: z.literal("math"),
      operation: z.enum(["add", "subtract", "multiply", "divide", "mod", "sin", "cos", "tan"]),
      value: z.number()
    })
  ]))
});
```

### 3. Motion Path Tools

#### Create Motion Path
```typescript
server.tool("create-motion-path", {
  compIndex: z.number(),
  layerIndex: z.number(),
  pathType: z.enum(["bezier", "circle", "spiral", "figure-8", "custom"]),
  pathParams: z.object({
    // For bezier
    points: z.array(z.object({
      position: z.array(z.number()),
      inTangent: z.array(z.number()).optional(),
      outTangent: z.array(z.number()).optional()
    })).optional(),
    // For circle
    center: z.array(z.number()).optional(),
    radius: z.number().optional(),
    // For spiral
    turns: z.number().optional(),
    expansion: z.number().optional(),
    // Common
    duration: z.number(),
    easing: z.string().optional(),
    orientToPath: z.boolean().optional(),
    autoOrientUpstream: z.boolean().optional()
  })
});
```

#### Copy/Paste Animation
```typescript
server.tool("copy-animation", {
  sourceCompIndex: z.number(),
  sourceLayerIndex: z.number(),
  sourceProperty: z.string().optional(),  // If not specified, copy all
  targetCompIndex: z.number(),
  targetLayerIndex: z.number(),
  targetProperty: z.string().optional(),
  timeOffset: z.number().optional(),
  scaleTime: z.number().optional()  // Time stretch factor
});
```

### 4. Time Remapping

```typescript
server.tool("enable-time-remapping", {
  compIndex: z.number(),
  layerIndex: z.number()
});

server.tool("set-time-remap-keyframe", {
  compIndex: z.number(),
  layerIndex: z.number(),
  time: z.number(),
  remappedTime: z.number()
});

server.tool("apply-time-effect", {
  compIndex: z.number(),
  layerIndex: z.number(),
  effect: z.enum([
    "reverse",
    "slow-motion",
    "speed-ramp",
    "freeze-frame",
    "loop",
    "pingpong"
  ]),
  parameters: z.object({
    speed: z.number().optional(),
    freezeAt: z.number().optional(),
    loopCount: z.number().optional(),
    rampDuration: z.number().optional()
  }).optional()
});
```

### 5. Motion Blur & Frame Blending

```typescript
server.tool("set-motion-blur", {
  compIndex: z.number(),
  layerIndex: z.number().optional(),  // If not specified, set for composition
  enabled: z.boolean(),
  shutterAngle: z.number().optional(),  // 0-720
  shutterPhase: z.number().optional(),  // -360 to 360
  samplesPerFrame: z.number().optional(),  // 2-64
  adaptiveSampleLimit: z.number().optional()
});

server.tool("set-frame-blending", {
  compIndex: z.number(),
  layerIndex: z.number(),
  mode: z.enum(["none", "frame-mix", "pixel-motion"])
});
```

---

## Effects & Color Grading

### 1. Comprehensive Effect Library

#### Effect Categories
```typescript
const effectCategories = {
  blur: [
    "gaussian-blur", "camera-lens-blur", "directional-blur",
    "radial-blur", "box-blur", "fast-blur", "compound-blur",
    "channel-blur", "bilateral-blur", "smart-blur"
  ],
  distort: [
    "bezier-warp", "bulge", "corner-pin", "displacement-map",
    "liquify", "magnify", "mesh-warp", "mirror", "offset",
    "optics-compensation", "polar-coordinates", "reshape",
    "ripple", "rolling-shutter-repair", "smear", "spherize",
    "transform", "turbulent-displace", "twirl", "wave-warp", "warp"
  ],
  colorCorrection: [
    "auto-color", "auto-contrast", "auto-levels", "brightness-contrast",
    "color-balance", "color-stabilizer", "curves", "equalize",
    "exposure", "hue-saturation", "leave-color", "levels",
    "photo-filter", "selective-color", "shadow-highlight",
    "tint", "tritone", "vibrance", "color-link"
  ],
  generate: [
    "4-color-gradient", "advanced-lightning", "audio-spectrum",
    "audio-waveform", "beam", "cell-pattern", "checkerboard",
    "circle", "ellipse", "eyedropper-fill", "fill", "fractal",
    "gradient-ramp", "grid", "lens-flare", "paint-bucket",
    "radio-waves", "scribble", "stroke", "vegas", "write-on"
  ],
  keying: [
    "color-difference-key", "color-key", "color-range",
    "difference-matte", "extract", "inner-outer-key",
    "keylight", "linear-color-key", "luma-key", "spill-suppressor"
  ],
  matte: [
    "matte-choker", "refine-edge", "refine-soft-matte",
    "simple-choker"
  ],
  noise: [
    "add-grain", "dust-scratches", "fractal-noise",
    "match-grain", "median", "noise", "noise-alpha",
    "remove-grain", "turbulent-noise"
  ],
  perspective: [
    "3d-camera-tracker", "3d-glasses", "bevel-alpha",
    "bevel-edges", "cc-cylinder", "cc-environment",
    "cc-sphere", "drop-shadow", "radial-shadow"
  ],
  simulation: [
    "card-dance", "card-wipe", "caustics", "foam",
    "particle-playground", "shatter", "wave-world",
    "cc-ball-action", "cc-bubbles", "cc-drizzle",
    "cc-hair", "cc-mr-mercury", "cc-particle-systems",
    "cc-particle-world", "cc-pixel-polly", "cc-rain",
    "cc-rainfall", "cc-scatter", "cc-snow", "cc-snowfall",
    "cc-star-burst"
  ],
  stylize: [
    "brush-strokes", "cartoon", "color-emboss", "emboss",
    "find-edges", "glow", "mosaic", "motion-tile",
    "posterize", "roughen-edges", "scatter", "strobe-light",
    "texturize", "threshold", "cc-glass", "cc-glue-gun",
    "cc-kaleida", "cc-light-sweep", "cc-plastic",
    "cc-threshold-rgb", "cc-vignette"
  ],
  text: [
    "numbers", "timecode"
  ],
  time: [
    "echo", "pixel-motion-blur", "posterize-time",
    "time-difference", "time-displacement", "timewarp",
    "cc-force-motion-blur", "cc-wide-time"
  ],
  transition: [
    "block-dissolve", "card-wipe", "gradient-wipe",
    "iris-wipe", "linear-wipe", "radial-wipe",
    "venetian-blinds", "cc-glass-wipe", "cc-grid-wipe",
    "cc-image-wipe", "cc-jaws", "cc-light-wipe",
    "cc-line-sweep", "cc-radial-scale-wipe", "cc-scale-wipe",
    "cc-twister", "cc-warped-stretch"
  ],
  utility: [
    "apply-color-lut", "cineon-converter", "color-profile-converter",
    "grow-bounds", "hdr-compander", "hdr-highlight-compression"
  ]
};
```

### 2. Color Grading Tools

#### Apply LUT
```typescript
server.tool("apply-lut", {
  compIndex: z.number(),
  layerIndex: z.number(),
  lutPath: z.string(),  // Path to .cube, .3dl, .look file
  intensity: z.number().optional()  // 0-100
});
```

#### Color Match
```typescript
server.tool("match-color", {
  compIndex: z.number(),
  sourceLayerIndex: z.number(),
  targetLayerIndex: z.number(),
  matchType: z.enum(["shadows", "midtones", "highlights", "all"]),
  intensity: z.number().optional()
});
```

#### Create Color Grade
```typescript
server.tool("create-color-grade", {
  compIndex: z.number(),
  layerIndex: z.number(),
  grade: z.object({
    exposure: z.number().optional(),
    contrast: z.number().optional(),
    highlights: z.number().optional(),
    shadows: z.number().optional(),
    whites: z.number().optional(),
    blacks: z.number().optional(),
    temperature: z.number().optional(),
    tint: z.number().optional(),
    vibrance: z.number().optional(),
    saturation: z.number().optional(),
    // Curves
    rgbCurve: z.array(z.array(z.number())).optional(),
    redCurve: z.array(z.array(z.number())).optional(),
    greenCurve: z.array(z.array(z.number())).optional(),
    blueCurve: z.array(z.array(z.number())).optional(),
    // Color wheels
    shadowsColor: z.array(z.number()).optional(),
    midtonesColor: z.array(z.number()).optional(),
    highlightsColor: z.array(z.number()).optional()
  })
});
```

### 3. Effect Presets (Extended)

```typescript
const effectPresets = {
  // Cinematic Looks
  "film-noir": { /* black & white with high contrast */ },
  "vintage-70s": { /* warm, faded, grain */ },
  "blockbuster-teal-orange": { /* complementary color grade */ },
  "indie-film": { /* desaturated, crushed blacks */ },
  "dream-sequence": { /* glow, soft focus, warm */ },
  "horror-look": { /* desaturated, cold, high contrast */ },
  "sci-fi-future": { /* cool blues, high tech feel */ },
  
  // Social Media
  "instagram-1977": { /* vintage warm filter */ },
  "instagram-clarendon": { /* bright, vivid colors */ },
  "tiktok-trendy": { /* high contrast, vibrant */ },
  "youtube-thumbnail": { /* punchy, attention-grabbing */ },
  
  // Broadcast
  "news-lower-third": { /* clean, professional */ },
  "sports-highlight": { /* dynamic, energetic */ },
  "corporate-clean": { /* professional, neutral */ },
  
  // VFX
  "greenscreen-fix": { /* spill suppressor, edge refinement */ },
  "object-tracking-blur": { /* motion blur for tracked objects */ },
  "seamless-composite": { /* color match, grain match */ },
  
  // Motion Graphics
  "neon-glow": { /* bright glow effect */ },
  "glass-morphism": { /* frosted glass effect */ },
  "glitch-distortion": { /* digital glitch effect */ },
  "vhs-retro": { /* VHS tape look */ },
  "chromatic-aberration": { /* RGB split effect */ }
};
```

### 4. Effect Animation

```typescript
server.tool("animate-effect-property", {
  compIndex: z.number(),
  layerIndex: z.number(),
  effectName: z.string(),
  propertyName: z.string(),
  keyframes: z.array(z.object({
    time: z.number(),
    value: z.any(),
    easing: z.string().optional()
  }))
});

server.tool("apply-effect-expression", {
  compIndex: z.number(),
  layerIndex: z.number(),
  effectName: z.string(),
  propertyName: z.string(),
  expression: z.string()
});
```

---

## 3D Environment

### 1. Camera System

#### Camera Presets
```typescript
server.tool("apply-camera-preset", {
  compIndex: z.number(),
  cameraLayerIndex: z.number(),
  preset: z.enum([
    "wide-angle-24mm",
    "standard-50mm",
    "portrait-85mm",
    "telephoto-200mm",
    "cinematic-35mm",
    "gopro-wide",
    "drone-aerial",
    "security-camera"
  ])
});
```

#### Camera Animation
```typescript
server.tool("animate-camera", {
  compIndex: z.number(),
  cameraLayerIndex: z.number(),
  animation: z.enum([
    "dolly-in",
    "dolly-out",
    "truck-left",
    "truck-right",
    "pedestal-up",
    "pedestal-down",
    "pan-left",
    "pan-right",
    "tilt-up",
    "tilt-down",
    "orbit",
    "follow-path",
    "rack-focus",
    "zoom-in",
    "zoom-out",
    "shake",
    "handheld"
  ]),
  parameters: z.object({
    duration: z.number(),
    distance: z.number().optional(),
    easing: z.string().optional(),
    target: z.array(z.number()).optional()
  })
});
```

### 2. Lighting System

#### Lighting Presets
```typescript
server.tool("apply-lighting-preset", {
  compIndex: z.number(),
  preset: z.enum([
    "three-point-lighting",
    "dramatic-side-light",
    "soft-ambient",
    "sunset-warm",
    "moonlight-cool",
    "studio-portrait",
    "neon-night",
    "outdoor-sunny",
    "overcast-soft"
  ]),
  intensity: z.number().optional()
});
```

### 3. 3D Layer Management

```typescript
server.tool("convert-to-3d", {
  compIndex: z.number(),
  layerIndex: z.number(),
  autoOrient: z.enum(["off", "towards-camera", "along-path"]).optional()
});

server.tool("set-3d-transform", {
  compIndex: z.number(),
  layerIndex: z.number(),
  position: z.array(z.number()).optional(),  // [x, y, z]
  rotation: z.array(z.number()).optional(),  // [x, y, z]
  scale: z.array(z.number()).optional(),     // [x, y, z]
  anchorPoint: z.array(z.number()).optional(),
  orientation: z.array(z.number()).optional()
});
```

### 4. 3D Renderer Settings

```typescript
server.tool("set-3d-renderer", {
  compIndex: z.number(),
  renderer: z.enum(["classic-3d", "cinema-4d", "ray-traced"]),
  options: z.object({
    // Ray-traced options
    quality: z.enum(["draft", "final"]).optional(),
    antiAliasing: z.enum(["low", "medium", "high"]).optional(),
    reflections: z.number().optional(),
    shadows: z.boolean().optional(),
    // Cinema 4D options
    currentRenderer: z.enum(["standard", "physical"]).optional()
  }).optional()
});
```

---

## Audio Integration

### 1. Audio Layer Tools

```typescript
server.tool("import-audio", {
  compIndex: z.number(),
  audioPath: z.string(),
  startTime: z.number().optional(),
  name: z.string().optional()
});

server.tool("set-audio-levels", {
  compIndex: z.number(),
  layerIndex: z.number(),
  levels: z.union([
    z.number(),  // Single value for both channels
    z.array(z.number())  // [left, right] for stereo
  ])
});

server.tool("set-audio-keyframe", {
  compIndex: z.number(),
  layerIndex: z.number(),
  time: z.number(),
  levels: z.union([z.number(), z.array(z.number())])
});
```

### 2. Audio Analysis

```typescript
server.tool("analyze-audio", {
  compIndex: z.number(),
  layerIndex: z.number(),
  analysisType: z.enum([
    "amplitude",
    "frequency-bands",
    "beat-detection",
    "waveform"
  ]),
  timeRange: z.object({
    start: z.number(),
    end: z.number()
  }).optional()
});

server.tool("generate-audio-keyframes", {
  compIndex: z.number(),
  audioLayerIndex: z.number(),
  targetLayerIndex: z.number(),
  targetProperty: z.string(),
  mappingType: z.enum([
    "amplitude-to-scale",
    "amplitude-to-position",
    "amplitude-to-opacity",
    "amplitude-to-rotation",
    "bass-to-property",
    "mid-to-property",
    "treble-to-property",
    "beat-to-property"
  ]),
  sensitivity: z.number().optional(),
  smoothing: z.number().optional(),
  offset: z.number().optional(),
  multiplier: z.number().optional()
});
```

### 3. Audio Visualization

```typescript
server.tool("create-audio-visualization", {
  compIndex: z.number(),
  audioLayerIndex: z.number(),
  visualizationType: z.enum([
    "spectrum",
    "waveform",
    "bars",
    "circular",
    "particles",
    "line-graph"
  ]),
  settings: z.object({
    color: z.array(z.number()).optional(),
    barCount: z.number().optional(),
    sensitivity: z.number().optional(),
    smoothing: z.number().optional(),
    lineThickness: z.number().optional()
  }).optional()
});
```

---

## Rendering & Export

### 1. Render Queue Management

```typescript
server.tool("add-to-render-queue", {
  compIndex: z.number(),
  outputModule: z.string().optional(),  // Template name
  outputPath: z.string(),
  renderSettings: z.string().optional()  // Template name
});

server.tool("render-queue-item", {
  queueItemIndex: z.number(),
  waitForCompletion: z.boolean().optional()
});

server.tool("render-all", {
  waitForCompletion: z.boolean().optional()
});

server.tool("get-render-queue-status", {});

server.tool("clear-render-queue", {});
```

### 2. Export Presets

```typescript
server.tool("export-composition", {
  compIndex: z.number(),
  preset: z.enum([
    // Video
    "h264-high-quality",
    "h264-youtube",
    "h264-vimeo",
    "h264-instagram",
    "h264-tiktok",
    "prores-422",
    "prores-4444",
    "dnxhd",
    "cineform",
    
    // Image Sequences
    "png-sequence",
    "tiff-sequence",
    "exr-sequence",
    "jpeg-sequence",
    
    // GIF/Animation
    "gif-high-quality",
    "gif-optimized",
    "animated-png",
    
    // Audio
    "wav-48khz",
    "mp3-320kbps",
    "aac-256kbps"
  ]),
  outputPath: z.string(),
  frameRange: z.object({
    start: z.number(),
    end: z.number()
  }).optional()
});
```

### 3. Frame Export

```typescript
server.tool("export-frame", {
  compIndex: z.number(),
  time: z.number(),
  format: z.enum(["png", "jpg", "tiff", "psd", "exr"]),
  outputPath: z.string(),
  resolution: z.enum(["full", "half", "third", "quarter"]).optional()
});

server.tool("export-frame-sequence", {
  compIndex: z.number(),
  startTime: z.number(),
  endTime: z.number(),
  frameStep: z.number().optional(),  // Export every N frames
  format: z.enum(["png", "jpg", "tiff", "exr"]),
  outputFolder: z.string()
});
```

### 4. Media Encoder Integration

```typescript
server.tool("send-to-media-encoder", {
  compIndex: z.number(),
  preset: z.string(),
  outputPath: z.string()
});
```

---

## Project Management

### 1. Project Operations

```typescript
server.tool("new-project", {
  name: z.string().optional()
});

server.tool("open-project", {
  projectPath: z.string()
});

server.tool("save-project", {
  savePath: z.string().optional()  // If not provided, saves to current location
});

server.tool("save-project-as", {
  savePath: z.string()
});

server.tool("close-project", {
  save: z.boolean().optional()
});
```

### 2. Project Settings

```typescript
server.tool("set-project-settings", {
  bitsPerChannel: z.enum(["8", "16", "32"]).optional(),
  workingColorSpace: z.string().optional(),
  linearizeWorkingSpace: z.boolean().optional(),
  compensateForSceneReferredProfiles: z.boolean().optional(),
  expressionEngine: z.enum(["legacy", "javascript"]).optional(),
  gpuAcceleration: z.enum(["mercury-gpu", "software"]).optional(),
  audioSampleRate: z.number().optional()
});
```

### 3. Project Organization

```typescript
server.tool("create-folder", {
  name: z.string(),
  parentFolderIndex: z.number().optional()
});

server.tool("move-item-to-folder", {
  itemIndex: z.number(),
  folderIndex: z.number()
});

server.tool("rename-item", {
  itemIndex: z.number(),
  newName: z.string()
});

server.tool("delete-item", {
  itemIndex: z.number()
});
```

### 4. Project Templates

```typescript
server.tool("create-from-template", {
  templatePath: z.string(),
  projectName: z.string().optional()
});

server.tool("save-as-template", {
  savePath: z.string(),
  includeFootage: z.boolean().optional()
});
```

---

## Text Animation System

### 1. Text Animators

```typescript
server.tool("add-text-animator", {
  compIndex: z.number(),
  layerIndex: z.number(),
  animatorType: z.enum([
    "position",
    "scale",
    "rotation",
    "opacity",
    "fill-color",
    "stroke-color",
    "stroke-width",
    "tracking",
    "line-anchor",
    "line-spacing",
    "character-offset",
    "blur"
  ]),
  rangeSelector: z.object({
    type: z.enum(["range", "wiggly", "expression"]),
    start: z.number().optional(),
    end: z.number().optional(),
    offset: z.number().optional(),
    units: z.enum(["percentage", "index"]).optional(),
    based: z.enum(["characters", "words", "lines"]).optional(),
    mode: z.enum(["add", "subtract", "intersect", "min", "max", "difference"]).optional(),
    amount: z.number().optional(),
    shape: z.enum(["square", "ramp-up", "ramp-down", "triangle", "round", "smooth"]).optional(),
    smoothness: z.number().optional(),
    ease: z.object({
      high: z.number(),
      low: z.number()
    }).optional(),
    // Wiggly selector options
    wigglesPerSecond: z.number().optional(),
    correlation: z.number().optional(),
    // Expression selector options
    expression: z.string().optional()
  }).optional()
});
```

### 2. Text Animation Presets

```typescript
server.tool("apply-text-animation-preset", {
  compIndex: z.number(),
  layerIndex: z.number(),
  preset: z.enum([
    // Animate In
    "typewriter",
    "fade-up-by-character",
    "fade-up-by-word",
    "fade-up-by-line",
    "scale-in-characters",
    "blur-in",
    "fly-in-from-left",
    "fly-in-from-right",
    "fly-in-from-bottom",
    "drop-in",
    "bounce-in",
    "swing-in",
    "random-fade-in",
    "decode-effect",
    "glitch-reveal",
    
    // Animate Out
    "fade-out-characters",
    "scale-out",
    "blur-out",
    "fly-out",
    
    // Continuous
    "wiggle-position",
    "wiggle-scale",
    "color-cycle",
    "wave",
    "bounce-loop",
    
    // Special
    "3d-rotate-in",
    "3d-flip-in",
    "neon-flicker",
    "rainbow-colors"
  ]),
  duration: z.number().optional(),
  delay: z.number().optional()
});
```

### 3. Per-Character 3D

```typescript
server.tool("enable-per-character-3d", {
  compIndex: z.number(),
  layerIndex: z.number()
});

server.tool("set-character-3d-transform", {
  compIndex: z.number(),
  layerIndex: z.number(),
  animatorIndex: z.number(),
  position: z.array(z.number()).optional(),
  rotation: z.array(z.number()).optional(),
  scale: z.array(z.number()).optional()
});
```

---

## Shape & Path Animation

### 1. Path Operations

```typescript
server.tool("create-shape-from-path", {
  compIndex: z.number(),
  pathData: z.object({
    vertices: z.array(z.array(z.number())),
    inTangents: z.array(z.array(z.number())).optional(),
    outTangents: z.array(z.array(z.number())).optional(),
    closed: z.boolean().optional()
  }),
  name: z.string().optional(),
  fillColor: z.array(z.number()).optional(),
  strokeColor: z.array(z.number()).optional(),
  strokeWidth: z.number().optional()
});

server.tool("modify-shape-path", {
  compIndex: z.number(),
  layerIndex: z.number(),
  groupIndex: z.number().optional(),
  newPathData: z.object({
    vertices: z.array(z.array(z.number())),
    inTangents: z.array(z.array(z.number())).optional(),
    outTangents: z.array(z.array(z.number())).optional(),
    closed: z.boolean().optional()
  })
});
```

### 2. Path Animation (Morphing)

```typescript
server.tool("create-path-morph", {
  compIndex: z.number(),
  layerIndex: z.number(),
  pathKeyframes: z.array(z.object({
    time: z.number(),
    pathData: z.object({
      vertices: z.array(z.array(z.number())),
      inTangents: z.array(z.array(z.number())).optional(),
      outTangents: z.array(z.array(z.number())).optional()
    })
  })),
  easing: z.string().optional()
});
```

### 3. Shape Modifiers

```typescript
server.tool("add-shape-modifier", {
  compIndex: z.number(),
  layerIndex: z.number(),
  modifier: z.enum([
    "trim-paths",
    "pucker-bloat",
    "repeater",
    "round-corners",
    "wiggle-paths",
    "wiggle-transform",
    "twist",
    "zig-zag",
    "offset-paths",
    "merge-paths"
  ]),
  settings: z.record(z.any()).optional()
});

server.tool("animate-trim-paths", {
  compIndex: z.number(),
  layerIndex: z.number(),
  keyframes: z.array(z.object({
    time: z.number(),
    start: z.number().optional(),
    end: z.number().optional(),
    offset: z.number().optional()
  })),
  easing: z.string().optional()
});
```

### 4. Shape Presets

```typescript
server.tool("create-shape-preset", {
  compIndex: z.number(),
  preset: z.enum([
    // Basic
    "rectangle",
    "rounded-rectangle",
    "circle",
    "ellipse",
    "polygon",
    "star",
    
    // Complex
    "arrow",
    "speech-bubble",
    "heart",
    "checkmark",
    "cross",
    "play-button",
    "pause-button",
    "loading-spinner",
    "progress-bar",
    
    // UI Elements
    "button",
    "card",
    "toggle",
    "slider",
    "dropdown",
    
    // Decorative
    "wave-line",
    "zig-zag-line",
    "dotted-line",
    "bracket",
    "underline"
  ]),
  position: z.array(z.number()).optional(),
  size: z.array(z.number()).optional(),
  fillColor: z.array(z.number()).optional(),
  strokeColor: z.array(z.number()).optional()
});
```

---

## Masks & Mattes

### 1. Mask Creation

```typescript
server.tool("create-mask", {
  compIndex: z.number(),
  layerIndex: z.number(),
  maskType: z.enum(["rectangle", "ellipse", "path"]),
  maskData: z.object({
    // For rectangle/ellipse
    position: z.array(z.number()).optional(),
    size: z.array(z.number()).optional(),
    // For path
    vertices: z.array(z.array(z.number())).optional(),
    inTangents: z.array(z.array(z.number())).optional(),
    outTangents: z.array(z.array(z.number())).optional(),
    closed: z.boolean().optional()
  }),
  mode: z.enum([
    "none", "add", "subtract", "intersect", "lighten", "darken", "difference"
  ]).optional(),
  inverted: z.boolean().optional(),
  feather: z.number().optional(),
  opacity: z.number().optional(),
  expansion: z.number().optional()
});
```

### 2. Mask Animation

```typescript
server.tool("animate-mask", {
  compIndex: z.number(),
  layerIndex: z.number(),
  maskIndex: z.number(),
  property: z.enum(["path", "feather", "opacity", "expansion"]),
  keyframes: z.array(z.object({
    time: z.number(),
    value: z.any()
  }))
});

server.tool("animate-mask-path", {
  compIndex: z.number(),
  layerIndex: z.number(),
  maskIndex: z.number(),
  pathKeyframes: z.array(z.object({
    time: z.number(),
    vertices: z.array(z.array(z.number())),
    inTangents: z.array(z.array(z.number())).optional(),
    outTangents: z.array(z.array(z.number())).optional()
  }))
});
```

### 3. Mask Presets

```typescript
server.tool("apply-mask-preset", {
  compIndex: z.number(),
  layerIndex: z.number(),
  preset: z.enum([
    // Reveal animations
    "wipe-left-to-right",
    "wipe-right-to-left",
    "wipe-top-to-bottom",
    "wipe-bottom-to-top",
    "circular-reveal",
    "iris-reveal",
    "diagonal-reveal",
    
    // Shapes
    "vignette",
    "letterbox",
    "circular-frame",
    "rounded-rectangle-frame",
    
    // Split
    "split-horizontal",
    "split-vertical",
    "split-thirds",
    "split-grid"
  ]),
  duration: z.number().optional()
});
```

---

## Asset Management

### 1. Import Operations

```typescript
server.tool("import-file", {
  filePath: z.string(),
  importAs: z.enum(["footage", "composition", "composition-cropped"]).optional(),
  sequence: z.boolean().optional(),  // Import as image sequence
  framerate: z.number().optional(),  // For sequences
  alpha: z.enum(["ignore", "straight", "premultiplied"]).optional(),
  folderIndex: z.number().optional()  // Target folder
});

server.tool("import-folder", {
  folderPath: z.string(),
  importSubfolders: z.boolean().optional(),
  sequenceDetection: z.boolean().optional(),
  targetFolderIndex: z.number().optional()
});

server.tool("import-photoshop", {
  filePath: z.string(),
  importKind: z.enum(["footage", "composition", "composition-cropped-layers"]),
  layerOptions: z.object({
    preserveStyles: z.boolean().optional(),
    mergeStyles: z.boolean().optional(),
    ignoreLayerStyles: z.boolean().optional()
  }).optional()
});

server.tool("import-illustrator", {
  filePath: z.string(),
  importKind: z.enum(["footage", "composition", "composition-cropped-layers"]),
  layerOptions: z.object({
    preserveStyles: z.boolean().optional()
  }).optional()
});
```

### 2. Footage Management

```typescript
server.tool("replace-footage", {
  footageItemIndex: z.number(),
  newFilePath: z.string()
});

server.tool("reload-footage", {
  footageItemIndex: z.number()
});

server.tool("set-footage-interpretation", {
  footageItemIndex: z.number(),
  framerate: z.number().optional(),
  alpha: z.enum(["ignore", "straight", "premultiplied"]).optional(),
  fieldSeparation: z.enum(["off", "upper-first", "lower-first"]).optional(),
  pulldown: z.enum(["off", "wssww", "sswww", "swwws", "wwwss", "wwssw"]).optional(),
  loopTimes: z.number().optional()
});

server.tool("get-missing-footage", {});

server.tool("find-replace-footage", {
  searchPath: z.string(),
  replacePath: z.string(),
  recursive: z.boolean().optional()
});
```

### 3. Asset Organization

```typescript
server.tool("collect-files", {
  outputFolder: z.string(),
  options: z.object({
    collectSourceFiles: z.boolean().optional(),
    generateReport: z.boolean().optional(),
    reducedProject: z.boolean().optional(),
    obeyProxySettings: z.boolean().optional()
  }).optional()
});

server.tool("consolidate-footage", {});

server.tool("remove-unused-footage", {});
```

---

## MCP Resources & Prompts

### 1. Enhanced Resources

```typescript
// Dynamic project state resource
server.resource("project-state", "aftereffects://project/state", {
  // Real-time project information
});

// Active composition resource
server.resource("active-composition", "aftereffects://composition/active", {
  // Current composition details including layers, effects, etc.
});

// Selected layers resource
server.resource("selected-layers", "aftereffects://selection/layers", {
  // Currently selected layers
});

// Render queue resource
server.resource("render-queue", "aftereffects://render/queue", {
  // Render queue status
});

// Effect list resource
server.resource("available-effects", "aftereffects://effects/list", {
  // All available effects
});

// Font list resource
server.resource("available-fonts", "aftereffects://fonts/list", {
  // All available fonts
});
```

### 2. Enhanced Prompts

```typescript
// Motion graphics prompts
server.prompt("create-lower-third", {
  text: z.string(),
  style: z.enum(["minimal", "broadcast", "modern", "elegant"]),
  duration: z.number()
});

server.prompt("create-title-sequence", {
  title: z.string(),
  subtitle: z.string().optional(),
  style: z.string()
});

server.prompt("create-social-video", {
  platform: z.enum(["instagram", "tiktok", "youtube", "twitter"]),
  content: z.string()
});

// Animation prompts
server.prompt("animate-logo", {
  logoPath: z.string(),
  animationType: z.enum(["reveal", "bounce", "elegant", "dynamic"]),
  duration: z.number()
});

server.prompt("create-transition", {
  fromComp: z.string(),
  toComp: z.string(),
  transitionType: z.string()
});

// Technical prompts
server.prompt("fix-expression-errors", {});

server.prompt("optimize-composition", {
  compIndex: z.number()
});

server.prompt("match-cut-timing", {
  musicPath: z.string()
});
```

---

## Developer Experience

### 1. TypeScript Definitions

Create comprehensive type definitions for the entire API:

```typescript
// types/aftereffects-mcp.d.ts
declare module '@after-effects-mcp' {
  interface Composition {
    id: number;
    name: string;
    width: number;
    height: number;
    duration: number;
    frameRate: number;
    // ... complete type definitions
  }
  
  interface Layer {
    index: number;
    name: string;
    type: LayerType;
    // ... complete type definitions
  }
  
  // ... all type definitions
}
```

### 2. CLI Tool

Create a command-line interface for common operations:

```bash
# ae-mcp CLI examples
ae-mcp project info
ae-mcp comp list
ae-mcp comp create --name "My Comp" --width 1920 --height 1080
ae-mcp layer add-text --comp "My Comp" --text "Hello World"
ae-mcp render --comp "My Comp" --preset h264-high-quality --output ./output.mp4
```

### 3. SDK for Custom Scripts

```typescript
// SDK for building custom automation scripts
import { AEClient } from '@after-effects-mcp/sdk';

const ae = new AEClient();

await ae.connect();

const comp = await ae.createComposition({
  name: "My Animation",
  width: 1920,
  height: 1080,
  duration: 10,
  frameRate: 30
});

const textLayer = await comp.addTextLayer({
  text: "Hello World",
  position: [960, 540]
});

await textLayer.animate("position", [
  { time: 0, value: [0, 540] },
  { time: 2, value: [960, 540], easing: "ease-out" }
]);

await ae.render(comp, {
  preset: "h264-high-quality",
  output: "./output.mp4"
});
```

### 4. Documentation Site

Create comprehensive documentation including:
- Getting Started Guide
- API Reference
- Tutorials
- Examples Gallery
- Troubleshooting Guide
- Video Tutorials
- Community Templates

---

## Performance Optimization

### 1. Batch Operations

```typescript
server.tool("batch-operations", {
  operations: z.array(z.object({
    type: z.string(),
    params: z.record(z.any())
  })),
  undoGroupName: z.string().optional()
});
```

### 2. Caching System

Implement intelligent caching for:
- Project structure
- Composition metadata
- Layer properties
- Effect lists
- Font lists

### 3. Parallel Processing

- Queue multiple operations
- Progress streaming for long operations
- Cancellation support

### 4. Memory Management

- Purge memory tools
- Proxy creation
- Smart preview resolution

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] WebSocket communication system
- [ ] Event system architecture
- [ ] Enhanced error handling
- [ ] Comprehensive logging
- [ ] Unit testing framework

### Phase 2: Layer Expansion (Weeks 3-4)
- [ ] Footage layer support
- [ ] Camera layer support
- [ ] Light layer support
- [ ] Null object support
- [ ] Audio layer support
- [ ] Layer operations (duplicate, parent, precompose)

### Phase 3: Animation System (Weeks 5-6)
- [ ] Enhanced keyframe system with easing
- [ ] Expression library and builder
- [ ] Motion path tools
- [ ] Time remapping
- [ ] Motion blur controls

### Phase 4: Effects & Color (Weeks 7-8)
- [ ] Comprehensive effect library
- [ ] Color grading tools
- [ ] LUT support
- [ ] Effect animation
- [ ] 30+ effect presets

### Phase 5: 3D Environment (Week 9)
- [ ] Camera animation system
- [ ] Lighting presets
- [ ] 3D layer management
- [ ] Renderer settings

### Phase 6: Audio Integration (Week 10)
- [ ] Audio layer management
- [ ] Audio analysis tools
- [ ] Audio-reactive animation
- [ ] Audio visualization

### Phase 7: Rendering & Export (Week 11)
- [ ] Render queue management
- [ ] Export presets
- [ ] Frame export
- [ ] Media Encoder integration

### Phase 8: Advanced Features (Week 12)
- [ ] Text animation system
- [ ] Shape/path animation
- [ ] Masks and mattes
- [ ] Asset management

### Phase 9: Polish & Documentation (Week 13)
- [ ] TypeScript definitions
- [ ] CLI tool
- [ ] SDK development
- [ ] Documentation site

### Phase 10: Testing & Release (Week 14)
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Security review
- [ ] Public release

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Tool Count | 100+ tools |
| Effect Presets | 50+ presets |
| Text Animation Presets | 30+ presets |
| API Coverage | 90% of AE features |
| Response Time | <100ms average |
| Documentation Coverage | 100% |
| Test Coverage | >80% |

---

## Conclusion

This enhancement plan transforms the After Effects MCP Server from a basic automation tool into a comprehensive, production-ready platform for AI-powered motion graphics creation. The modular architecture allows for incremental implementation while maintaining backward compatibility with existing integrations.

By following this roadmap, the project will become the definitive solution for automating After Effects workflows, enabling unprecedented creative possibilities through AI-assisted motion graphics production.

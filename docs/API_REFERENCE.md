# After Effects MCP Server - API Reference

## Table of Contents

- [Tools](#tools)
  - [Composition Tools](#composition-tools)
  - [Layer Tools](#layer-tools)
  - [Animation Tools](#animation-tools)
  - [Effect Tools](#effect-tools)
  - [3D Tools](#3d-tools)
  - [Audio Tools](#audio-tools)
  - [Render Tools](#render-tools)
  - [Project Tools](#project-tools)
  - [Text Animation Tools](#text-animation-tools)
  - [Shape Tools](#shape-tools)
  - [Mask Tools](#mask-tools)
- [Resources](#resources)
- [Prompts](#prompts)
- [Events](#events)

---

## Tools

### Composition Tools

#### `create-composition`
Create a new composition in After Effects.

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | Yes | - | Name of the composition |
| `width` | number | Yes | - | Width in pixels (1-30000) |
| `height` | number | Yes | - | Height in pixels (1-30000) |
| `pixelAspect` | number | No | 1.0 | Pixel aspect ratio |
| `duration` | number | No | 10.0 | Duration in seconds |
| `frameRate` | number | No | 30.0 | Frame rate (fps) |
| `backgroundColor` | object | No | {r:0,g:0,b:0} | RGB values (0-255) |

**Example:**
```json
{
  "name": "My Composition",
  "width": 1920,
  "height": 1080,
  "frameRate": 24,
  "duration": 30,
  "backgroundColor": { "r": 32, "g": 32, "b": 32 }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Composition created successfully",
  "composition": {
    "id": 1,
    "name": "My Composition",
    "width": 1920,
    "height": 1080,
    "duration": 30,
    "frameRate": 24
  }
}
```

---

#### `list-compositions` (via run-script)
List all compositions in the current project.

**Parameters:** None

**Response:**
```json
{
  "compositions": [
    {
      "id": 1,
      "name": "Main Comp",
      "width": 1920,
      "height": 1080,
      "duration": 30,
      "frameRate": 24,
      "numLayers": 5
    }
  ]
}
```

---

#### `duplicate-composition` (Planned)
Duplicate an existing composition.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `compIndex` | number | Yes | Source composition index |
| `newName` | string | No | Name for duplicate |

---

#### `delete-composition` (Planned)
Delete a composition from the project.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `compIndex` | number | Yes | Composition index to delete |

---

### Layer Tools

#### `create-text-layer` (via run-script)
Create a new text layer.

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `compName` | string | No | Active comp | Target composition |
| `text` | string | No | "Text Layer" | Text content |
| `position` | [x, y] | No | [960, 540] | Position in pixels |
| `fontSize` | number | No | 72 | Font size |
| `color` | [r, g, b] | No | [1, 1, 1] | RGB (0-1) |
| `fontFamily` | string | No | "Arial" | Font family name |
| `alignment` | string | No | "center" | left/center/right |
| `startTime` | number | No | 0 | Start time (seconds) |
| `duration` | number | No | 5 | Duration (seconds) |

**Example:**
```json
{
  "script": "createTextLayer",
  "parameters": {
    "compName": "Main Comp",
    "text": "Hello World",
    "position": [960, 540],
    "fontSize": 96,
    "color": [1, 0.5, 0],
    "fontFamily": "Helvetica Neue"
  }
}
```

---

#### `create-shape-layer` (via run-script)
Create a new shape layer.

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `compName` | string | No | Active comp | Target composition |
| `shapeType` | string | No | "rectangle" | rectangle/ellipse/polygon/star |
| `position` | [x, y] | No | [960, 540] | Position in pixels |
| `size` | [w, h] | No | [200, 200] | Size in pixels |
| `fillColor` | [r, g, b] | No | [1, 0, 0] | Fill RGB (0-1) |
| `strokeColor` | [r, g, b] | No | [0, 0, 0] | Stroke RGB (0-1) |
| `strokeWidth` | number | No | 0 | Stroke width |
| `points` | number | No | 5 | Points (polygon/star) |
| `name` | string | No | "Shape Layer" | Layer name |

---

#### `create-solid-layer` (via run-script)
Create a new solid or adjustment layer.

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `compName` | string | No | Active comp | Target composition |
| `color` | [r, g, b] | No | [1, 1, 1] | RGB (0-1) |
| `name` | string | No | "Solid Layer" | Layer name |
| `size` | [w, h] | No | Comp size | Size in pixels |
| `isAdjustment` | boolean | No | false | Make adjustment layer |

---

#### `create-footage-layer` (Planned)
Create a layer from imported footage.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `compIndex` | number | Yes | Target composition |
| `footagePath` | string | Yes | Path to footage file |
| `position` | [x, y] | No | Layer position |
| `scale` | [x, y] | No | Layer scale |
| `startTime` | number | No | In point |

---

#### `create-null-layer` (Planned)
Create a null object layer.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `compIndex` | number | Yes | Target composition |
| `name` | string | No | Layer name |
| `position` | [x, y, z] | No | Position |
| `is3D` | boolean | No | Make 3D layer |

---

#### `setLayerProperties` (via run-script)
Modify properties of an existing layer.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `compName` | string | No | Target composition |
| `layerName` | string | No* | Layer name |
| `layerIndex` | number | No* | Layer index (1-based) |
| `position` | [x, y] | No | New position |
| `scale` | [x, y] | No | New scale (percentage) |
| `rotation` | number | No | New rotation (degrees) |
| `opacity` | number | No | New opacity (0-100) |
| `startTime` | number | No | New start time |
| `duration` | number | No | New duration |

*Either `layerName` or `layerIndex` must be provided.

---

#### `duplicate-layer` (Planned)
Duplicate a layer.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `compIndex` | number | Yes | Composition index |
| `layerIndex` | number | Yes | Layer to duplicate |
| `count` | number | No | Number of copies |
| `offset` | [x, y] | No | Position offset per copy |

---

#### `parent-layer` (Planned)
Set layer parenting.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `compIndex` | number | Yes | Composition index |
| `childLayerIndex` | number | Yes | Child layer |
| `parentLayerIndex` | number | null | Yes | Parent layer (null to remove) |

---

#### `precompose-layers` (Planned)
Precompose selected layers.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `compIndex` | number | Yes | Source composition |
| `layerIndices` | number[] | Yes | Layers to precompose |
| `newCompName` | string | Yes | New composition name |
| `moveAttributes` | boolean | No | Move attributes into new comp |

---

### Animation Tools

#### `setLayerKeyframe`
Set a keyframe for a layer property.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `compIndex` | number | Yes | Composition index (1-based) |
| `layerIndex` | number | Yes | Layer index (1-based) |
| `propertyName` | string | Yes | Property name (e.g., "Position") |
| `timeInSeconds` | number | Yes | Time for keyframe |
| `value` | any | Yes | Value at keyframe |

**Supported Properties:**
- Transform: `Position`, `Scale`, `Rotation`, `Opacity`, `Anchor Point`
- 3D: `X Rotation`, `Y Rotation`, `Z Rotation`, `Orientation`

**Example:**
```json
{
  "compIndex": 1,
  "layerIndex": 1,
  "propertyName": "Position",
  "timeInSeconds": 2.0,
  "value": [1500, 540]
}
```

---

#### `setLayerExpression`
Set or remove an expression on a layer property.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `compIndex` | number | Yes | Composition index |
| `layerIndex` | number | Yes | Layer index |
| `propertyName` | string | Yes | Property name |
| `expressionString` | string | Yes | Expression (empty to remove) |

**Example:**
```json
{
  "compIndex": 1,
  "layerIndex": 1,
  "propertyName": "Position",
  "expressionString": "wiggle(3, 50)"
}
```

---

#### `set-keyframes` (Planned)
Set multiple keyframes with easing.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `compIndex` | number | Yes | Composition index |
| `layerIndex` | number | Yes | Layer index |
| `propertyPath` | string | Yes | Full property path |
| `keyframes` | array | Yes | Array of keyframe objects |

**Keyframe Object:**
```json
{
  "time": 1.0,
  "value": [960, 540],
  "easing": {
    "type": "bezier",
    "inInfluence": 33,
    "outInfluence": 33
  }
}
```

---

#### `apply-easing-preset` (Planned)
Apply easing preset to keyframe.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `compIndex` | number | Yes | Composition index |
| `layerIndex` | number | Yes | Layer index |
| `propertyPath` | string | Yes | Property path |
| `keyframeIndex` | number | Yes | Keyframe index |
| `preset` | string | Yes | Easing preset name |

**Presets:**
- `linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out`
- `bounce`, `elastic`, `back-in`, `back-out`
- `anticipation`, `overshoot`

---

#### `apply-expression-template` (Planned)
Apply predefined expression templates.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `compIndex` | number | Yes | Composition index |
| `layerIndex` | number | Yes | Layer index |
| `propertyPath` | string | Yes | Property path |
| `template` | string | Yes | Template name |
| `parameters` | object | No | Template parameters |

**Templates:**
- `wiggle` - Random movement
- `bounce` - Bounce effect
- `elastic` - Elastic settling
- `loop-cycle` - Loop animation
- `loop-pingpong` - Ping-pong loop
- `typewriter` - Typewriter text effect
- `counter` - Number counter
- `audio-reactive` - React to audio

---

### Effect Tools

#### `apply-effect`
Apply an effect to a layer.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `compIndex` | number | Yes | Composition index |
| `layerIndex` | number | Yes | Layer index |
| `effectName` | string | No* | Effect display name |
| `effectMatchName` | string | No* | Effect match name |
| `effectSettings` | object | No | Effect property values |

*Either `effectName` or `effectMatchName` must be provided.

**Example:**
```json
{
  "compIndex": 1,
  "layerIndex": 1,
  "effectMatchName": "ADBE Gaussian Blur 2",
  "effectSettings": {
    "Blurriness": 25
  }
}
```

---

#### `apply-effect-template`
Apply a predefined effect template.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `compIndex` | number | Yes | Composition index |
| `layerIndex` | number | Yes | Layer index |
| `templateName` | string | Yes | Template name |
| `customSettings` | object | No | Override default settings |

**Available Templates:**
- `gaussian-blur` - Gaussian blur effect
- `directional-blur` - Directional blur
- `color-balance` - HLS color balance
- `brightness-contrast` - Brightness/contrast
- `curves` - Curves adjustment
- `glow` - Glow effect
- `drop-shadow` - Drop shadow
- `cinematic-look` - Cinematic color grade
- `text-pop` - Text enhancement

---

#### `apply-lut` (Planned)
Apply a LUT file to a layer.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `compIndex` | number | Yes | Composition index |
| `layerIndex` | number | Yes | Layer index |
| `lutPath` | string | Yes | Path to LUT file |
| `intensity` | number | No | Effect intensity (0-100) |

---

### 3D Tools

#### `create-camera` (Planned)
Create a camera layer.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `compIndex` | number | Yes | Composition index |
| `name` | string | No | Camera name |
| `type` | string | Yes | "one-node" or "two-node" |
| `zoom` | number | No | Zoom value |
| `position` | [x, y, z] | No | Camera position |
| `pointOfInterest` | [x, y, z] | No | Point of interest |
| `depthOfField` | boolean | No | Enable DOF |
| `focusDistance` | number | No | Focus distance |
| `aperture` | number | No | Aperture value |

---

#### `create-light` (Planned)
Create a light layer.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `compIndex` | number | Yes | Composition index |
| `name` | string | No | Light name |
| `lightType` | string | Yes | parallel/spot/point/ambient |
| `color` | [r, g, b] | No | Light color |
| `intensity` | number | No | Light intensity |
| `coneAngle` | number | No | Spot light cone angle |
| `castsShadows` | boolean | No | Enable shadows |

---

#### `convert-to-3d` (Planned)
Convert a 2D layer to 3D.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `compIndex` | number | Yes | Composition index |
| `layerIndex` | number | Yes | Layer index |
| `autoOrient` | string | No | off/towards-camera/along-path |

---

### Audio Tools

#### `create-audio-layer` (Planned)
Import and add an audio layer.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `compIndex` | number | Yes | Composition index |
| `audioPath` | string | Yes | Path to audio file |
| `startTime` | number | No | Start time |
| `inPoint` | number | No | Audio in point |
| `outPoint` | number | No | Audio out point |
| `audioLevels` | number | No | Volume in dB |

---

#### `analyze-audio` (Planned)
Analyze audio for visualization/sync.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `compIndex` | number | Yes | Composition index |
| `layerIndex` | number | Yes | Audio layer index |
| `analysisType` | string | Yes | amplitude/frequency/beat |
| `timeRange` | object | No | Start/end times |

---

### Render Tools

#### `add-to-render-queue` (Planned)
Add composition to render queue.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `compIndex` | number | Yes | Composition index |
| `outputPath` | string | Yes | Output file path |
| `outputModule` | string | No | Output module template |
| `renderSettings` | string | No | Render settings template |

---

#### `export-composition` (Planned)
Export composition with preset.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `compIndex` | number | Yes | Composition index |
| `preset` | string | Yes | Export preset name |
| `outputPath` | string | Yes | Output file path |
| `frameRange` | object | No | Start/end frames |

**Presets:**
- `h264-high-quality`, `h264-youtube`, `h264-instagram`
- `prores-422`, `prores-4444`
- `png-sequence`, `exr-sequence`
- `gif-high-quality`

---

#### `export-frame` (Planned)
Export a single frame.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `compIndex` | number | Yes | Composition index |
| `time` | number | Yes | Time in seconds |
| `format` | string | Yes | png/jpg/tiff/psd/exr |
| `outputPath` | string | Yes | Output file path |
| `resolution` | string | No | full/half/third/quarter |

---

### Project Tools

#### `get-project-info` (via run-script)
Get current project information.

**Response:**
```json
{
  "projectName": "My Project.aep",
  "path": "/path/to/project.aep",
  "numItems": 15,
  "bitsPerChannel": 16,
  "itemCounts": {
    "compositions": 3,
    "footage": 10,
    "folders": 2
  },
  "activeComp": {
    "name": "Main Comp",
    "width": 1920,
    "height": 1080
  }
}
```

---

#### `save-project` (Planned)
Save the current project.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `savePath` | string | No | New save path |

---

#### `import-file` (Planned)
Import a file into the project.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filePath` | string | Yes | Path to file |
| `importAs` | string | No | footage/composition |
| `sequence` | boolean | No | Import as sequence |
| `folderIndex` | number | No | Target folder |

---

### Text Animation Tools

#### `add-text-animator` (Planned)
Add a text animator to a text layer.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `compIndex` | number | Yes | Composition index |
| `layerIndex` | number | Yes | Text layer index |
| `animatorType` | string | Yes | Property to animate |
| `rangeSelector` | object | No | Range selector config |

---

#### `apply-text-animation-preset` (Planned)
Apply text animation preset.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `compIndex` | number | Yes | Composition index |
| `layerIndex` | number | Yes | Text layer index |
| `preset` | string | Yes | Preset name |
| `duration` | number | No | Animation duration |

---

### Shape Tools

#### `add-shape-modifier` (Planned)
Add a modifier to a shape layer.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `compIndex` | number | Yes | Composition index |
| `layerIndex` | number | Yes | Shape layer index |
| `modifier` | string | Yes | Modifier type |
| `settings` | object | No | Modifier settings |

**Modifiers:**
- `trim-paths`, `pucker-bloat`, `repeater`
- `round-corners`, `wiggle-paths`, `twist`
- `zig-zag`, `offset-paths`, `merge-paths`

---

### Mask Tools

#### `create-mask` (Planned)
Create a mask on a layer.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `compIndex` | number | Yes | Composition index |
| `layerIndex` | number | Yes | Layer index |
| `maskType` | string | Yes | rectangle/ellipse/path |
| `maskData` | object | Yes | Mask shape data |
| `mode` | string | No | Mask mode |
| `feather` | number | No | Feather amount |
| `opacity` | number | No | Mask opacity |

---

## Resources

### `compositions`
**URI:** `aftereffects://compositions`

Returns list of all compositions in the project.

---

### `project-state` (Planned)
**URI:** `aftereffects://project/state`

Returns current project state including active composition, selection, etc.

---

### `available-effects` (Planned)
**URI:** `aftereffects://effects/list`

Returns list of all available effects.

---

### `available-fonts` (Planned)
**URI:** `aftereffects://fonts/list`

Returns list of all available fonts.

---

## Prompts

### `list-compositions`
Prompt to list all compositions in the project.

### `analyze-composition`
**Arguments:**
- `compositionName` - Name of composition to analyze

### `create-composition`
Prompt to create a new composition with guidance.

---

## Events (Planned)

### `composition:changed`
Fired when a composition is modified.

### `layer:added`
Fired when a layer is added to a composition.

### `layer:removed`
Fired when a layer is removed from a composition.

### `selection:changed`
Fired when the layer selection changes.

### `render:progress`
Fired during render with progress updates.

### `render:complete`
Fired when render completes.

---

## Effect Match Names Reference

### Blur & Sharpen
| Display Name | Match Name |
|--------------|------------|
| Gaussian Blur | `ADBE Gaussian Blur 2` |
| Camera Lens Blur | `ADBE Camera Lens Blur` |
| Directional Blur | `ADBE Directional Blur` |
| Radial Blur | `ADBE Radial Blur` |

### Color Correction
| Display Name | Match Name |
|--------------|------------|
| Brightness & Contrast | `ADBE Brightness & Contrast 2` |
| Color Balance | `ADBE Color Balance (HLS)` |
| Curves | `ADBE CurvesCustom` |
| Hue/Saturation | `ADBE HUE SATURATION` |
| Levels | `ADBE Pro Levels2` |
| Vibrance | `ADBE Vibrance` |

### Stylize
| Display Name | Match Name |
|--------------|------------|
| Glow | `ADBE Glow` |
| Drop Shadow | `ADBE Drop Shadow` |
| Fractal Noise | `ADBE Fractal Noise` |

---

## Error Codes

| Code | Description |
|------|-------------|
| `COMP_NOT_FOUND` | Composition not found at specified index |
| `LAYER_NOT_FOUND` | Layer not found at specified index |
| `EFFECT_NOT_FOUND` | Effect not found |
| `PROPERTY_NOT_FOUND` | Property not found |
| `INVALID_PARAMETERS` | Invalid parameters provided |
| `AE_NOT_RUNNING` | After Effects not running |
| `BRIDGE_NOT_OPEN` | MCP Bridge panel not open |
| `TIMEOUT` | Operation timed out |

# Text and Shapes Guide for After Effects MCP

This skill covers creating and animating text layers and shape layers.

## Text Layers

### Create Text Layer

```
Tool: create-text-layer (via run-script "createTextLayer")
Parameters:
  - compIndex: number
  - text: string
  - position: [x, y]
  - fontSize: number
  - color: {r, g, b} (0-255)
  - font: string (optional, e.g., "Arial-BoldMT")
```

### Set Text Content

```
Tool: set-text-content
Parameters:
  - compIndex: number
  - layerIndex: number
  - text: string
```

### Set Text Style

```
Tool: set-text-style
Parameters:
  - compIndex: number
  - layerIndex: number
  - font: string (PostScript name)
  - fontSize: number
  - fillColor: {r, g, b}
  - strokeColor: {r, g, b} (optional)
  - strokeWidth: number (optional)
  - tracking: number (letter spacing)
  - leading: number (line spacing)
  - justification: "left" | "center" | "right"
  - baselineShift: number
  - faux: { bold: boolean, italic: boolean }
```

### List Available Fonts

```
Tool: list-available-fonts
```
Returns all fonts available in After Effects.

## Text Animators

Text animators allow per-character animation.

### Add Text Animator

```
Tool: add-text-animator
Parameters:
  - compIndex: number
  - layerIndex: number
  - animatorName: string
  - property: "position" | "scale" | "rotation" | "opacity" | "tracking" | "skew"
  - value: any (depends on property)
  - rangeType: "characters" | "words" | "lines"
  - rangeStart: number (0-100%)
  - rangeEnd: number (0-100%)
  - rangeOffset: number (animate through text)
```

### Text Animation Presets

```
Tool: apply-text-animation
Parameters:
  - compIndex: number
  - layerIndex: number
  - animation: "typewriter" | "fadeInByCharacter" | "fadeInByWord" |
               "scaleInByCharacter" | "slideInByWord" | "randomFadeIn"
  - duration: number (seconds)
  - delay: number (between characters/words)
  - direction: "forward" | "reverse" | "center" | "random"
```

## Text Animation Examples

### Typewriter Effect
```
apply-text-animation:
  animation: "typewriter"
  duration: 2
  direction: "forward"
```

### Fade In By Word
```
apply-text-animation:
  animation: "fadeInByWord"
  duration: 1.5
  delay: 0.1
```

### Scale Pop Per Character
```
add-text-animator:
  property: "scale"
  value: [0, 0]
  rangeType: "characters"
Then animate rangeOffset from 0 to 100
```

## Shape Layers

### Create Shape Layer

```
Tool: create-shape-layer (via run-script "createShapeLayer")
Parameters:
  - compIndex: number
  - shapeType: "rectangle" | "ellipse"
  - size: [width, height]
  - position: [x, y]
  - fillColor: {r, g, b}
  - strokeColor: {r, g, b} (optional)
  - strokeWidth: number (optional)
  - name: string (optional)
```

### Add Shape Path

```
Tool: add-shape-path
Parameters:
  - compIndex: number
  - layerIndex: number
  - vertices: [[x,y], [x,y], ...] (path points)
  - inTangents: [[x,y], ...] (bezier handles)
  - outTangents: [[x,y], ...]
  - closed: boolean
```

Example - triangle:
```json
{
  "vertices": [[0, -50], [50, 50], [-50, 50]],
  "inTangents": [[0,0], [0,0], [0,0]],
  "outTangents": [[0,0], [0,0], [0,0]],
  "closed": true
}
```

### Shape Modifiers

```
Tool: add-shape-modifier
Parameters:
  - compIndex: number
  - layerIndex: number
  - modifier: "trim" | "zigzag" | "pucker" | "twist" | "wiggle" | "roundCorners"
  - settings: object
```

Modifier settings:

**Trim Paths:**
```json
{ "start": 0, "end": 100, "offset": 0 }
```

**Round Corners:**
```json
{ "radius": 10 }
```

**Zigzag:**
```json
{ "size": 10, "ridges": 5, "points": "smooth" }
```

**Pucker & Bloat:**
```json
{ "amount": 50 }
```

### Animate Shape Path

```
Tool: animate-shape-path
Parameters:
  - compIndex: number
  - layerIndex: number
  - pathKeyframes: [
      { time: 0, vertices: [...], inTangents: [...], outTangents: [...] },
      { time: 1, vertices: [...], inTangents: [...], outTangents: [...] }
    ]
```

## Shape Animation Examples

### Line Draw (Trim Paths)
```
1. Create shape with stroke
2. add-shape-modifier: "trim"
3. Animate "end" from 0 to 100
```

### Morphing Shapes
```
1. Create shape layer
2. animate-shape-path with different vertex positions at keyframes
```

### Pulsing Circle
```
1. Create ellipse shape
2. Animate Scale: 100% → 110% → 100% with easeInOut
3. Or use expression: scale + Math.sin(time*4)*10
```

## Masks

Masks are shapes that control layer visibility.

### Create Mask

```
Tool: create-mask
Parameters:
  - compIndex: number
  - layerIndex: number
  - maskShape: "rectangle" | "ellipse" | "custom"
  - maskMode: "add" | "subtract" | "intersect" | "lighten" | "darken" | "difference"
  - maskData: { vertices, inTangents, outTangents } (for custom)
  - feather: number (edge softness)
  - opacity: number (0-100)
  - expansion: number (grow/shrink)
  - inverted: boolean
```

### Mask Properties

```
Tool: mask-set-properties
Parameters:
  - compIndex, layerIndex, maskIndex
  - mode, feather, opacity, expansion, inverted
```

### Animate Mask

```
Tool: mask-keyframe
Parameters:
  - compIndex, layerIndex, maskIndex
  - time: number
  - vertices, inTangents, outTangents
```

### Mask Animation Presets

```
Tool: apply-mask-animation
Parameters:
  - compIndex: number
  - layerIndex: number
  - animation: "revealLeft" | "revealRight" | "revealTop" | "revealBottom" |
               "irisIn" | "irisOut" | "wipeCircle"
  - duration: number
  - startTime: number
  - reverse: boolean
```

### Remove Mask

```
Tool: mask-remove
Parameters:
  - compIndex, layerIndex, maskIndex
```

## Common Patterns

### Animated Lower Third
```
1. Create text layer (name)
2. Create shape layer (bar/background)
3. Add trim paths to shape, animate 0→100
4. Offset text animation slightly after shape
5. Parent both to null for easy positioning
```

### Logo Reveal
```
1. Import/create logo
2. Create mask on logo
3. apply-mask-animation: "revealRight"
4. Add glow effect timed with reveal
```

### Kinetic Typography
```
1. Create multiple text layers (one per word/phrase)
2. Use stagger-animation for timing
3. Apply different text-animation presets
4. Parent to camera for movement
```

## Best Practices

1. **Use shape layers for graphics** - They're resolution-independent
2. **Separate text by animation need** - Different words = different layers if animated differently
3. **Precompose complex shapes** - Easier to manage and cache
4. **Name your shapes/masks** - Default names get confusing fast
5. **Use trim paths for reveals** - More control than mask animations
6. **Effects on shapes** - Convert to bezier paths first, or use a solid with the shape as a mask

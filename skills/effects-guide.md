# Effects Guide for After Effects MCP

This skill covers applying and managing effects on layers.

## Important: Effect-Compatible Layers

Effects can ONLY be applied to:
- ✅ Solid layers
- ✅ Text layers
- ✅ Footage layers
- ✅ Adjustment layers

Effects CANNOT be applied to:
- ❌ Shape layers
- ❌ Null objects
- ❌ Cameras
- ❌ Lights

## Applying Effects

### Basic Effect Application

```
Tool: apply-effect
Parameters:
  - compIndex or compName
  - layerIndex or layerName
  - effectName: string (display name, e.g., "Gaussian Blur")
  - effectMatchName: string (internal name, e.g., "ADBE Gaussian Blur 2")
  - effectCategory: string (optional, e.g., "Blur & Sharpen")
  - effectSettings: object (property values)
```

### Effect Templates (Presets)

```
Tool: apply-effect-template
Parameters:
  - compIndex or compName
  - layerIndex or layerName
  - templateName: string
  - customSettings: object (optional overrides)
```

Available templates:
- `gaussian-blur` - Simple Gaussian blur
- `directional-blur` - Motion blur in direction
- `color-balance` - Hue, lightness, saturation
- `brightness-contrast` - Basic exposure adjustment
- `curves` - Advanced color curves
- `glow` - Add glow effect
- `drop-shadow` - Customizable shadow
- `cinematic-look` - Film-style color grade
- `text-pop` - Glow + shadow for text

### Effect Presets

```
Tool: apply-effect-preset
Parameters:
  - compIndex or compName
  - layerIndex or layerName
  - preset: string
  - intensity: number (0-100, optional)
  - customSettings: object (optional)
```

## Common Effects Reference

### Blur Effects
```
Gaussian Blur:
  - effectMatchName: "ADBE Gaussian Blur 2"
  - settings: { "Blurriness": 20 }

Directional Blur:
  - effectMatchName: "ADBE Motion Blur"
  - settings: { "Direction": 45, "Blur Length": 30 }

Fast Box Blur:
  - effectMatchName: "ADBE Box Blur2"
  - settings: { "Blur Radius": 10 }
```

### Color Correction
```
Curves:
  - effectMatchName: "ADBE CurvesCustom"

Levels:
  - effectMatchName: "ADBE Pro Levels2"

Hue/Saturation:
  - effectMatchName: "ADBE HUE SATURATION"
  - settings: { "Master Saturation": 20 }

Brightness & Contrast:
  - effectMatchName: "ADBE Brightness & Contrast 2"
  - settings: { "Brightness": 10, "Contrast": 20 }

Tint:
  - effectMatchName: "ADBE Tint"
  - settings: { "Map Black To": [0,0,0], "Map White To": [255,200,150] }
```

### Stylize
```
Glow:
  - effectMatchName: "ADBE Glo2"
  - settings: { "Glow Threshold": 60, "Glow Radius": 20, "Glow Intensity": 1 }

Drop Shadow:
  - effectMatchName: "ADBE Drop Shadow"
  - settings: { "Opacity": 75, "Direction": 135, "Distance": 10, "Softness": 15 }

Stroke:
  - effectMatchName: "ADBE Stroke"
```

### Distort
```
Transform:
  - effectMatchName: "ADBE Geometry2"

Turbulent Displace:
  - effectMatchName: "ADBE Turbulent Displace"

Warp:
  - effectMatchName: "ADBE WARP"
```

### Generate
```
Fill:
  - effectMatchName: "ADBE Fill"
  - settings: { "Color": [255, 0, 0] }

Gradient Ramp:
  - effectMatchName: "ADBE Ramp"

4-Color Gradient:
  - effectMatchName: "ADBE 4ColorGradient"
```

## Managing Effects

### Set Effect Property

```
Tool: effect-set-property
Parameters:
  - compIndex or compName
  - layerIndex or layerName
  - effectIndex: number (1-based)
  - propertyName: string
  - value: any
```

### Animate Effect Property

```
Tool: effect-keyframe
Parameters:
  - compIndex or compName
  - layerIndex or layerName
  - effectIndex: number
  - propertyName: string
  - time: number (seconds)
  - value: any
```

### Toggle Effect

```
Tool: effect-toggle
Parameters:
  - compIndex: number
  - layerIndex: number
  - effectIndex: number
  - enabled: boolean
```

### Duplicate Effect

```
Tool: effect-duplicate
Parameters:
  - compIndex: number
  - layerIndex: number
  - effectIndex: number
```

### Remove Effect

```
Tool: effect-remove
Parameters:
  - compIndex: number
  - layerIndex: number
  - effectIndex: number
```

## Adjustment Layers

Adjustment layers apply effects to all layers below them.

```
Tool: create-adjustment-layer
Parameters:
  - compIndex: number
  - name: string (optional)
  - duration: number (optional)
```

Common workflow:
1. Create adjustment layer
2. Apply color correction effects
3. All layers below are affected

## Effect Animation Examples

### Blur In/Out
```
1. Apply Gaussian Blur
2. effect-keyframe: time=0, Blurriness=50
3. effect-keyframe: time=0.5, Blurriness=0
```

### Color Fade
```
1. Apply Tint effect
2. effect-keyframe: time=0, "Amount to Tint"=100
3. effect-keyframe: time=1, "Amount to Tint"=0
```

### Glow Pulse
```
1. Apply Glow
2. Set expression on Glow Intensity:
   "Math.sin(time * 4) * 0.5 + 1"
```

## Best Practices

1. **Use adjustment layers** for global color correction
2. **Order matters** - effects are processed top to bottom
3. **Name your effects** for complex stacks
4. **Disable unused effects** to improve performance
5. **Pre-compose heavy effects** to cache renders
6. **Check layer type** before applying effects (no shape/null/camera/light)

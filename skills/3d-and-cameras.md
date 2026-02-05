# 3D, Cameras, and Lights Guide for After Effects MCP

This skill covers 3D layers, cameras, lights, and 3D animation in After Effects.

## Converting Layers to 3D

### Enable 3D on Layer

```
Tool: convert-to-3d
Parameters:
  - compIndex: number
  - layerIndex: number
  - enable3D: boolean
```

Once 3D is enabled, layers have:
- Position: [x, y, z]
- Rotation: X Rotation, Y Rotation, Z Rotation
- Orientation: [x, y, z]
- Material options (for lighting)

## 3D Transform Properties

### Set 3D Position

```
Tool: set-3d-position
Parameters:
  - compIndex: number
  - layerIndex: number
  - x: number
  - y: number
  - z: number (negative = closer to camera)
```

### Set 3D Rotation

```
Tool: set-3d-rotation
Parameters:
  - compIndex: number
  - layerIndex: number
  - xRotation: number (degrees, pitch)
  - yRotation: number (degrees, yaw)
  - zRotation: number (degrees, roll)
  - orientation: [x, y, z] (optional, for smooth rotation)
```

### Auto-Orient

```
Tool: layer-auto-orient
Parameters:
  - compIndex: number
  - layerIndex: number
  - orientation: "none" | "alongPath" | "towardsCamera" | "towardsPointOfInterest"
```

## Cameras

### Create Camera

```
Tool: create-camera
Parameters:
  - compIndex or compName
  - name: string (optional)
  - cameraType: "oneNode" | "twoNode"
  - position: [x, y, z]
  - pointOfInterest: [x, y, z] (for twoNode)
  - zoom: number (focal length in pixels)

  Depth of Field (optional):
  - depthOfField: boolean
  - focusDistance: number
  - aperture: number
  - blurLevel: number
```

Camera types:
- **oneNode**: Free camera, rotates around its own anchor
- **twoNode**: Has point of interest, always looks at POI

### Common Camera Presets

```
Wide angle: zoom: 400
Standard: zoom: 800
Telephoto: zoom: 1600

Position for 1080p comp center:
position: [960, 540, -1500]
pointOfInterest: [960, 540, 0]
```

### Camera Animation

Animate camera Position and Point of Interest for:
- **Dolly**: Move camera Z position
- **Truck**: Move camera X position
- **Pedestal**: Move camera Y position
- **Pan**: Move Point of Interest X
- **Tilt**: Move Point of Interest Y
- **Zoom**: Animate zoom property

## Lights

### Create Light

```
Tool: create-light
Parameters:
  - compIndex or compName
  - name: string (optional)
  - lightType: "parallel" | "spot" | "point" | "ambient"
  - position: [x, y, z]
  - pointOfInterest: [x, y, z] (for spot/parallel)
  - intensity: number (100 = default)
  - color: [r, g, b] (0-255)

  For Spot lights:
  - coneAngle: number (degrees)
  - coneFeather: number (percentage)

  Shadows (optional):
  - castsShadows: boolean
  - shadowDarkness: number (0-100)
  - shadowDiffusion: number
```

Light types:
- **Ambient**: Even illumination everywhere
- **Parallel**: Distant light (like sun), parallel rays
- **Spot**: Cone of light, like a flashlight
- **Point**: Radiates in all directions, like a bulb

### Light Setup Examples

**Basic 3-Point Lighting:**
```
Key Light (main):
  lightType: "spot"
  position: [500, 300, -800]
  intensity: 150

Fill Light (soften shadows):
  lightType: "point"
  position: [1400, 600, -500]
  intensity: 50

Back Light (rim/separation):
  lightType: "spot"
  position: [960, 200, 500]
  intensity: 80
```

**Ambient + Key:**
```
Ambient (base illumination):
  lightType: "ambient"
  intensity: 30

Key Light:
  lightType: "spot"
  intensity: 100
  castsShadows: true
```

## Material Options

Control how 3D layers interact with lights.

```
Tool: set-material-options
Parameters:
  - compIndex: number
  - layerIndex: number
  - castsShadows: boolean
  - acceptsShadows: boolean
  - acceptsLights: boolean
  - ambient: number (0-100)
  - diffuse: number (0-100)
  - specularIntensity: number (0-100)
  - specularShininess: number (0-100)
  - metal: number (0-100)
```

Material presets:

**Matte (flat):**
```
diffuse: 100, specularIntensity: 0
```

**Plastic:**
```
diffuse: 80, specularIntensity: 50, specularShininess: 20
```

**Metal:**
```
diffuse: 50, specularIntensity: 80, specularShininess: 80, metal: 100
```

## 3D Animation Patterns

### Camera Fly-Through
```
1. Create twoNode camera
2. Position layers in 3D space (different Z values)
3. Animate camera Z position from far to close
4. Add easeInOut for smooth motion
```

### Orbit Around Object
```
1. Create null at center point
2. Parent camera to null
3. Animate null's Y Rotation 0 → 360
4. Camera orbits around center
```

### Parallax Effect
```
1. Place layers at different Z depths
2. Background: z = 500
3. Midground: z = 0
4. Foreground: z = -300
5. Animate camera X position slightly
6. Layers move at different speeds
```

### Card Flip
```
1. Convert layer to 3D
2. Animate Y Rotation: 0 → 180 (or -180)
3. Add easeInOut
4. Optional: scale slightly at 90° for depth
```

### 3D Text Extrusion Look
```
1. Duplicate text layer multiple times
2. Offset each copy's Z position by 1-2px
3. Darken back copies
4. Creates fake 3D depth
```

## Depth of Field

```
1. Create camera with depthOfField: true
2. Set focusDistance to subject Z position
3. Adjust aperture (higher = more blur)
4. Animate focusDistance for rack focus
```

### Rack Focus Example
```
1. Subject A at z = 0
2. Subject B at z = -500
3. Camera focusDistance keyframes:
   - time 0: focusDistance = 1500 (focus on A)
   - time 1: focusDistance = 1000 (focus on B)
```

## Best Practices

1. **Use null objects** for camera rigs - parent camera to null for easier control
2. **Start simple** with lights - ambient + one key light, add more as needed
3. **Mind the render time** - 3D, shadows, and DOF increase render times
4. **Collapse transformations** on precomps to maintain 3D in parent comp
5. **Use 3D sparingly** - not every layer needs to be 3D
6. **Camera distance matters** - too close = distortion, too far = flat
7. **Animate Point of Interest** for smooth camera looks, not rotation
8. **Check multiple angles** - use custom views to verify 3D positioning

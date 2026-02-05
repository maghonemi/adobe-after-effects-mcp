# Animation Basics for After Effects MCP

This skill covers keyframe animation, easing, motion paths, and animation workflows.

## Understanding Keyframes

Keyframes mark specific values at specific times. After Effects interpolates between keyframes to create animation.

### Property Paths

Common animatable properties:
- `Position` - [x, y] or [x, y, z] for 3D layers
- `Scale` - [x, y] percentage (100 = 100%)
- `Rotation` - degrees
- `Opacity` - 0-100
- `Anchor Point` - [x, y]

## Setting Keyframes

### Single Keyframe

```
Tool: setLayerKeyframe
Parameters:
  - compIndex: number
  - layerIndex: number
  - propertyName: string (e.g., "Position", "Scale", "Opacity")
  - timeInSeconds: number
  - value: any (depends on property type)
```

Examples:
```
Position at 0s: value: [960, 540]
Position at 1s: value: [1500, 540]

Scale at 0s: value: [0, 0]
Scale at 1s: value: [100, 100]

Opacity at 0s: value: 0
Opacity at 1s: value: 100
```

### Multiple Keyframes

```
Tool: set-keyframes
Parameters:
  - compIndex: number
  - layerIndex: number
  - propertyPath: string
  - keyframes: array of {time, value, easing?}
```

Example - fade in and out:
```json
{
  "compIndex": 1,
  "layerIndex": 1,
  "propertyPath": "Opacity",
  "keyframes": [
    {"time": 0, "value": 0},
    {"time": 0.5, "value": 100, "easing": "easeOut"},
    {"time": 2.5, "value": 100},
    {"time": 3, "value": 0, "easing": "easeIn"}
  ]
}
```

## Easing and Interpolation

### Apply Easing

```
Tool: apply-easing
Parameters:
  - compIndex: number
  - layerIndex: number
  - propertyPath: string
  - keyframeIndices: [array] (1-based)
  - easing: "linear" | "easeIn" | "easeOut" | "easeInOut" | "hold"
  - influence: number (0-100, optional)
```

### Easing Types

- **linear**: Constant speed, mechanical feel
- **easeIn**: Starts slow, accelerates (good for exits)
- **easeOut**: Starts fast, decelerates (good for entrances)
- **easeInOut**: Slow start, fast middle, slow end (natural movement)
- **hold**: No interpolation, jumps to next value

### Get/Set Keyframe Interpolation

```
Tool: get-keyframe-interpolation / set-keyframe-interpolation
Parameters:
  - compIndex, layerIndex, propertyName, keyframeIndex
  - interpolation: "linear" | "bezier" | "hold"
```

## Keyframe Management

```
Tool: keyframe-get-all    - Get all keyframes for a property
Tool: keyframe-remove     - Remove specific keyframe by index
Tool: keyframe-remove-all - Remove all keyframes from property
Tool: keyframe-reverse    - Reverse keyframe order
```

## Motion Paths

```
Tool: create-motion-path
Parameters:
  - compIndex, layerIndex
  - pathType: "linear" | "circular" | "custom"
  - duration: number (seconds)
  - orientToPath: boolean

  For linear: points: [[x1,y1], [x2,y2], ...]
  For circular: center: [x,y], radius: number, turns: number
```

## Animation Presets

```
Tool: create-animation-preset
Parameters:
  - compIndex, layerIndex
  - preset: "fadeIn" | "fadeOut" | "scaleUp" | "scaleDown" |
            "slideInLeft" | "slideInRight" | "slideInTop" | "slideInBottom" |
            "bounceIn" | "spinIn"
  - duration: number
  - startTime: number
```

## Sequencing and Staggering

### Sequence Layers
```
Tool: sequence-layers
Parameters:
  - compIndex: number
  - layerIndices: [array]
  - overlap: number (seconds, negative for gaps)
  - reverse: boolean
```

### Stagger Animation
```
Tool: stagger-animation
Parameters:
  - compIndex: number
  - layerIndices: [array]
  - property: string
  - startValue, endValue: any
  - duration: number (per layer)
  - delay: number (between layers)
```

## Copy Animation

```
Tool: copy-animation
Parameters:
  - sourceCompIndex, sourceLayerIndex, sourceProperty
  - targetCompIndex, targetLayerIndex, targetProperty
  - timeOffset: number (shift keyframes)
```

## Time Remapping

```
Tool: enable-time-remapping - Enable on layer
Tool: set-time-remap-keyframe - Set remap point
Tool: apply-time-effect
  - effect: "freeze" | "reverse" | "loop" | "pingpong" | "slowmo"
```

## Common Animation Patterns

### Fade In
```
1. setLayerKeyframe: Opacity, time=0, value=0
2. setLayerKeyframe: Opacity, time=0.5, value=100
3. apply-easing: keyframeIndices=[2], easing="easeOut"
```

### Pop In (Scale with Overshoot)
```
set-keyframes:
  - time=0, value=[0,0]
  - time=0.3, value=[110,110]
  - time=0.4, value=[100,100]
Apply easeOut to all
```

### Slide and Fade
```
Position: offset → final (easeOut)
Opacity: 0 → 100 (easeOut)
```

## Best Practices

1. **Always ease keyframes** - Linear motion looks mechanical
2. **Offset properties** - Don't animate everything at the same time
3. **Follow through** - Add slight overshoot for organic motion
4. **Use null objects** - Parent multiple layers for coordinated animation
5. **Keep it simple** - Fewer, well-timed keyframes beat many complex ones

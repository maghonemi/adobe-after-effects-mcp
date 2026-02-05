# After Effects MCP Core Concepts

This skill covers the fundamental concepts and tools for working with the After Effects MCP integration.

## Project Structure

After Effects projects are organized hierarchically:
- **Project**: The top-level container holding all assets
- **Compositions**: Timeline containers where you arrange and animate layers
- **Layers**: Individual elements (footage, shapes, text, solids, etc.) within compositions
- **Properties**: Animatable attributes of layers (position, scale, opacity, etc.)

## Essential Tools Overview

### Getting Project Info

```
Tool: get-scene-summary
```
Returns: active composition, current time, layer count, selected layers, render queue length.

```
Tool: list-compositions (via run-script)
```
Returns all compositions in the project with their settings.

### Creating Compositions

```
Tool: create-composition
Parameters:
  - name: string (required)
  - width: number (pixels)
  - height: number (pixels)
  - duration: number (seconds)
  - frameRate: number (fps)
  - backgroundColor: {r, g, b} (0-255)
```

Common presets:
- 1080p: 1920x1080, 29.97fps
- 4K: 3840x2160, 29.97fps
- Square (social): 1080x1080, 30fps
- Vertical (mobile): 1080x1920, 30fps

### Setup Project (Quick Start)

```
Tool: setup-project
Parameters:
  - name: string
  - width: number
  - height: number
  - duration: number
  - frameRate: number
  - backgroundColor: {r, g, b} (optional)
  - setAsActive: boolean
```
Creates a composition with given settings in one call.

## Layer Types

### Creating Layers

**Solid Layer**
```
Tool: create-solid-layer (via run-script "createSolidLayer")
Parameters:
  - compIndex: number
  - name: string
  - color: {r, g, b}
  - width, height: number (optional, defaults to comp size)
```

**Text Layer**
```
Tool: create-text-layer (via run-script "createTextLayer")
Parameters:
  - compIndex: number
  - text: string
  - position: [x, y]
  - fontSize: number
  - color: {r, g, b}
```

**Shape Layer**
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
```

**Null Object**
```
Tool: create-null-layer
Parameters:
  - compIndex: number (or compName: string)
  - name: string (optional)
  - position: [x, y, z] (optional)
  - is3D: boolean (optional)
```
Null objects are invisible layers used for parenting and animation control.

**Adjustment Layer**
```
Tool: create-adjustment-layer
Parameters:
  - compIndex: number
  - name: string (optional)
  - duration: number (optional)
```
Effects applied to adjustment layers affect all layers below them.

## Layer Operations

### Selecting and Identifying Layers

Most tools use either:
- `compIndex` + `layerIndex`: 1-based indices
- `compName` + `layerName`: String identifiers (more readable)

### Common Operations

**Get Layer Info**
```
Tool: get-layer-details
Parameters:
  - compIndex: number
  - layerIndex: number
  - includeKeyframes: boolean
  - includeEffects: boolean
  - includeExpressions: boolean
  - includeMasks: boolean
```

**Get Layer Tree**
```
Tool: get-layer-tree
Parameters:
  - compIndex or compName (optional, uses active comp if omitted)
```
Returns full layer hierarchy with index, name, type, timing, and parent info.

**Delete Layer**
```
Tool: layer-delete
Parameters:
  - compIndex/compName
  - layerIndex/layerName
```

**Rename Layer**
```
Tool: layer-rename
Parameters:
  - compIndex: number
  - layerIndex: number
  - newName: string
```

**Move Layer (in stack)**
```
Tool: layer-move
Parameters:
  - compIndex/compName
  - layerIndex/layerName
  - newIndex: number (1 = top of stack)
```

**Duplicate Layer**
```
Tool: duplicate-layer
Parameters:
  - compIndex: number
  - layerIndex: number
  - count: number (optional, how many copies)
  - offsetPosition: [x, y] (optional)
  - offsetTime: number (optional, seconds)
```

### Layer Timing

```
Tool: layer-set-timing
Parameters:
  - compIndex/compName
  - layerIndex/layerName
  - inPoint: number (seconds, when layer becomes visible)
  - outPoint: number (seconds, when layer ends)
  - duration: number (alternative: sets outPoint = inPoint + duration)
  - startTime: number (offset in timeline)
  - stretch: number (time stretch percentage)
```

### Layer Toggles

```
Tool: layer-toggle
Parameters:
  - compIndex: number
  - layerIndex: number
  - toggle: "visible" | "audio" | "solo" | "locked" | "shy" |
            "collapseTransform" | "qualityBest" | "effectsActive" |
            "adjustmentLayer" | "guideLayer" | "motionBlur"
  - value: boolean
```

## Transform Properties

### Set All Transforms

```
Tool: transform-set-all
Parameters:
  - compIndex: number
  - layerIndex: number
  - position: [x, y] or [x, y, z]
  - scale: [x, y] (percentage, 100 = 100%)
  - rotation: number (degrees)
  - opacity: number (0-100)
  - anchorPoint: [x, y]
```

### Center in Composition

```
Tool: transform-center-in-comp
Parameters:
  - compIndex: number
  - layerIndex: number
  - horizontal: boolean
  - vertical: boolean
```

### Fit to Composition

```
Tool: transform-fit-to-comp
Parameters:
  - compIndex: number
  - layerIndex: number
  - fitType: "fit" | "fill" | "stretch"
```

### Reset Transform

```
Tool: transform-reset
Parameters:
  - compIndex: number
  - layerIndex: number
  - property: "all" | "position" | "scale" | "rotation" | "anchorPoint"
```

## Parenting and Hierarchy

### Parent Layer

```
Tool: parent-layer
Parameters:
  - compIndex: number
  - childLayerIndex: number
  - parentLayerIndex: number (or null to remove parent)
```

Child layers inherit transforms from their parent. This is essential for:
- Character rigging
- UI element groups
- Complex animations with a single control point

### Precompose Layers

```
Tool: precompose-layers
Parameters:
  - compIndex: number
  - layerIndices: [array of layer indices]
  - newCompName: string
  - moveAttributes: boolean (transfer keyframes to new comp)
  - adjustDuration: boolean (trim to layer content)
```

### Add Comp as Layer (Nesting)

```
Tool: add-comp-as-layer
Parameters:
  - sourceCompIndex/sourceCompName
  - targetCompIndex/targetCompName
  - position: number (layer order, optional)
  - layerName: string (optional)
```

## Project Management

### Save Project
```
Tool: save-project
Parameters:
  - savePath: string (optional, for Save As)
```

### Import Files
```
Tool: import-file
Parameters:
  - filePath: string
  - importAs: "footage" | "composition" | "project"
  - sequence: boolean (for image sequences)
  - framerate: number (for sequences)
  - targetFolderIndex: number (project panel folder)
```

### Create Project Folder
```
Tool: create-project-folder
Parameters:
  - name: string
  - parentFolderIndex: number (optional)
```

### Clean Up Project
```
Tool: project-remove-unused
```
Removes footage items not used in any composition.

```
Tool: project-consolidate-footage
```
Merges duplicate footage items.

## Workflow Best Practices

1. **Always check current state first**: Use `get-scene-summary` or `get-layer-tree` before making changes
2. **Use meaningful names**: Set layer and comp names for easier identification
3. **Organize with folders**: Create project folders for assets, precomps, and finals
4. **Save frequently**: Use `save-project` after major changes
5. **Use null objects**: For complex animations, parent elements to nulls for easier control
6. **Precompose when needed**: Group related layers to simplify the main timeline

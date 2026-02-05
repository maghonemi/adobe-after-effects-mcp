# Workflow Recipes for After Effects MCP

This skill provides step-by-step recipes for common motion graphics tasks.

## Setup Recipes

### New Project from Scratch

```
1. setup-project
   name: "My Project"
   width: 1920, height: 1080
   frameRate: 30
   duration: 10
   setAsActive: true

2. create-project-folder
   name: "Assets"

3. create-project-folder
   name: "Precomps"

4. save-project
   savePath: "/path/to/project.aep"
```

### Social Media Template

**Instagram Story (9:16)**
```
setup-project:
  width: 1080, height: 1920
  frameRate: 30, duration: 15
```

**Instagram Post (1:1)**
```
setup-project:
  width: 1080, height: 1080
  frameRate: 30, duration: 60
```

**YouTube (16:9)**
```
setup-project:
  width: 1920, height: 1080
  frameRate: 24, duration: 60
```

## Text Animation Recipes

### Animated Title Intro

```
1. create-text-layer
   text: "YOUR TITLE"
   position: [960, 540]
   fontSize: 120

2. set-text-style
   justification: "center"
   font: "Helvetica-Bold"

3. apply-text-animation
   animation: "fadeInByCharacter"
   duration: 1.5
   delay: 0.05
   direction: "center"

4. create-animation-preset (on same layer)
   preset: "scaleUp"
   duration: 0.5
   startTime: 0
```

### Lower Third

```
1. create-solid-layer
   name: "Lower Third BG"
   color: {r: 30, g: 30, b: 30}
   width: 500, height: 80

2. transform-set-all (on solid)
   position: [300, 900]
   anchorPoint: [0, 40]

3. create-text-layer
   text: "John Smith"
   position: [50, 890]
   fontSize: 36

4. create-text-layer
   text: "Creative Director"
   position: [50, 920]
   fontSize: 24

5. create-mask (on solid)
   maskShape: "rectangle"

6. apply-mask-animation
   animation: "revealRight"
   duration: 0.5

7. sequence-layers (text after solid)
   overlap: -0.2
```

### Kinetic Typography

```
For each word/phrase:
1. create-text-layer
   text: "WORD"

2. transform-set-all
   scale: [0, 0]

3. set-keyframes (Scale)
   - time: 0, value: [0, 0]
   - time: 0.2, value: [110, 110]
   - time: 0.3, value: [100, 100]

4. apply-easing: easeOut

5. Repeat, staggering start times by 0.3s
```

## Logo Animation Recipes

### Logo Reveal (Wipe)

```
1. import-file (logo)

2. add layer to comp

3. create-mask
   maskShape: "rectangle"

4. apply-mask-animation
   animation: "revealRight"
   duration: 0.8

5. apply-effect-preset (Glow)
   intensity: 50
   Animate intensity: 100 → 0
```

### Logo Pop

```
1. import-file (logo)

2. transform-set-all
   scale: [0, 0]
   opacity: 0

3. set-keyframes (Scale)
   - time: 0, value: [0, 0]
   - time: 0.4, value: [115, 115]
   - time: 0.6, value: [100, 100]

4. set-keyframes (Opacity)
   - time: 0, value: 0
   - time: 0.2, value: 100

5. apply-easing: easeOut
```

### Logo 3D Flip

```
1. import-file (logo)

2. convert-to-3d: true

3. set-keyframes (Y Rotation)
   - time: 0, value: -90
   - time: 0.8, value: 0

4. set-keyframes (Opacity)
   - time: 0, value: 0
   - time: 0.4, value: 100

5. apply-easing: easeOut
```

## Transition Recipes

### Cross Dissolve

```
1. Layer A: set-keyframes (Opacity)
   - time: 2, value: 100
   - time: 3, value: 0

2. Layer B: set-keyframes (Opacity)
   - time: 2, value: 0
   - time: 3, value: 100
```

### Push Transition

```
1. Layer A: set-keyframes (Position)
   - time: 2, value: [960, 540]
   - time: 2.5, value: [-960, 540]  // exit left

2. Layer B: set-keyframes (Position)
   - time: 2, value: [2880, 540]  // start right
   - time: 2.5, value: [960, 540]

3. apply-easing: easeInOut to both
```

### Zoom Transition

```
1. create-adjustment-layer
   name: "Zoom Transition"

2. apply-effect: Transform
   Set Scale keyframes:
   - time: 2, value: 100
   - time: 2.25, value: 500
   - time: 2.5, value: 100

3. Layer A: ends at 2.25s
4. Layer B: starts at 2.25s
```

### Whip Pan

```
1. create-adjustment-layer

2. apply-effect: Directional Blur
   - time: 2, Blur Length: 0
   - time: 2.15, Blur Length: 100
   - time: 2.35, Blur Length: 100
   - time: 2.5, Blur Length: 0

3. Cut between clips at 2.25s
```

## Slideshow Recipe

```
1. import-file (multiple images)

2. For each image:
   a. Add to comp
   b. transform-fit-to-comp: fitType: "fill"
   c. layer-set-timing:
      inPoint: index * 3  // 3 seconds each
      duration: 3.5  // slight overlap

3. For transitions, add to each:
   set-keyframes (Opacity)
   - inPoint: 0
   - inPoint + 0.5: 100
   - outPoint - 0.5: 100
   - outPoint: 0

4. Optional: add Ken Burns effect
   set-keyframes (Scale, Position) for subtle movement
```

## Background Recipes

### Animated Gradient

```
1. create-solid-layer (full comp size)

2. apply-effect: 4-Color Gradient
   Set colors at corners

3. expression-set on color positions:
   time * 50  // slowly animate

Or:

4. set-keyframes on Point positions
   for looping movement
```

### Particle Background

```
1. create-solid-layer (black)

2. apply-effect: CC Particle World
   Settings:
   - Birth Rate: 2
   - Longevity: 3
   - Producer: size large
   - Particle: type: Line
   - Physics: Gravity: 0, random spread
```

### Geometric Pattern

```
1. create-shape-layer
   shapeType: "ellipse"
   size: [20, 20]
   fillColor: {r: 255, g: 255, b: 255}

2. duplicate-layer
   count: 50
   offsetPosition: [40, 0]

3. precompose-layers (all dots)

4. duplicate-layer (precomp)
   count: 20
   offsetPosition: [0, 40]

5. expression-set (on position of each):
   wiggle(0.5, 10)
```

## Character Animation Recipe

### Simple Character Rig

```
1. Import character parts as separate layers
   (head, body, arm_L, arm_R, leg_L, leg_R)

2. create-null-layer: name: "Body Control"

3. parent-layer:
   - body → Body Control
   - head → body
   - arm_L, arm_R → body
   - leg_L, leg_R → body

4. Set anchor points at joints

5. Animate:
   - Body Control position: walk cycle
   - Legs rotation: walking motion
   - Arms rotation: opposite to legs
   - Body rotation: slight tilt

6. loopOut("cycle") on all animated properties
```

### Bouncing Ball (Animation Principles)

```
1. create-shape-layer (ellipse)

2. Position keyframes (bounce path):
   - 0s: [200, 200] (top)
   - 0.5s: [400, 800] (ground)
   - 1s: [600, 300] (lower bounce)
   - 1.5s: [800, 800] (ground)

3. Scale keyframes (squash/stretch):
   At ground: [120, 80]
   In air: [90, 110]
   At apex: [100, 100]

4. Timing:
   - Ease in to ground (accelerate)
   - Ease out from ground (decelerate)
   - Faster at ground, slower at apex
```

## Export Recipes

### Deliver to Client

```
1. save-project

2. For review:
   export-composition
   preset: "h264"
   outputPath: "/delivery/project_v1_preview.mp4"

3. For master:
   add-to-render-queue
   outputModule: "ProRes 4444"
   outputPath: "/delivery/project_v1_master.mov"

4. start-render

5. project-collect-files
   outputFolder: "/delivery/project_archive"
   collectSourceFiles: true
```

### Social Media Export

```
Instagram:
  export-composition
  preset: "h264"
  (ensure comp is 1080x1080 or 1080x1920)

YouTube:
  add-to-render-queue
  outputModule: "H.264" or "YouTube 1080p"

GIF (short loop):
  export-composition
  preset: "gif"
  (keep under 5 seconds)
```

## Troubleshooting Recipes

### Fix Missing Footage

```
1. footage-get-missing
   (lists all missing files)

2. For each missing file:
   replace-footage
   footageIndex: [from list]
   newFilePath: "/correct/path/to/file"
```

### Clean Up Project

```
1. project-remove-unused
   (removes unused footage)

2. project-consolidate-footage
   (merges duplicates)

3. purge-memory
   purgeType: "all"

4. save-project
```

### Performance Issues

```
1. purge-memory: purgeType: "all"

2. For complex comps:
   precompose-layers (heavy layers)

3. layer-toggle:
   toggle: "qualityBest" → false (draft mode)

4. comp-set-work-area
   (render only what you need)
```

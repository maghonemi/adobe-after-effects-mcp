# Rendering and Export Guide for After Effects MCP

This skill covers rendering compositions, export formats, and output settings.

## Output Templates

### List Available Templates

```
Tool: list-output-templates
```
Returns all render settings and output module templates available in After Effects.

## Render Queue

### Add to Render Queue

```
Tool: add-to-render-queue
Parameters:
  - compIndex: number
  - outputPath: string (full path with filename)
  - renderSettings: string (template name, optional)
  - outputModule: string (template name, optional)
```

Common render settings templates:
- `Best Settings`
- `Current Settings`
- `Draft Settings`
- `Multi-Machine Settings`

Common output module templates:
- `Lossless`
- `Lossless with Alpha`
- `H.264`
- `JPEG Sequence`
- `PNG Sequence`

### Start Render

```
Tool: start-render
```
Starts rendering all items in the render queue.

### Check Render Progress

```
Tool: get-render-progress
```
Returns status of render queue items (queued, rendering, done, error).

## Quick Export

### Export Composition

```
Tool: export-composition
Parameters:
  - compIndex: number
  - outputPath: string
  - preset: "lossless" | "h264" | "prores" | "gif" | "png-sequence" | "jpeg-sequence"
  - startFrame: number (optional)
  - endFrame: number (optional)
```

### Export Single Frame

```
Tool: export-frame
Parameters:
  - compIndex: number
  - outputPath: string
  - time: number (seconds)
  - format: "png" | "jpg" | "psd" | "tiff"
  - quality: number (0-100, for jpg)
```

## Viewport Screenshot

```
Tool: get-viewport-screenshot
Parameters:
  - compIndex or compName (optional, uses active comp)
  - time: number (optional, current time if omitted)
```
Captures current composition view as PNG image.

## Format Reference

### Video Formats

**Lossless (for editing/archiving):**
```
- Format: QuickTime
- Codec: Animation or None
- Quality: 100%
- Use: Master files, intermediate renders
- Size: Very large
```

**ProRes (professional delivery):**
```
- Format: QuickTime
- Codec: Apple ProRes 422/4444
- Use: Broadcast, high-quality delivery
- Size: Large but manageable
```

**H.264 (web/sharing):**
```
- Format: H.264 or QuickTime H.264
- Use: Web, social media, preview
- Size: Small
- Note: May require Adobe Media Encoder
```

### Image Sequences

**PNG Sequence (with alpha):**
```
- Format: PNG
- Channels: RGB+Alpha
- Use: Compositing, transparency needed
```

**JPEG Sequence:**
```
- Format: JPEG
- Quality: 90-100%
- Use: Fast renders, no transparency needed
```

**EXR Sequence (HDR/VFX):**
```
- Format: OpenEXR
- Bit Depth: 32-bit
- Use: VFX pipelines, color grading
```

### GIF (animated)

```
preset: "gif"
```
Note: GIFs have limited colors (256). Best for:
- Short loops
- Simple graphics
- Social media

## Work Area

Control what portion of the composition renders.

### Get Work Area

```
Tool: comp-get-work-area
Parameters:
  - compIndex: number
```

### Set Work Area

```
Tool: comp-set-work-area
Parameters:
  - compIndex: number
  - startTime: number (seconds)
  - endTime: number (seconds)
```

## Project Management for Render

### Save Project

```
Tool: save-project
Parameters:
  - savePath: string (optional, for Save As)
```

### Collect Files

```
Tool: project-collect-files
Parameters:
  - outputFolder: string
  - collectSourceFiles: boolean
  - generateReport: boolean
```
Packages project with all assets for archiving or transfer.

## Render Workflow

### Standard Render Workflow

```
1. get-scene-summary (verify composition)
2. comp-set-work-area (if partial render)
3. save-project (before rendering)
4. add-to-render-queue with output settings
5. start-render
6. get-render-progress (monitor)
```

### Quick Preview Export

```
1. export-composition
   preset: "h264"
   outputPath: "/path/to/preview.mp4"
```

### High-Quality Master

```
1. add-to-render-queue
   renderSettings: "Best Settings"
   outputModule: "Lossless with Alpha"
   outputPath: "/path/to/master.mov"
2. start-render
```

### Image Sequence for Compositing

```
1. export-composition
   preset: "png-sequence"
   outputPath: "/path/to/frames/frame_[#####].png"
```

## Performance Tips

### Before Rendering

```
Tool: purge-memory
Parameters:
  - purgeType: "all" | "memory" | "disk" | "snapshot"
```

### Reduce Render Time

1. **Lower resolution for previews** - Half or quarter res
2. **Disable motion blur** for test renders
3. **Turn off effects** you're not checking
4. **Use draft quality** for timing checks
5. **Render RAM previews** for playback testing

### Background Rendering

After Effects can render in the background:
1. Add to render queue
2. Continue working (with reduced performance)

Or use Adobe Media Encoder:
1. Send to Media Encoder (preserves AE for work)
2. Render happens in separate application

## Common Export Scenarios

### Social Media (Instagram/TikTok)

```
Resolution: 1080x1920 (vertical) or 1080x1080 (square)
Frame rate: 30fps
Format: H.264
Duration: < 60 seconds for best compatibility
```

### YouTube

```
Resolution: 1920x1080 or 3840x2160
Frame rate: 24, 30, or 60fps
Format: H.264 (upload) or ProRes (archive)
Bitrate: 8-12 Mbps (1080p), 35-45 Mbps (4K)
```

### Client Delivery

```
1. Master: ProRes 4444 or Lossless with Alpha
2. Preview: H.264 with watermark
3. Package: project-collect-files for archiving
```

### Animation for Web

```
Short loop: GIF (< 5 seconds, simple colors)
Longer/complex: MP4 H.264 or WebM
Transparent: PNG sequence (composite in code)
```

## Best Practices

1. **Always save before rendering** - Renders can crash
2. **Use absolute paths** for output - Avoid "relative to project"
3. **Include frame numbers** in sequence naming
4. **Test render a few frames first** - Catch issues early
5. **Monitor disk space** - Video files get large fast
6. **Keep masters** - Lossless or ProRes, compress later
7. **Name outputs clearly** - Include date, version, format

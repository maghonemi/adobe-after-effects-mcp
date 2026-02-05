# After Effects MCP Server - Effect Library

## Complete Effect Match Names Reference

This document provides the complete list of After Effects internal effect match names for use with the `effectMatchName` parameter.

---

## Table of Contents

- [Blur & Sharpen](#blur--sharpen)
- [Channel](#channel)
- [Color Correction](#color-correction)
- [Distort](#distort)
- [Expression Controls](#expression-controls)
- [Generate](#generate)
- [Keying](#keying)
- [Matte](#matte)
- [Noise & Grain](#noise--grain)
- [Perspective](#perspective)
- [Simulation](#simulation)
- [Stylize](#stylize)
- [Text](#text)
- [Time](#time)
- [Transition](#transition)
- [Utility](#utility)
- [Third-Party Effects](#third-party-effects)

---

## Blur & Sharpen

| Display Name | Match Name | Common Parameters |
|--------------|------------|-------------------|
| Bilateral Blur | `ADBE Bilateral` | `Threshold`, `Radius`, `Colorize` |
| Box Blur | `ADBE Box Blur2` | `Blur Radius`, `Iterations` |
| Camera Lens Blur | `ADBE Camera Lens Blur` | `Blur Radius`, `Iris Shape`, `Blade Curvature` |
| Camera-Shake Deblur | `ADBE CameraShakeDeblur` | `Blur Radius` |
| Compound Blur | `ADBE Compound Blur` | `Blur Layer`, `Maximum Blur` |
| Directional Blur | `ADBE Directional Blur` | `Direction`, `Blur Length` |
| Fast Box Blur | `ADBE Box Blur` | `Blur Radius`, `Iterations` |
| Gaussian Blur | `ADBE Gaussian Blur 2` | `Blurriness`, `Repeat Edge Pixels` |
| Radial Blur | `ADBE Radial Blur` | `Amount`, `Type`, `Center` |
| Sharpen | `ADBE Sharpen` | `Sharpen Amount` |
| Smart Blur | `ADBE Smart Blur` | `Radius`, `Threshold`, `Mode` |
| Unsharp Mask | `ADBE Unsharp Mask` | `Amount`, `Radius`, `Threshold` |

### Usage Example
```json
{
  "effectMatchName": "ADBE Gaussian Blur 2",
  "effectSettings": {
    "Blurriness": 15,
    "Repeat Edge Pixels": true
  }
}
```

---

## Channel

| Display Name | Match Name |
|--------------|------------|
| Arithmetic | `ADBE Arithmetic` |
| Blend | `ADBE Blend` |
| Calculations | `ADBE Calculations` |
| Channel Combiner | `ADBE Channel Combiner` |
| Compound Arithmetic | `ADBE Compound Arithmetic` |
| Invert | `ADBE Invert` |
| Minimax | `ADBE Minimax` |
| Remove Color Matting | `ADBE Remove Color Matting` |
| Set Channels | `ADBE Set Channels` |
| Set Matte | `ADBE Set Matte3` |
| Shift Channels | `ADBE Shift Channels` |
| Solid Composite | `ADBE Solid Composite` |

---

## Color Correction

| Display Name | Match Name | Common Parameters |
|--------------|------------|-------------------|
| Auto Color | `ADBE Auto Color` | - |
| Auto Contrast | `ADBE Auto Contrast` | - |
| Auto Levels | `ADBE Auto Levels` | - |
| Black & White | `ADBE Black&White` | `Reds`, `Yellows`, `Greens`, `Cyans`, `Blues`, `Magentas` |
| Brightness & Contrast | `ADBE Brightness & Contrast 2` | `Brightness`, `Contrast`, `Use Legacy` |
| Broadcast Colors | `ADBE Broadcast Colors` | `Broadcast Locale`, `How to Make Color Safe` |
| Change Color | `ADBE Change Color` | `Hue Transform`, `Lightness Transform`, `Saturation Transform` |
| Change to Color | `ADBE Change To Color` | `From`, `To`, `Tolerance` |
| Channel Mixer | `ADBE Channel Mixer` | RGB channel mappings |
| Color Balance | `ADBE Color Balance` | `Shadow Red Balance`, `Midtone Red Balance`, etc. |
| Color Balance (HLS) | `ADBE Color Balance (HLS)` | `Hue`, `Lightness`, `Saturation` |
| Color Link | `ADBE Color Link` | `Source Layer`, `Sample` |
| Color Stabilizer | `ADBE Color Stabilizer` | - |
| Colorama | `ADBE Colorama` | Multiple phases and color settings |
| Curves | `ADBE CurvesCustom` | `RGB`, `Red`, `Green`, `Blue` curves |
| Equalize | `ADBE Equalize` | `Equalize` |
| Exposure | `ADBE Exposure2` | `Exposure`, `Offset`, `Gamma Correction` |
| Gamma/Pedestal/Gain | `ADBE Gamma Pedestal Gain` | `Black Stretch`, `Black Point`, `White Point` |
| Hue/Saturation | `ADBE HUE SATURATION` | `Channel Control`, `Master Hue`, `Master Saturation`, `Master Lightness` |
| Leave Color | `ADBE Leave Color` | `Amount to Decolor`, `Tolerance`, `Edge Softness` |
| Levels | `ADBE Pro Levels2` | `Input Black`, `Input White`, `Gamma`, `Output Black`, `Output White` |
| Levels (Individual Controls) | `ADBE Levels (Individual Controls)` | Per-channel levels |
| Lumetri Color | `ADBE Lumetri` | Extensive color grading |
| Photo Filter | `ADBE Photo Filter` | `Filter`, `Density`, `Preserve Luminosity` |
| PS Arbitrary Map | `ADBE PS Arbitrary Map` | - |
| Selective Color | `ADBE Selective Color` | Reds, Yellows, Greens, Cyans, Blues, Magentas, Whites, Neutrals, Blacks |
| Shadow/Highlight | `ADBE Shadow Highlight` | `Auto Amounts`, `Shadow Amount`, `Highlight Amount` |
| Tint | `ADBE Tint` | `Map Black To`, `Map White To`, `Amount to Tint` |
| Tritone | `ADBE Tritone` | `Highlights`, `Midtones`, `Shadows` |
| Vibrance | `ADBE Vibrance` | `Vibrance`, `Saturation` |

### Levels Usage Example
```json
{
  "effectMatchName": "ADBE Pro Levels2",
  "effectSettings": {
    "Input Black": 20,
    "Input White": 235,
    "Gamma": 1.2,
    "Output Black": 0,
    "Output White": 255
  }
}
```

---

## Distort

| Display Name | Match Name | Common Parameters |
|--------------|------------|-------------------|
| Bezier Warp | `ADBE Bezier Warp` | Vertex points |
| Bulge | `ADBE Bulge` | `Horizontal Radius`, `Vertical Radius`, `Bulge Height`, `Bulge Center` |
| Corner Pin | `ADBE Corner Pin` | `Upper Left`, `Upper Right`, `Lower Left`, `Lower Right` |
| Displacement Map | `ADBE Displacement Map` | `Displacement Map Layer`, `Max Horizontal Displacement`, `Max Vertical Displacement` |
| Liquify | `ADBE Liquify` | - |
| Magnify | `ADBE MAGNIFY` | `Shape`, `Center`, `Magnification`, `Size` |
| Mesh Warp | `ADBE Mesh Warp` | `Rows`, `Columns` |
| Mirror | `ADBE Mirror` | `Reflection Center`, `Reflection Angle` |
| Offset | `ADBE Offset` | `Shift Center To`, `Blend With Original` |
| Optics Compensation | `ADBE Optics Compensation` | `Field of View`, `Reverse Lens Distortion` |
| Polar Coordinates | `ADBE Polar Coordinates` | `Type of Conversion`, `Interpolation` |
| Reshape | `ADBE Reshape` | - |
| Ripple | `ADBE Ripple` | `Radius`, `Center`, `Conversion Type`, `Wave Speed`, `Wave Width`, `Wave Height` |
| Rolling Shutter Repair | `ADBE Rolling Shutter Repair` | `Rolling Shutter Rate`, `Scan Direction` |
| Smear | `ADBE Smear` | - |
| Spherize | `ADBE Spherize` | `Radius`, `Center of Sphere` |
| Transform | `ADBE Geometry2` | `Position`, `Scale`, `Rotation`, `Opacity` |
| Turbulent Displace | `ADBE Turbulent Displace` | `Amount`, `Size`, `Complexity`, `Evolution` |
| Twirl | `ADBE Twirl` | `Angle`, `Twirl Radius`, `Twirl Center` |
| Wave Warp | `ADBE Wave Warp` | `Wave Type`, `Wave Height`, `Wave Width`, `Direction`, `Wave Speed` |
| Warp | `ADBE Warp` | `Warp Style`, `Bend`, `Horizontal Distortion`, `Vertical Distortion` |
| Warp Stabilizer | `ADBE Warp Stabilizer Comp` | `Result`, `Smoothness`, `Method`, `Framing` |

### Turbulent Displace Usage
```json
{
  "effectMatchName": "ADBE Turbulent Displace",
  "effectSettings": {
    "Amount": 50,
    "Size": 20,
    "Complexity": 2.0,
    "Evolution": 0
  }
}
```

---

## Expression Controls

| Display Name | Match Name |
|--------------|------------|
| 3D Point Control | `ADBE Point3D Control` |
| Angle Control | `ADBE Angle Control` |
| Checkbox Control | `ADBE Checkbox Control` |
| Color Control | `ADBE Color Control` |
| Dropdown Menu Control | `ADBE Dropdown Menu Control` |
| Layer Control | `ADBE Layer Control` |
| Point Control | `ADBE Point Control` |
| Slider Control | `ADBE Slider Control` |

---

## Generate

| Display Name | Match Name | Common Parameters |
|--------------|------------|-------------------|
| 4-Color Gradient | `ADBE 4ColorGradient` | `Positions & Colors`, `Blend`, `Jitter` |
| Advanced Lightning | `ADBE Advanced Lightning` | `Lightning Type`, `Origin`, `Direction` |
| Audio Spectrum | `ADBE Audio Spectrum` | `Audio Layer`, `Start/End Point`, `Frequency Bands` |
| Audio Waveform | `ADBE Audio Waveform` | `Audio Layer`, `Start/End Point`, `Displayed Samples` |
| Beam | `ADBE Laser` | `Starting Point`, `Ending Point`, `Length`, `Time`, `Inside Color`, `Outside Color` |
| Cell Pattern | `ADBE Cell Pattern` | `Cell Pattern`, `Size`, `Scatter`, `Contrast` |
| Checkerboard | `ADBE Checkerboard` | `Anchor`, `Size`, `Color`, `Feather` |
| Circle | `ADBE Circle` | `Center`, `Radius`, `Color`, `Softness` |
| Ellipse | `ADBE Ellipse` | `Center`, `Width`, `Height`, `Softness` |
| Eyedropper Fill | `ADBE Eyedropper Fill` | `Sample Point`, `Sample Radius` |
| Fill | `ADBE Fill` | `Fill Mask`, `All Masks`, `Color` |
| Fractal | `ADBE Fractal` | `Fractal Type`, `Contrast`, `Brightness` |
| Gradient Ramp | `ADBE Ramp` | `Start of Ramp`, `Start Color`, `End of Ramp`, `End Color`, `Ramp Shape` |
| Grid | `ADBE Grid` | `Anchor`, `Corner`, `Size From`, `Border`, `Color` |
| Lens Flare | `ADBE Lens Flare` | `Flare Center`, `Flare Brightness`, `Lens Type` |
| Paint Bucket | `ADBE Paint Bucket` | `Fill Point`, `Tolerance`, `Color` |
| Radio Waves | `ADBE Radio Waves` | `Producer Point`, `Wave Type`, `Frequency` |
| Scribble | `ADBE Scribble` | - |
| Stroke | `ADBE Stroke` | `Path`, `Color`, `Brush Size`, `Brush Hardness`, `Start`, `End` |
| Vegas | `ADBE Vegas` | `Stroke`, `Segments`, `Width`, `Color` |
| Write-on | `ADBE Write-on` | `Brush Position`, `Color`, `Brush Size`, `Brush Hardness` |

### Gradient Ramp Usage
```json
{
  "effectMatchName": "ADBE Ramp",
  "effectSettings": {
    "Start of Ramp": [960, 0],
    "Start Color": [0, 0, 0, 1],
    "End of Ramp": [960, 1080],
    "End Color": [0, 0.5, 1, 1],
    "Ramp Shape": 1
  }
}
```

---

## Keying

| Display Name | Match Name |
|--------------|------------|
| Color Difference Key | `ADBE Color Difference Key` |
| Color Key | `ADBE Color Key` |
| Color Range | `ADBE Color Range` |
| Difference Matte | `ADBE Difference Matte2` |
| Extract | `ADBE Extract` |
| Inner/Outer Key | `ADBE Inner Outer Key` |
| Keylight (1.2) | `Keylight 906` |
| Linear Color Key | `ADBE Linear Color Key2` |
| Luma Key | `ADBE Luma Key` |
| Spill Suppressor | `ADBE Spill Suppressor` |

---

## Matte

| Display Name | Match Name |
|--------------|------------|
| Matte Choker | `ADBE Matte Choker` |
| Refine Edge | `ADBE RefineRBF` |
| Refine Soft Matte | `ADBE Refine Matte` |
| Simple Choker | `ADBE Simple Choker` |

---

## Noise & Grain

| Display Name | Match Name | Common Parameters |
|--------------|------------|-------------------|
| Add Grain | `ADBE Add Grain` | `Viewing Mode`, `Intensity`, `Size` |
| Dust & Scratches | `ADBE Dust & Scratches` | `Radius`, `Threshold` |
| Fractal Noise | `ADBE Fractal Noise` | `Fractal Type`, `Noise Type`, `Contrast`, `Brightness`, `Evolution` |
| Match Grain | `ADBE Match Grain 2` | - |
| Median | `ADBE Median` | `Radius` |
| Noise | `ADBE Noise` | `Amount of Noise`, `Noise Type`, `Clipping` |
| Noise Alpha | `ADBE Noise Alpha 2` | `Amount`, `Original Alpha` |
| Noise HLS | `ADBE Noise HLS 2` | `Hue`, `Lightness`, `Saturation` |
| Noise HLS Auto | `ADBE Noise HLS Auto 2` | - |
| Remove Grain | `ADBE Remove Grain` | `Viewing Mode`, `Noise Reduction`, `Temporal Filtering` |
| Turbulent Noise | `ADBE Turbulent Noise` | `Fractal Type`, `Noise Type`, `Evolution` |

### Fractal Noise Usage
```json
{
  "effectMatchName": "ADBE Fractal Noise",
  "effectSettings": {
    "Fractal Type": 1,
    "Noise Type": 1,
    "Contrast": 150,
    "Brightness": -20,
    "Evolution": 0,
    "Complexity": 5,
    "Transform": {
      "Scale": 100
    }
  }
}
```

---

## Perspective

| Display Name | Match Name |
|--------------|------------|
| 3D Camera Tracker | `ADBE 3D Camera Tracker` |
| 3D Glasses | `ADBE 3D Glasses2` |
| Bevel Alpha | `ADBE Bevel Alpha` |
| Bevel Edges | `ADBE Bevel Edges` |
| CC Cylinder | `CC Cylinder` |
| CC Environment | `CC Environment` |
| CC Sphere | `CC Sphere` |
| Drop Shadow | `ADBE Drop Shadow` |
| Radial Shadow | `ADBE Radial Shadow` |

### Drop Shadow Usage
```json
{
  "effectMatchName": "ADBE Drop Shadow",
  "effectSettings": {
    "Shadow Color": [0, 0, 0, 1],
    "Opacity": 50,
    "Direction": 135,
    "Distance": 10,
    "Softness": 15
  }
}
```

---

## Simulation

| Display Name | Match Name |
|--------------|------------|
| Card Dance | `ADBE Card Dance` |
| Card Wipe | `ADBE Card Wipe` |
| Caustics | `ADBE Caustics` |
| Foam | `ADBE Foam` |
| Particle Playground | `ADBE Particle Playground` |
| Shatter | `ADBE Shatter` |
| Wave World | `ADBE Wave World` |
| CC Ball Action | `CC Ball Action` |
| CC Bubbles | `CC Bubbles` |
| CC Drizzle | `CC Drizzle` |
| CC Hair | `CC Hair` |
| CC Mr. Mercury | `CC Mr. Mercury` |
| CC Particle Systems II | `CC Particle Systems II` |
| CC Particle World | `CC Particle World` |
| CC Pixel Polly | `CC Pixel Polly` |
| CC Rain | `CC Rain` |
| CC Rainfall | `CC Rainfall` |
| CC Scatter | `CC Scatter` |
| CC Snow | `CC Snow` |
| CC Snowfall | `CC Snowfall` |
| CC Star Burst | `CC Star Burst` |

---

## Stylize

| Display Name | Match Name | Common Parameters |
|--------------|------------|-------------------|
| Brush Strokes | `ADBE Brush Strokes` | `Stroke Angle`, `Brush Size`, `Stroke Length` |
| Cartoon | `ADBE Cartoon` | `Render`, `Detail Radius`, `Detail Threshold` |
| CC Glass | `CC Glass` | `Surface`, `Softness`, `Height`, `Displacement` |
| CC Kaleida | `CC Kaleida` | `Size`, `Rotation`, `Center` |
| CC Light Sweep | `CC Light Sweep` | `Center`, `Direction`, `Width`, `Sweep Intensity` |
| CC Plastic | `CC Plastic` | `Softness`, `Height`, `Light` |
| CC Threshold | `CC Threshold` | `Level` |
| CC Threshold RGB | `CC Threshold RGB` | `Red`, `Green`, `Blue` |
| CC Vignette | `CC Vignette` | `Amount` |
| Color Emboss | `ADBE Color Emboss` | `Direction`, `Relief`, `Contrast` |
| Emboss | `ADBE Emboss` | `Direction`, `Relief`, `Contrast` |
| Find Edges | `ADBE Find Edges` | `Invert` |
| Glow | `ADBE Glow` | `Glow Threshold`, `Glow Radius`, `Glow Intensity`, `Glow Colors` |
| Mosaic | `ADBE Mosaic` | `Horizontal Blocks`, `Vertical Blocks`, `Sharp Colors` |
| Motion Tile | `ADBE Tile` | `Tile Center`, `Tile Width`, `Tile Height`, `Mirror Edges` |
| Posterize | `ADBE Posterize` | `Level` |
| Roughen Edges | `ADBE Roughen Edges` | `Edge Type`, `Border`, `Edge Sharpness`, `Fractal Influence` |
| Scatter | `ADBE Scatter` | `Scatter Amount` |
| Strobe Light | `ADBE Strobe` | `Strobe Duration`, `Strobe Period`, `Strobe Color`, `Blend With Original` |
| Texturize | `ADBE Texturize` | `Texture Layer`, `Light Direction`, `Texture Contrast` |
| Threshold | `ADBE Threshold` | `Level` |

### Glow Usage
```json
{
  "effectMatchName": "ADBE Glow",
  "effectSettings": {
    "Glow Threshold": 60,
    "Glow Radius": 50,
    "Glow Intensity": 1.5,
    "Glow Colors": 1
  }
}
```

---

## Text

| Display Name | Match Name |
|--------------|------------|
| Numbers | `ADBE Numbers2` |
| Timecode | `ADBE Timecode` |

---

## Time

| Display Name | Match Name | Common Parameters |
|--------------|------------|-------------------|
| CC Force Motion Blur | `CC Force Motion Blur` | `Motion Blur Samples`, `Shutter Angle` |
| CC Wide Time | `CC Wide Time` | `Angle`, `Interval` |
| Echo | `ADBE Echo` | `Echo Time`, `Number of Echoes`, `Starting Intensity`, `Decay` |
| Pixel Motion Blur | `ADBE Pixel Motion Blur` | `Shutter Control`, `Shutter Angle` |
| Posterize Time | `ADBE Posterize Time` | `Frame Rate` |
| Time Difference | `ADBE Time Difference` | `Target`, `Time Offset` |
| Time Displacement | `ADBE Time Displacement` | `Time Displacement Layer`, `Max Displacement Time` |
| Timewarp | `ADBE Timewarp` | `Method`, `Speed` |

---

## Transition

| Display Name | Match Name |
|--------------|------------|
| Block Dissolve | `ADBE Block Dissolve` |
| Card Wipe | `ADBE Card Wipe` |
| Gradient Wipe | `ADBE Gradient Wipe` |
| Iris Wipe | `ADBE Iris Wipe` |
| Linear Wipe | `ADBE Linear Wipe` |
| Radial Wipe | `ADBE Radial Wipe` |
| Venetian Blinds | `ADBE Venetian Blinds` |
| CC Glass Wipe | `CC Glass Wipe` |
| CC Grid Wipe | `CC Grid Wipe` |
| CC Image Wipe | `CC Image Wipe` |
| CC Jaws | `CC Jaws` |
| CC Light Wipe | `CC Light Wipe` |
| CC Line Sweep | `CC Line Sweep` |
| CC Radial Scale Wipe | `CC Radial Scale Wipe` |
| CC Scale Wipe | `CC Scale Wipe` |
| CC Twister | `CC Twister` |
| CC Warped Stretch | `CC Warped Stretch` |

---

## Utility

| Display Name | Match Name |
|--------------|------------|
| Apply Color LUT | `ADBE Apply Color LUT2` |
| Cineon Converter | `ADBE Cineon Converter2` |
| Color Profile Converter | `ADBE Color Profile Converter` |
| Grow Bounds | `ADBE Grow Bounds` |
| HDR Compander | `ADBE HDR Compander` |
| HDR Highlight Compression | `ADBE HDR Highlight Compression` |

---

## Third-Party Effects

Common third-party effects (require plugin installation):

### Red Giant
| Display Name | Match Name |
|--------------|------------|
| Magic Bullet Looks | Varies by version |
| Trapcode Particular | `Particular` |
| Universe Glitch | Varies |

### Video Copilot
| Display Name | Match Name |
|--------------|------------|
| Element 3D | `Element` |
| Optical Flares | `Optical Flares` |
| Saber | `Saber` |

---

## Expression Templates

### Wiggle
```javascript
// Basic wiggle
wiggle(frequency, amplitude)

// Wiggle with seed
wiggle(frequency, amplitude, octaves, amp_mult, time)

// Separate X/Y wiggle
[wiggle(2, 100)[0], value[1]]  // Only X
[value[0], wiggle(2, 100)[1]]  // Only Y
```

### Bounce
```javascript
// Simple bounce
n = 0;
if (numKeys > 0) {
  n = nearestKey(time).index;
  if (key(n).time > time) { n--; }
}
if (n == 0) { t = 0; } else { t = time - key(n).time; }
if (n > 0 && t < 1) {
  v = velocityAtTime(key(n).time - thisComp.frameDuration/10);
  amp = .05;
  freq = 4.0;
  decay = 8.0;
  value + v*amp*Math.sin(freq*t*2*Math.PI)/Math.exp(decay*t);
} else { value; }
```

### Loop
```javascript
// Loop cycle
loopOut("cycle")

// Loop pingpong
loopOut("pingpong")

// Loop with offset
loopOut("offset")

// Loop specific property group
loopOut("cycle", 0)
```

### Inertia/Overshoot
```javascript
// Inertia after keyframes
n = 0;
if (numKeys > 0) {
  n = nearestKey(time).index;
  if (key(n).time > time) n--;
}
if (n == 0) t = 0;
else t = time - key(n).time;

if (n > 0) {
  v = velocityAtTime(key(n).time - .001);
  value + v*t;
} else value;
```

### Time-Based
```javascript
// Continuous rotation
time * 90  // 90 degrees per second

// Oscillate
Math.sin(time * 2 * Math.PI) * 100

// Linear movement
value + [time * 100, 0]
```

### Layer Connections
```javascript
// Follow another layer
thisComp.layer("Null 1").transform.position

// Offset from layer
thisComp.layer("Null 1").transform.position + [100, 0]

// Copy with delay
thisComp.layer("Null 1").transform.position.valueAtTime(time - 0.5)
```

---

## Usage Tips

1. **Always use match names** - They're more reliable than display names across different AE versions and languages.

2. **Check property names** - Use `effect.numProperties` and iterate to discover available properties.

3. **Handle arrays correctly** - Color values are [R,G,B,A] with values 0-1, positions are [x,y] or [x,y,z].

4. **Use expressions for dynamic effects** - Link effect properties to layer properties or other effects for dynamic animations.

5. **Test in ExtendScript Toolkit** - Before integrating, test effect application in the ESTK console.

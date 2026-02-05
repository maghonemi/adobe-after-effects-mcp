# Master Video Production Guide with AI

## 🎬 Complete End-to-End Video Creation System

This guide shows how to create ANY video project from start to finish using AI with the After Effects MCP server.

---

## 📋 The Complete Video Creation Framework

### Phase 1: Project Brief
### Phase 2: Planning
### Phase 3: Setup
### Phase 4: Building
### Phase 5: Animation
### Phase 6: Polish
### Phase 7: Export

---

## Phase 1: Project Brief 📝

### What You Need to Know First

Before starting any prompt, gather this information:

```
PROJECT BRIEF TEMPLATE:

1. VIDEO PURPOSE: [Promote/Educate/Entertain/Announce]
2. TARGET PLATFORM: [YouTube/Instagram/TikTok/LinkedIn/Website/TV]
3. TARGET AUDIENCE: [Who will watch this?]
4. KEY MESSAGE: [What's the one thing viewers should remember?]
5. DURATION: [How many seconds/minutes?]
6. BRAND ASSETS: [Logo, colors, fonts available?]
7. REFERENCES: [Any videos you like as examples?]
8. DEADLINE: [When is it needed?]
```

### Platform Specifications Quick Reference

| Platform | Resolution | Duration | Aspect | Notes |
|----------|------------|----------|--------|-------|
| YouTube | 1920x1080 | Any | 16:9 | Safe zones for UI |
| Instagram Post | 1080x1080 | 60s max | 1:1 | Works in feed |
| Instagram Reel | 1080x1920 | 90s max | 9:16 | Full screen mobile |
| Instagram Story | 1080x1920 | 15s | 9:16 | Tap to advance |
| TikTok | 1080x1920 | 10min max | 9:16 | First 3s crucial |
| LinkedIn | 1920x1080 | 10min max | 16:9 | Professional tone |
| Facebook Feed | 1080x1080 | 240min | 1:1 | Autoplay silent |
| Twitter/X | 1280x720 | 140s | 16:9 | Short attention |
| TV/Broadcast | 1920x1080 | Varies | 16:9 | Safe zones strict |

---

## Phase 2: Planning 📐

### Video Structure Templates

**Formula 1: Problem-Solution-CTA (Great for ads, explainers)**
```
SECTION 1 - HOOK (10% of duration)
└── Attention-grabbing opening
└── State the problem or question

SECTION 2 - PROBLEM (20% of duration)
└── Expand on the pain point
└── Make viewer feel understood

SECTION 3 - SOLUTION (40% of duration)
└── Introduce your solution
└── Show key features/benefits
└── Demonstrate value

SECTION 4 - PROOF (15% of duration)
└── Testimonials/statistics
└── Build credibility

SECTION 5 - CTA (15% of duration)
└── Clear next step
└── Urgency/scarcity
└── Contact information
```

**Formula 2: Hook-Content-CTA (Great for social media)**
```
SECTION 1 - HOOK (0-3 seconds)
└── Pattern interrupt
└── Bold statement or question

SECTION 2 - CONTENT (Main body)
└── Deliver the promised value
└── Keep it fast-paced
└── Visual variety every 3-5 seconds

SECTION 3 - CTA (Last 3 seconds)
└── Follow/Subscribe/Learn more
└── Keep it simple
```

**Formula 3: Intro-Body-Outro (Great for YouTube)**
```
SECTION 1 - INTRO (5-10 seconds)
└── Channel branding
└── Video topic preview
└── "Keep watching" hook

SECTION 2 - BODY (Main duration)
└── Content sections
└── Transitions between topics
└── Visual variety

SECTION 3 - OUTRO (10-20 seconds)
└── Summary/takeaway
└── End screen (subscribe, watch more)
└── Thank viewer
```

### Scene Planning Template

```
SCENE PLANNER:

Scene #: [Number]
Duration: [Start time] to [End time] = [X seconds]
Purpose: [What this scene accomplishes]

VISUALS:
- Background: [Description]
- Main element: [Description]
- Text: "[Text content]"
- Animation: [Description]

AUDIO SYNC:
- Music moment: [Beat, drop, transition]
- Voiceover: "[Script excerpt]"

TRANSITION TO NEXT:
- Type: [Cut/Fade/Wipe/Custom]
- Duration: [X seconds]
```

---

## Phase 3: Setup 🛠️

### Master Setup Prompt

Copy and customize this prompt to start any project:

```
===== PROJECT SETUP =====

Create a new After Effects project with this structure:

PROJECT SETTINGS:
- Name: "[PROJECT_NAME]"
- Bit depth: 16-bit color

MAIN COMPOSITION:
- Name: "Final_Render"
- Resolution: [WIDTH]x[HEIGHT]
- Frame rate: [FPS]
- Duration: [SECONDS]
- Background: [#HEXCOLOR or transparent]

SUB-COMPOSITIONS (create if longer than 30s):
- "01_Intro" - [DURATION]s
- "02_Section1" - [DURATION]s
- "03_Section2" - [DURATION]s
- "04_Outro" - [DURATION]s

PROJECT FOLDERS:
- "01_Assets" - for imported files
- "02_Comps" - for compositions
- "03_Audio" - for music/sound
- "04_Exports" - for renders

GLOBAL ELEMENTS:
- Adjustment layer "Color_Grade" at top of main comp
- Null object "Master_Controller" for expressions

===========================
```

### Import Assets Prompt

```
===== IMPORT ASSETS =====

Import these files into the project:

LOGOS:
- [Path to logo file]
- Place in "Assets" folder

FOOTAGE:
- [Path to video file]
- Set frame rate interpretation to [FPS]

IMAGES:
- [Path to image files]

AUDIO:
- [Path to music file]
- [Path to voiceover file]

FONTS TO USE:
- Primary: [Font name]
- Secondary: [Font name]

===========================
```

---

## Phase 4: Building 🏗️

### Layer-by-Layer Building

**Background Prompt:**
```
Create the background for [SCENE NAME]:

Option A - Solid Color:
- Create solid layer "[COLOR NAME]"
- Color: [#HEXCODE]
- Full comp size

Option B - Gradient:
- Create shape layer "Gradient_BG"
- Apply gradient fill
- Colors: [#COLOR1] to [#COLOR2]
- Direction: [degrees]

Option C - Animated:
- Create background with [animated particles / shapes / patterns]
- Colors from palette: [COLORS]
- Subtle movement, not distracting

Lock background layer when done.
```

**Text Layer Prompts:**
```
Create text for [SCENE NAME]:

HEADLINE TEXT:
- Layer name: "Headline"
- Content: "[HEADLINE TEXT]"
- Font: [FONT NAME], Bold
- Size: [XX]px
- Color: [#HEXCODE]
- Position: [Center / Coordinates]
- Add [drop shadow / glow / outline]

BODY TEXT:
- Layer name: "Body"
- Content: "[BODY TEXT]"
- Font: [FONT NAME], Regular
- Size: [XX]px
- Color: [#HEXCODE]
- Line spacing: [XX]px
- Position: Below headline

CTA TEXT:
- Layer name: "CTA"
- Content: "[CALL TO ACTION]"
- Style: [Button shape behind / Underline / Arrow]
- Position: [Bottom center / Custom]
```

**Shape Layer Prompts:**
```
Create decorative shapes for [SCENE NAME]:

ACCENT SHAPE 1:
- Type: [Rectangle / Circle / Line / Custom]
- Size: [W]x[H]
- Position: [X, Y]
- Fill: [#HEXCODE]
- Stroke: [None / Color, Width]

ACCENT SHAPE 2:
- [Same structure]

DIVIDER LINE:
- Horizontal line
- Width: [XX]px, Height: [X]px
- Position: Between [ELEMENT1] and [ELEMENT2]
```

**Logo Placement Prompt:**
```
Add logo to composition:

MAIN LOGO (for reveals):
- Position: Center
- Scale: [XX]%
- Layer name: "Logo_Main"

WATERMARK (corner bug):
- Position: [Bottom right corner]
- Scale: [XX]% (typically 5-10%)
- Opacity: [XX]% (typically 50-80%)
- Layer name: "Logo_Bug"
- Send to top of layer stack
```

---

## Phase 5: Animation 🎭

### Animation Timing Guide

```
ANIMATION TIMING REFERENCE:

INSTANT (1-5 frames):
- Cuts, flashes, impacts

FAST (0.1-0.3s):
- Quick reveals, snappy motion
- Energetic, urgent feel

MEDIUM (0.3-0.6s):
- Standard transitions
- Most UI animations
- Professional feel

SLOW (0.6-1.5s):
- Elegant reveals
- Cinematic motion
- Dramatic emphasis

VERY SLOW (1.5s+):
- Dreamy, emotional
- Background movements
- Continuous loops
```

### Standard Animation Prompts

**Entrance Animations:**
```
Add entrance animation to [LAYER NAME]:

TYPE: [Choose one]
□ Fade in (opacity 0 to 100)
□ Scale in (scale 0 to 100)
□ Slide in from [left/right/top/bottom]
□ Bounce in (with overshoot)
□ Blur in (blur to sharp)
□ Flip in (3D rotation)
□ Typewriter (text only)
□ Word by word (text only)

TIMING:
- Start at: [X]s
- Duration: [X]s
- Easing: [ease-out / bounce / elastic]

Add motion blur: [Yes/No]
```

**Exit Animations:**
```
Add exit animation to [LAYER NAME]:

TYPE: [Choose one]
□ Fade out (opacity 100 to 0)
□ Scale out (scale 100 to 0)
□ Slide out to [left/right/top/bottom]
□ Blur out
□ Zoom out (scale + fade)

TIMING:
- Start at: [X]s
- Duration: [X]s
- Easing: [ease-in]
```

**Emphasis Animations:**
```
Add emphasis to [LAYER NAME]:

TYPE: [Choose one]
□ Pulse (scale 100→110→100)
□ Shake (position wiggle)
□ Glow (brightness pulse)
□ Color shift (color change)
□ Bounce (position)

TRIGGER: [On appear / At specific time / Continuous]
DURATION: [X]s
REPEAT: [Once / Loop]
```

**Continuous Background Animations:**
```
Add continuous animation to [LAYER NAME]:

TYPE:
□ Slow drift (position)
□ Gentle rotation
□ Subtle scale breathing
□ Float up/down
□ Parallax movement

SPEED: Very slow (creates ambient movement)
LOOP: Seamless
Should be subtle, not distracting from main content
```

### Stagger Animation System

```
Create staggered animation across multiple layers:

LAYERS TO ANIMATE:
1. [Layer 1 name]
2. [Layer 2 name]
3. [Layer 3 name]
4. [Layer 4 name]

BASE ANIMATION:
- Type: [fade in / scale in / slide in]
- Duration: [X]s per layer
- Easing: [ease-out]

STAGGER TIMING:
- First layer starts at: [X]s
- Delay between layers: [X]s
- Total sequence duration: [calculated]

DIRECTION: [1→4 or 4→1]
```

---

## Phase 6: Polish ✨

### Effects & Enhancements

**Color Grading Prompt:**
```
Apply color grading to composition:

ON ADJUSTMENT LAYER "Color_Grade":

Option A - Warm Look:
- Increase orange in highlights
- Lift shadows slightly
- Add slight saturation

Option B - Cool Look:
- Add blue to shadows
- Desaturate slightly
- Increase contrast

Option C - Cinematic:
- Lift blacks (not true black)
- Roll off highlights
- Subtle teal in shadows, orange in highlights

Option D - Branded:
- Shift overall hue toward [brand color]
- Maintain readability
```

**Add Production Value:**
```
Add polish effects:

FILM GRAIN:
- Subtle grain overlay
- Opacity: 5-10%
- Blending: Overlay

VIGNETTE:
- Darken edges slightly
- Soft falloff
- Opacity: 20-30%

LENS EFFECTS (if appropriate):
- Subtle lens flare on bright elements
- Light leaks for warmth
- Chromatic aberration (very subtle)

SHARPENING:
- Unsharp mask
- Amount: 50-100
- Radius: 1-2px
```

### Quality Check Prompts

```
Perform quality check:

1. TEXT READABILITY:
   - All text visible and readable?
   - Sufficient contrast with background?
   - Within safe zones?

2. TIMING:
   - All animations complete within duration?
   - No cut-off animations at end?
   - Timing feels natural?

3. BRANDING:
   - Logo visible throughout?
   - Colors match brand?
   - Fonts consistent?

4. TECHNICAL:
   - Frame rate consistent?
   - No render errors?
   - Audio synced (if applicable)?
```

---

## Phase 7: Export 📤

### Export Prompts by Platform

**YouTube/General Web:**
```
Export for YouTube:
- Format: H.264 MP4
- Resolution: 1920x1080 (or 4K: 3840x2160)
- Frame rate: Match composition
- Bitrate: 15-20 Mbps (1080p) or 35-45 Mbps (4K)
- Audio: AAC, 320kbps

Add to render queue and start render.
Save to: [OUTPUT PATH]
```

**Instagram/Social:**
```
Export for Instagram:
- Format: H.264 MP4
- Resolution: [1080x1080 / 1080x1920]
- Frame rate: 30fps
- Bitrate: 5-10 Mbps
- Audio: AAC, 128kbps

Keep under 4GB file size.
```

**High Quality Archive:**
```
Export high quality master:
- Format: Apple ProRes 422 (or 4444 for transparency)
- Resolution: [COMP SIZE]
- Frame rate: [COMP FPS]
- Full quality, no compression artifacts

For archival and future re-encoding.
```

**GIF Export:**
```
Export as GIF:
- Resolution: [WIDTH]x[HEIGHT] (reduce for smaller file)
- Frame rate: 15fps
- Colors: 128-256
- Loop: Forever

Target file size: Under [X]MB
Optimize for web display
```

---

## Complete Project Prompt Templates

### 🎬 Template A: Quick Social Video

```
=== QUICK SOCIAL VIDEO PROJECT ===

BRIEF:
- Platform: [Instagram/TikTok/LinkedIn]
- Duration: [X] seconds
- Message: "[KEY MESSAGE]"
- CTA: "[WHAT SHOULD VIEWERS DO]"

EXECUTE:

1. Create composition:
   - Size: [1080x1080/1080x1920/1920x1080]
   - Duration: [X]s
   - Background: [COLOR]

2. Add main text:
   - "[HEADLINE]" - Large, center
   - Animate: bounce in at 0.5s

3. Add supporting text:
   - "[SUBTEXT]" - Below headline
   - Animate: fade in at 1.5s

4. Add CTA:
   - "[CTA TEXT]" - Bottom
   - Animate: slide up at [X]s
   - Add pulse effect

5. Add logo watermark:
   - Corner position
   - Small, semi-transparent

6. Export as H.264 MP4

===================================
```

### 🎬 Template B: Standard Promo Video

```
=== STANDARD PROMO VIDEO PROJECT ===

BRIEF:
- Duration: 30 seconds
- Platform: Multi-platform
- Brand colors: [PRIMARY], [SECONDARY]

EXECUTE SCENE BY SCENE:

SCENE 1 - HOOK (0-5s):
- Full screen text: "[HOOK]"
- Bounce in animation
- Background: gradient [COLOR1] to [COLOR2]

SCENE 2 - MAIN MESSAGE (5-15s):
- Product/service focus
- 3 key points with icons
- Staggered animation

SCENE 3 - PROOF (15-22s):
- Statistics or testimonial
- Animated counter
- Trust indicators

SCENE 4 - CTA (22-30s):
- Clear next step: "[CTA]"
- Website: "[URL]"
- Logo outro

GLOBAL:
- Add shape wipe transitions between scenes
- Music sync markers at 0s, 5s, 15s, 22s
- Logo watermark throughout

EXPORT:
- H.264 for web
- Square crop version for social

===================================
```

### 🎬 Template C: Full Brand Video

```
=== FULL BRAND VIDEO PROJECT ===

BRIEF:
- Duration: 60-90 seconds
- Purpose: Brand awareness
- Style: Professional, trustworthy

PROJECT STRUCTURE:

1. PROJECT SETUP:
   - Create project "[COMPANY]_Brand_Video"
   - Main comp: 1920x1080, 30fps, [DURATION]
   - Create sub-comps for each section

2. SECTION 1 - INTRO (0-10s):
   - Logo reveal animation
   - Tagline: "[TAGLINE]"
   - Transition to content

3. SECTION 2 - WHO WE ARE (10-25s):
   - Company story in visual text
   - Supporting imagery placeholders
   - Animated statistics

4. SECTION 3 - WHAT WE DO (25-45s):
   - Services/products showcase
   - Feature highlights
   - Visual demonstrations

5. SECTION 4 - WHY CHOOSE US (45-60s):
   - Differentiators
   - Client success indicators
   - Trust elements

6. SECTION 5 - CONTACT (60-90s):
   - All contact methods
   - Social media
   - Logo lockup
   - Fade to end

STYLE GUIDE:
- Animation: Smooth, professional
- Timing: Allow content to breathe
- Color: Brand palette throughout
- Typography: Consistent hierarchy

POST-PRODUCTION:
- Add color grade
- Audio placeholder tracks
- Export multiple formats

===================================
```

---

## 🔄 Iterative Improvement Prompts

### Feedback Loop

```
"The [ELEMENT] needs adjustment:
- Current: [What it looks like now]
- Issue: [What's wrong]
- Desired: [What you want instead]
Please update and show result."
```

### Common Adjustments

```
"Speed up all animations by 20%"
"Increase contrast on text layers"
"Move CTA to appear 2 seconds earlier"
"Add more energy to the intro"
"Make colors more saturated"
"Simplify - remove [ELEMENT]"
"Add [ELEMENT] from [TIME] to [TIME]"
```

---

## ✅ Final Checklist

Before considering any project complete:

```
PRE-FLIGHT CHECKLIST:

□ All text spelled correctly
□ Contact info accurate
□ Dates/numbers verified
□ Logo is correct version
□ Colors match brand guide
□ Animations smooth (no jumps)
□ Audio synced (if applicable)
□ Duration matches requirement
□ Safe zones respected
□ Exported in correct format
□ File size acceptable
□ Preview on target device
```

---

## 📚 Additional Resources

- `PROJECT_WORKFLOWS.md` - Detailed workflow guides
- `AI_PROMPT_LIBRARY.md` - Copy-paste prompts
- `COMPLETE_FEATURE_COVERAGE.md` - All available tools
- `EFFECT_LIBRARY.md` - Effect reference
- `API_REFERENCE.md` - Technical documentation

---

**You now have everything needed to create ANY video project from start to finish using AI!**

Start with the Project Brief, follow the phases, use the templates, and iterate until perfect. 🎬

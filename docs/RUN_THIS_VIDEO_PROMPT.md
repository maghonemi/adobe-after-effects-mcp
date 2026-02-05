# Run This: Create a Video in After Effects

**Use this prompt in Cursor (or any MCP client) with the After Effects MCP server connected and the MCP Bridge panel open in AE with "Auto-run commands" enabled.**

Copy the entire block below and paste it into the chat. The AI will use the MCP tools to build the video step by step.

---

## Instagram-style promo (15s, 1080×1080)

```
Using the After Effects MCP tools, create this video step by step. After each command, use get-results to confirm success. Assume the target composition will be at compIndex 1 (if the project already has other compositions, run list-compositions first and use the correct compIndex for the new comp).

1) Create composition:
   - create-composition: name "AIPromo", width 1080, height 1080, duration 15, frameRate 30, backgroundColor { r: 25, g: 45, b: 120 }.

2) Add layers (use run-script with these parameters):
   - createSolidLayer: compName "AIPromo", name "Background", color [0.1, 0.18, 0.47] (normalized RGB), position [540, 540]. No size (use comp size).
   - createTextLayer: compName "AIPromo", text "Create Something Amazing", position [540, 420], fontSize 56, color [1, 1, 1], fontFamily "Arial", alignment "center".
   - createTextLayer: compName "AIPromo", text "Bring your ideas to life with AI", position [540, 540], fontSize 32, color [0.95, 0.95, 0.95], fontFamily "Arial", alignment "center".

3) Animate (compIndex 1; in AE newest layer = top: layer 1 = subtext, layer 2 = headline, layer 3 = Background):
   - Headline (layer 2): setLayerKeyframe compIndex 1, layerIndex 2, propertyName "Opacity", timeInSeconds 0, value 0. Then timeInSeconds 1, value 100.
   - Headline (layer 2): setLayerKeyframe compIndex 1, layerIndex 2, propertyName "Scale", timeInSeconds 0, value [0, 0]. Then timeInSeconds 1.2, value [100, 100].
   - Subtext (layer 1): setLayerKeyframe compIndex 1, layerIndex 1, propertyName "Opacity", timeInSeconds 0.5, value 0. Then timeInSeconds 2, value 100.

4) Also apply a subtle glow or drop-shadow to the headline using apply-effect-template (e.g. "drop-shadow" or "glow") on compIndex 1, layerIndex 2.

Run the steps in order and report any errors from get-results.
```

---

## What you get

- **Composition:** "AIPromo" — 1080×1080, 15 s, 30 fps, blue background.
- **Layers:** Background solid, headline "Create Something Amazing", subtext "Bring your ideas to life with AI".
- **Animation:** Headline fades and scales in; subtext fades in after.

After it runs, open the composition in After Effects and press Space to preview.

---

## From the AI Prompt Library

This prompt is based on the **Instagram Post (Square)** template in [AI_PROMPT_LIBRARY.md](AI_PROMPT_LIBRARY.md). For more ideas (YouTube intros, LinkedIn, TikTok, motion graphics, etc.), use the prompts in that file and ask the AI to execute them with the After Effects MCP tools.

# Blender MCP vs After Effects MCP – Comparison & Roadmap

This document compares [Blender MCP](https://github.com/maghonemi/blender-mcp) with this After Effects MCP and lists concrete features that can be added (ported from Blender or AE-specific).

---

## 1. Side-by-side comparison

| Capability | Blender MCP | After Effects MCP |
|------------|-------------|-------------------|
| **Scene / project overview** | `get_scene_info`, `get_object_info` | `getProjectInfo`, `listCompositions`, `getLayerInfo`, `getLayerDetails`, `findLayers`, `getProjectState`, `getActiveComposition` |
| **Viewport “vision”** | `get_viewport_screenshot` (image) | ✅ `get-viewport-screenshot` (image) |
| **Run custom code** | `execute_code` (Python in Blender) | ❌ No generic “run ExtendScript” (only predefined `run-script`) |
| **One-shot project setup** | `setup_project` (fps, resolution, collections, etc.) | Partial: create comp, set comp settings, project settings; no single “setup_project” |
| **Rendering** | `render_image`, `render_animation`, `get_render_progress` | `add-to-render-queue`, `start-render`, `export-composition`, `export-frame`; ❌ no render progress |
| **Camera** | Create, set active, DOF, constraints | ✅ Create camera, set properties |
| **Lights** | Create, three-point, world | ✅ Create lights (spot, point, etc.) |
| **Animation** | Keyframes, F-curves, actions, baking, shape keys | Keyframes, easing, expressions, motion paths, presets; no “bake” or F-curve API |
| **Modeling / layers** | Primitives, extrude | Comps, text, shape, solid, null, camera, light, audio, adjustment |
| **Integrations** | Poly Haven, Sketchfab, Hyper3D, Hunyuan3D | ❌ No asset-marketplace integrations |
| **Resources** | — | `compositions`, `project-state`, `active-composition`, `available-effects`, `available-fonts` |

---

## 2. What from Blender MCP can be added here

### 2.1 Already ported

- **Viewport screenshot** → `get-viewport-screenshot` (capture comp frame as PNG for AI “vision”).

### 2.2 High value, feasible

| Feature | Blender concept | AE equivalent | Notes |
|--------|------------------|---------------|--------|
| **Render progress** | `get_render_progress` | Poll render queue (current item, status, frames done) | Expose queue state so AI can report “rendering 45%”. |
| **Unified scene/project info** | `get_scene_info` (one rich summary) | Single tool returning: active comp, comp list summary, layer count, current time, selection, render queue length | One call for “what’s the state?”. |
| **Setup project (one shot)** | `setup_project` (fps, resolution, engine, collections) | Single tool: create comp + set project/comp settings (resolution, fps, duration, maybe folders) | Reduces multi-step setup. |
| **Execute code** | `execute_code` (run Python) | **Execute ExtendScript** (run JSX string) | High power, high risk; optional, with clear warnings and sandbox docs. |

### 2.3 Nice to have

| Feature | Blender concept | AE equivalent |
|--------|------------------|---------------|
| **Object / layer info by name** | `get_object_info` | Already have `getLayerDetails`, `findLayers`; could add “get comp by name” returns full layer tree. |
| **Batch keyframes** | `batch_keyframes` | We have `set-keyframes` (multiple keyframes on one property); could add batch across layers. |

---

## 3. AE-specific additions (not from Blender)

These make sense for motion graphics / video and are not direct Blender ports.

### 3.1 Scene & workflow

- **Get layer tree** – For active (or given) comp: full hierarchy, names, types, in/out, parent chain in one response.
- **Selection** – Get selected layer indices; set selection (for “select layer 2 and 4”).
- **Current time** – Get/set composition current time (and optionally active comp).
- **Guide / reference layer** – Set layer as guide layer so it doesn’t render.

### 3.2 Animation & keyframes

- **Keyframe interpolation** – Get/set interpolation type per keyframe (linear, bezier, hold, etc.).
- **Keyframe selection** – Get selected keyframes; set keyframe selection (e.g. for copy/paste or delete).
- **Graph editor** – Read (and optionally write) keyframe values + interpolation from the “graph” (no full F-curve like Blender, but useful for debugging).

### 3.3 Assets & presets

- **List animation presets** – Enumerate built-in animation presets; apply by name (complement to existing effect/layer presets).
- **List/compose comp dependencies** – Which comps use which comps as layers (for “comp flow”).
- **Missing footage** – Already have `footageGetMissing`; expose as a dedicated tool if not already.

### 3.4 Export & pipeline

- **Render queue status** – Same as “render progress” above: current item, progress, errors.
- **Export to Media Encoder** – Queue comp(s) for Adobe Media Encoder (if supported by ExtendScript).
- **Composition thumbnail** – Small preview image for a comp (e.g. for UI or “what does this comp look like?”).

### 3.5 Text & typography

- **List available fonts** – Already as resource `available-fonts`; expose as a tool so AI can “list fonts” without reading resource URI.
- **Paragraph / character style** – Get/set more text options (alignment, paragraph spacing, etc.) where supported.

### 3.6 Integrations (Blender-style “marketplace”)

- **Stock footage / templates** – Link to Adobe Stock or similar (search/insert placeholder) if API exists.
- **External media** – “Import from URL” or “replace with file from path” (we have replace footage; could add URL or path helpers).

---

## 4. Suggested priority

### Already done

- Viewport screenshot (AI “vision” of scene).

### Quick wins (1–2 days each)

1. **get-render-progress** – ✅ Done. Read render queue status (current item, progress).
2. **get-scene-summary** – One tool returning: active comp name/index, current time, number of layers, number of comps, selected layers (if available).
3. **set-current-time** – Set composition current time (if not already exposed).
4. **List fonts as tool** – Wrap `available-fonts` resource in a `list-available-fonts` tool.

### Medium effort (3–5 days each)

5. **setup-project** – Single tool: create comp + set resolution, fps, duration, background; optional project settings.
6. **get-layer-tree** – Full layer list for a comp (names, types, in/out, indices).
7. **Selection get/set** – Get selected layers; set selected layers by indices.
8. **Keyframe interpolation** – Get/set interpolation for a keyframe.

### Larger / optional

9. **execute-extend-script** – Run arbitrary JSX string (with security and docs).
10. **Integrations** – Stock/media APIs if available and maintainable.

---

## 5. What we’re not porting (Blender-specific)

- **Rigging (armatures, bones, weights, IK)** – No direct AE equivalent.
- **3D modeling (meshes, extrude)** – AE is comp/layer-based; no mesh modeling.
- **Poly Haven / Sketchfab / Hyper3D / Hunyuan3D** – Blender-specific; AE would need its own asset sources (e.g. Adobe Stock, templates).

---

## 6. Summary

- **From Blender:** Viewport screenshot is done. Next best: render progress, unified scene summary, setup-project, and (optionally) execute ExtendScript.
- **AE-specific:** Layer tree, selection, current time, keyframe interpolation, animation presets list, comp dependencies, and list-fonts tool round out a strong “full project from prompt” story.

Use this as a roadmap: implement “quick wins” first, then “medium” items, then consider execute-script and integrations.

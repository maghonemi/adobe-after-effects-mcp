# After Effects MCP Skills

Drop `.md` files here to expose them as MCP resources. Each file becomes a resource the AI can read.

- **URI format**: `aftereffects://skills/<filename-without-extension>`
- **Example**: `core-concepts.md` → `aftereffects://skills/core-concepts`

Restart the MCP server after adding or changing files. Use the `list-skills` tool to see available skills.

## Available Skills

| Skill | Description |
|-------|-------------|
| **core-concepts** | Project structure, layers, transforms, parenting, project management |
| **animation-basics** | Keyframes, easing, motion paths, sequencing, time remapping |
| **effects-guide** | Applying effects, effect templates, managing effects, adjustment layers |
| **text-and-shapes** | Text layers, text animators, shape layers, masks |
| **3d-and-cameras** | 3D layers, cameras, lights, material options, depth of field |
| **rendering-export** | Render queue, export formats, output templates, work area |
| **expressions-guide** | Expression syntax, common expressions, expression controls |
| **workflow-recipes** | Step-by-step recipes for common motion graphics tasks |

## Usage

In your AI conversations, you can load these skills to provide context:

```
Read the aftereffects://skills/animation-basics resource to help with keyframe animation.
```

Or use the `list-skills` tool to see all available skills and their URIs.

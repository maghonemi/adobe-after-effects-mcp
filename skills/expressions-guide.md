# Expressions Guide for After Effects MCP

This skill covers After Effects expressions - JavaScript-based automation for properties.

## Expression Basics

Expressions are small scripts that control property values dynamically.

### Set Expression

```
Tool: expression-set
Parameters:
  - compIndex: number
  - layerIndex: number
  - propertyPath: string
  - expression: string
```

### Remove Expression

```
Tool: expression-remove
Parameters:
  - compIndex: number
  - layerIndex: number
  - propertyPath: string
```

### Toggle Expression

```
Tool: expression-toggle
Parameters:
  - compIndex: number
  - layerIndex: number
  - propertyPath: string
  - enabled: boolean
```

### Get Expression

```
Tool: expression-get
Parameters:
  - compIndex: number
  - layerIndex: number
  - propertyPath: string
```

## Expression Templates

```
Tool: apply-expression-template
Parameters:
  - compIndex: number
  - layerIndex: number
  - propertyPath: string
  - template: string (template name)
  - parameters: object (template variables)
```

Available templates:
- `wiggle` - Random motion
- `bounce` - Bouncy overshoot
- `loop` - Loop keyframes
- `time` - Time-based animation
- `random` - Random values
- `link` - Link to another property

## Expression Controls

Add slider/checkbox controls to drive expressions.

```
Tool: add-expression-control
Parameters:
  - compIndex: number
  - layerIndex: number
  - controlType: "slider" | "checkbox" | "color" | "point" | "angle" | "layer"
  - name: string
  - defaultValue: any (optional)
```

Reference in expressions:
```javascript
effect("Slider Control")("Slider")
effect("Checkbox Control")("Checkbox")
effect("Color Control")("Color")
```

## Common Expressions

### Time-Based

**Continuous rotation:**
```javascript
time * 90  // 90 degrees per second
```

**Oscillation (sine wave):**
```javascript
Math.sin(time * 2) * 50  // oscillate ±50
```

**Pulse (scale):**
```javascript
s = 100 + Math.sin(time * 4) * 10;
[s, s]
```

### Wiggle

**Basic wiggle:**
```javascript
wiggle(frequency, amplitude)
wiggle(3, 50)  // 3 times/sec, 50 pixels
```

**Wiggle only X:**
```javascript
w = wiggle(3, 50);
[w[0], value[1]]
```

**Smooth wiggle:**
```javascript
freq = 2;
amp = 30;
octaves = 3;
wiggle(freq, amp, octaves, 0.5)
```

### Looping

**Loop keyframes (cycle):**
```javascript
loopOut("cycle")  // repeat forever
```

**Loop with ping-pong:**
```javascript
loopOut("pingpong")  // forward then reverse
```

**Loop specific keyframes:**
```javascript
loopOut("cycle", 2)  // loop last 2 keyframes
```

### Bounce & Overshoot

**Bounce after keyframes:**
```javascript
n = 0;
if (numKeys > 0) {
  n = nearestKey(time).index;
  if (key(n).time > time) n--;
}
if (n > 0) {
  t = time - key(n).time;
  amp = velocityAtTime(key(n).time - 0.001);
  freq = 3;
  decay = 5;
  value + amp * (Math.sin(t * freq * Math.PI * 2) / Math.exp(decay * t));
} else {
  value;
}
```

**Simple elastic:**
```javascript
amp = 0.1;
freq = 2;
decay = 4;
n = 0;
if (numKeys > 0) {
  n = nearestKey(time).index;
  if (key(n).time > time) n--;
}
if (n > 0) {
  t = time - key(n).time;
  value + value * amp * Math.sin(t * freq * 2 * Math.PI) / Math.exp(decay * t);
} else {
  value;
}
```

### Linking Properties

**Link to another layer's property:**
```javascript
thisComp.layer("Control Null").transform.position
```

**Link with offset:**
```javascript
thisComp.layer("Other Layer").transform.position + [100, 0]
```

**Parent-like behavior without parenting:**
```javascript
L = thisComp.layer("Parent");
L.toWorld(L.anchorPoint)
```

### Random

**Random value (consistent):**
```javascript
seedRandom(index, true);
random(0, 100)  // 0-100, same each frame
```

**Random value (per frame):**
```javascript
seedRandom(index, false);
random(0, 100)  // changes each frame
```

**Random within range:**
```javascript
random([0, 0], [1920, 1080])  // random position
```

### Conditional

**If/else:**
```javascript
if (time < 2) {
  [0, 0]
} else {
  [100, 100]
}
```

**Ternary:**
```javascript
time < 2 ? 0 : 100
```

**Switch based on layer name:**
```javascript
name = thisLayer.name;
if (name == "A") [100, 100]
else if (name == "B") [50, 50]
else [0, 0]
```

### Value Mapping

**Linear interpolation:**
```javascript
linear(time, 0, 5, 0, 100)  // 0-100 over 5 seconds
```

**Ease interpolation:**
```javascript
ease(time, 0, 5, 0, 100)  // same but with easing
```

**Clamp values:**
```javascript
clamp(value, 0, 100)  // keep between 0-100
```

### Layer Index

**Offset based on layer order:**
```javascript
delay = index * 0.1;  // 0.1s delay per layer
value + [0, -50 * index]  // stack layers
```

**Staggered animation:**
```javascript
delay = index * 0.2;
t = time - delay;
if (t < 0) 0
else if (t < 1) ease(t, 0, 1, 0, 100)
else 100
```

## Property References

### This Layer
```javascript
thisLayer.transform.position
thisLayer.transform.scale
thisLayer.transform.rotation
thisLayer.transform.opacity
thisLayer.effect("Effect Name")("Property")
```

### Other Layers
```javascript
thisComp.layer("Layer Name")
thisComp.layer(1)  // by index
thisComp.layer(index - 1)  // layer above
```

### Composition
```javascript
thisComp.width
thisComp.height
thisComp.duration
thisComp.frameDuration  // 1/fps
```

### Time
```javascript
time  // current time in seconds
timeToFrames(time)  // current frame
framesToTime(30)  // frame 30 in seconds
```

## Expression Examples by Use Case

### Auto-Scale to Comp
```javascript
s = thisComp.width / 1920 * 100;
[s, s]
```

### Counter/Timer
```javascript
Math.floor(time)  // seconds counter
```

### Typewriter (with slider)
```javascript
n = Math.floor(effect("Slider Control")("Slider"));
text.sourceText.substr(0, n)
```

### Follow with Delay
```javascript
delay = 0.2;
thisComp.layer("Leader").transform.position.valueAtTime(time - delay)
```

### Maintain Position When Parent Rotates
```javascript
p = parent.toWorld(anchorPoint);
thisLayer.toWorld(anchorPoint) - p
```

## Debugging Expressions

Expressions that error show as red in AE.

**Common issues:**
- Typos in property names
- Wrong array dimensions
- Division by zero
- Referencing non-existent layers

**Tips:**
- Start simple, add complexity
- Use variables for readability
- Test with simple values first
- Check property type matches (array vs number)

## Best Practices

1. **Use expression controls** - Make adjustments easy
2. **Comment your code** - `// explain what this does`
3. **Name layers clearly** - Expressions reference by name
4. **Keep it simple** - Complex expressions slow renders
5. **Use posterizeTime()** - For intentional frame skipping
6. **Cache complex calculations** - Store in variables
7. **Test edge cases** - Time=0, negative values, etc.

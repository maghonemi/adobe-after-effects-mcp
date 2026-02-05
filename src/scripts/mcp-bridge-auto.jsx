// mcp-bridge-auto.jsx
// Auto-running MCP Bridge panel for After Effects

// ExtendScript (ES3) polyfill: Object.keys is not defined
if (typeof Object.keys !== "function") {
    Object.keys = function (obj) {
        var keys = [];
        for (var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) keys.push(k); }
        return keys;
    };
}

// Remove #include directives as we define functions below
/*
#include "createComposition.jsx"
#include "createTextLayer.jsx"
#include "createShapeLayer.jsx"
#include "createSolidLayer.jsx"
#include "setLayerProperties.jsx"
*/

// --- Function Definitions ---

// --- createComposition (from createComposition.jsx) --- 
function createComposition(args) {
    try {
        var name = args.name || "New Composition";
        var width = parseInt(args.width) || 1920;
        var height = parseInt(args.height) || 1080;
        var pixelAspect = parseFloat(args.pixelAspect) || 1.0;
        var duration = parseFloat(args.duration) || 10.0;
        var frameRate = parseFloat(args.frameRate) || 30.0;
        var bgColor = args.backgroundColor ? [args.backgroundColor.r/255, args.backgroundColor.g/255, args.backgroundColor.b/255] : [0, 0, 0];
        var newComp = app.project.items.addComp(name, width, height, pixelAspect, duration, frameRate);
        if (args.backgroundColor) {
            newComp.bgColor = bgColor;
        }
        return JSON.stringify({
            status: "success", message: "Composition created successfully",
            composition: { name: newComp.name, id: newComp.id, width: newComp.width, height: newComp.height, pixelAspect: newComp.pixelAspect, duration: newComp.duration, frameRate: newComp.frameRate, bgColor: newComp.bgColor }
        }, null, 2);
    } catch (error) {
        return JSON.stringify({ status: "error", message: error.toString() }, null, 2);
    }
}

// --- createTextLayer (from createTextLayer.jsx) ---
function createTextLayer(args) {
    try {
        var compName = args.compName || "";
        var text = args.text || "Text Layer";
        var position = args.position || [960, 540]; 
        var fontSize = args.fontSize || 72;
        var color = args.color || [1, 1, 1]; 
        var startTime = args.startTime || 0;
        var duration = args.duration || 5; 
        var fontFamily = args.fontFamily || "Arial";
        var alignment = args.alignment || "center"; 
        var comp = null;
        for (var i = 1; i <= app.project.numItems; i++) {
            var item = app.project.item(i);
            if (item instanceof CompItem && item.name === compName) { comp = item; break; }
        }
        if (!comp) {
            if (app.project.activeItem instanceof CompItem) { comp = app.project.activeItem; } 
            else { throw new Error("No composition found with name '" + compName + "' and no active composition"); }
        }
        var textLayer = comp.layers.addText(text);
        var textProp = textLayer.property("ADBE Text Properties").property("ADBE Text Document");
        var textDocument = textProp.value;
        textDocument.fontSize = fontSize;
        textDocument.fillColor = color;
        textDocument.font = fontFamily;
        if (alignment === "left") { textDocument.justification = ParagraphJustification.LEFT_JUSTIFY; } 
        else if (alignment === "center") { textDocument.justification = ParagraphJustification.CENTER_JUSTIFY; } 
        else if (alignment === "right") { textDocument.justification = ParagraphJustification.RIGHT_JUSTIFY; }
        textProp.setValue(textDocument);
        textLayer.property("Position").setValue(position);
        textLayer.startTime = startTime;
        if (duration > 0) { textLayer.outPoint = startTime + duration; }
        return JSON.stringify({
            status: "success", message: "Text layer created successfully",
            layer: { name: textLayer.name, index: textLayer.index, type: "text", inPoint: textLayer.inPoint, outPoint: textLayer.outPoint, position: textLayer.property("Position").value }
        }, null, 2);
    } catch (error) {
        return JSON.stringify({ status: "error", message: error.toString() }, null, 2);
    }
}

// --- createShapeLayer (from createShapeLayer.jsx) --- 
function createShapeLayer(args) {
    try {
        var compName = args.compName || "";
        var shapeType = args.shapeType || "rectangle"; 
        var position = args.position || [960, 540]; 
        var size = args.size || [200, 200]; 
        var fillColor = args.fillColor || [1, 0, 0]; 
        var strokeColor = args.strokeColor || [0, 0, 0]; 
        var strokeWidth = args.strokeWidth || 0; 
        var startTime = args.startTime || 0;
        var duration = args.duration || 5; 
        var name = args.name || "Shape Layer";
        var points = args.points || 5; 
        var comp = null;
        for (var i = 1; i <= app.project.numItems; i++) {
            var item = app.project.item(i);
            if (item instanceof CompItem && item.name === compName) { comp = item; break; }
        }
        if (!comp) {
            if (app.project.activeItem instanceof CompItem) { comp = app.project.activeItem; } 
            else { throw new Error("No composition found with name '" + compName + "' and no active composition"); }
        }
        var shapeLayer = comp.layers.addShape();
        shapeLayer.name = name;
        var contents = shapeLayer.property("Contents"); 
        var shapeGroup = contents.addProperty("ADBE Vector Group");
        var groupContents = shapeGroup.property("Contents"); 
        var shapePathProperty;
        if (shapeType === "rectangle") {
            shapePathProperty = groupContents.addProperty("ADBE Vector Shape - Rect");
            shapePathProperty.property("Size").setValue(size);
        } else if (shapeType === "ellipse") {
            shapePathProperty = groupContents.addProperty("ADBE Vector Shape - Ellipse");
            shapePathProperty.property("Size").setValue(size);
        } else if (shapeType === "polygon" || shapeType === "star") { 
            shapePathProperty = groupContents.addProperty("ADBE Vector Shape - Star");
            shapePathProperty.property("Type").setValue(shapeType === "polygon" ? 1 : 2); 
            shapePathProperty.property("Points").setValue(points);
            shapePathProperty.property("Outer Radius").setValue(size[0] / 2);
            if (shapeType === "star") { shapePathProperty.property("Inner Radius").setValue(size[0] / 3); }
        }
        var fill = groupContents.addProperty("ADBE Vector Graphic - Fill");
        fill.property("Color").setValue(fillColor);
        fill.property("Opacity").setValue(100);
        if (strokeWidth > 0) {
            var stroke = groupContents.addProperty("ADBE Vector Graphic - Stroke");
            stroke.property("Color").setValue(strokeColor);
            stroke.property("Stroke Width").setValue(strokeWidth);
            stroke.property("Opacity").setValue(100);
        }
        shapeLayer.property("Position").setValue(position);
        shapeLayer.startTime = startTime;
        if (duration > 0) { shapeLayer.outPoint = startTime + duration; }
        return JSON.stringify({
            status: "success", message: "Shape layer created successfully",
            layer: { name: shapeLayer.name, index: shapeLayer.index, type: "shape", shapeType: shapeType, inPoint: shapeLayer.inPoint, outPoint: shapeLayer.outPoint, position: shapeLayer.property("Position").value }
        }, null, 2);
    } catch (error) {
        return JSON.stringify({ status: "error", message: error.toString() }, null, 2);
    }
}

// --- createSolidLayer (from createSolidLayer.jsx) --- 
function createSolidLayer(args) {
    try {
        var compName = args.compName || "";
        var color = args.color || [1, 1, 1]; 
        var name = args.name || "Solid Layer";
        var position = args.position || [960, 540]; 
        var size = args.size; 
        var startTime = args.startTime || 0;
        var duration = args.duration || 5; 
        var isAdjustment = args.isAdjustment || false; 
        var comp = null;
        for (var i = 1; i <= app.project.numItems; i++) {
            var item = app.project.item(i);
            if (item instanceof CompItem && item.name === compName) { comp = item; break; }
        }
        if (!comp) {
            if (app.project.activeItem instanceof CompItem) { comp = app.project.activeItem; } 
            else { throw new Error("No composition found with name '" + compName + "' and no active composition"); }
        }
        if (!size) { size = [comp.width, comp.height]; }
        var solidLayer;
        if (isAdjustment) {
            solidLayer = comp.layers.addSolid([0, 0, 0], name, size[0], size[1], 1);
            solidLayer.adjustmentLayer = true;
        } else {
            solidLayer = comp.layers.addSolid(color, name, size[0], size[1], 1);
        }
        solidLayer.property("Position").setValue(position);
        solidLayer.startTime = startTime;
        if (duration > 0) { solidLayer.outPoint = startTime + duration; }
        return JSON.stringify({
            status: "success", message: isAdjustment ? "Adjustment layer created successfully" : "Solid layer created successfully",
            layer: { name: solidLayer.name, index: solidLayer.index, type: isAdjustment ? "adjustment" : "solid", inPoint: solidLayer.inPoint, outPoint: solidLayer.outPoint, position: solidLayer.property("Position").value, isAdjustment: solidLayer.adjustmentLayer }
        }, null, 2);
    } catch (error) {
        return JSON.stringify({ status: "error", message: error.toString() }, null, 2);
    }
}

// --- setLayerProperties (modified to handle text properties) ---
function setLayerProperties(args) {
    try {
        var compName = args.compName || "";
        var layerName = args.layerName || "";
        var layerIndex = args.layerIndex; 
        
        // General Properties
        var position = args.position; 
        var scale = args.scale; 
        var rotation = args.rotation; 
        var opacity = args.opacity; 
        var startTime = args.startTime; 
        var duration = args.duration; 

        // Text Specific Properties
        var textContent = args.text; // New: text content
        var fontFamily = args.fontFamily; // New: font family
        var fontSize = args.fontSize; // New: font size
        var fillColor = args.fillColor; // New: font color
        
        // Find the composition (same logic as before)
        var comp = null;
        for (var i = 1; i <= app.project.numItems; i++) {
            var item = app.project.item(i);
            if (item instanceof CompItem && item.name === compName) { comp = item; break; }
        }
        if (!comp) {
            if (app.project.activeItem instanceof CompItem) { comp = app.project.activeItem; } 
            else { throw new Error("No composition found with name '" + compName + "' and no active composition"); }
        }
        
        // Find the layer (same logic as before)
        var layer = null;
        if (layerIndex !== undefined && layerIndex !== null) {
            if (layerIndex > 0 && layerIndex <= comp.numLayers) { layer = comp.layer(layerIndex); } 
            else { throw new Error("Layer index out of bounds: " + layerIndex); }
        } else if (layerName) {
            for (var j = 1; j <= comp.numLayers; j++) {
                if (comp.layer(j).name === layerName) { layer = comp.layer(j); break; }
            }
        }
        if (!layer) { throw new Error("Layer not found: " + (layerName || "index " + layerIndex)); }
        
        var changedProperties = [];
        var textDocumentChanged = false;
        var textProp = null;
        var textDocument = null;

        // --- Text Property Handling ---
        if (layer instanceof TextLayer && (textContent !== undefined || fontFamily !== undefined || fontSize !== undefined || fillColor !== undefined)) {
            var sourceTextProp = layer.property("Source Text");
            if (sourceTextProp && sourceTextProp.value) {
                var currentTextDocument = sourceTextProp.value; // Get the current value
                var updated = false;

                if (textContent !== undefined && textContent !== null && currentTextDocument.text !== textContent) {
                    currentTextDocument.text = textContent;
                    changedProperties.push("text");
                    updated = true;
                }
                if (fontFamily !== undefined && fontFamily !== null && currentTextDocument.font !== fontFamily) {
                    // Add basic validation/logging for font existence if needed
                    // try { app.fonts.findFont(fontFamily); } catch (e) { logToPanel("Warning: Font '"+fontFamily+"' might not be installed."); }
                    currentTextDocument.font = fontFamily;
                    changedProperties.push("fontFamily");
                    updated = true;
                }
                if (fontSize !== undefined && fontSize !== null && currentTextDocument.fontSize !== fontSize) {
                    currentTextDocument.fontSize = fontSize;
                    changedProperties.push("fontSize");
                    updated = true;
                }
                // Comparing colors needs care due to potential floating point inaccuracies if set via UI
                // Simple comparison for now
                if (fillColor !== undefined && fillColor !== null && 
                    (currentTextDocument.fillColor[0] !== fillColor[0] || 
                     currentTextDocument.fillColor[1] !== fillColor[1] || 
                     currentTextDocument.fillColor[2] !== fillColor[2])) {
                    currentTextDocument.fillColor = fillColor;
                    changedProperties.push("fillColor");
                    updated = true;
                }

                // Only set the value if something actually changed
                if (updated) {
                    try {
                        sourceTextProp.setValue(currentTextDocument);
                        logToPanel("Applied changes to Text Document for layer: " + layer.name);
                    } catch (e) {
                        logToPanel("ERROR applying Text Document changes: " + e.toString());
                        // Decide if we should throw or just log the error for text properties
                        // For now, just log, other properties might still succeed
                    }
                }
                 // Store the potentially updated document for the return value
                 textDocument = currentTextDocument; 

            } else {
                logToPanel("Warning: Could not access Source Text property for layer: " + layer.name);
            }
        }

        // --- General Property Handling ---
        if (position !== undefined && position !== null) { layer.property("Position").setValue(position); changedProperties.push("position"); }
        if (scale !== undefined && scale !== null) { layer.property("Scale").setValue(scale); changedProperties.push("scale"); }
        if (rotation !== undefined && rotation !== null) {
            if (layer.threeDLayer) { 
                // For 3D layers, Z rotation is often what's intended by a single value
                layer.property("Z Rotation").setValue(rotation);
            } else { 
                layer.property("Rotation").setValue(rotation); 
            }
            changedProperties.push("rotation");
        }
        if (opacity !== undefined && opacity !== null) { layer.property("Opacity").setValue(opacity); changedProperties.push("opacity"); }
        if (startTime !== undefined && startTime !== null) { layer.startTime = startTime; changedProperties.push("startTime"); }
        if (duration !== undefined && duration !== null && duration > 0) {
            var actualStartTime = (startTime !== undefined && startTime !== null) ? startTime : layer.startTime;
            layer.outPoint = actualStartTime + duration;
            changedProperties.push("duration");
        }

        // Return success with updated layer details (including text if changed)
        var returnLayerInfo = {
            name: layer.name,
            index: layer.index,
            position: layer.property("Position").value,
            scale: layer.property("Scale").value,
            rotation: layer.threeDLayer ? layer.property("Z Rotation").value : layer.property("Rotation").value, // Return appropriate rotation
            opacity: layer.property("Opacity").value,
            inPoint: layer.inPoint,
            outPoint: layer.outPoint,
            changedProperties: changedProperties
        };
        // Add text properties to the return object if it was a text layer
        if (layer instanceof TextLayer && textDocument) {
            returnLayerInfo.text = textDocument.text;
            returnLayerInfo.fontFamily = textDocument.font;
            returnLayerInfo.fontSize = textDocument.fontSize;
            returnLayerInfo.fillColor = textDocument.fillColor;
        }

        // *** ADDED LOGGING HERE ***
        logToPanel("Final check before return:");
        logToPanel("  Changed Properties: " + changedProperties.join(", "));
        logToPanel("  Return Layer Info Font: " + (returnLayerInfo.fontFamily || "N/A")); 
        logToPanel("  TextDocument Font: " + (textDocument ? textDocument.font : "N/A"));

        return JSON.stringify({
            status: "success", message: "Layer properties updated successfully",
            layer: returnLayerInfo
        }, null, 2);
    } catch (error) {
        // Error handling remains similar, but add more specific checks if needed
        return JSON.stringify({ status: "error", message: error.toString() }, null, 2);
    }
}

/**
 * Sets a keyframe for a specific property on a layer.
 * Indices are 1-based for After Effects collections.
 * @param {number} compIndex - The index of the composition (1-based).
 * @param {number} layerIndex - The index of the layer within the composition (1-based).
 * @param {string} propertyName - The name of the property (e.g., "Position", "Scale", "Rotation", "Opacity").
 * @param {number} timeInSeconds - The time (in seconds) for the keyframe.
 * @param {any} value - The value for the keyframe (e.g., [x, y] for Position, [w, h] for Scale, angle for Rotation, percentage for Opacity).
 * @returns {string} JSON string indicating success or error.
 */
function setLayerKeyframe(compIndex, layerIndex, propertyName, timeInSeconds, value) {
    try {
        // Use 1-based indices as per After Effects API
        var comp = app.project.items[compIndex];
        if (!comp || !(comp instanceof CompItem)) {
            return JSON.stringify({ success: false, message: "Composition not found at index " + compIndex });
        }
        var layer = comp.layers[layerIndex];
        if (!layer) {
            return JSON.stringify({ success: false, message: "Layer not found at index " + layerIndex + " in composition '" + comp.name + "'"});
        }

        var transformGroup = layer.property("Transform");
        if (!transformGroup) {
             return JSON.stringify({ success: false, message: "Transform properties not found for layer '" + layer.name + "' (type: " + layer.matchName + ")." });
        }

        var property = transformGroup.property(propertyName);
        if (!property) {
            // Check other common property groups if not in Transform
             if (layer.property("Effects") && layer.property("Effects").property(propertyName)) {
                 property = layer.property("Effects").property(propertyName);
             } else if (layer.property("Text") && layer.property("Text").property(propertyName)) {
                 property = layer.property("Text").property(propertyName);
            } // Add more groups if needed (e.g., Masks, Shapes)

            if (!property) {
                 return JSON.stringify({ success: false, message: "Property '" + propertyName + "' not found on layer '" + layer.name + "'." });
            }
        }


        // Ensure the property can be keyframed
        if (!property.canVaryOverTime) {
             return JSON.stringify({ success: false, message: "Property '" + propertyName + "' cannot be keyframed." });
        }

        // Make sure the property is enabled for keyframing
        if (property.numKeys === 0 && !property.isTimeVarying) {
             property.setValueAtTime(comp.time, property.value); // Set initial keyframe if none exist
        }


        property.setValueAtTime(timeInSeconds, value);

        return JSON.stringify({ success: true, message: "Keyframe set for '" + propertyName + "' on layer '" + layer.name + "' at " + timeInSeconds + "s." });
    } catch (e) {
        return JSON.stringify({ success: false, message: "Error setting keyframe: " + e.toString() + " (Line: " + e.line + ")" });
    }
}


/**
 * Sets an expression for a specific property on a layer.
 * @param {number} compIndex - The index of the composition (1-based).
 * @param {number} layerIndex - The index of the layer within the composition (1-based).
 * @param {string} propertyName - The name of the property (e.g., "Position", "Scale", "Rotation", "Opacity").
 * @param {string} expressionString - The JavaScript expression string. Use "" to remove expression.
 * @returns {string} JSON string indicating success or error.
 */
function setLayerExpression(compIndex, layerIndex, propertyName, expressionString) {
    try {
         // Adjust indices to be 0-based for ExtendScript arrays
        var comp = app.project.items[compIndex];
         if (!comp || !(comp instanceof CompItem)) {
            return JSON.stringify({ success: false, message: "Composition not found at index " + compIndex });
        }
        var layer = comp.layers[layerIndex];
         if (!layer) {
            return JSON.stringify({ success: false, message: "Layer not found at index " + layerIndex + " in composition '" + comp.name + "'"});
        }

        var transformGroup = layer.property("Transform");
         if (!transformGroup) {
             // Allow expressions on non-transformable layers if property exists elsewhere
             // return JSON.stringify({ success: false, message: "Transform properties not found for layer '" + layer.name + "' (type: " + layer.matchName + ")." });
        }

        var property = transformGroup ? transformGroup.property(propertyName) : null;
         if (!property) {
            // Check other common property groups if not in Transform
             if (layer.property("Effects") && layer.property("Effects").property(propertyName)) {
                 property = layer.property("Effects").property(propertyName);
             } else if (layer.property("Text") && layer.property("Text").property(propertyName)) {
                 property = layer.property("Text").property(propertyName);
             } // Add more groups if needed

            if (!property) {
                 return JSON.stringify({ success: false, message: "Property '" + propertyName + "' not found on layer '" + layer.name + "'." });
            }
        }

        if (!property.canSetExpression) {
            return JSON.stringify({ success: false, message: "Property '" + propertyName + "' does not support expressions." });
        }

        property.expression = expressionString;

        var action = expressionString === "" ? "removed" : "set";
        return JSON.stringify({ success: true, message: "Expression " + action + " for '" + propertyName + "' on layer '" + layer.name + "'." });
    } catch (e) {
        return JSON.stringify({ success: false, message: "Error setting expression: " + e.toString() + " (Line: " + e.line + ")" });
    }
}

// --- applyEffect (from applyEffect.jsx) ---
function applyEffect(args) {
    try {
        // Extract parameters
        var effectName = args.effectName; // Name of the effect to apply
        var effectMatchName = args.effectMatchName; // After Effects internal name (more reliable)
        var effectCategory = args.effectCategory || ""; // Optional category for filtering
        var presetPath = args.presetPath; // Optional path to an effect preset
        var effectSettings = args.effectSettings || {}; // Optional effect parameters
        
        if (!effectName && !effectMatchName && !presetPath) {
            throw new Error("You must specify either effectName, effectMatchName, or presetPath");
        }
        
        // Resolve composition by index or name
        var comp = null;
        if (args.compIndex !== undefined && args.compIndex !== null) {
            comp = app.project.item(args.compIndex);
            if (!comp || !(comp instanceof CompItem)) {
                throw new Error("Project item at index " + args.compIndex + " is not a composition (index is over all project items: folders, footage, comps). Use compName with a name from list-compositions, or omit comp to use the active composition.");
            }
        } else if (args.compName) {
            for (var i = 1; i <= app.project.numItems; i++) {
                var item = app.project.item(i);
                if (item instanceof CompItem && item.name === args.compName) {
                    comp = item;
                    break;
                }
            }
            if (!comp) {
                throw new Error("Composition not found: '" + args.compName + "'. Use list-compositions to see available comps.");
            }
        } else {
            // Try active composition as fallback
            if (app.project.activeItem && app.project.activeItem instanceof CompItem) {
                comp = app.project.activeItem;
            } else {
                throw new Error("No composition specified. Provide compName (from list-compositions) or open a composition in After Effects. Avoid compIndex unless you know the project item index is a comp.");
            }
        }
        
        // Resolve layer by index or name
        var layer = null;
        if (args.layerIndex !== undefined && args.layerIndex !== null) {
            layer = comp.layer(args.layerIndex);
            if (!layer) {
                throw new Error("Layer not found at index " + args.layerIndex + " in composition '" + comp.name + "'");
            }
        } else if (args.layerName) {
            try {
                layer = comp.layer(args.layerName);
            } catch (e) {
                throw new Error("Layer not found: '" + args.layerName + "' in composition '" + comp.name + "'");
            }
            if (!layer) {
                throw new Error("Layer not found: '" + args.layerName + "' in composition '" + comp.name + "'");
            }
        } else {
            // Default to first layer
            if (comp.numLayers > 0) {
                layer = comp.layer(1);
            } else {
                throw new Error("Composition '" + comp.name + "' has no layers. Add a layer first.");
            }
        }
        
        var effectResult;
        
        // Apply preset if a path is provided
        if (presetPath) {
            var presetFile = new File(presetPath);
            if (!presetFile.exists) {
                throw new Error("Effect preset file not found: " + presetPath);
            }
            
            // Apply the preset to the layer
            layer.applyPreset(presetFile);
            effectResult = {
                type: "preset",
                name: presetPath.split('/').pop().split('\\').pop(),
                applied: true
            };
        }
        // Apply effect by match name (more reliable method)
        else if (effectMatchName) {
            var effect = layer.Effects.addProperty(effectMatchName);
            effectResult = {
                type: "effect",
                name: effect.name,
                matchName: effect.matchName,
                index: effect.propertyIndex
            };
            
            // Apply settings if provided
            applyEffectSettings(effect, effectSettings);
        }
        // Apply effect by display name
        else {
            // Get the effect from the Effect menu
            var effect = layer.Effects.addProperty(effectName);
            effectResult = {
                type: "effect",
                name: effect.name,
                matchName: effect.matchName,
                index: effect.propertyIndex
            };
            
            // Apply settings if provided
            applyEffectSettings(effect, effectSettings);
        }
        
        return JSON.stringify({
            status: "success",
            message: "Effect applied successfully",
            effect: effectResult,
            layer: {
                name: layer.name,
                index: layer.index
            },
            composition: {
                name: comp.name
            }
        }, null, 2);
    } catch (error) {
        return JSON.stringify({
            status: "error",
            message: error.toString()
        }, null, 2);
    }
}

// Helper function to apply effect settings
function applyEffectSettings(effect, settings) {
    // Skip if no settings are provided
    if (!settings || Object.keys(settings).length === 0) {
        return;
    }
    
    // Iterate through all provided settings
    for (var propName in settings) {
        if (settings.hasOwnProperty(propName)) {
            try {
                // Find the property in the effect
                var property = null;
                
                // Try direct property access first
                try {
                    property = effect.property(propName);
                } catch (e) {
                    // If direct access fails, search through all properties
                    for (var i = 1; i <= effect.numProperties; i++) {
                        var prop = effect.property(i);
                        if (prop.name === propName) {
                            property = prop;
                            break;
                        }
                    }
                }
                
                // Set the property value if found
                if (property && property.setValue) {
                    property.setValue(settings[propName]);
                }
            } catch (e) {
                // Log error but continue with other properties
                $.writeln("Error setting effect property '" + propName + "': " + e.toString());
            }
        }
    }
}

// --- applyEffectTemplate (from applyEffectTemplate.jsx) ---
function applyEffectTemplate(args) {
    try {
        // Extract parameters
        var templateName = args.templateName; // Name of the template to apply
        var customSettings = args.customSettings || {}; // Optional customizations
        
        if (!templateName) {
            throw new Error("You must specify a templateName");
        }
        
        // Resolve composition by index or name
        var comp = null;
        if (args.compIndex !== undefined && args.compIndex !== null) {
            comp = app.project.item(args.compIndex);
            if (!comp || !(comp instanceof CompItem)) {
                throw new Error("Composition not found at index " + args.compIndex);
            }
        } else if (args.compName) {
            for (var i = 1; i <= app.project.numItems; i++) {
                var item = app.project.item(i);
                if (item instanceof CompItem && item.name === args.compName) {
                    comp = item;
                    break;
                }
            }
            if (!comp) {
                throw new Error("Composition not found: '" + args.compName + "'");
            }
        } else {
            if (app.project.activeItem && app.project.activeItem instanceof CompItem) {
                comp = app.project.activeItem;
            } else {
                throw new Error("No composition specified. Provide compIndex or compName.");
            }
        }
        
        // Resolve layer by index or name
        var layer = null;
        if (args.layerIndex !== undefined && args.layerIndex !== null) {
            layer = comp.layer(args.layerIndex);
            if (!layer) {
                throw new Error("Layer not found at index " + args.layerIndex);
            }
        } else if (args.layerName) {
            try {
                layer = comp.layer(args.layerName);
            } catch (e) {
                throw new Error("Layer not found: '" + args.layerName + "'");
            }
        } else {
            if (comp.numLayers > 0) {
                layer = comp.layer(1);
            } else {
                throw new Error("Composition has no layers");
            }
        }
        
        // Template definitions
        var templates = {
            // Blur effects
            "gaussian-blur": {
                effectMatchName: "ADBE Gaussian Blur 2",
                settings: {
                    "Blurriness": customSettings.blurriness || 20
                }
            },
            "directional-blur": {
                effectMatchName: "ADBE Directional Blur",
                settings: {
                    "Direction": customSettings.direction || 0,
                    "Blur Length": customSettings.length || 10
                }
            },
            
            // Color correction effects
            "color-balance": {
                effectMatchName: "ADBE Color Balance (HLS)",
                settings: {
                    "Hue": customSettings.hue || 0,
                    "Lightness": customSettings.lightness || 0,
                    "Saturation": customSettings.saturation || 0
                }
            },
            "brightness-contrast": {
                effectMatchName: "ADBE Brightness & Contrast 2",
                settings: {
                    "Brightness": customSettings.brightness || 0,
                    "Contrast": customSettings.contrast || 0,
                    "Use Legacy": false
                }
            },
            "curves": {
                effectMatchName: "ADBE CurvesCustom",
                // Curves are complex and would need special handling
            },
            
            // Stylistic effects
            "glow": {
                effectMatchName: "ADBE Glow",
                settings: {
                    "Glow Threshold": customSettings.threshold || 50,
                    "Glow Radius": customSettings.radius || 15,
                    "Glow Intensity": customSettings.intensity || 1
                }
            },
            "drop-shadow": {
                effectMatchName: "ADBE Drop Shadow",
                settings: {
                    "Shadow Color": customSettings.color || [0, 0, 0, 1],
                    "Opacity": customSettings.opacity || 50,
                    "Direction": customSettings.direction || 135,
                    "Distance": customSettings.distance || 10,
                    "Softness": customSettings.softness || 10
                }
            },
            
            // Common effect chains
            "cinematic-look": {
                effects: [
                    {
                        effectMatchName: "ADBE CurvesCustom",
                        settings: {}
                    },
                    {
                        effectMatchName: "ADBE Vibrance",
                        settings: {
                            "Vibrance": 15,
                            "Saturation": -5
                        }
                    }
                ]
            },
            "text-pop": {
                effects: [
                    {
                        effectMatchName: "ADBE Drop Shadow",
                        settings: {
                            "Shadow Color": [0, 0, 0, 1],
                            "Opacity": 75,
                            "Distance": 5,
                            "Softness": 10
                        }
                    },
                    {
                        effectMatchName: "ADBE Glow",
                        settings: {
                            "Glow Threshold": 50,
                            "Glow Radius": 10,
                            "Glow Intensity": 1.5
                        }
                    }
                ]
            }
        };
        
        // Check if the requested template exists
        var template = templates[templateName];
        if (!template) {
            var availableTemplates = Object.keys(templates).join(", ");
            throw new Error("Template '" + templateName + "' not found. Available templates: " + availableTemplates);
        }
        
        var appliedEffects = [];
        
        // Apply single effect or multiple effects based on template structure
        if (template.effectMatchName) {
            // Single effect template
            var effect = layer.Effects.addProperty(template.effectMatchName);
            
            // Apply settings
            for (var propName in template.settings) {
                try {
                    var property = effect.property(propName);
                    if (property) {
                        property.setValue(template.settings[propName]);
                    }
                } catch (e) {
                    $.writeln("Warning: Could not set " + propName + " on effect " + effect.name + ": " + e);
                }
            }
            
            appliedEffects.push({
                name: effect.name,
                matchName: effect.matchName
            });
        } else if (template.effects) {
            // Multiple effects template
            for (var i = 0; i < template.effects.length; i++) {
                var effectData = template.effects[i];
                var effect = layer.Effects.addProperty(effectData.effectMatchName);
                
                // Apply settings
                for (var propName in effectData.settings) {
                    try {
                        var property = effect.property(propName);
                        if (property) {
                            property.setValue(effectData.settings[propName]);
                        }
                    } catch (e) {
                        $.writeln("Warning: Could not set " + propName + " on effect " + effect.name + ": " + e);
                    }
                }
                
                appliedEffects.push({
                    name: effect.name,
                    matchName: effect.matchName
                });
            }
        }
        
        return JSON.stringify({
            status: "success",
            message: "Effect template '" + templateName + "' applied successfully",
            appliedEffects: appliedEffects,
            layer: {
                name: layer.name,
                index: layerIndex
            },
            composition: {
                name: comp.name,
                index: compIndex
            }
        }, null, 2);
    } catch (error) {
        return JSON.stringify({
            status: "error",
            message: error.toString()
        }, null, 2);
    }
}

// --- End of Function Definitions ---

// --- Bridge test function to verify communication and effects application ---
function bridgeTestEffects(args) {
    try {
        var compIndex = (args && args.compIndex) ? args.compIndex : 1;
        var layerIndex = (args && args.layerIndex) ? args.layerIndex : 1;

        // Apply a light Gaussian Blur
        var blurRes = JSON.parse(applyEffect({
            compIndex: compIndex,
            layerIndex: layerIndex,
            effectMatchName: "ADBE Gaussian Blur 2",
            effectSettings: { "Blurriness": 5 }
        }));

        // Apply a simple drop shadow via template
        var shadowRes = JSON.parse(applyEffectTemplate({
            compIndex: compIndex,
            layerIndex: layerIndex,
            templateName: "drop-shadow"
        }));

        return JSON.stringify({
            status: "success",
            message: "Bridge test effects applied.",
            results: [blurRes, shadowRes]
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// ============================================================================
// NEW FUNCTIONS - Layer Operations
// ============================================================================

// Helper to get composition
function getComp(args) {
    var comp = null;
    if (args.compIndex) {
        comp = app.project.item(args.compIndex);
    } else if (args.compName) {
        for (var i = 1; i <= app.project.numItems; i++) {
            if (app.project.item(i) instanceof CompItem && app.project.item(i).name === args.compName) {
                comp = app.project.item(i);
                break;
            }
        }
    } else if (app.project.activeItem instanceof CompItem) {
        comp = app.project.activeItem;
    }
    if (!comp || !(comp instanceof CompItem)) {
        throw new Error("Composition not found");
    }
    return comp;
}

// Create Null Layer
function createNullLayer(args) {
    try {
        var comp = getComp(args);
        var nullLayer = comp.layers.addNull();
        nullLayer.name = args.name || "Null";
        
        if (args.position) {
            nullLayer.property("Position").setValue(args.position);
        }
        if (args.is3D) {
            nullLayer.threeDLayer = true;
        }
        
        return JSON.stringify({
            status: "success",
            message: "Null layer created",
            layer: { name: nullLayer.name, index: nullLayer.index }
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// Duplicate Layer
function duplicateLayer(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var count = args.count || 1;
        var duplicates = [];
        
        for (var i = 0; i < count; i++) {
            var dup = layer.duplicate();
            if (args.offsetPosition) {
                var pos = dup.property("Position").value;
                dup.property("Position").setValue([
                    pos[0] + args.offsetPosition[0] * (i + 1),
                    pos[1] + args.offsetPosition[1] * (i + 1)
                ]);
            }
            if (args.offsetTime) {
                dup.startTime = layer.startTime + args.offsetTime * (i + 1);
            }
            duplicates.push({ name: dup.name, index: dup.index });
        }
        
        return JSON.stringify({
            status: "success",
            message: count + " layer(s) duplicated",
            duplicates: duplicates
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// Parent Layer
function parentLayer(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var childLayer = comp.layer(args.childLayerIndex);
        
        if (args.parentLayerIndex === null || args.parentLayerIndex === undefined) {
            childLayer.parent = null;
            return JSON.stringify({
                status: "success",
                message: "Parent removed from layer " + childLayer.name
            }, null, 2);
        } else {
            var parentLayer = comp.layer(args.parentLayerIndex);
            childLayer.parent = parentLayer;
            return JSON.stringify({
                status: "success",
                message: "Layer " + childLayer.name + " parented to " + parentLayer.name
            }, null, 2);
        }
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// Precompose Layers
function precomposeLayers(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layers = [];
        for (var i = 0; i < args.layerIndices.length; i++) {
            layers.push(comp.layer(args.layerIndices[i]));
        }
        
        // Select the layers
        for (var j = 1; j <= comp.numLayers; j++) {
            comp.layer(j).selected = false;
        }
        for (var k = 0; k < layers.length; k++) {
            layers[k].selected = true;
        }
        
        var moveAttrs = args.moveAttributes !== false;
        var newComp = comp.layers.precompose(args.layerIndices, args.newCompName, moveAttrs);
        
        return JSON.stringify({
            status: "success",
            message: "Precomposed " + layers.length + " layers into " + args.newCompName,
            newComp: { name: newComp.name, id: newComp.id }
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// Add composition as layer (drop a comp into another comp as a layer)
function addCompAsLayer(args) {
    try {
        // Target comp: the composition we add the layer INTO
        var targetComp = null;
        if (args.targetCompIndex !== undefined && args.targetCompIndex !== null) {
            targetComp = app.project.item(args.targetCompIndex);
            if (!targetComp || !(targetComp instanceof CompItem)) {
                throw new Error("Target composition not found at index " + args.targetCompIndex);
            }
        } else if (args.targetCompName) {
            for (var i = 1; i <= app.project.numItems; i++) {
                var item = app.project.item(i);
                if (item instanceof CompItem && item.name === args.targetCompName) {
                    targetComp = item;
                    break;
                }
            }
            if (!targetComp) throw new Error("Target composition not found: " + args.targetCompName);
        } else {
            if (app.project.activeItem && app.project.activeItem instanceof CompItem) {
                targetComp = app.project.activeItem;
            } else {
                throw new Error("No target composition. Provide targetCompIndex or targetCompName, or open a comp.");
            }
        }
        // Source comp: the composition we add AS a layer (must be a CompItem in the project)
        var sourceComp = null;
        if (args.sourceCompIndex !== undefined && args.sourceCompIndex !== null) {
            sourceComp = app.project.item(args.sourceCompIndex);
            if (!sourceComp || !(sourceComp instanceof CompItem)) {
                throw new Error("Source composition not found at index " + args.sourceCompIndex);
            }
        } else if (args.sourceCompName) {
            for (var j = 1; j <= app.project.numItems; j++) {
                var it = app.project.item(j);
                if (it instanceof CompItem && it.name === args.sourceCompName) {
                    sourceComp = it;
                    break;
                }
            }
            if (!sourceComp) throw new Error("Source composition not found: " + args.sourceCompName);
        } else {
            throw new Error("Source composition required. Provide sourceCompIndex or sourceCompName.");
        }
        if (sourceComp === targetComp) {
            throw new Error("Source and target composition cannot be the same (would create infinite recursion).");
        }
        var layer = targetComp.layers.add(sourceComp);
        if (args.layerName) layer.name = args.layerName;
        if (args.position !== undefined && args.position !== null && args.position >= 1 && args.position !== layer.index) {
            layer.moveToEnd();
            if (args.position <= targetComp.numLayers) {
                layer.moveBefore(targetComp.layer(args.position));
            }
        }
        return JSON.stringify({
            status: "success",
            message: "Added composition '" + sourceComp.name + "' as layer in '" + targetComp.name + "'",
            layer: { name: layer.name, index: layer.index },
            targetComp: targetComp.name,
            sourceComp: sourceComp.name
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// Set Blend Mode
function setBlendMode(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        
        var blendModes = {
            "normal": BlendingMode.NORMAL,
            "dissolve": BlendingMode.DISSOLVE,
            "darken": BlendingMode.DARKEN,
            "multiply": BlendingMode.MULTIPLY,
            "color-burn": BlendingMode.COLOR_BURN,
            "linear-burn": BlendingMode.LINEAR_BURN,
            "darker-color": BlendingMode.DARKER_COLOR,
            "add": BlendingMode.ADD,
            "lighten": BlendingMode.LIGHTEN,
            "screen": BlendingMode.SCREEN,
            "color-dodge": BlendingMode.COLOR_DODGE,
            "linear-dodge": BlendingMode.LINEAR_DODGE,
            "lighter-color": BlendingMode.LIGHTER_COLOR,
            "overlay": BlendingMode.OVERLAY,
            "soft-light": BlendingMode.SOFT_LIGHT,
            "hard-light": BlendingMode.HARD_LIGHT,
            "vivid-light": BlendingMode.VIVID_LIGHT,
            "linear-light": BlendingMode.LINEAR_LIGHT,
            "pin-light": BlendingMode.PIN_LIGHT,
            "hard-mix": BlendingMode.HARD_MIX,
            "difference": BlendingMode.DIFFERENCE,
            "exclusion": BlendingMode.EXCLUSION,
            "subtract": BlendingMode.SUBTRACT,
            "divide": BlendingMode.DIVIDE,
            "hue": BlendingMode.HUE,
            "saturation": BlendingMode.SATURATION,
            "color": BlendingMode.COLOR,
            "luminosity": BlendingMode.LUMINOSITY
        };
        
        if (blendModes[args.blendMode]) {
            layer.blendingMode = blendModes[args.blendMode];
        }
        
        return JSON.stringify({
            status: "success",
            message: "Blend mode set to " + args.blendMode
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// Set Track Matte
function setTrackMatte(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        
        var matteTypes = {
            "none": TrackMatteType.NO_TRACK_MATTE,
            "alpha": TrackMatteType.ALPHA,
            "alpha-inverted": TrackMatteType.ALPHA_INVERTED,
            "luma": TrackMatteType.LUMA,
            "luma-inverted": TrackMatteType.LUMA_INVERTED
        };
        
        layer.trackMatteType = matteTypes[args.matteType] || TrackMatteType.NO_TRACK_MATTE;
        
        return JSON.stringify({
            status: "success",
            message: "Track matte set to " + args.matteType
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// Convert to 3D
function convertTo3D(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        layer.threeDLayer = args.enable3D;
        
        return JSON.stringify({
            status: "success",
            message: "3D " + (args.enable3D ? "enabled" : "disabled") + " for layer " + layer.name
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// ============================================================================
// NEW FUNCTIONS - Camera and Light
// ============================================================================

// Create Camera
function createCamera(args) {
    try {
        var comp = getComp(args);
        var centerPoint = [comp.width / 2, comp.height / 2];
        
        var camera;
        if (args.cameraType === "one-node") {
            camera = comp.layers.addCamera(args.name || "Camera", centerPoint);
        } else {
            camera = comp.layers.addCamera(args.name || "Camera", centerPoint);
        }
        
        if (args.zoom) {
            camera.property("Camera Options").property("Zoom").setValue(args.zoom);
        }
        if (args.position) {
            camera.property("Position").setValue(args.position);
        }
        if (args.pointOfInterest) {
            camera.property("Point of Interest").setValue(args.pointOfInterest);
        }
        if (args.depthOfField) {
            camera.property("Camera Options").property("Depth of Field").setValue(1);
        }
        if (args.focusDistance !== undefined) {
            camera.property("Camera Options").property("Focus Distance").setValue(args.focusDistance);
        }
        if (args.aperture !== undefined) {
            camera.property("Camera Options").property("Aperture").setValue(args.aperture);
        }
        
        return JSON.stringify({
            status: "success",
            message: "Camera created",
            layer: { name: camera.name, index: camera.index }
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// Create Light
// addLight(name, centerPoint) - centerPoint must be [x, y] only (2 elements). Z is set via Position after.
function createLight(args) {
    try {
        var comp = getComp(args);
        var centerPoint = [comp.width / 2, comp.height / 2];  // AE addLight only accepts [x, y]
        
        var lightTypes = {
            "parallel": LightType.PARALLEL,
            "spot": LightType.SPOT,
            "point": LightType.POINT,
            "ambient": LightType.AMBIENT
        };
        
        var light = comp.layers.addLight(args.name || "Light", centerPoint);
        light.lightType = lightTypes[args.lightType] || LightType.POINT;
        
        // Set full 3D position (addLight only takes [x,y]; Z must be set after)
        if (args.position && args.position.length >= 3) {
            light.property("Position").setValue(args.position);
        } else if (args.position && args.position.length === 2) {
            light.property("Position").setValue([args.position[0], args.position[1], -500]);
        } else {
            light.property("Position").setValue([comp.width / 2, comp.height / 2, -500]);
        }
        if (args.color && args.color.length >= 2) {
            light.property("Light Options").property("Color").setValue(args.color);
        }
        if (args.intensity !== undefined) {
            light.property("Light Options").property("Intensity").setValue(args.intensity);
        }
        if (args.pointOfInterest) {
            light.property("Point of Interest").setValue(args.pointOfInterest);
        }
        if (args.coneAngle !== undefined) {
            light.property("Light Options").property("Cone Angle").setValue(args.coneAngle);
        }
        if (args.coneFeather !== undefined) {
            light.property("Light Options").property("Cone Feather").setValue(args.coneFeather);
        }
        if (args.castsShadows) {
            light.property("Light Options").property("Casts Shadows").setValue(1);
        }
        if (args.shadowDarkness !== undefined) {
            light.property("Light Options").property("Shadow Darkness").setValue(args.shadowDarkness);
        }
        
        return JSON.stringify({
            status: "success",
            message: args.lightType + " light created",
            layer: { name: light.name, index: light.index }
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// ============================================================================
// NEW FUNCTIONS - Keyframe and Animation
// ============================================================================

// Set Multiple Keyframes
function setKeyframes(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        
        // Parse property path
        var prop = layer.property("Transform").property(args.propertyPath);
        if (!prop) {
            // Try as effect property
            var parts = args.propertyPath.split(".");
            if (parts[0] === "Effects" && parts.length >= 2) {
                prop = layer.property("Effects").property(parts[1]);
                if (parts.length > 2 && prop) {
                    prop = prop.property(parts[2]);
                }
            }
        }
        if (!prop) {
            throw new Error("Property not found: " + args.propertyPath);
        }
        
        for (var i = 0; i < args.keyframes.length; i++) {
            var kf = args.keyframes[i];
            prop.setValueAtTime(kf.time, kf.value);
            
            // Apply easing if specified
            if (kf.easing && kf.easing !== "linear") {
                var keyIndex = prop.nearestKeyIndex(kf.time);
                if (kf.easing === "ease" || kf.easing === "ease-in-out") {
                    prop.setTemporalEaseAtKey(keyIndex, 
                        [new KeyframeEase(0, 33)], 
                        [new KeyframeEase(0, 33)]);
                } else if (kf.easing === "ease-in") {
                    prop.setTemporalEaseAtKey(keyIndex, 
                        [new KeyframeEase(0, 33)], 
                        [new KeyframeEase(0, 0.1)]);
                } else if (kf.easing === "ease-out") {
                    prop.setTemporalEaseAtKey(keyIndex, 
                        [new KeyframeEase(0, 0.1)], 
                        [new KeyframeEase(0, 33)]);
                } else if (kf.easing === "hold") {
                    prop.setInterpolationTypeAtKey(keyIndex, KeyframeInterpolationType.HOLD);
                }
            }
        }
        
        return JSON.stringify({
            status: "success",
            message: args.keyframes.length + " keyframes set on " + args.propertyPath
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// Apply Easing
function applyEasing(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var prop = layer.property("Transform").property(args.propertyPath);
        
        if (!prop) {
            throw new Error("Property not found: " + args.propertyPath);
        }
        
        var influence = args.influence || 33.33;
        var indices = args.keyframeIndices || [];
        if (indices.length === 0) {
            for (var i = 1; i <= prop.numKeys; i++) {
                indices.push(i);
            }
        }
        
        for (var j = 0; j < indices.length; j++) {
            var idx = indices[j];
            if (args.easing === "easy-ease") {
                prop.setTemporalEaseAtKey(idx, 
                    [new KeyframeEase(0, influence)], 
                    [new KeyframeEase(0, influence)]);
            } else if (args.easing === "easy-ease-in") {
                prop.setTemporalEaseAtKey(idx, 
                    [new KeyframeEase(0, influence)], 
                    [new KeyframeEase(0, 0.1)]);
            } else if (args.easing === "easy-ease-out") {
                prop.setTemporalEaseAtKey(idx, 
                    [new KeyframeEase(0, 0.1)], 
                    [new KeyframeEase(0, influence)]);
            } else if (args.easing === "hold") {
                prop.setInterpolationTypeAtKey(idx, KeyframeInterpolationType.HOLD);
            } else if (args.easing === "linear") {
                prop.setInterpolationTypeAtKey(idx, KeyframeInterpolationType.LINEAR);
            }
        }
        
        return JSON.stringify({
            status: "success",
            message: "Easing applied to " + indices.length + " keyframes"
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// Apply Expression Template
function applyExpressionTemplate(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var prop = layer.property("Transform").property(args.propertyPath);
        
        if (!prop) {
            throw new Error("Property not found: " + args.propertyPath);
        }
        
        var params = args.parameters || {};
        var expression = "";
        
        switch (args.template) {
            case "wiggle":
                expression = "wiggle(" + (params.frequency || 3) + ", " + (params.amplitude || 50) + ")";
                break;
            case "wiggle-smooth":
                expression = "posterizeTime(" + (params.fps || 12) + "); wiggle(" + (params.frequency || 3) + ", " + (params.amplitude || 50) + ")";
                break;
            case "bounce":
                expression = 'n = 0; if (numKeys > 0) { n = nearestKey(time).index; if (key(n).time > time) { n--; } } if (n == 0) { t = 0; } else { t = time - key(n).time; } if (n > 0 && t < 1) { v = velocityAtTime(key(n).time - thisComp.frameDuration/10); amp = ' + (params.amplitude || 0.05) + '; freq = ' + (params.frequency || 4) + '; decay = ' + (params.decay || 8) + '; value + v*amp*Math.sin(freq*t*2*Math.PI)/Math.exp(decay*t); } else { value; }';
                break;
            case "loop-cycle":
                expression = "loopOut('cycle')";
                break;
            case "loop-pingpong":
                expression = "loopOut('pingpong')";
                break;
            case "continuous-rotation":
                expression = "time * " + (params.speed || 90);
                break;
            case "oscillate-sine":
                expression = "Math.sin(time * " + (params.frequency || 2) + " * Math.PI * 2) * " + (params.amplitude || 100);
                break;
            case "typewriter":
                expression = 'txt = value; t = Math.floor(time * ' + (params.charsPerSecond || 10) + '); txt.substr(0, t);';
                break;
            case "counter":
                expression = "Math.floor(time * " + (params.speed || 1) + ")";
                break;
            default:
                throw new Error("Unknown expression template: " + args.template);
        }
        
        prop.expression = expression;
        
        return JSON.stringify({
            status: "success",
            message: "Expression template '" + args.template + "' applied",
            expression: expression
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// ============================================================================
// NEW FUNCTIONS - Extended Effect Presets
// ============================================================================

function applyEffectPreset(args) {
    try {
        // Resolve composition by index or name
        var comp = null;
        if (args.compIndex !== undefined && args.compIndex !== null) {
            comp = app.project.item(args.compIndex);
            if (!comp || !(comp instanceof CompItem)) {
                throw new Error("Composition not found at index " + args.compIndex);
            }
        } else if (args.compName) {
            for (var i = 1; i <= app.project.numItems; i++) {
                var item = app.project.item(i);
                if (item instanceof CompItem && item.name === args.compName) {
                    comp = item;
                    break;
                }
            }
            if (!comp) {
                throw new Error("Composition not found: '" + args.compName + "'");
            }
        } else {
            if (app.project.activeItem && app.project.activeItem instanceof CompItem) {
                comp = app.project.activeItem;
            } else {
                throw new Error("No composition specified. Provide compIndex or compName.");
            }
        }
        
        // Resolve layer by index or name
        var layer = null;
        if (args.layerIndex !== undefined && args.layerIndex !== null) {
            layer = comp.layer(args.layerIndex);
            if (!layer) {
                throw new Error("Layer not found at index " + args.layerIndex);
            }
        } else if (args.layerName) {
            try {
                layer = comp.layer(args.layerName);
            } catch (e) {
                throw new Error("Layer not found: '" + args.layerName + "'");
            }
        } else {
            if (comp.numLayers > 0) {
                layer = comp.layer(1);
            } else {
                throw new Error("Composition has no layers");
            }
        }
        
        var intensity = (args.intensity !== undefined) ? args.intensity / 100 : 1;
        var appliedEffects = [];
        
        var presets = {
            // Blur presets
            "radial-blur": { matchName: "ADBE Radial Blur", settings: { "Amount": 10 * intensity } },
            "zoom-blur": { matchName: "ADBE Radial Blur", settings: { "Amount": 20 * intensity, "Type": 1 } },
            "camera-lens-blur": { matchName: "ADBE Camera Lens Blur", settings: { "Blur Radius": 15 * intensity } },
            
            // Color presets
            "vintage-film": { effects: [
                { matchName: "ADBE CurvesCustom", settings: {} },
                { matchName: "ADBE Vibrance", settings: { "Vibrance": -20 * intensity, "Saturation": -10 * intensity } },
                { matchName: "ADBE Noise", settings: { "Amount of Noise": 5 * intensity } }
            ]},
            "film-noir": { effects: [
                { matchName: "ADBE Black&White", settings: {} },
                { matchName: "ADBE Brightness & Contrast 2", settings: { "Contrast": 30 * intensity } }
            ]},
            "blockbuster-teal-orange": { effects: [
                { matchName: "ADBE Color Balance (HLS)", settings: { "Hue": 10 * intensity } },
                { matchName: "ADBE Vibrance", settings: { "Vibrance": 20 * intensity } }
            ]},
            "sepia-tone": { matchName: "ADBE Tint", settings: { "Map Black To": [0.1, 0.05, 0], "Map White To": [1, 0.9, 0.7], "Amount to Tint": 100 * intensity } },
            "high-contrast-bw": { effects: [
                { matchName: "ADBE Black&White", settings: {} },
                { matchName: "ADBE Brightness & Contrast 2", settings: { "Contrast": 50 * intensity } }
            ]},
            "vibrant-pop": { matchName: "ADBE Vibrance", settings: { "Vibrance": 40 * intensity, "Saturation": 20 * intensity } },
            
            // Stylize presets
            "vhs-retro": { effects: [
                { matchName: "ADBE Noise", settings: { "Amount of Noise": 10 * intensity } },
                { matchName: "CC Jaws", settings: {} },
                { matchName: "ADBE Color Balance (HLS)", settings: { "Saturation": -20 * intensity } }
            ]},
            "glitch-digital": { effects: [
                { matchName: "ADBE Displacement Map", settings: { "Max Horizontal Displacement": 20 * intensity } },
                { matchName: "CC Jaws", settings: {} }
            ]},
            "chromatic-aberration": { effects: [
                { matchName: "ADBE Shift Channels", settings: {} }
            ]},
            "neon-glow": { matchName: "ADBE Glow", settings: { "Glow Threshold": 40, "Glow Radius": 30 * intensity, "Glow Intensity": 2 * intensity } },
            "glass-morphism": { matchName: "ADBE Gaussian Blur 2", settings: { "Blurriness": 20 * intensity } },
            
            // VFX presets
            "lens-flare": { matchName: "ADBE Lens Flare", settings: { "Flare Brightness": 100 * intensity } },
            "film-grain": { matchName: "ADBE Add Grain", settings: { "Intensity": 0.5 * intensity } },
            "vignette-dark": { matchName: "CC Vignette", settings: { "Amount": 50 * intensity } },
            "vignette-light": { matchName: "CC Vignette", settings: { "Amount": -30 * intensity } }
        };
        
        // Also include original presets
        var originalPresets = {
            "gaussian-blur": { matchName: "ADBE Gaussian Blur 2", settings: { "Blurriness": 20 * intensity } },
            "directional-blur": { matchName: "ADBE Directional Blur", settings: { "Direction": 0, "Blur Length": 10 * intensity } },
            "color-balance": { matchName: "ADBE Color Balance (HLS)", settings: { "Hue": 0, "Lightness": 0, "Saturation": 0 } },
            "brightness-contrast": { matchName: "ADBE Brightness & Contrast 2", settings: { "Brightness": 0, "Contrast": 0 } },
            "curves": { matchName: "ADBE CurvesCustom", settings: {} },
            "glow": { matchName: "ADBE Glow", settings: { "Glow Threshold": 50, "Glow Radius": 15 * intensity, "Glow Intensity": intensity } },
            "drop-shadow": { matchName: "ADBE Drop Shadow", settings: { "Opacity": 50 * intensity, "Direction": 135, "Distance": 10, "Softness": 10 } },
            "cinematic-look": { effects: [
                { matchName: "ADBE CurvesCustom", settings: {} },
                { matchName: "ADBE Vibrance", settings: { "Vibrance": 15, "Saturation": -5 } }
            ]},
            "text-pop": { effects: [
                { matchName: "ADBE Drop Shadow", settings: { "Opacity": 75, "Distance": 5, "Softness": 10 } },
                { matchName: "ADBE Glow", settings: { "Glow Threshold": 50, "Glow Radius": 10, "Glow Intensity": 1.5 } }
            ]}
        };
        
        // Merge presets
        for (var key in originalPresets) {
            presets[key] = originalPresets[key];
        }
        
        var preset = presets[args.preset];
        if (!preset) {
            throw new Error("Unknown preset: " + args.preset);
        }
        
        // Apply single effect or multiple effects
        if (preset.matchName) {
            var effect = layer.Effects.addProperty(preset.matchName);
            for (var propName in preset.settings) {
                try {
                    effect.property(propName).setValue(preset.settings[propName]);
                } catch (e) {}
            }
            appliedEffects.push({ name: effect.name, matchName: effect.matchName });
        } else if (preset.effects) {
            for (var i = 0; i < preset.effects.length; i++) {
                var effData = preset.effects[i];
                var eff = layer.Effects.addProperty(effData.matchName);
                for (var pName in effData.settings) {
                    try {
                        eff.property(pName).setValue(effData.settings[pName]);
                    } catch (e) {}
                }
                appliedEffects.push({ name: eff.name, matchName: eff.matchName });
            }
        }
        
        return JSON.stringify({
            status: "success",
            message: "Effect preset '" + args.preset + "' applied",
            effects: appliedEffects
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// ============================================================================
// NEW FUNCTIONS - Text Animation
// ============================================================================

function addTextAnimator(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        
        if (!(layer instanceof TextLayer)) {
            throw new Error("Layer is not a text layer");
        }
        
        var textProp = layer.property("ADBE Text Properties");
        var animators = textProp.property("ADBE Text Animators");
        var animator = animators.addProperty("ADBE Text Animator");
        animator.name = args.animatorName || "Animator";
        
        // Add property
        var propMap = {
            "position": "ADBE Text Position 3D",
            "scale": "ADBE Text Scale 3D",
            "rotation": "ADBE Text Rotation",
            "opacity": "ADBE Text Opacity",
            "fill-color": "ADBE Text Fill Color",
            "stroke-color": "ADBE Text Stroke Color",
            "stroke-width": "ADBE Text Stroke Width",
            "tracking": "ADBE Text Tracking Amount",
            "blur": "ADBE Text Blur"
        };
        
        var propName = propMap[args.property];
        if (propName) {
            var animProp = animator.property("ADBE Text Animator Properties").addProperty(propName);
            if (args.value !== undefined) {
                animProp.setValue(args.value);
            }
        }
        
        // Configure range selector
        var selector = animator.property("ADBE Text Selectors").property(1);
        if (selector) {
            if (args.rangeStart !== undefined) {
                selector.property("ADBE Text Percent Start").setValue(args.rangeStart);
            }
            if (args.rangeEnd !== undefined) {
                selector.property("ADBE Text Percent End").setValue(args.rangeEnd);
            }
            if (args.rangeOffset !== undefined) {
                selector.property("ADBE Text Percent Offset").setValue(args.rangeOffset);
            }
        }
        
        return JSON.stringify({
            status: "success",
            message: "Text animator added for " + args.property
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function applyTextAnimation(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        
        if (!(layer instanceof TextLayer)) {
            throw new Error("Layer is not a text layer");
        }
        
        var duration = args.duration || 2;
        var delay = args.delay || 3;
        
        var textProp = layer.property("ADBE Text Properties");
        var animators = textProp.property("ADBE Text Animators");
        
        switch (args.animation) {
            case "typewriter":
                // Add opacity animator
                var anim = animators.addProperty("ADBE Text Animator");
                anim.name = "Typewriter";
                var opacityProp = anim.property("ADBE Text Animator Properties").addProperty("ADBE Text Opacity");
                opacityProp.setValue(0);
                
                var selector = anim.property("ADBE Text Selectors").property(1);
                selector.property("ADBE Text Percent Start").setValueAtTime(0, 0);
                selector.property("ADBE Text Percent Start").setValueAtTime(duration, 100);
                break;
                
            case "fade-in-characters":
                var anim2 = animators.addProperty("ADBE Text Animator");
                anim2.name = "Fade In";
                var opacityProp2 = anim2.property("ADBE Text Animator Properties").addProperty("ADBE Text Opacity");
                opacityProp2.setValue(0);
                
                var selector2 = anim2.property("ADBE Text Selectors").property(1);
                selector2.property("ADBE Text Percent End").setValueAtTime(0, 0);
                selector2.property("ADBE Text Percent End").setValueAtTime(duration, 100);
                break;
                
            case "scale-in-characters":
                var anim3 = animators.addProperty("ADBE Text Animator");
                anim3.name = "Scale In";
                var scaleProp = anim3.property("ADBE Text Animator Properties").addProperty("ADBE Text Scale 3D");
                scaleProp.setValue([0, 0, 100]);
                
                var selector3 = anim3.property("ADBE Text Selectors").property(1);
                selector3.property("ADBE Text Percent End").setValueAtTime(0, 0);
                selector3.property("ADBE Text Percent End").setValueAtTime(duration, 100);
                break;
                
            case "blur-in":
                var anim4 = animators.addProperty("ADBE Text Animator");
                anim4.name = "Blur In";
                var blurProp = anim4.property("ADBE Text Animator Properties").addProperty("ADBE Text Blur");
                blurProp.setValue(50);
                var opacityProp4 = anim4.property("ADBE Text Animator Properties").addProperty("ADBE Text Opacity");
                opacityProp4.setValue(0);
                
                var selector4 = anim4.property("ADBE Text Selectors").property(1);
                selector4.property("ADBE Text Percent End").setValueAtTime(0, 0);
                selector4.property("ADBE Text Percent End").setValueAtTime(duration, 100);
                break;
                
            default:
                throw new Error("Unknown text animation: " + args.animation);
        }
        
        return JSON.stringify({
            status: "success",
            message: "Text animation '" + args.animation + "' applied"
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// ============================================================================
// NEW FUNCTIONS - Masks
// ============================================================================

function createMask(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        
        var mask = layer.Masks.addProperty("ADBE Mask Atom");
        var maskPath = mask.property("ADBE Mask Shape");
        
        var shape = new Shape();
        
        if (args.maskShape === "rectangle") {
            var pos = args.maskData.position || [comp.width/2, comp.height/2];
            var size = args.maskData.size || [200, 200];
            var hw = size[0] / 2;
            var hh = size[1] / 2;
            shape.vertices = [
                [pos[0] - hw, pos[1] - hh],
                [pos[0] + hw, pos[1] - hh],
                [pos[0] + hw, pos[1] + hh],
                [pos[0] - hw, pos[1] + hh]
            ];
            shape.closed = true;
        } else if (args.maskShape === "ellipse") {
            var pos = args.maskData.position || [comp.width/2, comp.height/2];
            var size = args.maskData.size || [200, 200];
            var hw = size[0] / 2;
            var hh = size[1] / 2;
            // Approximate ellipse with bezier
            var c = 0.55228; // Magic number for bezier circle approximation
            shape.vertices = [
                [pos[0], pos[1] - hh],
                [pos[0] + hw, pos[1]],
                [pos[0], pos[1] + hh],
                [pos[0] - hw, pos[1]]
            ];
            shape.inTangents = [
                [-hw * c, 0],
                [0, -hh * c],
                [hw * c, 0],
                [0, hh * c]
            ];
            shape.outTangents = [
                [hw * c, 0],
                [0, hh * c],
                [-hw * c, 0],
                [0, -hh * c]
            ];
            shape.closed = true;
        } else if (args.maskShape === "path" && args.maskData.vertices) {
            shape.vertices = args.maskData.vertices;
            shape.inTangents = args.maskData.inTangents || [];
            shape.outTangents = args.maskData.outTangents || [];
            shape.closed = args.maskData.closed !== false;
        }
        
        maskPath.setValue(shape);
        
        // Set mask mode
        var modeMap = {
            "none": MaskMode.NONE,
            "add": MaskMode.ADD,
            "subtract": MaskMode.SUBTRACT,
            "intersect": MaskMode.INTERSECT,
            "lighten": MaskMode.LIGHTEN,
            "darken": MaskMode.DARKEN,
            "difference": MaskMode.DIFFERENCE
        };
        if (args.maskMode && modeMap[args.maskMode]) {
            mask.maskMode = modeMap[args.maskMode];
        }
        
        if (args.feather !== undefined) {
            mask.property("ADBE Mask Feather").setValue([args.feather, args.feather]);
        }
        if (args.opacity !== undefined) {
            mask.property("ADBE Mask Opacity").setValue(args.opacity);
        }
        if (args.expansion !== undefined) {
            mask.property("ADBE Mask Offset").setValue(args.expansion);
        }
        if (args.inverted) {
            mask.inverted = true;
        }
        
        return JSON.stringify({
            status: "success",
            message: args.maskShape + " mask created"
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function applyMaskAnimation(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var duration = args.duration || 1;
        var startTime = args.startTime || 0;
        var reverse = args.reverse || false;
        
        // Create mask for animation
        var mask = layer.Masks.addProperty("ADBE Mask Atom");
        var maskPath = mask.property("ADBE Mask Shape");
        
        var w = layer.width;
        var h = layer.height;
        
        var startShape = new Shape();
        var endShape = new Shape();
        
        switch (args.animation) {
            case "wipe-left":
                startShape.vertices = [[0, 0], [reverse ? w : 0, 0], [reverse ? w : 0, h], [0, h]];
                endShape.vertices = [[0, 0], [reverse ? 0 : w, 0], [reverse ? 0 : w, h], [0, h]];
                break;
            case "wipe-right":
                startShape.vertices = [[reverse ? 0 : w, 0], [w, 0], [w, h], [reverse ? 0 : w, h]];
                endShape.vertices = [[reverse ? w : 0, 0], [w, 0], [w, h], [reverse ? w : 0, h]];
                break;
            case "wipe-up":
                startShape.vertices = [[0, reverse ? 0 : h], [w, reverse ? 0 : h], [w, h], [0, h]];
                endShape.vertices = [[0, reverse ? h : 0], [w, reverse ? h : 0], [w, h], [0, h]];
                break;
            case "wipe-down":
                startShape.vertices = [[0, 0], [w, 0], [w, reverse ? h : 0], [0, reverse ? h : 0]];
                endShape.vertices = [[0, 0], [w, 0], [w, reverse ? 0 : h], [0, reverse ? 0 : h]];
                break;
            default:
                // Default to wipe-left
                startShape.vertices = [[0, 0], [0, 0], [0, h], [0, h]];
                endShape.vertices = [[0, 0], [w, 0], [w, h], [0, h]];
        }
        
        startShape.closed = true;
        endShape.closed = true;
        
        maskPath.setValueAtTime(startTime, startShape);
        maskPath.setValueAtTime(startTime + duration, endShape);
        
        return JSON.stringify({
            status: "success",
            message: "Mask animation '" + args.animation + "' applied"
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// ============================================================================
// NEW FUNCTIONS - Render
// ============================================================================

function listOutputModuleTemplates(args) {
    try {
        var comp = null;
        // Find any comp to use temporarily
        for (var i = 1; i <= app.project.numItems; i++) {
            if (app.project.item(i) instanceof CompItem) {
                comp = app.project.item(i);
                break;
            }
        }
        if (!comp) {
            return JSON.stringify({
                status: "error",
                message: "No compositions in project to query templates"
            }, null, 2);
        }

        // Add temp render item to get templates
        var tempItem = app.project.renderQueue.items.add(comp);
        var outputModule = tempItem.outputModules[1];

        // Get output module templates
        var templates = outputModule.templates;
        var templateList = [];
        for (var t = 0; t < templates.length; t++) {
            templateList.push(templates[t]);
        }

        // Get render settings templates
        var renderTemplates = tempItem.templates;
        var renderTemplateList = [];
        for (var r = 0; r < renderTemplates.length; r++) {
            renderTemplateList.push(renderTemplates[r]);
        }

        // Remove the temp item
        tempItem.remove();

        return JSON.stringify({
            status: "success",
            outputModuleTemplates: templateList,
            renderSettingsTemplates: renderTemplateList
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function addToRenderQueue(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var renderItem = app.project.renderQueue.items.add(comp);
        
        if (args.outputPath) {
            renderItem.outputModules[1].file = new File(args.outputPath);
        }
        if (args.outputModule) {
            renderItem.outputModules[1].applyTemplate(args.outputModule);
        }
        if (args.renderSettings) {
            renderItem.applyTemplate(args.renderSettings);
        }
        
        return JSON.stringify({
            status: "success",
            message: "Added to render queue",
            queueItem: { index: renderItem.index }
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function startRender(args) {
    try {
        app.project.renderQueue.render();
        return JSON.stringify({
            status: "success",
            message: "Render started"
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function exportComposition(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var renderItem = app.project.renderQueue.items.add(comp);
        
        // Apply preset (basic implementation)
        var outputModule = renderItem.outputModules[1];
        outputModule.file = new File(args.outputPath);
        
        // Apply template based on preset
        var templates = {
            "h264-high": "H.264 - Match Source - High Bitrate",
            "h264-medium": "H.264 - Match Source - Medium Bitrate",
            "h264-youtube": "H.264 - Match Source - High Bitrate",
            "prores-422": "Apple ProRes 422",
            "prores-4444": "Apple ProRes 4444",
            "png-sequence": "PNG Sequence",
            "tiff-sequence": "TIFF Sequence with Alpha"
        };
        
        try {
            if (templates[args.preset]) {
                outputModule.applyTemplate(templates[args.preset]);
            }
        } catch (e) {
            // Template may not exist, continue with defaults
        }
        
        return JSON.stringify({
            status: "success",
            message: "Export configured with preset: " + args.preset,
            queueItem: { index: renderItem.index }
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function exportFrame(args) {
    try {
        var comp = app.project.item(args.compIndex);
        
        // Set time
        comp.time = args.time;
        
        // Save frame
        var outputFile = new File(args.outputPath);
        comp.saveFrameToPng(args.time, outputFile);
        
        return JSON.stringify({
            status: "success",
            message: "Frame exported to " + args.outputPath
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// Capture current composition view (viewport) to PNG for AI "vision" of scene (like Blender MCP get_viewport_screenshot)
function captureViewport(args) {
    try {
        var comp = null;
        if (args.compIndex !== undefined && args.compIndex !== null) {
            comp = app.project.item(args.compIndex);
            if (!(comp instanceof CompItem)) {
                return JSON.stringify({ status: "error", message: "Project item at index " + args.compIndex + " is not a composition" }, null, 2);
            }
        } else if (args.compName !== undefined && args.compName !== "") {
            for (var i = 1; i <= app.project.numItems; i++) {
                var item = app.project.item(i);
                if (item instanceof CompItem && item.name === args.compName) {
                    comp = item;
                    break;
                }
            }
            if (!comp) {
                return JSON.stringify({ status: "error", message: "Composition not found: " + args.compName }, null, 2);
            }
        } else {
            if (app.project.activeItem instanceof CompItem) {
                comp = app.project.activeItem;
            } else {
                return JSON.stringify({ status: "error", message: "No active composition. Open a comp or pass compIndex/compName." }, null, 2);
            }
        }
        var t = (args.time !== undefined && args.time !== null) ? args.time : comp.time;
        comp.time = t;
        var outputPath = args.outputPath;
        if (!outputPath) {
            outputPath = getBridgeDir() + "/ae_viewport.png";
        }
        var outputFile = new File(outputPath);
        
        // Ensure parent directory exists
        if (outputFile.parent && !outputFile.parent.exists) {
            outputFile.parent.create();
        }
        
        // Remove existing file first
        if (outputFile.exists) {
            try { outputFile.remove(); } catch (e) {}
        }
        
        // Try to capture with multiple retries
        var maxRetries = 3;
        var fileSize = 0;
        
        for (var attempt = 0; attempt < maxRetries; attempt++) {
            try {
                comp.saveFrameToPng(t, outputFile);
            } catch (saveErr) {
                logToPanel("saveFrameToPng attempt " + (attempt + 1) + " error: " + saveErr.toString());
                if (attempt < maxRetries - 1) {
                    $.sleep(300);
                    continue;
                }
                return JSON.stringify({
                    status: "error",
                    message: "saveFrameToPng failed: " + saveErr.toString(),
                    outputPath: outputPath
                }, null, 2);
            }
            
            // Wait a moment for file system to catch up
            $.sleep(100);
            
            // Check if file was written successfully
            var fileCheck = new File(outputPath);
            if (fileCheck.exists) {
                fileSize = fileCheck.length;
                if (fileSize > 0) {
                    // Success! File has content
                    break;
                }
            }
            
            logToPanel("captureViewport attempt " + (attempt + 1) + ": file exists=" + fileCheck.exists + ", size=" + fileSize);
            
            if (attempt < maxRetries - 1) {
                $.sleep(500); // Wait longer between retries
            }
        }
        
        // Final check
        var finalCheck = new File(outputPath);
        if (!finalCheck.exists) {
            return JSON.stringify({
                status: "error",
                message: "Viewport capture failed: file was not created after " + maxRetries + " attempts",
                outputPath: outputPath
            }, null, 2);
        }
        
        if (finalCheck.length === 0) {
            return JSON.stringify({
                status: "error",
                message: "Viewport capture failed: file was created but is empty (0 bytes) after " + maxRetries + " attempts. The composition may have no visible content at time " + t + "s.",
                outputPath: outputPath
            }, null, 2);
        }
        
        return JSON.stringify({
            status: "success",
            message: "Viewport captured",
            outputPath: outputPath,
            compName: comp.name,
            time: t,
            fileSize: finalCheck.length
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// ============================================================================
// NEW FUNCTIONS - Project
// ============================================================================

function saveProject(args) {
    try {
        if (args.savePath) {
            app.project.save(new File(args.savePath));
        } else {
            app.project.save();
        }
        return JSON.stringify({
            status: "success",
            message: "Project saved"
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function createProjectFolder(args) {
    try {
        var folder;
        if (args.parentFolderIndex) {
            var parent = app.project.item(args.parentFolderIndex);
            folder = parent.items.addFolder(args.name);
        } else {
            folder = app.project.items.addFolder(args.name);
        }
        return JSON.stringify({
            status: "success",
            message: "Folder created",
            folder: { name: folder.name, id: folder.id }
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// ============================================================================
// NEW FUNCTIONS - Import
// ============================================================================

function importFile(args) {
    try {
        var importOptions = new ImportOptions(new File(args.filePath));
        
        if (args.sequence) {
            importOptions.sequence = true;
            if (args.framerate) {
                importOptions.forceAlphabetical = true;
            }
        }
        
        if (args.importAs === "composition") {
            importOptions.importAs = ImportAsType.COMP;
        } else if (args.importAs === "composition-cropped") {
            importOptions.importAs = ImportAsType.COMP_CROPPED_LAYERS;
        } else {
            importOptions.importAs = ImportAsType.FOOTAGE;
        }
        
        var importedItem = app.project.importFile(importOptions);
        
        if (args.targetFolderIndex) {
            var folder = app.project.item(args.targetFolderIndex);
            importedItem.parentFolder = folder;
        }
        
        return JSON.stringify({
            status: "success",
            message: "File imported",
            item: { name: importedItem.name, id: importedItem.id }
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function replaceFootage(args) {
    try {
        var item = app.project.item(args.footageIndex);
        item.replace(new File(args.newFilePath));
        return JSON.stringify({
            status: "success",
            message: "Footage replaced"
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// ============================================================================
// NEW FUNCTIONS - Utility
// ============================================================================

function getLayerDetails(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        
        var details = {
            name: layer.name,
            index: layer.index,
            enabled: layer.enabled,
            solo: layer.solo,
            shy: layer.shy,
            locked: layer.locked,
            is3D: layer.threeDLayer,
            inPoint: layer.inPoint,
            outPoint: layer.outPoint,
            startTime: layer.startTime,
            hasVideo: layer.hasVideo,
            hasAudio: layer.hasAudio,
            isGuide: layer.guideLayer,
            isAdjustment: layer.adjustmentLayer
        };
        
        // Get transform values
        details.transform = {
            position: layer.property("Position").value,
            scale: layer.property("Scale").value,
            rotation: layer.threeDLayer ? layer.property("Z Rotation").value : layer.property("Rotation").value,
            opacity: layer.property("Opacity").value,
            anchorPoint: layer.property("Anchor Point").value
        };
        
        // Get effects if requested
        if (args.includeEffects) {
            details.effects = [];
            var effects = layer.property("Effects");
            for (var i = 1; i <= effects.numProperties; i++) {
                var effect = effects.property(i);
                details.effects.push({
                    name: effect.name,
                    matchName: effect.matchName,
                    enabled: effect.enabled
                });
            }
        }
        
        // Get masks if requested
        if (args.includeMasks) {
            details.masks = [];
            var masks = layer.property("Masks");
            for (var j = 1; j <= masks.numProperties; j++) {
                var mask = masks.property(j);
                details.masks.push({
                    name: mask.name,
                    mode: mask.maskMode,
                    inverted: mask.inverted
                });
            }
        }
        
        return JSON.stringify({
            status: "success",
            layer: details
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function findLayers(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var results = [];
        
        for (var i = 1; i <= comp.numLayers; i++) {
            var layer = comp.layer(i);
            var matches = true;
            
            // Name match
            if (args.name && layer.name !== args.name) matches = false;
            if (args.namePattern) {
                var regex = new RegExp(args.namePattern);
                if (!regex.test(layer.name)) matches = false;
            }
            
            // Type match
            if (args.layerType && args.layerType !== "all") {
                var layerType = "unknown";
                if (layer instanceof TextLayer) layerType = "text";
                else if (layer instanceof ShapeLayer) layerType = "shape";
                else if (layer instanceof CameraLayer) layerType = "camera";
                else if (layer instanceof LightLayer) layerType = "light";
                else if (layer.nullLayer) layerType = "null";
                else if (layer.adjustmentLayer) layerType = "adjustment";
                else if (layer.source instanceof CompItem) layerType = "precomp";
                else if (layer.source) layerType = "footage";
                else layerType = "solid";
                
                if (layerType !== args.layerType) matches = false;
            }
            
            // Other filters
            if (args.has3D !== undefined && layer.threeDLayer !== args.has3D) matches = false;
            if (args.isVisible !== undefined && layer.enabled !== args.isVisible) matches = false;
            if (args.hasEffects !== undefined) {
                var hasEffects = layer.property("Effects").numProperties > 0;
                if (hasEffects !== args.hasEffects) matches = false;
            }
            
            if (matches) {
                results.push({
                    name: layer.name,
                    index: layer.index,
                    type: layerType || "unknown"
                });
            }
        }
        
        return JSON.stringify({
            status: "success",
            count: results.length,
            layers: results
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function purgeMemory(args) {
    try {
        switch (args.purgeType) {
            case "all":
                app.purge(PurgeTarget.ALL_CACHES);
                break;
            case "image-cache":
                app.purge(PurgeTarget.IMAGE_CACHES);
                break;
            case "undo":
                app.purge(PurgeTarget.UNDO_CACHES);
                break;
            case "snapshot":
                app.purge(PurgeTarget.SNAPSHOT_CACHES);
                break;
            default:
                app.purge(PurgeTarget.ALL_CACHES);
        }
        return JSON.stringify({
            status: "success",
            message: args.purgeType + " cache purged"
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function setCompositionSettings(args) {
    try {
        var comp = app.project.item(args.compIndex);
        
        if (args.name) comp.name = args.name;
        if (args.width) comp.width = args.width;
        if (args.height) comp.height = args.height;
        if (args.frameRate) comp.frameRate = args.frameRate;
        if (args.duration) comp.duration = args.duration;
        if (args.backgroundColor) {
            comp.bgColor = [args.backgroundColor.r/255, args.backgroundColor.g/255, args.backgroundColor.b/255];
        }
        if (args.motionBlur !== undefined) comp.motionBlur = args.motionBlur;
        if (args.shutterAngle !== undefined) comp.shutterAngle = args.shutterAngle;
        
        return JSON.stringify({
            status: "success",
            message: "Composition settings updated"
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// ============================================================================
// COMPLETE 100% COVERAGE - All New Function Implementations
// ============================================================================

// ==================== PROJECT OPERATIONS ====================

function projectNew(args) {
    try {
        app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
        app.newProject();
        return JSON.stringify({ status: "success", message: "New project created" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function projectOpen(args) {
    try {
        var file = new File(args.projectPath);
        if (!file.exists) throw new Error("File not found: " + args.projectPath);
        app.open(file);
        return JSON.stringify({ status: "success", message: "Project opened" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function projectClose(args) {
    try {
        var closeOption = args.save ? CloseOptions.SAVE_CHANGES : CloseOptions.DO_NOT_SAVE_CHANGES;
        app.project.close(closeOption);
        return JSON.stringify({ status: "success", message: "Project closed" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function projectGetSettings(args) {
    try {
        var settings = {
            bitsPerChannel: app.project.bitsPerChannel,
            expressionEngine: app.project.expressionEngine,
            file: app.project.file ? app.project.file.fsName : null,
            numItems: app.project.numItems
        };
        return JSON.stringify({ status: "success", settings: settings }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function projectSetSettings(args) {
    try {
        if (args.bitsPerChannel) app.project.bitsPerChannel = parseInt(args.bitsPerChannel);
        return JSON.stringify({ status: "success", message: "Project settings updated" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function projectDeleteItem(args) {
    try {
        var item = app.project.item(args.itemIndex);
        item.remove();
        return JSON.stringify({ status: "success", message: "Item deleted" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function projectRenameItem(args) {
    try {
        var item = app.project.item(args.itemIndex);
        item.name = args.newName;
        return JSON.stringify({ status: "success", message: "Item renamed" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function projectMoveItem(args) {
    try {
        var item = app.project.item(args.itemIndex);
        var folder = app.project.item(args.targetFolderIndex);
        item.parentFolder = folder;
        return JSON.stringify({ status: "success", message: "Item moved" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function projectCollectFiles(args) {
    try {
        // Note: Full collect files requires user interaction
        return JSON.stringify({ status: "info", message: "Use File > Dependencies > Collect Files in AE" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function projectRemoveUnused(args) {
    try {
        app.project.removeUnusedFootage();
        return JSON.stringify({ status: "success", message: "Unused footage removed" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function projectConsolidateFootage(args) {
    try {
        app.project.consolidateFootage();
        return JSON.stringify({ status: "success", message: "Footage consolidated" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// ==================== COMPOSITION OPERATIONS ====================

function compDuplicate(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var newComp = comp.duplicate();
        if (args.newName) newComp.name = args.newName;
        return JSON.stringify({ status: "success", message: "Composition duplicated", comp: { name: newComp.name, id: newComp.id } }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function compDelete(args) {
    try {
        var comp = null;
        if (args.compName !== undefined && args.compName !== "") {
            for (var i = 1; i <= app.project.numItems; i++) {
                var item = app.project.item(i);
                if (item instanceof CompItem && item.name === args.compName) {
                    comp = item;
                    break;
                }
            }
            if (!comp) {
                return JSON.stringify({ status: "error", message: "Composition not found: " + args.compName }, null, 2);
            }
        } else if (args.compIndex !== undefined) {
            comp = app.project.item(args.compIndex);
            if (!(comp instanceof CompItem)) {
                return JSON.stringify({ status: "error", message: "Project item at index " + args.compIndex + " is not a composition" }, null, 2);
            }
        } else {
            return JSON.stringify({ status: "error", message: "Provide compIndex or compName" }, null, 2);
        }
        comp.remove();
        return JSON.stringify({ status: "success", message: "Composition deleted" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function compSetActive(args) {
    try {
        var comp = app.project.item(args.compIndex);
        comp.openInViewer();
        return JSON.stringify({ status: "success", message: "Composition set as active" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function compGetWorkArea(args) {
    try {
        var comp = app.project.item(args.compIndex);
        return JSON.stringify({
            status: "success",
            workArea: {
                start: comp.workAreaStart,
                duration: comp.workAreaDuration,
                end: comp.workAreaStart + comp.workAreaDuration
            }
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function compSetWorkArea(args) {
    try {
        var comp = app.project.item(args.compIndex);
        comp.workAreaStart = args.startTime;
        comp.workAreaDuration = args.endTime - args.startTime;
        return JSON.stringify({ status: "success", message: "Work area set" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function compGetSelectedLayers(args) {
    try {
        var comp = args.compIndex ? app.project.item(args.compIndex) : app.project.activeItem;
        var selected = [];
        for (var i = 0; i < comp.selectedLayers.length; i++) {
            var layer = comp.selectedLayers[i];
            selected.push({ name: layer.name, index: layer.index });
        }
        return JSON.stringify({ status: "success", selectedLayers: selected }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// ==================== SCENE SUMMARY & RENDER PROGRESS (Blender-style) ====================

function getRenderProgress(args) {
    try {
        var rq = app.project.renderQueue;
        var items = [];
        for (var i = 1; i <= rq.numItems; i++) {
            var item = rq.item(i);
            var statusCode = item.status;
            var statusStr = "unknown";
            if (statusCode === 0) statusStr = "queued";
            else if (statusCode === 1) statusStr = "needs_output";
            else if (statusCode === 2) statusStr = "unqueued";
            else if (statusCode === 3) statusStr = "rendering";
            else if (statusCode === 4) statusStr = "done";
            else if (statusCode === 5) statusStr = "stopped";
            else if (statusCode === 6) statusStr = "error";
            var elapsed = 0;
            try {
                if (item.elapsedSeconds !== undefined) elapsed = item.elapsedSeconds;
            } catch (e2) {}
            items.push({
                index: i,
                compName: item.comp ? item.comp.name : null,
                status: statusStr,
                statusCode: statusCode,
                elapsedSeconds: elapsed
            });
        }
        var rendering = false;
        try {
            if (rq.rendering !== undefined) rendering = rq.rendering;
        } catch (e2) {}
        return JSON.stringify({
            status: "success",
            rendering: rendering,
            numItems: rq.numItems,
            items: items
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function getSceneSummary(args) {
    try {
        var summary = {
            project: {
                name: app.project.file ? app.project.file.name : "Untitled",
                path: app.project.file ? app.project.file.fsName : null,
                numItems: app.project.numItems
            },
            activeComp: null,
            currentTime: null,
            selectedLayers: [],
            renderQueue: { numItems: 0, rendering: false }
        };
        if (app.project.activeItem instanceof CompItem) {
            var ac = app.project.activeItem;
            summary.activeComp = {
                name: ac.name,
                id: ac.id,
                width: ac.width,
                height: ac.height,
                duration: ac.duration,
                frameRate: ac.frameRate,
                numLayers: ac.numLayers
            };
            summary.currentTime = ac.time;
            var sel = [];
            for (var s = 0; s < ac.selectedLayers.length; s++) {
                sel.push({ index: ac.selectedLayers[s].index, name: ac.selectedLayers[s].name });
            }
            summary.selectedLayers = sel;
        }
        try {
            var rq = app.project.renderQueue;
            summary.renderQueue = { numItems: rq.numItems, rendering: rq.rendering };
        } catch (rqErr) {}
        return JSON.stringify({ status: "success", summary: summary }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function getLayerTree(args) {
    try {
        var comp = null;
        if (args.compIndex !== undefined && args.compIndex !== null) {
            comp = app.project.item(args.compIndex);
        } else if (args.compName) {
            for (var i = 1; i <= app.project.numItems; i++) {
                var item = app.project.item(i);
                if (item instanceof CompItem && item.name === args.compName) { comp = item; break; }
            }
        } else if (app.project.activeItem instanceof CompItem) {
            comp = app.project.activeItem;
        }
        if (!comp || !(comp instanceof CompItem)) {
            return JSON.stringify({ status: "error", message: "Composition not found" }, null, 2);
        }
        var layers = [];
        for (var L = 1; L <= comp.numLayers; L++) {
            var layer = comp.layer(L);
            var type = "unknown";
            if (layer.matchName === "ADBE AV Layer") type = "solid";
            else if (layer.matchName === "ADBE Text Layer") type = "text";
            else if (layer.matchName === "ADBE Vector Layer") type = "shape";
            else if (layer.matchName === "ADBE Camera Layer") type = "camera";
            else if (layer.matchName === "ADBE Light Layer") type = "light";
            else if (layer.matchName === "ADBE Null Layer") type = "null";
            else if (layer.matchName === "ADBE AV Layer" && layer.adjustmentLayer) type = "adjustment";
            var dur = layer.outPoint - layer.inPoint;
            layers.push({
                index: layer.index,
                name: layer.name,
                type: type,
                inPoint: layer.inPoint,
                outPoint: layer.outPoint,
                durationSeconds: Math.max(0, dur),
                startTime: layer.startTime,
                enabled: layer.enabled,
                parent: layer.parent ? layer.parent.name : null
            });
        }
        return JSON.stringify({
            status: "success",
            compName: comp.name,
            currentTime: comp.time,
            layers: layers
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function getKeyframeInterpolation(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var prop = layer.property("Transform").property(args.propertyName || "Position");
        if (!prop || !prop.canVaryOverTime || prop.numKeys === 0) {
            return JSON.stringify({ status: "error", message: "Property has no keyframes" }, null, 2);
        }
        var keyIndex = Math.max(1, Math.min(args.keyframeIndex || 1, prop.numKeys));
        var inType = prop.getInterpolationTypeAtKey(keyIndex, true);
        var outType = prop.getInterpolationTypeAtKey(keyIndex, false);
        var toStr = function (t) {
            if (t === 1) return "linear";
            if (t === 2) return "bezier";
            if (t === 3) return "hold";
            return "unknown";
        };
        return JSON.stringify({
            status: "success",
            keyframeIndex: keyIndex,
            inType: toStr(inType),
            outType: toStr(outType),
            numKeys: prop.numKeys
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function setKeyframeInterpolation(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var prop = layer.property("Transform").property(args.propertyName || "Position");
        if (!prop || !prop.canVaryOverTime) {
            return JSON.stringify({ status: "error", message: "Property cannot be keyframed" }, null, 2);
        }
        var keyIndex = args.keyframeIndex || 1;
        var interp = (args.interpolation || "bezier").toString().toLowerCase();
        var type = 2;
        if (interp === "linear") type = 1;
        else if (interp === "hold") type = 3;
        else type = 2;
        prop.setInterpolationTypeAtKey(keyIndex, type, type);
        return JSON.stringify({ status: "success", message: "Interpolation set to " + interp }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function setupProject(args) {
    try {
        var name = args.name || "Main";
        var width = args.width || 1920;
        var height = args.height || 1080;
        var duration = args.duration || 30;
        var frameRate = args.frameRate || 30;
        var bg = args.backgroundColor;
        var comp = app.project.items.addComp(name, width, height, 1, duration, frameRate);
        if (bg && bg.r !== undefined) {
            comp.bgColor = [bg.r / 255, bg.g / 255, bg.b / 255];
        }
        if (args.setAsActive && comp) comp.openInViewer();
        return JSON.stringify({
            status: "success",
            message: "Project setup: composition created",
            composition: { name: comp.name, width: comp.width, height: comp.height, duration: comp.duration, frameRate: comp.frameRate }
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// ==================== LAYER OPERATIONS ====================

function layerDelete(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        layer.remove();
        return JSON.stringify({ status: "success", message: "Layer deleted" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function layerRename(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        layer.name = args.newName;
        return JSON.stringify({ status: "success", message: "Layer renamed" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function layerSelect(args) {
    try {
        var comp = app.project.item(args.compIndex);
        if (!args.addToSelection) {
            for (var i = 1; i <= comp.numLayers; i++) {
                comp.layer(i).selected = false;
            }
        }
        for (var j = 0; j < args.layerIndices.length; j++) {
            comp.layer(args.layerIndices[j]).selected = true;
        }
        return JSON.stringify({ status: "success", message: "Layers selected" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function layerDeselectAll(args) {
    try {
        var comp = app.project.item(args.compIndex);
        for (var i = 1; i <= comp.numLayers; i++) {
            comp.layer(i).selected = false;
        }
        return JSON.stringify({ status: "success", message: "All layers deselected" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function layerMove(args) {
    try {
        // Resolve composition by index or name
        var comp = null;
        if (args.compIndex !== undefined && args.compIndex !== null) {
            comp = app.project.item(args.compIndex);
        } else if (args.compName) {
            for (var i = 1; i <= app.project.numItems; i++) {
                var item = app.project.item(i);
                if (item instanceof CompItem && item.name === args.compName) {
                    comp = item;
                    break;
                }
            }
        }
        if (!comp || !(comp instanceof CompItem)) {
            return JSON.stringify({ status: "error", message: "Composition not found. Provide compIndex or compName." }, null, 2);
        }
        
        // Resolve layer by index or name
        var layer = null;
        if (args.layerIndex !== undefined && args.layerIndex !== null) {
            layer = comp.layer(args.layerIndex);
        } else if (args.layerName) {
            try {
                layer = comp.layer(args.layerName);
            } catch (e) {
                return JSON.stringify({ status: "error", message: "Layer not found: " + args.layerName }, null, 2);
            }
        }
        if (!layer) {
            return JSON.stringify({ status: "error", message: "Layer not found. Provide layerIndex or layerName." }, null, 2);
        }
        
        layer.moveToEnd();
        if (args.newIndex < comp.numLayers) {
            layer.moveBefore(comp.layer(args.newIndex));
        }
        return JSON.stringify({ status: "success", message: "Layer '" + layer.name + "' moved to index " + args.newIndex }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function layerSplit(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        comp.time = args.splitTime;
        var newLayer = layer.duplicate();
        layer.outPoint = args.splitTime;
        newLayer.inPoint = args.splitTime;
        return JSON.stringify({ status: "success", message: "Layer split" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function layerSetTiming(args) {
    try {
        // Resolve composition by index or name
        var comp = null;
        if (args.compIndex !== undefined && args.compIndex !== null) {
            comp = app.project.item(args.compIndex);
        } else if (args.compName) {
            for (var i = 1; i <= app.project.numItems; i++) {
                var item = app.project.item(i);
                if (item instanceof CompItem && item.name === args.compName) {
                    comp = item;
                    break;
                }
            }
        }
        if (!comp || !(comp instanceof CompItem)) {
            return JSON.stringify({ status: "error", message: "Composition not found. Provide compIndex or compName." }, null, 2);
        }
        
        // Resolve layer by index or name
        var layer = null;
        if (args.layerIndex !== undefined && args.layerIndex !== null) {
            layer = comp.layer(args.layerIndex);
        } else if (args.layerName) {
            try {
                layer = comp.layer(args.layerName);
            } catch (e) {
                return JSON.stringify({ status: "error", message: "Layer not found: " + args.layerName }, null, 2);
            }
        }
        if (!layer) {
            return JSON.stringify({ status: "error", message: "Layer not found. Provide layerIndex or layerName." }, null, 2);
        }
        
        if (args.inPoint !== undefined) layer.inPoint = args.inPoint;
        if (args.outPoint !== undefined) layer.outPoint = args.outPoint;
        if (args.startTime !== undefined) layer.startTime = args.startTime;
        if (args.stretch !== undefined) layer.stretch = args.stretch;
        
        // If duration (seconds) is provided: set outPoint = inPoint + duration (so the layer has visible length)
        if (args.duration !== undefined && args.duration !== null && args.duration > 0) {
            var ip = (args.inPoint !== undefined && args.inPoint !== null) ? args.inPoint : layer.inPoint;
            layer.inPoint = ip;
            layer.outPoint = ip + args.duration;
        }
        
        // Validation: if in and out were both set and are equal (or out < in), fix so layer has at least 0.1s duration
        if (layer.inPoint >= layer.outPoint) {
            layer.outPoint = layer.inPoint + 0.1;
        }
        
        return JSON.stringify({
            status: "success",
            message: "Layer timing set for " + layer.name,
            inPoint: layer.inPoint,
            outPoint: layer.outPoint,
            startTime: layer.startTime,
            durationSeconds: layer.outPoint - layer.inPoint
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function layerToggle(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var newValue = args.value !== undefined ? args.value : undefined;
        
        switch (args.toggle) {
            case "visibility": 
                layer.enabled = newValue !== undefined ? newValue : !layer.enabled;
                break;
            case "audio":
                layer.audioEnabled = newValue !== undefined ? newValue : !layer.audioEnabled;
                break;
            case "solo":
                layer.solo = newValue !== undefined ? newValue : !layer.solo;
                break;
            case "lock":
                layer.locked = newValue !== undefined ? newValue : !layer.locked;
                break;
            case "shy":
                layer.shy = newValue !== undefined ? newValue : !layer.shy;
                break;
            case "motionBlur":
                layer.motionBlur = newValue !== undefined ? newValue : !layer.motionBlur;
                break;
            case "collapse":
                layer.collapseTransformation = newValue !== undefined ? newValue : !layer.collapseTransformation;
                break;
        }
        return JSON.stringify({ status: "success", message: args.toggle + " toggled" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function layerSetQuality(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var qualities = { "best": LayerQuality.BEST, "draft": LayerQuality.DRAFT, "wireframe": LayerQuality.WIREFRAME };
        layer.quality = qualities[args.quality] || LayerQuality.BEST;
        return JSON.stringify({ status: "success", message: "Layer quality set" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function layerSetLabel(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        layer.label = args.label;
        return JSON.stringify({ status: "success", message: "Layer label set" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function layerAutoOrient(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var orientations = {
            "off": AutoOrientType.NO_AUTO_ORIENT,
            "along-path": AutoOrientType.ALONG_PATH,
            "towards-camera": AutoOrientType.CAMERA_OR_POINT_OF_INTEREST,
            "towards-poi": AutoOrientType.CAMERA_OR_POINT_OF_INTEREST
        };
        layer.autoOrient = orientations[args.orientation] || AutoOrientType.NO_AUTO_ORIENT;
        return JSON.stringify({ status: "success", message: "Auto-orient set" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// ==================== AUDIO ====================

function createAudioLayer(args) {
    try {
        var comp = args.compIndex ? app.project.item(args.compIndex) : app.project.activeItem;
        var file = new File(args.audioPath);
        var importOptions = new ImportOptions(file);
        var audioItem = app.project.importFile(importOptions);
        var audioLayer = comp.layers.add(audioItem);
        if (args.startTime !== undefined) audioLayer.startTime = args.startTime;
        if (args.name) audioLayer.name = args.name;
        return JSON.stringify({ status: "success", message: "Audio layer created", layer: { name: audioLayer.name, index: audioLayer.index } }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function setAudioLevels(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var audioProp = layer.property("Audio").property("Audio Levels");
        var value = typeof args.levels === "number" ? [args.levels, args.levels] : args.levels;
        audioProp.setValue(value);
        return JSON.stringify({ status: "success", message: "Audio levels set" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function audioKeyframe(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var audioProp = layer.property("Audio").property("Audio Levels");
        var value = typeof args.levels === "number" ? [args.levels, args.levels] : args.levels;
        audioProp.setValueAtTime(args.time, value);
        return JSON.stringify({ status: "success", message: "Audio keyframe set" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// ==================== MARKERS ====================

function addMarker(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var markerProp;
        if (args.layerIndex) {
            var layer = comp.layer(args.layerIndex);
            markerProp = layer.property("Marker");
        } else {
            markerProp = comp.markerProperty;
        }
        var marker = new MarkerValue(args.comment || "");
        if (args.chapter) marker.chapter = args.chapter;
        if (args.url) marker.url = args.url;
        if (args.duration) marker.duration = args.duration;
        markerProp.setValueAtTime(args.time, marker);
        return JSON.stringify({ status: "success", message: "Marker added" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function getMarkers(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var markerProp;
        if (args.layerIndex) {
            var layer = comp.layer(args.layerIndex);
            markerProp = layer.property("Marker");
        } else {
            markerProp = comp.markerProperty;
        }
        var markers = [];
        for (var i = 1; i <= markerProp.numKeys; i++) {
            var m = markerProp.keyValue(i);
            markers.push({
                time: markerProp.keyTime(i),
                comment: m.comment,
                chapter: m.chapter,
                url: m.url,
                duration: m.duration
            });
        }
        return JSON.stringify({ status: "success", markers: markers }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function removeMarker(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var markerProp;
        if (args.layerIndex) {
            var layer = comp.layer(args.layerIndex);
            markerProp = layer.property("Marker");
        } else {
            markerProp = comp.markerProperty;
        }
        markerProp.removeKey(args.markerIndex);
        return JSON.stringify({ status: "success", message: "Marker removed" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// ==================== LAYER STYLES ====================
// Note: AE Layer Styles (Photoshop-style) have limited scripting; addProperty often fails.
// We try menu command first; if unavailable, suggest using apply-effect-template (e.g. drop-shadow, glow).

function addLayerStyle(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        comp.openInViewer();
        // Note: app.project.activeItem is read-only, openInViewer() sets it
        layer.selected = true;
        
        var menuNames = {
            "drop-shadow": "Drop Shadow",
            "inner-shadow": "Inner Shadow",
            "outer-glow": "Outer Glow",
            "inner-glow": "Inner Glow",
            "bevel-emboss": "Bevel and Emboss",
            "satin": "Satin",
            "color-overlay": "Color Overlay",
            "gradient-overlay": "Gradient Overlay",
            "stroke": "Stroke"
        };
        var menuName = menuNames[args.style] || args.style;
        var cmdId = 0;
        try {
            if (app.findMenuCommandId) {
                cmdId = app.findMenuCommandId(menuName);
            }
        } catch (cmdErr) {}
        if (cmdId && cmdId !== 0) {
            app.executeCommand(cmdId);
            return JSON.stringify({ status: "success", message: args.style + " style applied via menu" }, null, 2);
        }
        layer.selected = false;
        return JSON.stringify({
            status: "error",
            message: "Layer styles have limited scripting support in AE. For drop shadow or glow, use apply-effect-template with templateName 'drop-shadow' or 'glow' instead."
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function removeLayerStyles(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var styles = layer.property("Layer Styles");
        styles.remove();
        return JSON.stringify({ status: "success", message: "Layer styles removed" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// ==================== SHAPE OPERATIONS ====================

function addShapePath(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var contents = layer.property("Contents");
        var group = contents.addProperty("ADBE Vector Group");
        var pathProp = group.property("Contents").addProperty("ADBE Vector Shape - Group");
        
        var shape = new Shape();
        shape.vertices = args.vertices;
        if (args.inTangents) shape.inTangents = args.inTangents;
        if (args.outTangents) shape.outTangents = args.outTangents;
        shape.closed = args.closed !== false;
        
        pathProp.property("Path").setValue(shape);
        
        return JSON.stringify({ status: "success", message: "Shape path added" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function addShapeModifier(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var contents = layer.property("Contents");
        
        var modifierMap = {
            "trim-paths": "ADBE Vector Filter - Trim",
            "pucker-bloat": "ADBE Vector Filter - PB",
            "repeater": "ADBE Vector Filter - Repeater",
            "round-corners": "ADBE Vector Filter - RC",
            "wiggle-paths": "ADBE Vector Filter - Roughen",
            "wiggle-transform": "ADBE Vector Filter - Wiggler",
            "twist": "ADBE Vector Filter - Twist",
            "zig-zag": "ADBE Vector Filter - Zigzag",
            "offset-paths": "ADBE Vector Filter - Offset",
            "merge-paths": "ADBE Vector Filter - Merge"
        };
        
        var modifier = contents.addProperty(modifierMap[args.modifier] || args.modifier);
        
        if (args.settings) {
            for (var prop in args.settings) {
                try {
                    modifier.property(prop).setValue(args.settings[prop]);
                } catch (e) {}
            }
        }
        
        return JSON.stringify({ status: "success", message: args.modifier + " modifier added" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function animateShapePath(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var contents = layer.property("Contents");
        var pathProp = contents.property(1).property("Contents").property(1).property("Path");
        
        for (var i = 0; i < args.pathKeyframes.length; i++) {
            var kf = args.pathKeyframes[i];
            var shape = new Shape();
            shape.vertices = kf.vertices;
            if (kf.inTangents) shape.inTangents = kf.inTangents;
            if (kf.outTangents) shape.outTangents = kf.outTangents;
            shape.closed = true;
            pathProp.setValueAtTime(kf.time, shape);
        }
        
        return JSON.stringify({ status: "success", message: "Shape path animated" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// ==================== TIME REMAPPING ====================

function enableTimeRemapping(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        layer.timeRemapEnabled = true;
        return JSON.stringify({ status: "success", message: "Time remapping enabled" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function setTimeRemapKeyframe(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        if (!layer.timeRemapEnabled) layer.timeRemapEnabled = true;
        layer.property("Time Remap").setValueAtTime(args.time, args.remappedTime);
        return JSON.stringify({ status: "success", message: "Time remap keyframe set" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function applyTimeEffect(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        if (!layer.timeRemapEnabled) layer.timeRemapEnabled = true;
        var timeRemap = layer.property("Time Remap");
        var duration = layer.outPoint - layer.inPoint;
        
        switch (args.effect) {
            case "reverse":
                timeRemap.setValueAtTime(0, duration);
                timeRemap.setValueAtTime(duration, 0);
                break;
            case "slow-motion":
                var speed = args.speed || 0.5;
                timeRemap.setValueAtTime(0, 0);
                timeRemap.setValueAtTime(duration / speed, duration);
                break;
            case "freeze-frame":
                var freezeAt = args.freezeAt || duration / 2;
                timeRemap.setValueAtTime(0, 0);
                timeRemap.setValueAtTime(freezeAt, freezeAt);
                timeRemap.setValueAtTime(duration, freezeAt);
                break;
        }
        
        return JSON.stringify({ status: "success", message: args.effect + " applied" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// ==================== MOTION PATH ====================

function createMotionPath(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var posProp = layer.property("Position");
        var duration = args.duration || 2;
        var center = args.center || [comp.width / 2, comp.height / 2];
        var radius = args.radius || 200;
        
        switch (args.pathType) {
            case "circle":
                var steps = 60;
                for (var i = 0; i <= steps; i++) {
                    var angle = (i / steps) * Math.PI * 2;
                    var x = center[0] + Math.cos(angle) * radius;
                    var y = center[1] + Math.sin(angle) * radius;
                    posProp.setValueAtTime((i / steps) * duration, [x, y]);
                }
                break;
            case "spiral":
                var turns = args.turns || 3;
                var steps = 60;
                for (var i = 0; i <= steps; i++) {
                    var progress = i / steps;
                    var angle = progress * Math.PI * 2 * turns;
                    var currentRadius = radius * progress;
                    var x = center[0] + Math.cos(angle) * currentRadius;
                    var y = center[1] + Math.sin(angle) * currentRadius;
                    posProp.setValueAtTime(progress * duration, [x, y]);
                }
                break;
            case "figure-8":
                var steps = 60;
                for (var i = 0; i <= steps; i++) {
                    var t = (i / steps) * Math.PI * 2;
                    var x = center[0] + Math.sin(t) * radius;
                    var y = center[1] + Math.sin(t * 2) * radius / 2;
                    posProp.setValueAtTime((i / steps) * duration, [x, y]);
                }
                break;
            case "custom":
            case "bezier":
                if (args.points) {
                    for (var i = 0; i < args.points.length; i++) {
                        var t = (i / (args.points.length - 1)) * duration;
                        posProp.setValueAtTime(t, args.points[i].position);
                    }
                }
                break;
        }
        
        if (args.orientToPath) {
            layer.autoOrient = AutoOrientType.ALONG_PATH;
        }
        
        return JSON.stringify({ status: "success", message: args.pathType + " motion path created" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function copyAnimation(args) {
    try {
        var sourceComp = app.project.item(args.sourceCompIndex);
        var sourceLayer = sourceComp.layer(args.sourceLayerIndex);
        var targetComp = app.project.item(args.targetCompIndex);
        var targetLayer = targetComp.layer(args.targetLayerIndex);
        
        var sourceProp = args.sourceProperty 
            ? sourceLayer.property("Transform").property(args.sourceProperty)
            : sourceLayer.property("Transform").property("Position");
        var targetProp = args.targetProperty
            ? targetLayer.property("Transform").property(args.targetProperty)
            : targetLayer.property("Transform").property("Position");
        
        var offset = args.timeOffset || 0;
        
        for (var i = 1; i <= sourceProp.numKeys; i++) {
            var time = sourceProp.keyTime(i) + offset;
            var value = sourceProp.keyValue(i);
            targetProp.setValueAtTime(time, value);
        }
        
        return JSON.stringify({ status: "success", message: "Animation copied" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// ==================== KEYFRAME OPERATIONS ====================

function keyframeRemove(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var prop = layer.property("Transform").property(args.propertyPath);
        if (!prop) throw new Error("Property not found");
        prop.removeKey(args.keyframeIndex);
        return JSON.stringify({ status: "success", message: "Keyframe removed" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function keyframeRemoveAll(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var prop = layer.property("Transform").property(args.propertyPath);
        if (!prop) throw new Error("Property not found");
        while (prop.numKeys > 0) {
            prop.removeKey(1);
        }
        return JSON.stringify({ status: "success", message: "All keyframes removed" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function keyframeGetAll(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var prop = layer.property("Transform").property(args.propertyPath);
        if (!prop) throw new Error("Property not found");
        
        var keyframes = [];
        for (var i = 1; i <= prop.numKeys; i++) {
            keyframes.push({
                index: i,
                time: prop.keyTime(i),
                value: prop.keyValue(i)
            });
        }
        return JSON.stringify({ status: "success", keyframes: keyframes }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function keyframeReverse(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var prop = layer.property("Transform").property(args.propertyPath);
        if (!prop) throw new Error("Property not found");
        
        var keyframes = [];
        for (var i = 1; i <= prop.numKeys; i++) {
            keyframes.push({ time: prop.keyTime(i), value: prop.keyValue(i) });
        }
        
        var duration = keyframes[keyframes.length - 1].time - keyframes[0].time;
        var startTime = keyframes[0].time;
        
        while (prop.numKeys > 0) prop.removeKey(1);
        
        for (var j = 0; j < keyframes.length; j++) {
            var newTime = startTime + duration - (keyframes[j].time - startTime);
            prop.setValueAtTime(newTime, keyframes[j].value);
        }
        
        return JSON.stringify({ status: "success", message: "Keyframes reversed" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// ==================== FOOTAGE OPERATIONS ====================

function footageSetInterpretation(args) {
    try {
        var item = app.project.item(args.footageIndex);
        if (args.frameRate) item.mainSource.conformFrameRate = args.frameRate;
        if (args.loopTimes) item.mainSource.loop = args.loopTimes;
        return JSON.stringify({ status: "success", message: "Footage interpretation set" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function footageReload(args) {
    try {
        var item = app.project.item(args.footageIndex);
        item.mainSource.reload();
        return JSON.stringify({ status: "success", message: "Footage reloaded" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function footageGetMissing(args) {
    try {
        var missing = [];
        for (var i = 1; i <= app.project.numItems; i++) {
            var item = app.project.item(i);
            if (item instanceof FootageItem && item.mainSource.isStill === undefined && !item.file) {
                missing.push({ index: i, name: item.name });
            }
        }
        return JSON.stringify({ status: "success", missingFootage: missing }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// ==================== EFFECT OPERATIONS ====================

function effectRemove(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        layer.Effects.property(args.effectIndex).remove();
        return JSON.stringify({ status: "success", message: "Effect removed" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function effectDuplicate(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var effect = layer.Effects.property(args.effectIndex);
        effect.duplicate();
        return JSON.stringify({ status: "success", message: "Effect duplicated" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function effectToggle(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var effect = layer.Effects.property(args.effectIndex);
        effect.enabled = args.enabled !== undefined ? args.enabled : !effect.enabled;
        return JSON.stringify({ status: "success", message: "Effect toggled" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function effectSetProperty(args) {
    try {
        var comp = null;
        if (args.compIndex !== undefined && args.compIndex !== null) {
            comp = app.project.item(args.compIndex);
            if (!comp || !(comp instanceof CompItem)) throw new Error("Composition not found at index " + args.compIndex);
        } else if (args.compName) {
            for (var i = 1; i <= app.project.numItems; i++) {
                var it = app.project.item(i);
                if (it instanceof CompItem && it.name === args.compName) { comp = it; break; }
            }
            if (!comp) throw new Error("Composition not found: " + args.compName);
        } else {
            comp = app.project.activeItem && app.project.activeItem instanceof CompItem ? app.project.activeItem : null;
            if (!comp) throw new Error("No composition specified. Provide compIndex or compName.");
        }
        var layer = null;
        if (args.layerIndex !== undefined && args.layerIndex !== null) {
            layer = comp.layer(args.layerIndex);
        } else if (args.layerName) {
            layer = comp.layer(args.layerName);
        } else if (comp.numLayers > 0) {
            layer = comp.layer(1);
        }
        if (!layer) throw new Error("Layer not found. Provide layerIndex or layerName.");
        var effect = layer.Effects.property(args.effectIndex);
        effect.property(args.propertyName).setValue(args.value);
        return JSON.stringify({ status: "success", message: "Effect property set" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function effectKeyframe(args) {
    try {
        var comp = null;
        if (args.compIndex !== undefined && args.compIndex !== null) {
            comp = app.project.item(args.compIndex);
            if (!comp || !(comp instanceof CompItem)) throw new Error("Composition not found at index " + args.compIndex);
        } else if (args.compName) {
            for (var i = 1; i <= app.project.numItems; i++) {
                var it = app.project.item(i);
                if (it instanceof CompItem && it.name === args.compName) { comp = it; break; }
            }
            if (!comp) throw new Error("Composition not found: " + args.compName);
        } else {
            comp = app.project.activeItem && app.project.activeItem instanceof CompItem ? app.project.activeItem : null;
            if (!comp) throw new Error("No composition specified. Provide compIndex or compName.");
        }
        var layer = null;
        if (args.layerIndex !== undefined && args.layerIndex !== null) {
            layer = comp.layer(args.layerIndex);
        } else if (args.layerName) {
            layer = comp.layer(args.layerName);
        } else if (comp.numLayers > 0) {
            layer = comp.layer(1);
        }
        if (!layer) throw new Error("Layer not found. Provide layerIndex or layerName.");
        var effect = layer.Effects.property(args.effectIndex);
        effect.property(args.propertyName).setValueAtTime(args.time, args.value);
        return JSON.stringify({ status: "success", message: "Effect keyframe set" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// ==================== MASK OPERATIONS ====================

function maskRemove(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        layer.Masks.property(args.maskIndex).remove();
        return JSON.stringify({ status: "success", message: "Mask removed" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function maskSetProperties(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var mask = layer.Masks.property(args.maskIndex);
        
        var modeMap = {
            "none": MaskMode.NONE,
            "add": MaskMode.ADD,
            "subtract": MaskMode.SUBTRACT,
            "intersect": MaskMode.INTERSECT,
            "lighten": MaskMode.LIGHTEN,
            "darken": MaskMode.DARKEN,
            "difference": MaskMode.DIFFERENCE
        };
        
        if (args.mode && modeMap[args.mode]) mask.maskMode = modeMap[args.mode];
        if (args.feather !== undefined) mask.property("Mask Feather").setValue([args.feather, args.feather]);
        if (args.opacity !== undefined) mask.property("Mask Opacity").setValue(args.opacity);
        if (args.expansion !== undefined) mask.property("Mask Expansion").setValue(args.expansion);
        if (args.inverted !== undefined) mask.inverted = args.inverted;
        
        return JSON.stringify({ status: "success", message: "Mask properties set" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function maskKeyframe(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var mask = layer.Masks.property(args.maskIndex);
        var maskPath = mask.property("Mask Path");
        
        var shape = new Shape();
        shape.vertices = args.vertices;
        if (args.inTangents) shape.inTangents = args.inTangents;
        if (args.outTangents) shape.outTangents = args.outTangents;
        shape.closed = true;
        
        maskPath.setValueAtTime(args.time, shape);
        
        return JSON.stringify({ status: "success", message: "Mask keyframe set" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// ==================== RESOURCE FUNCTIONS ====================

function getProjectState(args) {
    try {
        var state = {
            projectName: app.project.file ? app.project.file.name : "Untitled",
            projectPath: app.project.file ? app.project.file.fsName : null,
            numItems: app.project.numItems,
            bitsPerChannel: app.project.bitsPerChannel,
            activeComp: null
        };
        
        if (app.project.activeItem instanceof CompItem) {
            var ac = app.project.activeItem;
            state.activeComp = {
                name: ac.name,
                width: ac.width,
                height: ac.height,
                duration: ac.duration,
                frameRate: ac.frameRate,
                numLayers: ac.numLayers
            };
        }
        
        return JSON.stringify({ status: "success", state: state }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function getActiveComposition(args) {
    try {
        if (!(app.project.activeItem instanceof CompItem)) {
            return JSON.stringify({ status: "error", message: "No active composition" }, null, 2);
        }
        
        var comp = app.project.activeItem;
        var layers = [];
        for (var i = 1; i <= Math.min(comp.numLayers, 100); i++) {
            var layer = comp.layer(i);
            layers.push({
                index: i,
                name: layer.name,
                enabled: layer.enabled,
                is3D: layer.threeDLayer
            });
        }
        
        return JSON.stringify({
            status: "success",
            composition: {
                name: comp.name,
                id: comp.id,
                width: comp.width,
                height: comp.height,
                duration: comp.duration,
                frameRate: comp.frameRate,
                numLayers: comp.numLayers,
                layers: layers
            }
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function getAvailableEffects(args) {
    try {
        var effects = app.effects;
        var effectList = [];
        for (var i = 0; i < effects.length; i++) {
            effectList.push({
                name: effects[i].displayName,
                matchName: effects[i].matchName,
                category: effects[i].category
            });
        }
        return JSON.stringify({ status: "success", effects: effectList, count: effectList.length }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function getAvailableFonts(args) {
    try {
        var fonts = app.fonts;
        var fontList = [];
        for (var i = 0; i < fonts.length; i++) {
            fontList.push({
                name: fonts[i].fontName,
                family: fonts[i].familyName,
                style: fonts[i].styleName
            });
        }
        return JSON.stringify({ status: "success", fonts: fontList, count: fontList.length }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// ==================== TRANSFORM FUNCTIONS ====================

function transformSetAll(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var transform = layer.property("Transform");
        
        if (args.position) transform.property("Position").setValue(args.position);
        if (args.anchorPoint) transform.property("Anchor Point").setValue(args.anchorPoint);
        if (args.scale) transform.property("Scale").setValue(args.scale);
        if (args.rotation !== undefined) transform.property("Rotation").setValue(args.rotation);
        if (args.opacity !== undefined) transform.property("Opacity").setValue(args.opacity);
        
        return JSON.stringify({ status: "success", message: "Transform properties set" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function transformReset(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var transform = layer.property("Transform");
        var prop = args.property || "all";
        
        if (prop === "all" || prop === "position") {
            transform.property("Position").setValue([comp.width / 2, comp.height / 2]);
        }
        if (prop === "all" || prop === "anchorPoint") {
            transform.property("Anchor Point").setValue([0, 0]);
        }
        if (prop === "all" || prop === "scale") {
            transform.property("Scale").setValue([100, 100]);
        }
        if (prop === "all" || prop === "rotation") {
            transform.property("Rotation").setValue(0);
        }
        if (prop === "all" || prop === "opacity") {
            transform.property("Opacity").setValue(100);
        }
        
        return JSON.stringify({ status: "success", message: "Transform reset" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function transformCenterInComp(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var pos = layer.property("Position").value;
        var h = args.horizontal !== false;
        var v = args.vertical !== false;
        
        var newPos = [
            h ? comp.width / 2 : pos[0],
            v ? comp.height / 2 : pos[1]
        ];
        layer.property("Position").setValue(newPos);
        
        return JSON.stringify({ status: "success", message: "Layer centered" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function transformFitToComp(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var fitType = args.fitType || "fit";
        
        var layerWidth = layer.width;
        var layerHeight = layer.height;
        var scaleX = (comp.width / layerWidth) * 100;
        var scaleY = (comp.height / layerHeight) * 100;
        
        var scale;
        switch (fitType) {
            case "fill":
                scale = Math.max(scaleX, scaleY);
                layer.property("Scale").setValue([scale, scale]);
                break;
            case "fit":
                scale = Math.min(scaleX, scaleY);
                layer.property("Scale").setValue([scale, scale]);
                break;
            case "stretch":
                layer.property("Scale").setValue([scaleX, scaleY]);
                break;
        }
        
        layer.property("Position").setValue([comp.width / 2, comp.height / 2]);
        
        return JSON.stringify({ status: "success", message: "Layer fit to comp" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// ==================== EXPRESSION FUNCTIONS ====================

function expressionSet(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var prop = getPropertyByPath(layer, args.propertyPath);
        prop.expression = args.expression;
        return JSON.stringify({ status: "success", message: "Expression set" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function expressionRemove(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var prop = getPropertyByPath(layer, args.propertyPath);
        prop.expression = "";
        return JSON.stringify({ status: "success", message: "Expression removed" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function expressionToggle(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var prop = getPropertyByPath(layer, args.propertyPath);
        prop.expressionEnabled = args.enabled !== undefined ? args.enabled : !prop.expressionEnabled;
        return JSON.stringify({ status: "success", message: "Expression toggled" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function expressionGet(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var prop = getPropertyByPath(layer, args.propertyPath);
        return JSON.stringify({
            status: "success",
            expression: prop.expression,
            enabled: prop.expressionEnabled
        }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function addExpressionControl(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        
        var controlMap = {
            "slider": "ADBE Slider Control",
            "checkbox": "ADBE Checkbox Control",
            "color": "ADBE Color Control",
            "point": "ADBE Point Control",
            "angle": "ADBE Angle Control",
            "dropdown": "ADBE Dropdown Menu Control",
            "layer": "ADBE Layer Control"
        };
        
        var effect = layer.Effects.addProperty(controlMap[args.controlType]);
        if (args.name) effect.name = args.name;
        if (args.defaultValue !== undefined) {
            try {
                effect.property(1).setValue(args.defaultValue);
            } catch (e) {}
        }
        
        return JSON.stringify({ status: "success", message: args.controlType + " control added" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// Helper to get property by path
function getPropertyByPath(layer, path) {
    var parts = path.split(".");
    var prop = layer;
    for (var i = 0; i < parts.length; i++) {
        prop = prop.property(parts[i]);
        if (!prop) throw new Error("Property not found: " + path);
    }
    return prop;
}

// ==================== ANIMATION HELPER FUNCTIONS ====================

function sequenceLayers(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var indices = args.layerIndices;
        var overlap = args.overlap || 0;
        
        if (args.reverse) indices = indices.reverse();
        
        var currentTime = comp.layer(indices[0]).startTime;
        for (var i = 0; i < indices.length; i++) {
            var layer = comp.layer(indices[i]);
            layer.startTime = currentTime;
            currentTime = layer.outPoint - overlap;
        }
        
        return JSON.stringify({ status: "success", message: "Layers sequenced" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function staggerAnimation(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var indices = args.layerIndices;
        
        for (var i = 0; i < indices.length; i++) {
            var layer = comp.layer(indices[i]);
            var prop = layer.property("Transform").property(args.property);
            var offset = i * args.delay;
            
            prop.setValueAtTime(offset, args.startValue);
            prop.setValueAtTime(offset + args.duration, args.endValue);
        }
        
        return JSON.stringify({ status: "success", message: "Staggered animation applied" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function createAnimationPreset(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var duration = args.duration || 1;
        var startTime = args.startTime || 0;
        var endTime = startTime + duration;
        var transform = layer.property("Transform");
        
        switch (args.preset) {
            case "fade-in":
                transform.property("Opacity").setValueAtTime(startTime, 0);
                transform.property("Opacity").setValueAtTime(endTime, 100);
                break;
            case "fade-out":
                transform.property("Opacity").setValueAtTime(startTime, 100);
                transform.property("Opacity").setValueAtTime(endTime, 0);
                break;
            case "fade-in-out":
                transform.property("Opacity").setValueAtTime(startTime, 0);
                transform.property("Opacity").setValueAtTime(startTime + duration * 0.3, 100);
                transform.property("Opacity").setValueAtTime(startTime + duration * 0.7, 100);
                transform.property("Opacity").setValueAtTime(endTime, 0);
                break;
            case "slide-in-left":
                var pos = transform.property("Position").value;
                transform.property("Position").setValueAtTime(startTime, [-layer.width, pos[1]]);
                transform.property("Position").setValueAtTime(endTime, pos);
                break;
            case "slide-in-right":
                var pos = transform.property("Position").value;
                transform.property("Position").setValueAtTime(startTime, [comp.width + layer.width, pos[1]]);
                transform.property("Position").setValueAtTime(endTime, pos);
                break;
            case "slide-in-top":
                var pos = transform.property("Position").value;
                transform.property("Position").setValueAtTime(startTime, [pos[0], -layer.height]);
                transform.property("Position").setValueAtTime(endTime, pos);
                break;
            case "slide-in-bottom":
                var pos = transform.property("Position").value;
                transform.property("Position").setValueAtTime(startTime, [pos[0], comp.height + layer.height]);
                transform.property("Position").setValueAtTime(endTime, pos);
                break;
            case "scale-in":
                transform.property("Scale").setValueAtTime(startTime, [0, 0]);
                transform.property("Scale").setValueAtTime(endTime, [100, 100]);
                break;
            case "scale-out":
                transform.property("Scale").setValueAtTime(startTime, [100, 100]);
                transform.property("Scale").setValueAtTime(endTime, [0, 0]);
                break;
            case "scale-bounce":
                transform.property("Scale").setValueAtTime(startTime, [0, 0]);
                transform.property("Scale").setValueAtTime(startTime + duration * 0.6, [120, 120]);
                transform.property("Scale").setValueAtTime(startTime + duration * 0.8, [90, 90]);
                transform.property("Scale").setValueAtTime(endTime, [100, 100]);
                break;
            case "rotate-in":
                transform.property("Rotation").setValueAtTime(startTime, -360);
                transform.property("Rotation").setValueAtTime(endTime, 0);
                transform.property("Scale").setValueAtTime(startTime, [0, 0]);
                transform.property("Scale").setValueAtTime(endTime, [100, 100]);
                break;
            case "rotate-out":
                transform.property("Rotation").setValueAtTime(startTime, 0);
                transform.property("Rotation").setValueAtTime(endTime, 360);
                transform.property("Scale").setValueAtTime(startTime, [100, 100]);
                transform.property("Scale").setValueAtTime(endTime, [0, 0]);
                break;
            case "blur-in":
                transform.property("Opacity").setValueAtTime(startTime, 0);
                transform.property("Opacity").setValueAtTime(endTime, 100);
                var blur = layer.Effects.addProperty("ADBE Gaussian Blur 2");
                blur.property("Blurriness").setValueAtTime(startTime, 50);
                blur.property("Blurriness").setValueAtTime(endTime, 0);
                break;
            case "blur-out":
                transform.property("Opacity").setValueAtTime(startTime, 100);
                transform.property("Opacity").setValueAtTime(endTime, 0);
                var blur = layer.Effects.addProperty("ADBE Gaussian Blur 2");
                blur.property("Blurriness").setValueAtTime(startTime, 0);
                blur.property("Blurriness").setValueAtTime(endTime, 50);
                break;
            case "bounce-in":
                var pos = transform.property("Position").value;
                transform.property("Position").setValueAtTime(startTime, [pos[0], -layer.height]);
                transform.property("Position").setValueAtTime(startTime + duration * 0.5, pos);
                transform.property("Position").setValueAtTime(startTime + duration * 0.65, [pos[0], pos[1] - 50]);
                transform.property("Position").setValueAtTime(startTime + duration * 0.8, pos);
                transform.property("Position").setValueAtTime(startTime + duration * 0.9, [pos[0], pos[1] - 20]);
                transform.property("Position").setValueAtTime(endTime, pos);
                break;
            case "elastic-in":
                transform.property("Scale").setValueAtTime(startTime, [0, 0]);
                transform.property("Scale").setValueAtTime(startTime + duration * 0.4, [110, 110]);
                transform.property("Scale").setValueAtTime(startTime + duration * 0.55, [95, 95]);
                transform.property("Scale").setValueAtTime(startTime + duration * 0.7, [102, 102]);
                transform.property("Scale").setValueAtTime(startTime + duration * 0.85, [99, 99]);
                transform.property("Scale").setValueAtTime(endTime, [100, 100]);
                break;
        }
        
        return JSON.stringify({ status: "success", message: args.preset + " animation applied" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// ==================== 3D FUNCTIONS ====================

function set3DPosition(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        if (!layer.threeDLayer) layer.threeDLayer = true;
        
        var pos = layer.property("Position").value;
        var newPos = [
            args.x !== undefined ? args.x : pos[0],
            args.y !== undefined ? args.y : pos[1],
            args.z !== undefined ? args.z : (pos.length > 2 ? pos[2] : 0)
        ];
        layer.property("Position").setValue(newPos);
        
        return JSON.stringify({ status: "success", message: "3D position set" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function set3DRotation(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        if (!layer.threeDLayer) layer.threeDLayer = true;
        
        if (args.xRotation !== undefined) layer.property("X Rotation").setValue(args.xRotation);
        if (args.yRotation !== undefined) layer.property("Y Rotation").setValue(args.yRotation);
        if (args.zRotation !== undefined) layer.property("Z Rotation").setValue(args.zRotation);
        if (args.orientation) layer.property("Orientation").setValue(args.orientation);
        
        return JSON.stringify({ status: "success", message: "3D rotation set" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function setMaterialOptions(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        if (!layer.threeDLayer) layer.threeDLayer = true;
        
        var material = layer.property("Material Options");
        if (args.castsShadows !== undefined) material.property("Casts Shadows").setValue(args.castsShadows ? 1 : 0);
        if (args.acceptsShadows !== undefined) material.property("Accepts Shadows").setValue(args.acceptsShadows ? 1 : 0);
        if (args.acceptsLights !== undefined) material.property("Accepts Lights").setValue(args.acceptsLights ? 1 : 0);
        if (args.ambient !== undefined) material.property("Ambient").setValue(args.ambient);
        if (args.diffuse !== undefined) material.property("Diffuse").setValue(args.diffuse);
        if (args.specularIntensity !== undefined) material.property("Specular Intensity").setValue(args.specularIntensity);
        if (args.specularShininess !== undefined) material.property("Specular Shininess").setValue(args.specularShininess);
        if (args.metal !== undefined) material.property("Metal").setValue(args.metal);
        
        return JSON.stringify({ status: "success", message: "Material options set" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// ==================== TEXT FUNCTIONS ====================

function setTextContent(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var textProp = layer.property("Source Text");
        var textDoc = textProp.value;
        textDoc.text = args.text;
        textProp.setValue(textDoc);
        return JSON.stringify({ status: "success", message: "Text content set" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function setTextStyle(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        var textProp = layer.property("Source Text");
        var textDoc = textProp.value;
        
        if (args.font) textDoc.font = args.font;
        if (args.fontSize) textDoc.fontSize = args.fontSize;
        if (args.fillColor) textDoc.fillColor = [args.fillColor.r / 255, args.fillColor.g / 255, args.fillColor.b / 255];
        if (args.strokeColor) textDoc.strokeColor = [args.strokeColor.r / 255, args.strokeColor.g / 255, args.strokeColor.b / 255];
        if (args.strokeWidth) textDoc.strokeWidth = args.strokeWidth;
        if (args.tracking) textDoc.tracking = args.tracking;
        if (args.leading) textDoc.leading = args.leading;
        if (args.baselineShift) textDoc.baselineShift = args.baselineShift;
        if (args.justification) {
            var justMap = { "left": ParagraphJustification.LEFT_JUSTIFY, "center": ParagraphJustification.CENTER_JUSTIFY, "right": ParagraphJustification.RIGHT_JUSTIFY, "full": ParagraphJustification.FULL_JUSTIFY_LASTLINE_LEFT };
            textDoc.justification = justMap[args.justification] || ParagraphJustification.LEFT_JUSTIFY;
        }
        if (args.faux) {
            if (args.faux.bold !== undefined) textDoc.fauxBold = args.faux.bold;
            if (args.faux.italic !== undefined) textDoc.fauxItalic = args.faux.italic;
        }
        
        textProp.setValue(textDoc);
        return JSON.stringify({ status: "success", message: "Text style set" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// ==================== OTHER FUNCTIONS ====================

function createAdjustmentLayer(args) {
    try {
        var comp = args.compIndex ? app.project.item(args.compIndex) : app.project.activeItem;
        var layer = comp.layers.addSolid([1, 1, 1], args.name || "Adjustment Layer", comp.width, comp.height, 1, args.duration || comp.duration);
        layer.adjustmentLayer = true;
        return JSON.stringify({ status: "success", message: "Adjustment layer created", layer: { name: layer.name, index: layer.index } }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function setGuideLayer(args) {
    try {
        var comp = app.project.item(args.compIndex);
        var layer = comp.layer(args.layerIndex);
        layer.guideLayer = args.isGuide !== false;
        return JSON.stringify({ status: "success", message: "Guide layer set" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function setCurrentTime(args) {
    try {
        var comp = args.compIndex ? app.project.item(args.compIndex) : app.project.activeItem;
        comp.time = args.time;
        return JSON.stringify({ status: "success", message: "Current time set to " + args.time }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

function previewPlay(args) {
    try {
        // Note: Direct preview control is limited in ExtendScript
        // This provides a placeholder for future implementation
        return JSON.stringify({ status: "info", message: "Use spacebar in AE to play/pause preview" }, null, 2);
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.toString() }, null, 2);
    }
}

// JSON polyfill for ExtendScript (when JSON is undefined)
if (typeof JSON === "undefined") {
    JSON = {};
}
if (typeof JSON.parse !== "function") {
    JSON.parse = function (text) {
        // Safe-ish fallback for trusted input (our own command file)
        return eval("(" + text + ")");
    };
}
if (typeof JSON.stringify !== "function") {
    (function () {
        function esc(str) {
            return (str + "")
                .replace(/\\/g, "\\\\")
                .replace(/"/g, '\\"')
                .replace(/\n/g, "\\n")
                .replace(/\r/g, "\\r")
                .replace(/\t/g, "\\t");
        }
        function toJSON(val) {
            if (val === null) return "null";
            var t = typeof val;
            if (t === "number" || t === "boolean") return String(val);
            if (t === "string") return '"' + esc(val) + '"';
            if (val instanceof Array) {
                var a = [];
                for (var i = 0; i < val.length; i++) a.push(toJSON(val[i]));
                return "[" + a.join(",") + "]";
            }
            if (t === "object") {
                var props = [];
                for (var k in val) {
                    if (val.hasOwnProperty(k) && typeof val[k] !== "function" && typeof val[k] !== "undefined") {
                        props.push('"' + esc(k) + '":' + toJSON(val[k]));
                    }
                }
                return "{" + props.join(",") + "}";
            }
            return "null";
        }
        JSON.stringify = function (value, _replacer, _space) {
            return toJSON(value);
        };
    })();
}

// Detect AE version (e.g. "26.0" -> 26)
var aeVersionNum = 0;
try {
    var verStr = String(app.version).split(".")[0];
    aeVersionNum = parseInt(verStr, 10) || 0;
} catch (e) {}
var isAE2025OrLater = (aeVersionNum >= 25);

// Always create a floating palette window for AE 2025+
var panel = new Window("palette", "MCP Bridge Auto", undefined);
panel.orientation = "column";
panel.alignChildren = ["fill", "top"];
panel.spacing = 10;
panel.margins = 16;

// Status display
var statusText = panel.add("statictext", undefined, "Waiting for commands...");
statusText.alignment = ["fill", "top"];

// Add log area
var logPanel = panel.add("panel", undefined, "Command Log");
logPanel.orientation = "column";
logPanel.alignChildren = ["fill", "fill"];
var logText = logPanel.add("edittext", undefined, "", {multiline: true, readonly: true});
logText.preferredSize.height = 200;

// AE 2025+ warning (dockable panels not supported)
if (isAE2025OrLater) {
    var warning = panel.add("statictext", undefined, "AE 2025+: Dockable panels are not supported. Floating window only.");
    warning.graphics.foregroundColor = warning.graphics.newPen(warning.graphics.PenType.SOLID_COLOR, [1,0.3,0,1], 1);
}

// Auto-run checkbox
var autoRunCheckbox = panel.add("checkbox", undefined, "Auto-run commands");
autoRunCheckbox.value = true;

// Check interval (ms)
var checkInterval = 2000;
var isChecking = false;

// Use same folder as MCP server: ~/.after-effects-mcp/
function getBridgeDir() {
    var homeFolder = Folder.myDocuments.parent;
    var bridgeDir = new Folder(homeFolder.fsName + "/.after-effects-mcp");
    if (!bridgeDir.exists) {
        bridgeDir.create();
    }
    return bridgeDir.fsName;
}

// Command file path (must match path used by Node MCP server)
function getCommandFilePath() {
    return getBridgeDir() + "/ae_command.json";
}

// Result file path
function getResultFilePath() {
    return getBridgeDir() + "/ae_mcp_result.json";
}

// Functions for each script type
function getProjectInfo() {
    var project = app.project;
    var result = {
        projectName: project.file ? project.file.name : "Untitled Project",
        path: project.file ? project.file.fsName : "",
        numItems: project.numItems,
        bitsPerChannel: project.bitsPerChannel,
        timeMode: project.timeDisplayType === TimeDisplayType.FRAMES ? "Frames" : "Timecode",
        items: []
    };

    // Count item types
    var countByType = {
        compositions: 0,
        footage: 0,
        folders: 0,
        solids: 0
    };

    // Get item information (limited for performance)
    for (var i = 1; i <= Math.min(project.numItems, 50); i++) {
        var item = project.item(i);
        var itemType = "";
        
        if (item instanceof CompItem) {
            itemType = "Composition";
            countByType.compositions++;
        } else if (item instanceof FolderItem) {
            itemType = "Folder";
            countByType.folders++;
        } else if (item instanceof FootageItem) {
            if (item.mainSource instanceof SolidSource) {
                itemType = "Solid";
                countByType.solids++;
            } else {
                itemType = "Footage";
                countByType.footage++;
            }
        }
        
        result.items.push({
            id: item.id,
            name: item.name,
            type: itemType
        });
    }
    
    result.itemCounts = countByType;

    // Include active composition metadata if available
    if (app.project.activeItem instanceof CompItem) {
        var ac = app.project.activeItem;
        result.activeComp = {
            id: ac.id,
            name: ac.name,
            width: ac.width,
            height: ac.height,
            duration: ac.duration,
            frameRate: ac.frameRate,
            numLayers: ac.numLayers
        };
    }

    return JSON.stringify(result, null, 2);
}

function listCompositions() {
    var project = app.project;
    var result = {
        compositions: []
    };
    
    // Loop through items in the project
    for (var i = 1; i <= project.numItems; i++) {
        var item = project.item(i);
        
        // Check if the item is a composition
        if (item instanceof CompItem) {
            result.compositions.push({
                id: item.id,
                name: item.name,
                duration: item.duration,
                frameRate: item.frameRate,
                width: item.width,
                height: item.height,
                numLayers: item.numLayers
            });
        }
    }
    
    return JSON.stringify(result, null, 2);
}

function getLayerInfo() {
    var project = app.project;
    var result = {
        layers: []
    };
    
    // Get the active composition
    var activeComp = null;
    if (app.project.activeItem instanceof CompItem) {
        activeComp = app.project.activeItem;
    } else {
        return JSON.stringify({ error: "No active composition" }, null, 2);
    }
    
    // Loop through layers in the active composition
    for (var i = 1; i <= activeComp.numLayers; i++) {
        var layer = activeComp.layer(i);
        var layerInfo = {
            index: layer.index,
            name: layer.name,
            enabled: layer.enabled,
            locked: layer.locked,
            inPoint: layer.inPoint,
            outPoint: layer.outPoint
        };
        
        result.layers.push(layerInfo);
    }
    
    return JSON.stringify(result, null, 2);
}

// Execute command
function executeCommand(command, args) {
    var result = "";
    
    logToPanel("Executing command: " + command);
    statusText.text = "Running: " + command;
    panel.update();
    
    try {
        logToPanel("Attempting to execute: " + command); // Log before switch
        // Use a switch statement for clarity
        switch (command) {
            case "getProjectInfo":
                result = getProjectInfo();
                break;
            case "listCompositions":
                result = listCompositions();
                break;
            case "getLayerInfo":
                result = getLayerInfo();
                break;
            case "createComposition":
                logToPanel("Calling createComposition function...");
                result = createComposition(args);
                logToPanel("Returned from createComposition.");
                break;
            case "createTextLayer":
                logToPanel("Calling createTextLayer function...");
                result = createTextLayer(args);
                logToPanel("Returned from createTextLayer.");
                break;
            case "createShapeLayer":
                logToPanel("Calling createShapeLayer function...");
                result = createShapeLayer(args);
                logToPanel("Returned from createShapeLayer. Result type: " + typeof result);
                break;
            case "createSolidLayer":
                logToPanel("Calling createSolidLayer function...");
                result = createSolidLayer(args);
                logToPanel("Returned from createSolidLayer.");
                break;
            case "setLayerProperties":
                logToPanel("Calling setLayerProperties function...");
                result = setLayerProperties(args);
                logToPanel("Returned from setLayerProperties.");
                break;
            case "setLayerKeyframe":
                logToPanel("Calling setLayerKeyframe function...");
                result = setLayerKeyframe(args.compIndex, args.layerIndex, args.propertyName, args.timeInSeconds, args.value);
                logToPanel("Returned from setLayerKeyframe.");
                break;
            case "setLayerExpression":
                logToPanel("Calling setLayerExpression function...");
                result = setLayerExpression(args.compIndex, args.layerIndex, args.propertyName, args.expressionString);
                logToPanel("Returned from setLayerExpression.");
                break;
            case "applyEffect":
                logToPanel("Calling applyEffect function...");
                result = applyEffect(args);
                logToPanel("Returned from applyEffect.");
                break;
            case "applyEffectTemplate":
                logToPanel("Calling applyEffectTemplate function...");
                result = applyEffectTemplate(args);
                logToPanel("Returned from applyEffectTemplate.");
                break;
            case "bridgeTestEffects":
                logToPanel("Calling bridgeTestEffects function...");
                result = bridgeTestEffects(args);
                logToPanel("Returned from bridgeTestEffects.");
                break;
            // New layer operations
            case "createNullLayer":
                result = createNullLayer(args);
                break;
            case "duplicateLayer":
                result = duplicateLayer(args);
                break;
            case "parentLayer":
                result = parentLayer(args);
                break;
            case "precomposeLayers":
                result = precomposeLayers(args);
                break;
            case "addCompAsLayer":
                result = addCompAsLayer(args);
                break;
            case "setBlendMode":
                result = setBlendMode(args);
                break;
            case "setTrackMatte":
                result = setTrackMatte(args);
                break;
            case "convertTo3D":
                result = convertTo3D(args);
                break;
            // Camera and light
            case "createCamera":
                result = createCamera(args);
                break;
            case "createLight":
                result = createLight(args);
                break;
            // Keyframe and animation
            case "setKeyframes":
                result = setKeyframes(args);
                break;
            case "applyEasing":
                result = applyEasing(args);
                break;
            case "applyExpressionTemplate":
                result = applyExpressionTemplate(args);
                break;
            // Effects
            case "applyEffectPreset":
                result = applyEffectPreset(args);
                break;
            // Text animation
            case "addTextAnimator":
                result = addTextAnimator(args);
                break;
            case "applyTextAnimation":
                result = applyTextAnimation(args);
                break;
            // Masks
            case "createMask":
                result = createMask(args);
                break;
            case "applyMaskAnimation":
                result = applyMaskAnimation(args);
                break;
            // Render
            case "listOutputModuleTemplates":
                result = listOutputModuleTemplates(args);
                break;
            case "addToRenderQueue":
                result = addToRenderQueue(args);
                break;
            case "startRender":
                result = startRender(args);
                break;
            case "exportComposition":
                result = exportComposition(args);
                break;
            case "exportFrame":
                result = exportFrame(args);
                break;
            case "captureViewport":
                result = captureViewport(args);
                break;
            // Project
            case "saveProject":
                result = saveProject(args);
                break;
            case "createProjectFolder":
                result = createProjectFolder(args);
                break;
            // Import
            case "importFile":
                result = importFile(args);
                break;
            case "replaceFootage":
                result = replaceFootage(args);
                break;
            // Utility
            case "getLayerDetails":
                result = getLayerDetails(args);
                break;
            case "findLayers":
                result = findLayers(args);
                break;
            case "purgeMemory":
                result = purgeMemory(args);
                break;
            case "setCompositionSettings":
                result = setCompositionSettings(args);
                break;
            // Project operations
            case "projectNew":
                result = projectNew(args);
                break;
            case "projectOpen":
                result = projectOpen(args);
                break;
            case "projectClose":
                result = projectClose(args);
                break;
            case "projectGetSettings":
                result = projectGetSettings(args);
                break;
            case "projectSetSettings":
                result = projectSetSettings(args);
                break;
            case "projectDeleteItem":
                result = projectDeleteItem(args);
                break;
            case "projectRenameItem":
                result = projectRenameItem(args);
                break;
            case "projectMoveItem":
                result = projectMoveItem(args);
                break;
            case "projectCollectFiles":
                result = projectCollectFiles(args);
                break;
            case "projectRemoveUnused":
                result = projectRemoveUnused(args);
                break;
            case "projectConsolidateFootage":
                result = projectConsolidateFootage(args);
                break;
            // Composition operations
            case "compDuplicate":
                result = compDuplicate(args);
                break;
            case "compDelete":
                result = compDelete(args);
                break;
            case "compSetActive":
                result = compSetActive(args);
                break;
            case "compGetWorkArea":
                result = compGetWorkArea(args);
                break;
            case "compSetWorkArea":
                result = compSetWorkArea(args);
                break;
            case "compGetSelectedLayers":
                result = compGetSelectedLayers(args);
                break;
            case "getRenderProgress":
                result = getRenderProgress(args);
                break;
            case "getSceneSummary":
                result = getSceneSummary(args);
                break;
            case "getLayerTree":
                result = getLayerTree(args);
                break;
            case "getKeyframeInterpolation":
                result = getKeyframeInterpolation(args);
                break;
            case "setKeyframeInterpolation":
                result = setKeyframeInterpolation(args);
                break;
            case "setupProject":
                result = setupProject(args);
                break;
            // Layer operations
            case "layerDelete":
                result = layerDelete(args);
                break;
            case "layerRename":
                result = layerRename(args);
                break;
            case "layerSelect":
                result = layerSelect(args);
                break;
            case "layerDeselectAll":
                result = layerDeselectAll(args);
                break;
            case "layerMove":
                result = layerMove(args);
                break;
            case "layerSplit":
                result = layerSplit(args);
                break;
            case "layerSetTiming":
                result = layerSetTiming(args);
                break;
            case "layerToggle":
                result = layerToggle(args);
                break;
            case "layerSetQuality":
                result = layerSetQuality(args);
                break;
            case "layerSetLabel":
                result = layerSetLabel(args);
                break;
            case "layerAutoOrient":
                result = layerAutoOrient(args);
                break;
            // Audio
            case "createAudioLayer":
                result = createAudioLayer(args);
                break;
            case "setAudioLevels":
                result = setAudioLevels(args);
                break;
            case "audioKeyframe":
                result = audioKeyframe(args);
                break;
            // Markers
            case "addMarker":
                result = addMarker(args);
                break;
            case "getMarkers":
                result = getMarkers(args);
                break;
            case "removeMarker":
                result = removeMarker(args);
                break;
            // Layer styles
            case "addLayerStyle":
                result = addLayerStyle(args);
                break;
            case "removeLayerStyles":
                result = removeLayerStyles(args);
                break;
            // Shape operations
            case "addShapePath":
                result = addShapePath(args);
                break;
            case "addShapeModifier":
                result = addShapeModifier(args);
                break;
            case "animateShapePath":
                result = animateShapePath(args);
                break;
            // Time remapping
            case "enableTimeRemapping":
                result = enableTimeRemapping(args);
                break;
            case "setTimeRemapKeyframe":
                result = setTimeRemapKeyframe(args);
                break;
            case "applyTimeEffect":
                result = applyTimeEffect(args);
                break;
            // Motion path
            case "createMotionPath":
                result = createMotionPath(args);
                break;
            case "copyAnimation":
                result = copyAnimation(args);
                break;
            // Keyframe operations
            case "keyframeRemove":
                result = keyframeRemove(args);
                break;
            case "keyframeRemoveAll":
                result = keyframeRemoveAll(args);
                break;
            case "keyframeGetAll":
                result = keyframeGetAll(args);
                break;
            case "keyframeReverse":
                result = keyframeReverse(args);
                break;
            // Footage
            case "footageSetInterpretation":
                result = footageSetInterpretation(args);
                break;
            case "footageReload":
                result = footageReload(args);
                break;
            case "footageGetMissing":
                result = footageGetMissing(args);
                break;
            // Effect operations
            case "effectRemove":
                result = effectRemove(args);
                break;
            case "effectDuplicate":
                result = effectDuplicate(args);
                break;
            case "effectToggle":
                result = effectToggle(args);
                break;
            case "effectSetProperty":
                result = effectSetProperty(args);
                break;
            case "effectKeyframe":
                result = effectKeyframe(args);
                break;
            // Mask operations
            case "maskRemove":
                result = maskRemove(args);
                break;
            case "maskSetProperties":
                result = maskSetProperties(args);
                break;
            case "maskKeyframe":
                result = maskKeyframe(args);
                break;
            // Resources
            case "getProjectState":
                result = getProjectState(args);
                break;
            case "getActiveComposition":
                result = getActiveComposition(args);
                break;
            case "getAvailableEffects":
                result = getAvailableEffects(args);
                break;
            case "getAvailableFonts":
                result = getAvailableFonts(args);
                break;
            // Transform
            case "transformSetAll":
                result = transformSetAll(args);
                break;
            case "transformReset":
                result = transformReset(args);
                break;
            case "transformCenterInComp":
                result = transformCenterInComp(args);
                break;
            case "transformFitToComp":
                result = transformFitToComp(args);
                break;
            // Expression
            case "expressionSet":
                result = expressionSet(args);
                break;
            case "expressionRemove":
                result = expressionRemove(args);
                break;
            case "expressionToggle":
                result = expressionToggle(args);
                break;
            case "expressionGet":
                result = expressionGet(args);
                break;
            case "addExpressionControl":
                result = addExpressionControl(args);
                break;
            // Animation helpers
            case "sequenceLayers":
                result = sequenceLayers(args);
                break;
            case "staggerAnimation":
                result = staggerAnimation(args);
                break;
            case "createAnimationPreset":
                result = createAnimationPreset(args);
                break;
            // 3D
            case "set3DPosition":
                result = set3DPosition(args);
                break;
            case "set3DRotation":
                result = set3DRotation(args);
                break;
            case "setMaterialOptions":
                result = setMaterialOptions(args);
                break;
            // Text
            case "setTextContent":
                result = setTextContent(args);
                break;
            case "setTextStyle":
                result = setTextStyle(args);
                break;
            // Other
            case "createAdjustmentLayer":
                result = createAdjustmentLayer(args);
                break;
            case "setGuideLayer":
                result = setGuideLayer(args);
                break;
            case "setCurrentTime":
                result = setCurrentTime(args);
                break;
            case "previewPlay":
                result = previewPlay(args);
                break;
            default:
                result = JSON.stringify({ error: "Unknown command: " + command });
        }
        logToPanel("Execution finished for: " + command); // Log after switch
        
        // Save the result (ensure result is always a string)
        logToPanel("Preparing to write result file...");
        var resultString = (typeof result === 'string') ? result : JSON.stringify(result);
        
        // Try to parse the result as JSON to add a timestamp (ExtendScript has no Date.toISOString)
        try {
            var resultObj = JSON.parse(resultString);
            var d = new Date();
            function pad(n) { return n < 10 ? "0" + n : n; }
            var iso = d.getFullYear() + "-" + pad(d.getMonth()+1) + "-" + pad(d.getDate()) + "T" + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds()) + ".000Z";
            resultObj._responseTimestamp = iso;
            resultObj._commandExecuted = command;
            resultString = JSON.stringify(resultObj, null, 2);
            logToPanel("Added timestamp to result JSON for tracking freshness.");
        } catch (parseError) {
            logToPanel("Could not parse result as JSON to add timestamp: " + parseError.toString());
        }
        
        var resultFile = new File(getResultFilePath());
        resultFile.encoding = "UTF-8"; // Ensure UTF-8 encoding
        logToPanel("Opening result file for writing...");
        var opened = resultFile.open("w");
        if (!opened) {
            logToPanel("ERROR: Failed to open result file for writing: " + resultFile.fsName);
            throw new Error("Failed to open result file for writing.");
        }
        logToPanel("Writing to result file...");
        var written = resultFile.write(resultString);
        if (!written) {
             logToPanel("ERROR: Failed to write to result file (write returned false): " + resultFile.fsName);
             // Still try to close, but log the error
        }
        logToPanel("Closing result file...");
        var closed = resultFile.close();
         if (!closed) {
             logToPanel("ERROR: Failed to close result file: " + resultFile.fsName);
             // Continue, but log the error
        }
        logToPanel("Result file write process complete.");
        
        logToPanel("Command completed successfully: " + command); // Changed log message
        statusText.text = "Command completed: " + command;
        
        // Update command file status
        logToPanel("Updating command status to completed...");
        updateCommandStatus("completed");
        logToPanel("Command status updated.");
        
    } catch (error) {
        var errorMsg = "ERROR in executeCommand for '" + command + "': " + error.toString() + (error.line ? " (line: " + error.line + ")" : "");
        logToPanel(errorMsg); // Log detailed error
        statusText.text = "Error: " + error.toString();
        
        // Write detailed error to result file
        try {
            logToPanel("Attempting to write ERROR to result file...");
            var errorResult = JSON.stringify({ 
                status: "error", 
                command: command,
                _commandExecuted: command,
                message: error.toString(),
                line: error.line,
                fileName: error.fileName
            });
            var errorFile = new File(getResultFilePath());
            errorFile.encoding = "UTF-8";
            if (errorFile.open("w")) {
                errorFile.write(errorResult);
                errorFile.close();
                logToPanel("Successfully wrote ERROR to result file.");
            } else {
                 logToPanel("CRITICAL ERROR: Failed to open result file to write error!");
            }
        } catch (writeError) {
             logToPanel("CRITICAL ERROR: Failed to write error to result file: " + writeError.toString());
        }
        
        // Update command file status even after error
        logToPanel("Updating command status to error...");
        updateCommandStatus("error");
        logToPanel("Command status updated to error.");
    }
}

// Update command file status
function updateCommandStatus(status) {
    try {
        var commandFile = new File(getCommandFilePath());
        if (commandFile.exists) {
            commandFile.open("r");
            var content = commandFile.read();
            commandFile.close();
            
            if (content) {
                var commandData = JSON.parse(content);
                commandData.status = status;
                
                commandFile.open("w");
                commandFile.write(JSON.stringify(commandData, null, 2));
                commandFile.close();
            }
        }
    } catch (e) {
        logToPanel("Error updating command status: " + e.toString());
    }
}

// Log message to panel
function logToPanel(message) {
    var timestamp = new Date().toLocaleTimeString();
    logText.text = timestamp + ": " + message + "\n" + logText.text;
}

// Check for new commands
function checkForCommands() {
    if (!autoRunCheckbox.value || isChecking) return;
    
    isChecking = true;
    
    try {
        var commandFile = new File(getCommandFilePath());
        if (commandFile.exists) {
            commandFile.open("r");
            var content = commandFile.read();
            commandFile.close();
            
            if (content) {
                var commandData = (typeof JSON !== "undefined" && JSON.parse)
                    ? JSON.parse(content)
                    : eval("(" + content + ")");
                
                // Only execute pending commands
                if (commandData.status === "pending") {
                    // Update status to running
                    updateCommandStatus("running");
                    
                    // Execute the command
                    executeCommand(commandData.command, commandData.args || {});
                }
            }
        }
    } catch (e) {
        logToPanel("Error checking for commands: " + e.toString());
    }
    
    isChecking = false;
}

// Set up timer to check for commands
function startCommandChecker() {
    app.scheduleTask("checkForCommands()", checkInterval, true);
}

// Add manual check button
var checkButton = panel.add("button", undefined, "Check for Commands Now");
checkButton.onClick = function() {
    logToPanel("Manually checking for commands");
    checkForCommands();
};

// Log startup and show path so user can verify it matches MCP server
logToPanel("MCP Bridge Auto started");
try {
    logToPanel("Command path: " + getCommandFilePath());
} catch (e) {}
statusText.text = "Ready - Auto-run is " + (autoRunCheckbox.value ? "ON" : "OFF");

// Start the command checker
startCommandChecker();

// Show the panel
panel.center();
panel.show();

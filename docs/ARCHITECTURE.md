# After Effects MCP Server - Architecture Design

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AI Assistant                                    │
│                    (Claude, GPT, Custom Applications)                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ MCP Protocol
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MCP Server (Node.js)                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Tools     │  │  Resources  │  │   Prompts   │  │   Events    │        │
│  │   Handler   │  │   Handler   │  │   Handler   │  │   Handler   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│         │                │                │                │                │
│         └────────────────┴────────────────┴────────────────┘                │
│                                     │                                        │
│                          ┌──────────┴──────────┐                            │
│                          │  Connection Manager │                            │
│                          └──────────┬──────────┘                            │
└─────────────────────────────────────┼───────────────────────────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │      WebSocket / File Bridge      │
                    └─────────────────┬─────────────────┘
                                      │
┌─────────────────────────────────────┼───────────────────────────────────────┐
│                          After Effects                                       │
│  ┌──────────────────────────────────┴────────────────────────────────────┐  │
│  │                        MCP Bridge Panel                                │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │  Command    │  │   Script    │  │   Result    │  │   Event     │  │  │
│  │  │  Receiver   │  │   Executor  │  │   Writer    │  │   Emitter   │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      │                                       │
│  ┌───────────────────────────────────┴───────────────────────────────────┐  │
│  │                      ExtendScript Engine                               │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │  │
│  │  │ Comp    │ │ Layer   │ │ Effect  │ │ Render  │ │ Project │        │  │
│  │  │ Module  │ │ Module  │ │ Module  │ │ Module  │ │ Module  │        │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Module Architecture

### 1. MCP Server Layer (`src/`)

```
src/
├── index.ts                    # Main entry point
├── server/
│   ├── mcp-server.ts          # MCP server configuration
│   ├── tool-registry.ts       # Tool registration and management
│   ├── resource-registry.ts   # Resource registration
│   └── prompt-registry.ts     # Prompt registration
├── connection/
│   ├── connection-manager.ts  # Multi-instance connection handling
│   ├── websocket-server.ts    # WebSocket communication
│   └── file-bridge.ts         # File-based communication (fallback)
├── tools/
│   ├── composition/
│   │   ├── create.ts
│   │   ├── list.ts
│   │   ├── modify.ts
│   │   └── delete.ts
│   ├── layer/
│   │   ├── create.ts
│   │   ├── modify.ts
│   │   ├── animate.ts
│   │   └── effects.ts
│   ├── animation/
│   │   ├── keyframes.ts
│   │   ├── expressions.ts
│   │   ├── motion-paths.ts
│   │   └── presets.ts
│   ├── effects/
│   │   ├── apply.ts
│   │   ├── templates.ts
│   │   └── color-grading.ts
│   ├── render/
│   │   ├── queue.ts
│   │   ├── export.ts
│   │   └── presets.ts
│   └── project/
│       ├── manage.ts
│       ├── import.ts
│       └── organize.ts
├── resources/
│   ├── project-state.ts
│   ├── compositions.ts
│   ├── effects-list.ts
│   └── fonts-list.ts
├── prompts/
│   ├── motion-graphics.ts
│   ├── animation.ts
│   └── technical.ts
├── utils/
│   ├── validation.ts
│   ├── type-conversion.ts
│   ├── error-handling.ts
│   └── logging.ts
└── types/
    ├── composition.ts
    ├── layer.ts
    ├── effect.ts
    └── animation.ts
```

### 2. ExtendScript Layer (`src/scripts/`)

```
src/scripts/
├── mcp-bridge-auto.jsx        # Main bridge panel
├── lib/
│   ├── json-polyfill.jsx      # JSON support for ExtendScript
│   ├── utils.jsx              # Common utilities
│   └── error-handler.jsx      # Error handling
├── modules/
│   ├── composition/
│   │   ├── create.jsx
│   │   ├── list.jsx
│   │   └── modify.jsx
│   ├── layer/
│   │   ├── create-all.jsx     # All layer type creation
│   │   ├── properties.jsx     # Property manipulation
│   │   ├── transform.jsx      # Transform operations
│   │   └── parent.jsx         # Parenting operations
│   ├── animation/
│   │   ├── keyframes.jsx
│   │   ├── expressions.jsx
│   │   ├── easing.jsx
│   │   └── motion-path.jsx
│   ├── effects/
│   │   ├── apply.jsx
│   │   ├── templates.jsx
│   │   └── presets.jsx
│   ├── 3d/
│   │   ├── camera.jsx
│   │   ├── light.jsx
│   │   └── renderer.jsx
│   ├── audio/
│   │   ├── import.jsx
│   │   ├── analyze.jsx
│   │   └── visualize.jsx
│   ├── render/
│   │   ├── queue.jsx
│   │   └── export.jsx
│   ├── text/
│   │   ├── animators.jsx
│   │   └── presets.jsx
│   ├── shape/
│   │   ├── path.jsx
│   │   ├── modifiers.jsx
│   │   └── presets.jsx
│   ├── mask/
│   │   ├── create.jsx
│   │   └── animate.jsx
│   └── project/
│       ├── manage.jsx
│       ├── import.jsx
│       └── organize.jsx
└── presets/
    ├── effects/
    │   ├── cinematic.jsx
    │   ├── social.jsx
    │   └── vfx.jsx
    ├── animations/
    │   ├── text-in.jsx
    │   ├── text-out.jsx
    │   └── transitions.jsx
    └── expressions/
        ├── wiggle.jsx
        ├── bounce.jsx
        └── loop.jsx
```

---

## Communication Protocol

### Current: File-Based (Polling)

```
┌──────────────┐     Write      ┌──────────────┐     Read      ┌──────────────┐
│  MCP Server  │───────────────►│  Command     │◄──────────────│After Effects │
│              │                │  File        │               │    Bridge    │
└──────────────┘                └──────────────┘               └──────────────┘
       ▲                                                              │
       │                        ┌──────────────┐                      │
       └────────Read────────────│  Result      │◄─────Write───────────┘
                                │  File        │
                                └──────────────┘
```

### Enhanced: WebSocket (Real-time)

```
┌──────────────┐                                              ┌──────────────┐
│  MCP Server  │◄──────────────WebSocket──────────────────────│After Effects │
│              │                Port 8080                     │    Bridge    │
└──────────────┘                   ▲                          └──────────────┘
                                   │
                                   │ Events:
                                   │ - command
                                   │ - result
                                   │ - progress
                                   │ - error
                                   │ - state-change
```

### Protocol Messages

```typescript
// Command Message (Server → AE)
interface CommandMessage {
  id: string;              // Unique command ID
  type: 'command';
  command: string;         // Command name
  args: Record<string, any>;
  timestamp: string;
}

// Result Message (AE → Server)
interface ResultMessage {
  id: string;              // Matching command ID
  type: 'result';
  status: 'success' | 'error';
  data?: any;
  error?: {
    code: string;
    message: string;
    stack?: string;
  };
  timestamp: string;
}

// Progress Message (AE → Server)
interface ProgressMessage {
  id: string;              // Matching command ID
  type: 'progress';
  progress: number;        // 0-100
  message?: string;
  timestamp: string;
}

// Event Message (AE → Server)
interface EventMessage {
  type: 'event';
  event: string;           // Event name
  data: any;
  timestamp: string;
}
```

---

## Data Flow

### Tool Execution Flow

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│   AI    │───►│   MCP   │───►│  Tool   │───►│ Bridge  │───►│   AE    │
│Assistant│    │ Server  │    │ Handler │    │         │    │ Engine  │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
                                                                 │
                                                                 ▼
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│   AI    │◄───│   MCP   │◄───│  Tool   │◄───│ Bridge  │◄───│  Result │
│Assistant│    │ Server  │    │ Handler │    │         │    │         │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
```

### Event Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           After Effects                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │
│  │Selection│  │  Comp   │  │  Layer  │  │ Render  │  │ Project │      │
│  │ Changed │  │ Changed │  │ Changed │  │ Progress│  │ Changed │      │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘      │
└───────┼────────────┼────────────┼────────────┼────────────┼───────────┘
        │            │            │            │            │
        └────────────┴────────────┴────────────┴────────────┘
                                  │
                                  ▼
                        ┌─────────────────┐
                        │  Event Emitter  │
                        └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   MCP Server    │
                        └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   AI Assistant  │
                        └─────────────────┘
```

---

## Error Handling Strategy

### Error Categories

```typescript
enum ErrorCategory {
  // Connection Errors
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  CONNECTION_LOST = 'CONNECTION_LOST',
  TIMEOUT = 'TIMEOUT',
  
  // Validation Errors
  INVALID_PARAMETERS = 'INVALID_PARAMETERS',
  MISSING_REQUIRED = 'MISSING_REQUIRED',
  TYPE_MISMATCH = 'TYPE_MISMATCH',
  
  // AE Errors
  COMPOSITION_NOT_FOUND = 'COMPOSITION_NOT_FOUND',
  LAYER_NOT_FOUND = 'LAYER_NOT_FOUND',
  EFFECT_NOT_FOUND = 'EFFECT_NOT_FOUND',
  PROPERTY_NOT_FOUND = 'PROPERTY_NOT_FOUND',
  OPERATION_FAILED = 'OPERATION_FAILED',
  
  // Resource Errors
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  DISK_FULL = 'DISK_FULL',
  
  // System Errors
  AE_NOT_RUNNING = 'AE_NOT_RUNNING',
  BRIDGE_NOT_OPEN = 'BRIDGE_NOT_OPEN',
  SCRIPT_ERROR = 'SCRIPT_ERROR'
}

interface MCPError {
  category: ErrorCategory;
  code: string;
  message: string;
  details?: Record<string, any>;
  recoverable: boolean;
  suggestion?: string;
}
```

### Error Recovery

```typescript
class ErrorRecovery {
  static async handle(error: MCPError): Promise<void> {
    switch (error.category) {
      case ErrorCategory.CONNECTION_LOST:
        await this.attemptReconnect();
        break;
        
      case ErrorCategory.BRIDGE_NOT_OPEN:
        await this.notifyUserToOpenBridge();
        break;
        
      case ErrorCategory.TIMEOUT:
        await this.retryWithBackoff();
        break;
        
      default:
        throw error;
    }
  }
}
```

---

## Caching Strategy

### Cache Layers

```typescript
interface CacheConfig {
  projectStructure: {
    ttl: 60000;  // 1 minute
    invalidateOn: ['project:changed', 'item:added', 'item:removed'];
  };
  
  compositionMetadata: {
    ttl: 30000;  // 30 seconds
    invalidateOn: ['composition:changed'];
  };
  
  layerProperties: {
    ttl: 5000;   // 5 seconds
    invalidateOn: ['layer:changed'];
  };
  
  effectsList: {
    ttl: 3600000;  // 1 hour (rarely changes)
    invalidateOn: ['plugin:installed'];
  };
  
  fontsList: {
    ttl: 3600000;  // 1 hour (rarely changes)
    invalidateOn: ['font:installed'];
  };
}
```

### Cache Implementation

```typescript
class MCPCache {
  private store: Map<string, CacheEntry>;
  private config: CacheConfig;
  
  async get<T>(key: string): Promise<T | null>;
  async set<T>(key: string, value: T): Promise<void>;
  async invalidate(pattern: string): Promise<void>;
  async invalidateByEvent(event: string): Promise<void>;
}
```

---

## Security Model

### Permission System

```typescript
interface PermissionConfig {
  // File system access
  allowedPaths: string[];
  blockedPaths: string[];
  
  // Script execution
  allowCustomScripts: boolean;
  allowNetworkAccess: boolean;
  
  // Project operations
  allowProjectSave: boolean;
  allowProjectDelete: boolean;
  
  // Render operations
  allowBackgroundRender: boolean;
  allowMediaEncoder: boolean;
}
```

### Input Sanitization

```typescript
class InputSanitizer {
  static sanitizePath(path: string): string;
  static sanitizeExpression(expr: string): string;
  static sanitizeScriptContent(script: string): string;
  static validateParameters(params: any, schema: ZodSchema): void;
}
```

---

## Performance Optimization

### Batch Operations

```typescript
interface BatchOperation {
  id: string;
  operations: Operation[];
  undoGroupName?: string;
}

class BatchProcessor {
  async execute(batch: BatchOperation): Promise<BatchResult>;
  
  private optimizeOrder(operations: Operation[]): Operation[];
  private groupByType(operations: Operation[]): Map<string, Operation[]>;
  private executeGroup(group: Operation[]): Promise<void>;
}
```

### Parallel Processing

```typescript
class ParallelExecutor {
  private queue: OperationQueue;
  private maxConcurrent: number;
  
  async submit(operation: Operation): Promise<void>;
  async flush(): Promise<Result[]>;
  
  // Progress tracking
  on(event: 'progress', callback: (progress: number) => void): void;
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// Tool handler tests
describe('CreateCompositionTool', () => {
  it('creates composition with valid parameters');
  it('uses default values for optional parameters');
  it('rejects invalid dimensions');
  it('rejects negative duration');
});
```

### Integration Tests

```typescript
// End-to-end tests with mock AE
describe('Integration: Composition Workflow', () => {
  it('creates composition, adds layers, applies effects');
  it('handles errors gracefully');
  it('recovers from connection loss');
});
```

### Performance Tests

```typescript
// Load and performance tests
describe('Performance', () => {
  it('handles 100 concurrent tool calls');
  it('completes batch operations within timeout');
  it('maintains cache consistency under load');
});
```

---

## Deployment Architecture

### Development

```
┌─────────────────┐
│  TypeScript     │
│  Source Code    │
└────────┬────────┘
         │ tsc
         ▼
┌─────────────────┐
│  JavaScript     │
│  Build Output   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Local Node.js  │
│  Development    │
└─────────────────┘
```

### Production

```
┌─────────────────┐
│  npm package    │
│  Distribution   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐
│  Claude Desktop │◄───│  MCP Config     │
│  Cursor IDE     │    │  JSON           │
└─────────────────┘    └─────────────────┘
```

---

## Monitoring & Logging

### Log Levels

```typescript
enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: Record<string, any>;
  correlationId?: string;
}
```

### Metrics

```typescript
interface Metrics {
  // Command metrics
  commandsReceived: Counter;
  commandsSucceeded: Counter;
  commandsFailed: Counter;
  commandLatency: Histogram;
  
  // Connection metrics
  activeConnections: Gauge;
  connectionErrors: Counter;
  
  // Cache metrics
  cacheHits: Counter;
  cacheMisses: Counter;
  cacheSize: Gauge;
}
```

---

This architecture provides a solid foundation for building a scalable, maintainable, and robust After Effects MCP server that can grow to support all planned features.

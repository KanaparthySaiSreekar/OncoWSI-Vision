# Frontend Architecture

## Overview

OncoWSI Vision frontend follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (React Components, Pages, Layouts)     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         State Management Layer          │
│  (Redux Toolkit, React Query)           │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Business Logic Layer            │
│  (Services, Hooks, Utilities)           │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Data Access Layer               │
│  (API Client, WebSocket, Storage)       │
└─────────────────────────────────────────┘
```

## Core Architectural Patterns

### 1. Component Architecture

#### Atomic Design Principles

```
atoms/        → Basic building blocks (buttons, inputs, icons)
molecules/    → Simple component combinations
organisms/    → Complex component assemblies (viewer, console)
templates/    → Page layouts
pages/        → Fully composed pages
```

#### Component Types

**Presentational Components**
- Pure UI rendering
- Receive data via props
- No direct state management
- Example: `DetectionOverlay`, `ROIOverlay`

**Container Components**
- Connect to Redux store
- Handle business logic
- Manage local state
- Example: `WSIViewer`, `InferenceConsole`

**Layout Components**
- Define page structure
- Handle routing
- Example: `MainLayout`

### 2. State Management Strategy

#### Redux Toolkit Slices

```
store/
  ├── slides/      → Slide data, upload state
  ├── inference/   → Jobs, models, progress
  ├── detections/  → Detection data, visualization settings
  ├── workspace/   → Workspaces, sessions
  └── auth/        → Authentication, user data
```

#### State Normalization

```typescript
{
  slides: {
    byId: { [id]: Slide },
    allIds: string[],
  },
  detections: {
    bySlideId: { [slideId]: Detection[] },
  }
}
```

**Benefits:**
- Fast lookups by ID
- Avoid duplicate data
- Easy updates
- Predictable state shape

#### Async State Patterns

```typescript
createAsyncThunk('slides/upload', async (file) => {
  // Automatic loading/error states
  const response = await api.upload(file);
  return response.data;
});
```

### 3. Data Flow Architecture

#### Unidirectional Data Flow

```
User Action
    ↓
Action Creator (Thunk)
    ↓
API Call / Side Effect
    ↓
Reducer Updates State
    ↓
Component Re-renders
```

#### Real-time Updates Flow

```
Backend Event
    ↓
WebSocket Message
    ↓
Dispatch Action
    ↓
State Update
    ↓
UI Update
```

### 4. Service Layer Architecture

#### API Client Structure

```typescript
class ApiClient {
  private client: AxiosInstance;

  // Interceptors for auth
  setupInterceptors() {
    // Request: Add auth token
    // Response: Handle token refresh
  }
}
```

#### Service Modules

```
services/
  ├── api/
  │   ├── client.ts       → Axios configuration
  │   ├── slides.ts       → Slide operations
  │   ├── inference.ts    → Inference operations
  │   ├── detections.ts   → Detection operations
  │   └── auth.ts         → Auth operations
  ├── websocket/
  │   └── client.ts       → WebSocket client
  └── storage/
      └── local.ts        → LocalStorage utils
```

### 5. WSI Viewer Architecture

#### OpenSeadragon Integration

```
WSIViewer Component
    │
    ├─→ OpenSeadragon Instance
    │      └─→ Tile Source (DZI format)
    │
    ├─→ Detection Overlay (Canvas)
    │      └─→ Renders bounding boxes/polygons
    │
    └─→ ROI Overlay (Canvas)
           └─→ Renders regions of interest
```

#### Tile Loading Strategy

```typescript
// Pyramidal tile structure
getTileUrl(level, x, y) {
  return `/tiles/${slideId}/${level}/${x}_${y}.jpg`;
}

// Levels: 0 (lowest res) → N (highest res)
// Each level is 2x previous resolution
```

#### Overlay Rendering Pipeline

```
1. Get viewport bounds
2. Filter visible detections (culling)
3. Transform image coordinates → viewport → screen
4. Draw to canvas (requestAnimationFrame)
5. Monitor FPS, optimize if <60
```

### 6. Performance Optimization Patterns

#### Code Splitting

```typescript
// Route-based splitting
const SlideViewer = lazy(() => import('./pages/SlideViewerPage'));

// Component-based splitting
const ReportGenerator = lazy(() => import('./components/reports/ReportGenerator'));
```

#### Memoization

```typescript
// Expensive computations
const filteredDetections = useMemo(() => {
  return detections.filter(d => d.confidence > threshold);
}, [detections, threshold]);

// Component re-rendering
export const DetectionLayer = React.memo(({ detections }) => {
  // Only re-render if detections change
});
```

#### Virtual Scrolling

For large lists (e.g., thousands of detections):
```typescript
import { FixedSizeList } from 'react-window';
```

### 7. Error Handling Architecture

#### Error Boundary Strategy

```
App
 └─→ ErrorBoundary (Global)
      └─→ Routes
           └─→ ErrorBoundary (Route-level)
                └─→ Page Components
                     └─→ ErrorBoundary (Component-level)
```

#### Error Recovery Patterns

```typescript
// Automatic retry for network errors
const apiCall = async () => {
  for (let i = 0; i < 3; i++) {
    try {
      return await api.call();
    } catch (error) {
      if (i === 2) throw error;
      await sleep(1000 * Math.pow(2, i)); // Exponential backoff
    }
  }
};
```

### 8. Authentication Flow

```
1. User submits credentials
2. POST /auth/login
3. Receive { token, refreshToken, user }
4. Store in localStorage + Redux
5. Add token to all requests (interceptor)
6. On 401: Attempt refresh
7. If refresh fails: Redirect to login
```

#### Token Refresh Strategy

```typescript
// Automatic refresh 5 minutes before expiry
if (expiresAt - Date.now() < 5 * 60 * 1000) {
  await dispatch(refreshToken());
}
```

### 9. Type System Architecture

#### Domain Types

```
types/
  ├── slide.ts        → Slide, SlideMetadata
  ├── inference.ts    → InferenceJob, ModelMetadata
  ├── detection.ts    → Detection, DetectionLayer
  ├── analysis.ts     → ROI, RegionStatistics
  ├── report.ts       → Report, ReportExportOptions
  ├── workspace.ts    → Workspace, Session
  └── auth.ts         → User, Permission
```

#### Type Safety Benefits

- Compile-time error detection
- IntelliSense support
- Refactoring confidence
- Self-documenting code

### 10. Testing Architecture

#### Test Pyramid

```
      E2E (Few)
        /\
       /  \
      /    \
     /      \
    / Integration (Some) \
   /                      \
  /________________________\
      Unit Tests (Many)
```

#### Testing Strategy

**Unit Tests:**
- Individual component rendering
- Redux reducer logic
- Utility function correctness

**Integration Tests:**
- Component + Redux interaction
- API service integration
- WebSocket event handling

**E2E Tests:**
- Full user workflows
- Upload → Inference → Visualization → Report

### 11. Security Architecture

#### Defense in Depth

```
1. HTTPS Transport Layer
2. JWT Token Authentication
3. Role-Based Access Control (RBAC)
4. Input Validation (Client + Server)
5. XSS Prevention (React auto-escaping)
6. CSRF Protection (Token-based)
7. Audit Logging
```

#### HIPAA Compliance Measures

- No client-side PHI persistence (unless opted in)
- Encrypted communication (HTTPS/WSS)
- Anonymization options in reports
- Session timeout (1 hour)
- Comprehensive audit trails

### 12. Scalability Considerations

#### Bundle Size Management

```bash
# Analyze bundle
npm run build -- --analyze

# Targets:
- Initial bundle: <500KB gzipped
- Route chunks: <200KB each
- Vendor chunk: <300KB
```

#### Performance Budgets

```typescript
// Tile loading: <150ms
// FPS at 40× zoom: 60 FPS
// Autosave latency: <100ms
// API response time: <500ms
```

#### Concurrent Connection Limits

```typescript
// Max simultaneous tile requests: 4
// WebSocket reconnection: Exponential backoff
// API retry: 3 attempts with delay
```

## Design Decisions

### Why OpenSeadragon?

- Industry standard for deep zoom
- Excellent tile management
- Cross-browser compatibility
- Active community support

### Why Redux Toolkit?

- Reduces boilerplate
- Built-in best practices
- Excellent TypeScript support
- DevTools integration

### Why Canvas for Overlays?

- High performance for 1000s of annotations
- Direct pixel manipulation
- Smooth 60 FPS rendering
- WebGL option for future scaling

### Why Socket.io?

- Automatic reconnection
- Room-based subscriptions
- Fallback transports
- Event-based API

## Future Enhancements

1. **WebGL Acceleration** - For >10K detections per slide
2. **Service Workers** - Offline support, background sync
3. **WebRTC** - Collaborative viewing sessions
4. **IndexedDB** - Client-side slide caching
5. **Web Workers** - Offload heavy computations

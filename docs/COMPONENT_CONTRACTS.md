# Component Contracts

## Overview

This document defines the interfaces and contracts for all major components in the OncoWSI Vision frontend.

## Core Components

### WSIViewer

**Purpose:** High-resolution whole-slide image viewer with detection and ROI overlays.

**Props:**
```typescript
interface WSIViewerProps {
  slide: Slide;                                    // Slide data to display
  onViewportChange?: (viewport: Viewport) => void; // Callback for viewport changes
  showDetections?: boolean;                        // Toggle detection overlay
  showROIs?: boolean;                              // Toggle ROI overlay
  className?: string;                              // Additional CSS classes
}
```

**State:**
- OpenSeadragon viewer instance
- Current viewport position
- Ready state

**Events:**
- `onViewportChange`: Fires on pan, zoom, or rotation
- Tile load events for performance monitoring

**Dependencies:**
- OpenSeadragon
- DetectionOverlay component
- ROIOverlay component

---

### DetectionOverlay

**Purpose:** Renders biomarker detections on the WSI viewer using Canvas API.

**Props:**
```typescript
interface DetectionOverlayProps {
  viewer: OpenSeadragon.Viewer;  // Parent viewer instance
  slideId: string;                // Slide ID for fetching detections
}
```

**Redux State:**
- `detections`: Array of detections for the slide
- `layers`: Detection layer visibility and settings
- `visualizationSettings`: Global visualization preferences

**Rendering Strategy:**
- Viewport culling for performance
- RequestAnimationFrame for smooth rendering
- Coordinate transformation: image → viewport → screen

---

### ROIOverlay

**Purpose:** Renders regions of interest for analysis.

**Props:**
```typescript
interface ROIOverlayProps {
  viewer: OpenSeadragon.Viewer;
  slideId: string;
  rois?: ROI[];
  selectedROIId?: string | null;
  onROISelect?: (roi: ROI) => void;
}
```

**Features:**
- Interactive ROI selection
- Visual distinction for selected ROI
- Click handling for selection

---

### SlideUploader

**Purpose:** Drag-and-drop file upload with validation.

**Props:**
```typescript
interface SlideUploaderProps {
  // No props - self-contained component
}
```

**State:**
- `files`: Array of files pending upload
- `uploadProgress`: Upload progress per file

**Validation:**
- File size: Max 10GB
- File format: .tiff, .tif, .ndpi, .svs, .mrxs
- Metadata validation

**Events:**
- `onDrop`: Handle dropped files
- `onUpload`: Trigger upload for valid files
- `onRemove`: Remove file from queue

---

### InferenceConsole

**Purpose:** Biomarker inference control and job monitoring.

**Props:**
```typescript
interface InferenceConsoleProps {
  slideId: string;                              // Slide to run inference on
  onInferenceComplete?: (jobId: string) => void; // Callback on completion
}
```

**State:**
- `selectedModelId`: Currently selected model
- `confidenceThreshold`: Detection confidence threshold
- `iouThreshold`: IOU threshold for NMS
- `batchSize`: Inference batch size

**Redux State:**
- `models`: Available models
- `jobs`: Inference jobs for the slide

**WebSocket Integration:**
- Subscribe to job progress updates
- Listen for status changes
- Update Redux store on events

---

### ReportGenerator

**Purpose:** Generate and export pathology reports.

**Props:**
```typescript
interface ReportGeneratorProps {
  slideId: string;
  jobId: string;
  report?: Report;
}
```

**State:**
- `exportFormat`: PDF | JSON
- `anonymize`: HIPAA anonymization toggle
- `includeHeatmap`: Include heatmap in report
- `includeROIs`: Include ROI analysis

**Export Functions:**
- `generatePDF()`: Create PDF using jsPDF
- `generateJSON()`: Export as JSON
- `handleAnonymization()`: Strip PHI data

---

### LoginForm

**Purpose:** User authentication.

**Props:**
```typescript
interface LoginFormProps {
  // No props - self-contained
}
```

**State:**
- `email`: User email input
- `password`: Password input
- `loading`: Login in progress
- `error`: Login error message

**Validation:**
- Email format validation
- Required fields check

**Events:**
- `onSubmit`: Trigger login action
- Redirect to home on success

---

### MainLayout

**Purpose:** Primary application layout with navigation.

**Props:**
```typescript
interface MainLayoutProps {
  // No props - uses React Router Outlet
}
```

**Features:**
- Sidebar navigation
- User profile display
- Logout functionality
- Route rendering via Outlet

---

## Redux Slices Contracts

### Slides Slice

**State Shape:**
```typescript
interface SlidesState {
  slides: Record<string, Slide>;
  slidesList: string[];
  currentSlideId: string | null;
  uploadProgress: Record<string, SlideUploadProgress>;
  loading: boolean;
  error: string | null;
}
```

**Actions:**
```typescript
// Sync actions
setCurrentSlide(slideId: string | null)
updateSlideStatus({ slideId, status })
updateUploadProgress(progress: SlideUploadProgress)
clearUploadProgress(slideId: string)

// Async thunks
fetchSlides()
fetchSlideById(slideId)
uploadSlide(file: File)
deleteSlide(slideId)
```

---

### Inference Slice

**State Shape:**
```typescript
interface InferenceState {
  jobs: Record<string, InferenceJob>;
  jobsList: string[];
  models: Record<string, ModelMetadata>;
  modelsList: string[];
  currentJobId: string | null;
  loading: boolean;
  error: string | null;
}
```

**Actions:**
```typescript
// Sync actions
updateJobProgress({ jobId, progress, tilesProcessed, detectionCount })
updateJobStatus({ jobId, status, error? })
setCurrentJob(jobId: string | null)

// Async thunks
fetchModels()
fetchInferenceJobs(slideId?)
createInferenceJob({ slideId, config })
cancelInferenceJob(jobId)
```

---

### Detections Slice

**State Shape:**
```typescript
interface DetectionsState {
  detections: Record<string, Detection[]>;
  statistics: Record<string, DetectionStatistics>;
  layers: Record<string, DetectionLayer[]>;
  visualizationSettings: VisualizationSettings;
  loading: boolean;
  error: string | null;
}
```

**Actions:**
```typescript
// Sync actions
setVisualizationSettings(settings: Partial<VisualizationSettings>)
toggleLayerVisibility({ slideId, classId })
updateLayerOpacity({ slideId, classId, opacity })
initializeLayers({ slideId, layers })

// Async thunks
fetchDetections({ slideId, jobId })
fetchDetectionStatistics({ slideId, jobId })
```

---

### Workspace Slice

**State Shape:**
```typescript
interface WorkspaceState {
  workspaces: Record<string, Workspace>;
  workspacesList: string[];
  currentWorkspaceId: string | null;
  currentSession: Session | null;
  autoSaveEnabled: boolean;
  lastSavedAt: string | null;
  loading: boolean;
  error: string | null;
}
```

**Actions:**
```typescript
// Sync actions
setCurrentWorkspace(workspaceId: string | null)
updateViewerState(state: Partial<ViewerState>)
toggleAutoSave()
addSlideToWorkspace({ workspaceId, slideId })

// Async thunks
fetchWorkspaces()
createWorkspace({ name, description })
updateWorkspace({ id, updates })
saveSession(session: Session)
```

---

### Auth Slice

**State Shape:**
```typescript
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}
```

**Actions:**
```typescript
// Sync actions
setCredentials({ user, token, refreshToken, expiresAt })
clearCredentials()

// Async thunks
login(credentials: LoginCredentials)
logout()
refreshToken(refreshToken: string)
fetchCurrentUser()
```

---

## Custom Hooks

### useAppDispatch

**Purpose:** Typed Redux dispatch hook.

```typescript
const dispatch = useAppDispatch();
```

---

### useAppSelector

**Purpose:** Typed Redux selector hook.

```typescript
const slides = useAppSelector(state => state.slides.slides);
```

---

## Service Contracts

### API Client

**Methods:**
```typescript
class ApiClient {
  get<T>(url: string, config?): Promise<AxiosResponse<T>>
  post<T>(url: string, data?, config?): Promise<AxiosResponse<T>>
  patch<T>(url: string, data?, config?): Promise<AxiosResponse<T>>
  delete<T>(url: string, config?): Promise<AxiosResponse<T>>
}
```

**Interceptors:**
- Request: Add Authorization header
- Response: Handle token refresh on 401

---

### WebSocket Client

**Methods:**
```typescript
class WebSocketClient {
  onInferenceProgress(callback: (data: InferenceProgressUpdate) => void)
  onInferenceStatusChange(callback: (data: InferenceStatusUpdate) => void)
  onSlideStatusChange(callback: (data: SlideStatusUpdate) => void)

  subscribeToJob(jobId: string)
  unsubscribeFromJob(jobId: string)
  subscribeToSlide(slideId: string)
  unsubscribeFromSlide(slideId: string)

  disconnect()
  reconnect()
  isConnected(): boolean
}
```

---

## Type Definitions

### Core Domain Types

```typescript
// See src/types/ for full definitions

interface Slide { ... }
interface Detection { ... }
interface InferenceJob { ... }
interface ModelMetadata { ... }
interface ROI { ... }
interface Report { ... }
interface Workspace { ... }
interface User { ... }
```

---

## Component Lifecycle Patterns

### Standard Component Lifecycle

```typescript
1. Mount → Fetch initial data (useEffect)
2. User interaction → Dispatch action
3. Redux state update
4. Component re-render
5. Unmount → Cleanup (WebSocket unsubscribe, etc.)
```

### WebSocket Component Pattern

```typescript
useEffect(() => {
  // Subscribe on mount
  wsClient.subscribeToJob(jobId);
  wsClient.onInferenceProgress(handleProgress);

  // Cleanup on unmount
  return () => {
    wsClient.unsubscribeFromJob(jobId);
  };
}, [jobId]);
```

---

## Error Handling Patterns

### Component Error Boundaries

```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <ComponentThatMightError />
</ErrorBoundary>
```

### API Error Handling

```typescript
try {
  await dispatch(apiAction()).unwrap();
} catch (error) {
  // Display error to user
  // Log to error tracking service
}
```

---

## Performance Considerations

### Component Memoization

```typescript
export const ExpensiveComponent = React.memo(({ data }) => {
  // Only re-render if data changes
});
```

### Callback Memoization

```typescript
const handleClick = useCallback(() => {
  // Stable function reference
}, [dependencies]);
```

### Value Memoization

```typescript
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

---

## Testing Contracts

### Component Tests

```typescript
describe('WSIViewer', () => {
  it('renders slide correctly', () => {
    render(<WSIViewer slide={mockSlide} />);
    expect(screen.getByText(mockSlide.name)).toBeInTheDocument();
  });

  it('calls onViewportChange when viewport updates', () => {
    const handleChange = jest.fn();
    render(<WSIViewer slide={mockSlide} onViewportChange={handleChange} />);
    // Simulate viewport change
    expect(handleChange).toHaveBeenCalled();
  });
});
```

### Redux Tests

```typescript
describe('slidesSlice', () => {
  it('updates slide status', () => {
    const state = reducer(initialState, updateSlideStatus({
      slideId: 'slide_1',
      status: 'ready',
    }));

    expect(state.slides['slide_1'].status).toBe('ready');
  });
});
```

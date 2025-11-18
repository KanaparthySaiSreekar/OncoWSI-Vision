# API Specification

## Overview

The OncoWSI Vision frontend communicates with the backend through two primary channels:

1. **REST API** - Standard CRUD operations
2. **WebSocket** - Real-time updates for inference progress

## Base Configuration

```typescript
// API Configuration
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8000';
const WS_URL = process.env.VITE_WS_URL || 'ws://localhost:8000';
```

## Authentication

### JWT Token Authentication

All API requests include JWT token in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

### Token Refresh Flow

```
1. Initial login returns: { token, refreshToken, expiresIn }
2. Store tokens in localStorage
3. On 401 response: Attempt token refresh
4. If refresh succeeds: Retry original request
5. If refresh fails: Redirect to login
```

## REST API Endpoints

### Slides API

#### List Slides

```http
GET /slides
```

**Response:**
```json
[
  {
    "id": "slide_123",
    "name": "patient_001_scan.ndpi",
    "format": "ndpi",
    "size": 5242880000,
    "uploadedAt": "2024-01-15T10:30:00Z",
    "status": "ready",
    "metadata": {
      "width": 100000,
      "height": 80000,
      "magnification": 40,
      "pixelsPerMicron": 0.25,
      "tileSize": 256,
      "levels": 10
    },
    "tilesUrl": "/tiles/slide_123",
    "thumbnailUrl": "/thumbnails/slide_123.jpg"
  }
]
```

#### Upload Slide

```http
POST /slides/upload
Content-Type: multipart/form-data
```

**Request:**
```
file: <binary data>
```

**Response:**
```json
{
  "id": "slide_124",
  "name": "new_slide.tiff",
  "status": "validating",
  "uploadedAt": "2024-01-15T11:00:00Z"
}
```

**Progress Updates:** Via WebSocket (`slide:status` event)

#### Get Slide Details

```http
GET /slides/:slideId
```

**Response:** Single slide object (same structure as list)

#### Delete Slide

```http
DELETE /slides/:slideId
```

**Response:**
```json
{
  "message": "Slide deleted successfully",
  "id": "slide_123"
}
```

#### Get Slide Tiles

```http
GET /slides/:slideId/tiles/:level/:x/:y
```

**Parameters:**
- `level`: Pyramid level (0 = lowest resolution)
- `x`, `y`: Tile coordinates

**Response:** JPEG image (binary)

---

### Models API

#### List Models

```http
GET /models
```

**Response:**
```json
[
  {
    "id": "model_yolo_v1",
    "name": "YOLOv5 Biomarker Detector",
    "version": "1.2.0",
    "type": "yolov5",
    "description": "Detects common biomarkers in H&E stained slides",
    "classSchema": [
      {
        "id": 0,
        "name": "Tumor Cell",
        "color": "#FF6B6B",
        "description": "Malignant tumor cells"
      },
      {
        "id": 1,
        "name": "Lymphocyte",
        "color": "#4ECDC4",
        "description": "Immune cells"
      }
    ],
    "defaultConfidence": 0.5,
    "inputSize": [640, 640],
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

#### Get Model Details

```http
GET /models/:modelId
```

**Response:** Single model object

---

### Inference API

#### List Inference Jobs

```http
GET /inference/jobs?slideId=<optional>
```

**Query Parameters:**
- `slideId` (optional): Filter by slide

**Response:**
```json
[
  {
    "id": "job_456",
    "slideId": "slide_123",
    "modelId": "model_yolo_v1",
    "status": "running",
    "config": {
      "modelId": "model_yolo_v1",
      "confidenceThreshold": 0.5,
      "iouThreshold": 0.45,
      "batchSize": 16
    },
    "progress": 45.5,
    "startedAt": "2024-01-15T12:00:00Z",
    "tilesProcessed": 455,
    "totalTiles": 1000,
    "detectionCount": 1234,
    "estimatedTimeRemaining": 120
  }
]
```

#### Create Inference Job

```http
POST /inference/jobs
Content-Type: application/json
```

**Request:**
```json
{
  "slideId": "slide_123",
  "modelId": "model_yolo_v1",
  "confidenceThreshold": 0.5,
  "iouThreshold": 0.45,
  "batchSize": 16
}
```

**Response:**
```json
{
  "id": "job_456",
  "status": "queued",
  "slideId": "slide_123",
  "modelId": "model_yolo_v1",
  "config": { ... },
  "progress": 0,
  "tilesProcessed": 0,
  "totalTiles": 1000,
  "detectionCount": 0
}
```

#### Cancel Inference Job

```http
POST /inference/jobs/:jobId/cancel
```

**Response:**
```json
{
  "id": "job_456",
  "status": "cancelled"
}
```

#### Get Job Progress

```http
GET /inference/jobs/:jobId/progress
```

**Response:**
```json
{
  "jobId": "job_456",
  "progress": 67.8,
  "tilesProcessed": 678,
  "totalTiles": 1000,
  "detectionCount": 2345,
  "estimatedTimeRemaining": 45
}
```

---

### Detections API

#### Get Detections

```http
GET /slides/:slideId/detections?jobId=<jobId>
```

**Query Parameters:**
- `jobId`: Inference job ID

**Response:**
```json
[
  {
    "id": "det_001",
    "slideId": "slide_123",
    "inferenceJobId": "job_456",
    "classId": 0,
    "className": "Tumor Cell",
    "confidence": 0.87,
    "shape": "bbox",
    "bbox": {
      "x": 1000,
      "y": 2000,
      "width": 50,
      "height": 50
    },
    "tileX": 4,
    "tileY": 8,
    "level": 0
  }
]
```

#### Get Detection Statistics

```http
GET /slides/:slideId/detections/statistics?jobId=<jobId>
```

**Response:**
```json
{
  "slideId": "slide_123",
  "totalDetections": 5432,
  "byClass": {
    "0": 3000,
    "1": 2432
  },
  "averageConfidence": 0.76,
  "densityPerMm2": 125.4
}
```

#### Export Detections

```http
GET /slides/:slideId/detections/export?jobId=<jobId>&format=<json|csv>
```

**Response:** File download (JSON or CSV)

---

### Workspaces API

#### List Workspaces

```http
GET /workspaces
```

**Response:**
```json
[
  {
    "id": "ws_001",
    "name": "Breast Cancer Study",
    "description": "Analysis of 50 breast cancer samples",
    "createdAt": "2024-01-10T09:00:00Z",
    "updatedAt": "2024-01-15T14:30:00Z",
    "slideIds": ["slide_123", "slide_124", "slide_125"],
    "currentSlideId": "slide_123",
    "settings": {
      "autoSave": true,
      "autoSaveInterval": 10000,
      "defaultModel": "model_yolo_v1",
      "defaultConfidenceThreshold": 0.5,
      "visualizationDefaults": {
        "colorPalette": ["#FF6B6B", "#4ECDC4"],
        "lineWidth": 2,
        "opacity": 0.8
      }
    }
  }
]
```

#### Create Workspace

```http
POST /workspaces
Content-Type: application/json
```

**Request:**
```json
{
  "name": "New Study",
  "description": "Optional description"
}
```

**Response:** Created workspace object

#### Update Workspace

```http
PATCH /workspaces/:workspaceId
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Updated Name",
  "slideIds": ["slide_123", "slide_124"]
}
```

**Response:** Updated workspace object

#### Save Session

```http
POST /sessions
Content-Type: application/json
```

**Request:**
```json
{
  "workspaceId": "ws_001",
  "slideId": "slide_123",
  "viewerState": {
    "zoom": 2.5,
    "centerX": 50000,
    "centerY": 40000,
    "rotation": 0,
    "activeOverlays": ["detections", "rois"]
  },
  "detectionFilters": {
    "classIds": [0, 1],
    "confidenceMin": 0.5,
    "confidenceMax": 1.0
  },
  "selectedROIs": ["roi_001"]
}
```

---

### Authentication API

#### Login

```http
POST /auth/login
Content-Type: application/json
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_001",
    "email": "user@example.com",
    "name": "Dr. Jane Smith",
    "role": "pathologist",
    "permissions": ["upload_slides", "view_slides", "run_inference"]
  },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600
}
```

#### Logout

```http
POST /auth/logout
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

#### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json
```

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600
}
```

#### Get Current User

```http
GET /auth/me
```

**Response:** User object

---

## WebSocket API

### Connection

```typescript
import { io } from 'socket.io-client';

const socket = io(WS_URL, {
  auth: {
    token: jwtToken,
  },
  transports: ['websocket'],
});
```

### Events

#### Subscribe to Job Updates

```typescript
// Client → Server
socket.emit('subscribe:job', jobId);
```

#### Unsubscribe from Job Updates

```typescript
// Client → Server
socket.emit('unsubscribe:job', jobId);
```

#### Inference Progress Update

```typescript
// Server → Client
socket.on('inference:progress', (data) => {
  // {
  //   jobId: string,
  //   progress: number,
  //   tilesProcessed: number,
  //   totalTiles: number,
  //   detectionCount: number,
  //   estimatedTimeRemaining: number
  // }
});
```

#### Inference Status Change

```typescript
// Server → Client
socket.on('inference:status', (data) => {
  // {
  //   jobId: string,
  //   status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled',
  //   error?: string
  // }
});
```

#### Slide Status Change

```typescript
// Server → Client
socket.on('slide:status', (data) => {
  // {
  //   slideId: string,
  //   status: 'uploading' | 'validating' | 'ready' | 'error',
  //   error?: string
  // }
});
```

---

## Error Responses

All API errors follow this structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid confidence threshold. Must be between 0 and 1.",
    "details": {
      "field": "confidenceThreshold",
      "value": 1.5
    }
  }
}
```

### Common Error Codes

- `AUTHENTICATION_ERROR` - Invalid or expired token
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `VALIDATION_ERROR` - Invalid input data
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource conflict (e.g., duplicate)
- `INTERNAL_ERROR` - Server error

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error
- `503` - Service Unavailable

---

## Rate Limiting

```
Rate Limit: 1000 requests per hour
Headers:
  X-RateLimit-Limit: 1000
  X-RateLimit-Remaining: 987
  X-RateLimit-Reset: 1705327200
```

## Versioning

API version is included in the base URL:

```
/api/v1/slides
/api/v1/inference/jobs
```

Current version: **v1**

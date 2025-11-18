# UI Wireframe Specifications

## Design Principles

- **Clinical Focus**: Interface optimized for pathology workflows
- **Efficiency**: Minimal clicks to common actions
- **Clarity**: Clear visual hierarchy and information density
- **Accessibility**: Color-blind safe palettes, high contrast
- **Responsiveness**: Optimized for large monitors (1920×1080+)

## Color Palette

### Primary Colors
- **Primary Blue**: `#4a90e2` - Actions, links
- **Success Green**: `#27ae60` - Completed states
- **Warning Orange**: `#f39c12` - Alerts, queued states
- **Error Red**: `#e74c3c` - Errors, critical actions
- **Info Teal**: `#4ecdc4` - Information

### Neutral Colors
- **Dark Gray**: `#2c3e50` - Sidebar, headers
- **Medium Gray**: `#95a5a6` - Borders, disabled states
- **Light Gray**: `#f5f6fa` - Backgrounds
- **White**: `#ffffff` - Cards, content areas

### Detection Colors (Color-Blind Safe)
```
Standard Palette:
#FF6B6B (Red), #4ECDC4 (Teal), #45B7D1 (Blue), #FFA07A (Orange)
#98D8C8 (Mint), #F7DC6F (Yellow), #BB8FCE (Purple), #85C1E2 (Sky)

Color-Blind Safe Palette:
#0173B2 (Blue), #DE8F05 (Orange), #029E73 (Green), #CC78BC (Purple)
#CA9161 (Brown), #FBAFE4 (Pink), #949494 (Gray), #ECE133 (Yellow)
```

---

## Layout Structure

### Global Layout

```
┌─────────────────────────────────────────┐
│          Application Layout             │
├────────┬────────────────────────────────┤
│        │                                │
│  Side  │       Main Content Area        │
│  bar   │                                │
│        │                                │
│  250px │          (dynamic)             │
│        │                                │
└────────┴────────────────────────────────┘
```

### Sidebar

```
┌──────────────────┐
│   OncoWSI        │  ← Logo/Title
│   v1.0.0         │  ← Version
├──────────────────┤
│  🏠 Home         │  ← Navigation Items
│  ⬆️  Upload      │
│  ⚡ Inference    │
│  📄 Reports      │
│  📁 Workspaces   │
├──────────────────┤
│  [User Avatar]   │  ← User Info
│  Dr. Jane Smith  │
│  Pathologist     │
│                  │
│  [Logout]        │  ← Logout Button
└──────────────────┘
```

**Dimensions:**
- Width: 250px fixed
- Background: `#2c3e50`
- Text: White
- Icons: 20px size

**Navigation Items:**
- Padding: 12px 20px
- Hover state: `rgba(255,255,255,0.1)` background
- Active state: `rgba(255,255,255,0.2)` background

---

## Page Layouts

### 1. Home Page (Dashboard)

```
┌─────────────────────────────────────────────┐
│  Dashboard                                  │
│                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │  Total  │ │ Active  │ │  Total  │       │
│  │ Slides  │ │  Jobs   │ │Reports  │       │
│  │   42    │ │    3    │ │   28    │       │
│  └─────────┘ └─────────┘ └─────────┘       │
│                                             │
│  Recent Activity                            │
│  ┌─────────────────────────────────────┐   │
│  │ ⬆️  Uploaded slide_001.ndpi         │   │
│  │ ⚡ Started inference job #123       │   │
│  │ ✅ Completed report for slide_002   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Quick Actions                              │
│  [Upload New Slide] [Run Inference]        │
└─────────────────────────────────────────────┘
```

**Stats Cards:**
- Size: 150px × 120px
- Background: White
- Shadow: `0 2px 8px rgba(0,0,0,0.1)`
- Border radius: 8px

---

### 2. Slide Upload Page

```
┌─────────────────────────────────────────────┐
│                                             │
│    ┌─────────────────────────────────┐     │
│    │     Drag & Drop WSI Files       │     │
│    │                                 │     │
│    │         [Upload Icon]           │     │
│    │                                 │     │
│    │    or click to browse           │     │
│    │                                 │     │
│    │  Supported: .tiff, .ndpi, .svs  │     │
│    └─────────────────────────────────┘     │
│                                             │
│    Files (2)                                │
│    ┌─────────────────────────────────┐     │
│    │ 📄 slide_001.ndpi    [Remove]   │     │
│    │    2.5 GB                        │     │
│    │    ▓▓▓▓▓░░░░░ 45%               │     │
│    ├─────────────────────────────────┤     │
│    │ 📄 slide_002.tiff    [Remove]   │     │
│    │    3.1 GB                        │     │
│    │    Ready to upload               │     │
│    └─────────────────────────────────┘     │
│                                             │
│    [Upload 1 file(s)] [Clear All]          │
└─────────────────────────────────────────────┘
```

**Dropzone:**
- Border: 2px dashed `#ccc`
- Padding: 48px 24px
- Background: `#fafafa`
- Active state: Border color `#4a90e2`, background `#f0f7ff`

---

### 3. Slide Viewer Page

```
┌────────────────────────────────────────────────────┐
│  slide_001.ndpi                   [Toolbar]        │
├────────────────┬───────────────────────────────────┤
│                │                                   │
│   Detection    │                                   │
│   Layers       │                                   │
│   ──────       │      WSI Viewer Canvas            │
│   ☑ Tumor      │                                   │
│   ☐ Lympho     │                                   │
│   ☑ Stromal    │                                   │
│                │                                   │
│   Settings     │                                   │
│   ──────       │                                   │
│   Confidence:  │                                   │
│   [====|==] 0.5│                                   │
│                │                                   │
│   Opacity:     │                                   │
│   [======|] 0.8│                                   │
│                │                                   │
│   [ROI Tools]  │                                   │
│                │                                   │
└────────────────┴───────────────────────────────────┘
```

**Layout:**
- Left panel: 300px fixed
- Right panel: Flexible (viewer)
- Panel background: White
- Viewer background: `#1a1a1a` (dark)

**Detection Layers:**
- Checkbox + color indicator + label
- Toggle visibility per class
- Opacity slider (0-1)

---

### 4. Inference Console Page

```
┌─────────────────────────────────────────────┐
│  Biomarker Inference                        │
│                                             │
│  Model                                      │
│  [YOLOv5 Biomarker Detector v1.2.0    ▼]   │
│                                             │
│  Confidence Threshold    0.50               │
│  [═════|══════]                             │
│                                             │
│  IoU Threshold          0.45                │
│  [════|═══════]                             │
│                                             │
│  Batch Size                                 │
│  [16        ]                               │
│                                             │
│  [▶ Start Inference]                        │
│                                             │
│  ────────────────────────────────────       │
│                                             │
│  Pipeline Status                            │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ YOLOv5 v1.2.0         RUNNING       │   │
│  │ ▓▓▓▓▓▓░░░░░░░ 45%                   │   │
│  │ Tiles: 455/1000  |  Detections: 1234│   │
│  │ ETA: 2m 15s                          │   │
│  │                         [Cancel]     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ DETR v2.0.1           COMPLETED     │   │
│  │ Total Detections: 3456               │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Job Cards:**
- Background: `#fafafa`
- Border: 1px solid `#e0e0e0`
- Border radius: 6px
- Padding: 16px
- Status color-coded (see color palette)

---

### 5. Report Generation Page

```
┌─────────────────────────────────────────────┐
│  Report Generation                          │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Slide Information                   │   │
│  │ Slide: patient_001_scan.ndpi        │   │
│  │ Patient ID: P001234                 │   │
│  │ Generated: Jan 15, 2024 10:30 AM    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Summary                             │   │
│  │ ┌──────┐ ┌──────┐ ┌──────┐         │   │
│  │ │ 5432 │ │  3   │ │ 76%  │         │   │
│  │ │Detect│ │Class │ │Conf. │         │   │
│  │ └──────┘ └──────┘ └──────┘         │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Biomarker Frequency                 │   │
│  │ ┏━━━━━━━━━┳━━━━━┳━━━━━┳━━━━━━┓    │   │
│  │ ┃Biomarker┃Count┃  %  ┃Conf. ┃    │   │
│  │ ┣━━━━━━━━━╋━━━━━╋━━━━━╋━━━━━━┫    │   │
│  │ ┃ Tumor   ┃ 3000┃ 55% ┃ 87%  ┃    │   │
│  │ ┃Lymphocyte┃2432┃ 45% ┃ 72%  ┃    │   │
│  │ ┗━━━━━━━━━┻━━━━━┻━━━━━┻━━━━━━┛    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Export Options                             │
│  Format: ○ PDF  ○ JSON                     │
│  ☑ Anonymize (HIPAA compliance)            │
│  ☑ Include Heatmap                         │
│  ☑ Include ROI Analysis                    │
│                                             │
│  [⬇ Export PDF]                            │
└─────────────────────────────────────────────┘
```

**Stat Cards (in Summary):**
- Display: Inline-flex
- Background: `#f8f9fa`
- Padding: 16px
- Border radius: 8px
- Value: 28px bold, color `#4a90e2`
- Label: 12px, color `#666`

---

### 6. Login Page

```
┌─────────────────────────────────────────────┐
│                                             │
│          [Gradient Background]              │
│                                             │
│       ┌─────────────────────┐               │
│       │                     │               │
│       │    OncoWSI Vision   │               │
│       │  Pathology-grade WSI│               │
│       │                     │               │
│       │  📧 Email           │               │
│       │  [             ]    │               │
│       │                     │               │
│       │  🔒 Password        │               │
│       │  [             ]    │               │
│       │                     │               │
│       │  [Sign In]          │               │
│       │                     │               │
│       │  HIPAA-compliant    │               │
│       │  secure access      │               │
│       └─────────────────────┘               │
│                                             │
└─────────────────────────────────────────────┘
```

**Login Card:**
- Width: 400px max
- Background: White
- Shadow: `0 10px 40px rgba(0,0,0,0.2)`
- Border radius: 12px
- Padding: 40px
- Centered on page

**Background:**
- Gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

---

## Component Specifications

### Buttons

**Primary Button:**
```css
background: #667eea;
color: white;
padding: 10px 20px;
border-radius: 6px;
font-size: 14px;
font-weight: 500;
```

**Secondary Button:**
```css
background: #f0f0f0;
color: #333;
padding: 10px 20px;
border-radius: 6px;
```

**Danger Button:**
```css
background: #e74c3c;
color: white;
padding: 10px 20px;
border-radius: 6px;
```

### Form Controls

**Input Field:**
```css
width: 100%;
padding: 12px;
border: 1px solid #ddd;
border-radius: 6px;
font-size: 14px;

/* Focus state */
border-color: #667eea;
box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
```

**Range Slider:**
```css
width: 100%;
height: 6px;
background: #e0e0e0;
border-radius: 3px;

/* Thumb */
width: 16px;
height: 16px;
background: #667eea;
border-radius: 50%;
```

### Cards

**Standard Card:**
```css
background: white;
border: 1px solid #e0e0e0;
border-radius: 8px;
padding: 16px;
box-shadow: 0 2px 8px rgba(0,0,0,0.1);
```

### Progress Bars

**Linear Progress:**
```css
height: 6px;
background: #e0e0e0;
border-radius: 3px;
overflow: hidden;

/* Fill */
background: #4a90e2;
transition: width 0.3s ease;
```

---

## Responsive Breakpoints

```
Desktop Large:  ≥1920px (Primary target)
Desktop:        ≥1280px
Tablet:         ≥768px (Not primary focus)
Mobile:         <768px (Not supported)
```

**Note:** OncoWSI Vision is optimized for large desktop monitors used in pathology labs.

---

## Accessibility

### Color Contrast
- All text meets WCAG AA standards (4.5:1 minimum)
- Interactive elements have 3:1 minimum contrast

### Keyboard Navigation
- All interactive elements accessible via Tab
- Modal traps focus
- Escape key closes modals/dropdowns

### Screen Readers
- Semantic HTML (nav, main, aside, section)
- ARIA labels for icon buttons
- Live regions for dynamic updates

---

## Animation Timing

```
Fast:    150ms - Hover states, toggles
Medium:  300ms - Transitions, fades
Slow:    500ms - Viewer animations, page transitions
```

**Easing:**
- Standard: `ease-in-out`
- Elastic: `cubic-bezier(0.68, -0.55, 0.265, 1.55)`

---

## Icons

**Library:** React Icons (Feather Icons set)
**Size:** 20px default, 24px for primary actions
**Color:** Inherit from parent

**Common Icons:**
- FiHome - Home
- FiUpload - Upload
- FiActivity - Inference
- FiFileText - Reports
- FiFolderOpen - Workspaces
- FiUser - User profile
- FiLogOut - Logout
- FiPlay - Start
- FiX - Cancel/Close
- FiDownload - Export

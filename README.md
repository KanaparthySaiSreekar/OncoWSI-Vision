# OncoWSI-Vision

> Pathology-grade whole-slide image (WSI) biomarker detection system

## Overview

OncoWSI Vision is a comprehensive platform for clinical pathologists, research analysts, and ML engineers to analyze whole-slide pathology images using AI-powered biomarker detection. The system combines high-resolution WSI viewing, real-time inference management, interactive visualization, and automated reporting capabilities.

## Project Structure

```
OncoWSI-Vision/
├── frontend/          # React + TypeScript frontend application
├── docs/              # Comprehensive documentation
│   ├── ARCHITECTURE.md     # Frontend architecture details
│   ├── API_SPEC.md         # API interaction specifications
│   ├── COMPONENT_CONTRACTS.md  # Component interfaces
│   └── WIREFRAMES.md       # UI specifications
└── README.md          # This file
```

## Quick Start

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

See `frontend/README.md` for detailed instructions.

## Key Features

- **High-Resolution WSI Viewer**: OpenSeadragon-based pyramidal TIFF/NDPI support
- **AI Inference Console**: Real-time biomarker detection with YOLOv5/DETR models
- **Interactive Visualization**: Adjustable overlays with color-blind safe palettes
- **Region Analysis**: ROI selection with statistical analysis
- **Report Generation**: Automated PDF/JSON export with HIPAA compliance
- **Role-Based Access**: Pathologist, Researcher, Engineer, and Admin roles

## Tech Stack

- **Frontend**: React 18, TypeScript, Redux Toolkit, OpenSeadragon
- **State Management**: Redux Toolkit, React Query
- **Real-time**: Socket.io for WebSocket communication
- **Build Tool**: Vite for fast development and optimized builds

## Documentation

- [Frontend README](frontend/README.md) - Frontend setup and usage
- [Architecture](docs/ARCHITECTURE.md) - System architecture details
- [API Specification](docs/API_SPEC.md) - API contracts and endpoints
- [Component Contracts](docs/COMPONENT_CONTRACTS.md) - Component interfaces
- [UI Wireframes](docs/WIREFRAMES.md) - UI design specifications

## Security & Compliance

- HIPAA-aligned data handling
- Encrypted HTTPS/WSS transport
- JWT token-based authentication
- Role-based access control (RBAC)
- Comprehensive audit logging
- Optional data anonymization

## Performance Targets

- Tile load times: <150ms
- Viewer FPS at 40× magnification: 60 FPS
- Autosave interval: 10 seconds
- Session timeout: 1 hour

## License

Proprietary - OncoWSI Vision

## Support

For technical support and questions, contact: tech@oncowsi.com
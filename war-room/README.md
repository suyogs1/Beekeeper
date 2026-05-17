# 🐝 Bee-Keeper War Room

Enterprise Incident Response Command Center for IBM Bob Hackathon

## Overview

The Bee-Keeper War Room is a cinematic, single-page React application that visualizes the complete forensic analysis workflow for mainframe incidents. Built for the IBM Bob Hackathon, it provides an enterprise-grade operations center aesthetic optimized for demo presentations.

## Features

### Left Panel - Incident Metadata
- ABEND code and offset
- Job and module names
- Confidence score
- Forensic details (failure point, risks, JCL issues)

### Center Panel - Visual Intelligence
- **Mermaid dependency diagrams** showing:
  - Upstream dependencies
  - Failed job (highlighted)
  - Downstream enterprise impact
- **Enterprise impact table** with:
  - Affected systems
  - Status indicators (BLOCKED/DELAYED)
  - Business impact descriptions

### Right Panel - Analysis & Remediation
- Root cause analysis
- Contributing factors
- Prioritized remediation checklist
- Review checkpoint status

### Bottom Panel - Workflow Timeline
- 7-phase forensic workflow progression
- Timestamps for each phase
- Visual completion indicators

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Mermaid** - Diagram rendering

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Design Philosophy

### Enterprise Aesthetic
- Dark operations-center theme
- Monospace fonts for technical data
- Color-coded severity indicators
- Subtle fade-in animations

### Demo Optimization
- Single-page application (no routing)
- Mocked forensic data from real Bee-Keeper outputs
- Optimized for screen recording
- Cinematic visual storytelling

### Color Palette
- **Background**: `#0a0e1a` (deep navy)
- **Panels**: `#111827` (dark gray)
- **Accent**: `#3b82f6` (blue)
- **Critical**: `#ef4444` (red)
- **Warning**: `#f59e0b` (amber)
- **Success**: `#10b981` (green)

## Mocked Data

The application uses real forensic data from Bee-Keeper's RCA workflow:
- Incident: `INC-S0C7-2026-05-15T18-55-04`
- ABEND: S0C7 at offset X'B4'
- Job: PAYRL001
- Module: TAXCALC
- Confidence: 73%
- Severity: CRITICAL

## Project Structure

```
war-room/
├── src/
│   ├── data/
│   │   └── mockIncident.js    # Forensic data
│   ├── App.jsx                # Main War Room component
│   ├── main.jsx               # React entry point
│   └── index.css              # Tailwind styles
├── public/
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Hackathon Notes

- **No authentication** - Demo-focused
- **No backend** - Fully client-side
- **No routing** - Single operational screen
- **Lightweight state** - No Redux/Zustand needed
- **Mermaid-first** - Visual storytelling priority

## Demo Tips

1. **Full screen** the browser for maximum impact
2. **Dark mode** environment for best contrast
3. **Zoom to 100%** for optimal layout
4. **Highlight** the Mermaid diagram during presentation
5. **Emphasize** the enterprise impact table

## Future Enhancements (Post-Hackathon)

- Live WebSocket connection to Bee-Keeper MCP server
- Real-time workflow progression
- Historical incident comparison
- Interactive diagram exploration
- Export RCA reports to PDF

---

Built with ❤️ for IBM Bob Hackathon
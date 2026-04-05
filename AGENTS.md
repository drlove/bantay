# model-cards

A Progressive Web App (PWA) for creating, viewing, and managing Model Card disclosures for AI projects. Based on the framework from Mitchell et al.'s 2018 paper "Model Cards for Model Reporting."

## Overview

This project is a lightweight PWA that allows AI practitioners to document their models using the standardized Model Card format, featuring:
- Create and edit Model Cards with guided sections
- View and browse existing Model Cards
- Export cards as JSON or printable format
- Offline functionality via Service Workers
- Web App Manifest for installability
- Responsive design with app-like user experience

## Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Styling with CSS variables, flexbox, grid, and media queries
- **Vanilla JavaScript (ES6+)** - No frameworks or build tools
- **Service Worker API** - Offline caching and background sync
- **Web App Manifest** - Installable PWA metadata
- **LocalStorage/IndexedDB** - Local data persistence

## Project Structure

```
model-cards/
├── index.html              # Main HTML entry point
├── viewer.html             # Model Card viewer page
├── styles/
│   └── main.css            # Global styles
├── scripts/
│   ├── app.js              # Main application logic (create/edit)
│   ├── viewer.js           # Viewer functionality
│   ├── sw.js               # Service Worker
│   └── storage.js          # LocalStorage/IndexedDB utilities
├── manifest.json            # PWA manifest
├── assets/
│   ├── icons/              # PWA icons (192x192, 512x512)
│   └── images/             # Static images
└── AGENTS.md               # This file
```

## Model Card Structure

Based on Mitchell et al. (2019), each Model Card contains the following sections:

### 1. Model Details
- Person or organization developing model
- Model date
- Model version
- Model type
- Training algorithms, parameters, fairness constraints
- Paper or resource link
- Citation details
- License
- Contact information

### 2. Intended Use
- Primary intended uses
- Primary intended users
- Out-of-scope use cases

### 3. Factors
- Relevant factors (demographic, phenotypic, environmental, technical)
- Evaluation factors

### 4. Metrics
- Model performance measures
- Decision thresholds
- Approaches to uncertainty and variability

### 5. Evaluation Data
- Datasets used for evaluation
- Motivation for dataset selection
- Preprocessing steps

### 6. Training Data
- Overview of training data sources and composition

### 7. Quantitative Analyses
- Unitary results (disaggregated by factors)
- Intersectional results

### 8. Ethical Considerations
- Data concerns
- Human life considerations
- Mitigations applied
- Risks and harms identified
- Use cases review

### 9. Caveats and Recommendations
- Additional concerns not covered above
- Recommendations for future work

## UI Design

### Layout
- Clean, professional interface suitable for documentation
- Form-based input for creating Model Cards
- Card grid/list view for browsing existing cards
- Detailed view for reading Model Cards

### Main Page (index.html)
- Create new Model Card button
- List of existing Model Cards with search/filter
- Quick actions (edit, view, delete, export)

### Viewer Page (viewer.html)
- Full Model Card display with all sections
- Print-friendly layout
- Export options (JSON, PDF-ready)

## Core Conventions

1. **HTML**: Use semantic HTML5 elements. Link manifest and service worker in `<head>`.
2. **CSS**:
   - Use CSS custom properties (variables) for theming
   - Mobile-first responsive design
   - No preprocessors (pure CSS)
   - Print styles for Model Card export
3. **JavaScript**:
   - Register service worker in app.js
   - Handle PWA install prompt
   - Progressive enhancement approach
   - Modular structure with separate files for concerns
4. **Service Worker**:
   - Self-contained in sw.js
   - Use cache versioning for updates
   - Implement appropriate caching strategies
5. **Data Storage**:
   - Model Cards stored in IndexedDB for structured data
   - Export/import via JSON format
   - Each card has unique ID and timestamp

## Features

### Create Mode
- Guided form with all Model Card sections
- Auto-save drafts to LocalStorage
- Validation for required fields
- Preview before saving

### View Mode
- Read-only display of Model Cards
- Section-based navigation
- Collapsible/expandable sections

### Management
- List view with search and filter
- Sort by date, name, or model type
- Delete with confirmation
- Duplicate existing cards as templates

### Export
- Export as JSON (full data)
- Print-optimized CSS layout
- Share via Web Share API (if available)

### Offline Support
- Full functionality without network
- Service Worker caches all assets
- IndexedDB provides offline data access

## Browser Support

Modern browsers with Service Worker, Manifest, and IndexedDB support:
- Chrome/Edge 90+ (best support)
- Safari 14+ (partial support)
- Firefox 90+ (limited support)

## Development Commands

No build tools required. For local development:
- Serve with any static server: `npx serve` or `python -m http.server`
- Test service worker in browser DevTools Application tab

## References

Mitchell, Margaret, Simone Wu, Andrew Zaldivar, Parker Barnes, Lucy Vasserman, Ben Hutchinson, Elena Spitzer, Inioluwa Deborah Raji, and Timnit Gebru. 2019. "Model Cards for Model Reporting." In *Proceedings of the Conference on Fairness, Accountability, and Transparency*, 220-29. FAT* '19. New York, NY, USA: Association for Computing Machinery. https://doi.org/10.1145/3287560.3287596

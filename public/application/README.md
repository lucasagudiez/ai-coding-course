# Application Form - Directory Structure

## Overview

The application form is now properly organized in its own directory: `/public/application/`

This separates it from the main index page and makes it easier to maintain and extend.

## Directory Structure

```
public/
├── index.html              # Main landing page
├── styles.css              # Main site styles
├── js/
│   └── app.js             # Main site JavaScript
│
└── application/            # ← APPLICATION FORM (SEPARATE)
    ├── index.html          # Application form HTML
    ├── css/
    │   └── styles.css      # Application-specific styles
    ├── js/
    │   └── app.js          # Application-specific JavaScript
    └── templates/          # HTML template components
        ├── header.html
        ├── social-proof.html
        └── progress.html

tests/
├── ux.spec.js                           # Main site tests
├── application.spec.js                   # Application basic tests
└── application-comprehensive.spec.js     # Application full tests
```

## URLs

- **Main Site**: `http://localhost:8888/` or `https://adavauniversity.org/`
- **Application Form**: `http://localhost:8888/application/` or `https://adavauniversity.org/application/`

## File Responsibilities

### Main Site (`/public/`)
- Landing page with cohort selection
- Form submission redirects to `/application/`
- Uses `js/app.js` and `styles.css`

### Application Form (`/public/application/`)
- Full application form (36 conversion strategies)
- Receives parameters: `?cohort=X&name=Y&email=Z`
- Uses `application/js/app.js` and `application/css/styles.css`

## Template System (Future)

The `templates/` directory is prepared for modular HTML components.
Currently stored as standalone HTML files that can be loaded via JavaScript.

## Testing

All tests updated to use correct paths:
- `http://localhost:8888/application/` (not `.html`)
- Works with directory-based routing

## Deployment

Nginx serves both:
- `/` → `public/index.html`
- `/application/` → `public/application/index.html`

The structure is production-ready.

# Codebase Reorganization Plan

## Current Issues:
1. **22+ planning docs scattered in root** - Hard to find anything
2. **Duplicate/old files in public/** - application.html, application-old.html, etc.
3. **Empty/unused directories** - public/components/application/, public/sections/
4. **CSS files scattered** - Some in public/css/, some in subdirs
5. **No clear structure** - Mixing planning docs with code
6. **api_keys.yaml in root** - Should never be committed
7. **Python script in root** - Should be in scripts/

## New Structure:

```
adavauniversity.org/
├── .cursorrules                    # Cursor-specific rules
├── .gitignore
├── README.md                       # Main project README
├── package.json
├── playwright.config.js
│
├── docs/                           # ALL documentation
│   ├── planning/                   # Planning & strategy docs
│   │   ├── conversion/            # Conversion optimization plans
│   │   ├── funnel/                # Funnel architecture
│   │   ├── implementation/        # Implementation plans
│   │   └── state-management/      # State management docs
│   ├── reports/                   # Session summaries & reports
│   ├── reference/                 # Reference documentation
│   ├── testing/                   # Testing documentation
│   └── archive/                   # Old/deprecated docs
│
├── public/                         # Web root - ONLY production files
│   ├── index.html                 # Landing page
│   ├── legal.html                 # Legal page
│   ├── styles.css                 # Main styles
│   │
│   ├── css/                       # All stylesheets
│   │   ├── aos.css
│   │   ├── application.css
│   │   ├── evaluation.css
│   │   └── reservation.css
│   │
│   ├── js/                        # All JavaScript
│   │   ├── app.js                # Landing page logic
│   │   ├── state-manager.js      # State management utility
│   │   ├── component-loader.js   # Component loading utility
│   │   ├── application.js        # Application form logic
│   │   ├── evaluation.js         # Evaluation page logic
│   │   ├── reservation.js        # Reservation page logic
│   │   ├── aos.js               # External library
│   │   ├── gsap.min.js          # External library
│   │   ├── ScrollTrigger.min.js # External library
│   │   └── vanilla-tilt.min.js  # External library
│   │
│   ├── application/               # Application form page
│   │   └── index.html
│   ├── evaluation/                # Evaluation page
│   │   └── index.html
│   ├── reservation/               # Reservation page
│   │   └── index.html
│   │
│   ├── components/                # Reusable HTML components
│   │   └── shared/
│   │       ├── bonus-stack.html
│   │       ├── comparison-table.html
│   │       ├── outcomes.html
│   │       ├── pain-points.html
│   │       ├── stats-banner.html
│   │       ├── testimonials.html
│   │       └── value-stack.html
│   │
│   ├── fonts/                     # Web fonts
│   └── images/                    # All images
│
├── server/                         # Backend server
│   ├── app.js                     # Express server
│   ├── package.json
│   ├── nginx-config.conf
│   └── README.md
│
├── scripts/                        # Build/deploy scripts
│   ├── test-runner.js
│   ├── deploy.sh
│   ├── server-deploy.sh
│   └── update-application-form.py
│
├── tests/                          # Automated tests
│   ├── *.spec.js                  # Playwright tests
│   └── README.md
│
├── data/                           # Data storage (gitignored)
│   ├── submissions.csv
│   ├── applications.csv
│   └── sessions/
│
└── archive/                        # Deprecated files
    ├── old-assets/
    └── old-code/
```

## Actions to Take:

### 1. Organize Documentation
- Move all planning docs to `docs/planning/`
- Organize by category (conversion, funnel, implementation, state-management)
- Move session summaries to `docs/reports/`

### 2. Clean Up public/
- Delete duplicate/old files (application-old.html, application-new.html, backups)
- Remove empty directories
- Consolidate all CSS to public/css/
- Consolidate all JS to public/js/

### 3. Move Scripts
- Move all .sh and .py files to scripts/
- Update references in deployment docs

### 4. Remove Sensitive Files
- Delete api_keys.yaml (already in .env)
- Ensure .gitignore covers it

### 5. Update Imports
- Fix any broken CSS/JS imports after reorganization
- Update HTML file references

## Files to Delete:
- public/application-new.html
- public/application-old.html
- public/application.html.backup
- public/components/application/ (empty)
- public/components/index/ (empty)
- public/sections/ (empty)
- public/css/application/ (empty)
- public/js/application/ (empty)
- api_keys.yaml
- update-application-form.py (move to scripts/)

## Files to Move:
See detailed actions above.

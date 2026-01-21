# Adava University - Codebase Structure

## 📁 Directory Structure

```
adavauniversity.org/
├── 📄 README.md                    # This file
├── 📄 package.json                 # Node.js dependencies
├── 📄 playwright.config.js         # Playwright test config
├── 📄 .cursorrules                 # Cursor AI rules
├── 📄 .gitignore
│
├── 📂 public/                      # Web root - served by nginx/python server
│   ├── index.html                  # Landing page
│   ├── legal.html                  # Legal/terms page
│   ├── styles.css                  # Main landing page styles
│   │
│   ├── 📂 application/             # Application form
│   │   └── index.html
│   ├── 📂 evaluation/              # Evaluation page (LLM powered)
│   │   └── index.html
│   ├── 📂 reservation/             # Final reservation/payment
│   │   └── index.html
│   │
│   ├── 📂 css/                     # All stylesheets
│   │   ├── aos.css                 # Animation library styles
│   │   ├── application.css         # Application form styles
│   │   ├── evaluation.css          # Evaluation page styles
│   │   └── reservation.css         # Reservation page styles
│   │
│   ├── 📂 js/                      # All JavaScript
│   │   ├── app.js                  # Landing page logic
│   │   ├── application.js          # Application form logic
│   │   ├── evaluation.js           # Evaluation page logic
│   │   ├── reservation.js          # Reservation page logic
│   │   ├── state-manager.js        # State management utility
│   │   ├── component-loader.js     # Component loading utility
│   │   ├── aos.js                  # Scroll animations
│   │   ├── gsap.min.js             # Animation library
│   │   ├── ScrollTrigger.min.js    # Scroll triggers
│   │   └── vanilla-tilt.min.js     # 3D tilt effects
│   │
│   ├── 📂 components/              # Reusable HTML components
│   │   └── shared/
│   │       ├── bonus-stack.html
│   │       ├── comparison-table.html
│   │       ├── outcomes.html
│   │       ├── pain-points.html
│   │       ├── stats-banner.html
│   │       ├── testimonials.html
│   │       └── value-stack.html
│   │
│   ├── 📂 fonts/                   # Web fonts (DM Sans, Inter)
│   │   ├── fonts.css
│   │   └── *.ttf files
│   │
│   └── 📂 images/                  # All images
│       ├── adava-icon.svg          # Logo
│       ├── favicon.svg/png
│       ├── avatars/                # User avatars
│       ├── backgrounds/            # Background images
│       ├── certificates/           # Certificate images
│       ├── instructors/            # Instructor photos
│       └── posters/                # Project posters
│
├── 📂 server/                      # Backend Node.js server
│   ├── app.js                      # Express server
│   ├── package.json                # Server dependencies
│   ├── nginx-config.conf           # Nginx configuration
│   └── README.md                   # Server documentation
│
├── 📂 scripts/                     # Build & deployment scripts
│   ├── test-runner.js              # Unit test runner
│   ├── deploy.sh                   # Deployment script
│   ├── server-deploy.sh            # Server deployment
│   └── update-application-form.py  # Form update script
│
├── 📂 tests/                       # Automated tests (Playwright)
│   ├── *.spec.js                   # Test files
│   └── README.md                   # Testing documentation
│
├── 📂 data/                        # Data storage (gitignored)
│   ├── submissions.csv             # Form submissions
│   ├── applications.csv            # Application data
│   └── sessions/                   # User session data
│       └── *.json
│
├── 📂 docs/                        # ALL documentation
│   ├── DEPLOY-PROCESS.md
│   ├── DEPLOYMENT-STRUCTURE.md
│   ├── RESPONSIVE-DESIGN-COMPLETE.md
│   ├── UI-QUALITY-TESTS.md
│   │
│   ├── 📂 planning/                # Planning & strategy docs
│   │   ├── conversion/             # Conversion optimization
│   │   │   ├── CONVERSION-RESEARCH.md
│   │   │   ├── COMPLETE-CONVERSION-AUDIT.md
│   │   │   ├── STRATEGY-STATUS.md
│   │   │   ├── APPLICATION-ENHANCEMENT-PLAN.md
│   │   │   ├── APPLICATION-FORM-PROFESSIONAL-CHANGES.md
│   │   │   ├── PRESTIGIOUS-APPLICATION-PLAN.md
│   │   │   ├── FINAL-PROFESSIONAL-PLAN.md
│   │   │   └── MISSING-IMPLEMENTATION-PLAN.md
│   │   │
│   │   ├── funnel/                 # Funnel architecture
│   │   │   ├── FUNNEL-ARCHITECTURE.md
│   │   │   └── FUNNEL-OPTIMIZATION-PLAN.md
│   │   │
│   │   ├── implementation/         # Implementation plans
│   │   │   ├── IMPLEMENTATION-PRIORITY-PLAN.md
│   │   │   ├── IMPLEMENTATION-SUMMARY.md
│   │   │   ├── CONTENT-REORGANIZATION-PLAN.md
│   │   │   ├── COMPONENT-SYSTEM.md
│   │   │   └── MODULAR-SYSTEM-SUMMARY.md
│   │   │
│   │   └── state-management/       # State management
│   │       ├── STATE-MANAGEMENT-STATUS.md
│   │       ├── STATE-MANAGEMENT-INTEGRATION-FINAL.md
│   │       ├── STATE-MANAGEMENT-TEST-RESULTS.md
│   │       └── LLM-PERSONALIZATION.md
│   │
│   ├── 📂 reports/                 # Session summaries
│   │   └── SESSION-SUMMARY-JAN-21.md
│   │
│   ├── 📂 reference/               # Reference docs
│   ├── 📂 testing/                 # Testing docs
│   └── 📂 archive/                 # Old/deprecated docs
│
└── 📂 archive/                     # Deprecated files
    ├── old-assets/
    └── old-code/
```

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server (Python HTTP server)
npm run serve
# Opens http://localhost:8888

# Start backend server (for forms)
cd server && npm install && npm start
# Runs on http://localhost:3001
```

### Running Tests

```bash
# Unit tests (fast, ~1s)
npm test

# UX smoke tests (fast, ~3s)
npm run test:ux:smoke

# Full test suite (comprehensive, ~15s)
npm run test:full

# Application styling tests
npx playwright test tests/application-styling.spec.js
```

### Deployment

```bash
# Deploy to production
./scripts/deploy.sh

# Deploy backend server
./scripts/server-deploy.sh
```

## 📝 Key Files

| File | Purpose |
|------|---------|
| `public/index.html` | Landing page |
| `public/styles.css` | Main landing page styles |
| `public/js/app.js` | Landing page logic |
| `public/js/state-manager.js` | State management utility |
| `public/application/index.html` | Application form |
| `public/evaluation/index.html` | Evaluation page (LLM powered) |
| `public/reservation/index.html` | Final payment page |
| `server/app.js` | Backend Express server |
| `scripts/deploy.sh` | Deployment script |
| `tests/*.spec.js` | Automated tests |

## 🎨 Architecture

### Funnel Flow
1. **Landing Page** (`index.html`) → User fills name/email
2. **Application Form** (`application/`) → Detailed application
3. **Evaluation** (`evaluation/`) → LLM-powered personalization
4. **Reservation** (`reservation/`) → Final payment

### State Management
- **StateManager** (`js/state-manager.js`) handles all state
- Automatically merges: URL params > Server > LocalStorage
- Generic `Object.assign()` - no manual field mapping
- Auto-saves to server every 1s (debounced)

### Styling
- No media queries/breakpoints for main responsive design
- Fluid CSS with `clamp()`, `minmax()`, flexbox, grid
- Custom properties for colors (purple/magenta, teal/green)
- Glassmorphism effects with backdrop-filter
- All animations with GSAP/AOS/Vanilla Tilt

## 🧪 Testing Philosophy

1. **Unit tests** (91 tests) - Static analysis, file structure, content
2. **UX tests** (40+ tests) - Browser automation, user interactions
3. **Styling tests** (15 tests) - Padding, margins, contrast, mobile
4. **Git hooks** - Pre-commit runs unit tests automatically

## 📚 Documentation

All documentation is in `docs/`:
- **Planning docs** → `docs/planning/` (conversion, funnel, implementation, state-management)
- **Reports** → `docs/reports/`
- **Reference** → `docs/reference/`
- **Testing** → `docs/testing/`

## 🔒 Security

- `.env` for sensitive data (not in git)
- `data/` directory gitignored
- Nginx blocks access to `/data/`, `.env`, sensitive files
- Server-side session storage with email-based indexing

## 🎯 Recent Changes

See `docs/reports/SESSION-SUMMARY-JAN-21.md` for latest updates.

---

**Questions?** Check `docs/` or run `npm test` to verify everything works.

# Adava University Website

**10-day programming bootcamp using AI tools**  
Live at: [https://adavauniversity.org](https://adavauniversity.org)

---

## 📁 Project Structure

```
/
├── public/                 # 🌐 SERVED FILES (production)
│   ├── index.html          # Main landing page
│   ├── legal.html          # Privacy & Terms
│   ├── styles.css          # Global styles
│   ├── css/                # External CSS libraries (AOS)
│   ├── js/                 # JavaScript (Vue app, animations)
│   ├── fonts/              # Custom fonts (DM Sans, Inter)
│   └── images/             # All images, icons, favicons
│
├── server/                 # 🔧 BACKEND (Node.js API)
│   ├── app.js              # Express server
│   ├── package.json        # Backend dependencies
│   └── nginx-config.conf   # Reverse proxy config
│
├── docs/                   # 📚 DOCUMENTATION
│   ├── reports/            # Bug reports, summaries
│   ├── features/           # Feature documentation
│   ├── testing/            # Test documentation
│   └── reference/          # Reference docs, lessons learned
│
├── tests/                  # 🧪 PLAYWRIGHT UX TESTS
├── scripts/                # 🛠️ HELPER SCRIPTS (test-runner)
├── data/                   # 💾 CSV DATA STORAGE
├── archive/                # 📦 OLD/UNUSED ASSETS
│
├── package.json            # Dependencies & scripts
├── playwright.config.js    # Test configuration
├── deploy.sh               # Production deployment
└── server-deploy.sh        # Backend deployment
```

---

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start local server (serves public/ directory)
python3 -m http-server public -p 8888
# OR
npx http-server public -p 8888

# Start backend (separate terminal)
cd server && npm install && npm start

# Run tests
npm test
```

### Deployment

```bash
# Deploy frontend (commits, tests, deploys to production)
./deploy.sh

# Deploy backend (updates server, restarts systemd service)
./server-deploy.sh
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run fast UX tests only
npm run test:fast

# Run specific test file
npx playwright test tests/scholarship.spec.js
```

---

## 🛠️ Tech Stack

**Frontend:**
- HTML5, CSS3 (custom + AOS animations)
- Vue.js 3 (CDN-based, no build tools)
- GSAP + ScrollTrigger (parallax, animations)
- Vanilla Tilt (card effects)

**Backend:**
- Node.js + Express
- CSV data storage
- Nginx reverse proxy
- Systemd service

**Testing:**
- Playwright (UX tests)
- Custom test runner (scripts/test-runner.js)

---

## 📋 Key Features

- ✅ Responsive design (mobile-first)
- ✅ Vue.js form handling with validation
- ✅ Toast notifications (no alerts)
- ✅ Scholarship code validation
- ✅ Animated statistics counters
- ✅ Rotating text effects
- ✅ Background particle animation
- ✅ Form submission to backend API
- ✅ 100% client-side rendering (no SSR)

---

## 📚 Documentation

All reports, feature docs, and references are in `docs/`:

- **Bug Reports:** `docs/reports/`
- **Feature Docs:** `docs/features/`
- **Testing Guides:** `docs/testing/`
- **Reference:** `docs/reference/`

For deployment issues and lessons learned, see `docs/reference/LESSONS-LEARNED-DEBUGGING.md`.

---

## 🔒 Security

- Input validation (name, email)
- XSS prevention (sanitization)
- CSRF protection
- Rate limiting (backend)
- No SQL (CSV-based storage)

---

## 📞 Contact

**Email:** adavauniversity@gmail.com  
**Website:** https://adavauniversity.org

---

## 📄 License

© Copyright Adava University 2025-2026

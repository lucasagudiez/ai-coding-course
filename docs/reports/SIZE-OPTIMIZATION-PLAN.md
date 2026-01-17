# Repository Size Optimization Plan

**Date:** 2026-01-17  
**Current Total Size:** ~37MB  
**Served to Users:** 2.9MB  
**Target:** <1MB served, <10MB repo

---

## Current Breakdown

```
 17M  node_modules/        (dev dependencies)
5.8M  test-results/        (screenshots - SHOULD NOT BE IN GIT)
5.8M  server/node_modules/ (backend deps)
5.6M  archive/             (old assets - SHOULD NOT BE IN GIT)
2.9M  public/              (actual website)
```

### Public/ Breakdown (What Users Download)
```
2.1M  fonts/               (10 font files)
496K  images/              (instructors, avatars, logos)
156K  js/                  (GSAP, AOS, Vue, Tilt)
112K  index.html
 76K  styles.css
 28K  css/aos.css
  8K  legal.html
```

---

## Optimizations Implemented ✅

### 1. Git Ignore Large Files ✅
- Added `test-results/` to .gitignore (5.8MB saved from future commits)
- Added `archive/` to .gitignore (5.6MB saved from future commits)
- These files stay local but won't be tracked in git

### 2. Remove Unused Font Weight ✅
- Deleted `inter-900.ttf` (320KB saved)
- Not used anywhere in styles.css

---

## Optimizations To Implement

### 3. Switch to Google Fonts CDN 🎯 HIGH IMPACT
**Savings:** 2.1MB → 0 bytes (fonts loaded from CDN)  
**Trade-off:** Requires external request (but cached globally)

**Implementation:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

Delete local font files:
```bash
rm -rf public/fonts/
```

### 4. Optimize Instructor Images 🎯 HIGH IMPACT
**Savings:** 340KB → ~100KB (70% reduction)

Current sizes:
- abhishek.png: 80KB
- chase.png: 86KB
- nishit.png: 82KB
- varun.png: 19KB
- wilfried.png: 16KB

**Actions:**
1. Convert PNG to optimized JPG (PNGs are too large for photos)
2. Resize to actual display size (likely 200x200px max)
3. Compress with quality 85%

### 5. Minify JavaScript Libraries 🎯 MEDIUM IMPACT
**Savings:** 156KB → ~50KB (68% reduction)

Current:
- GSAP: ~40KB
- AOS: ~30KB  
- Vue: ~60KB
- Vanilla Tilt: ~26KB

**Actions:**
1. Use CDN minified versions (already cached by users)
2. Remove unused libraries if possible

### 6. Optimize Other Images 🎯 LOW IMPACT
**Savings:** ~50KB

- Compress logo PNGs
- Convert unnecessary PNGs to SVG where possible

---

## Expected Final Sizes

**After all optimizations:**
```
PUBLIC/ (SERVED TO USERS):
~800KB total (down from 2.9MB = 72% reduction)

- 0KB    fonts (CDN)
- 400KB  images (optimized)
- 50KB   js (CDN minified)
- 112KB  index.html
- 76KB   styles.css
- 28KB   css/aos.css
- 8KB    legal.html
```

**Repository (on disk):**
```
~7MB total (down from 37MB = 81% reduction)

- 17M  node_modules/ (stays - dev dependencies)
- 800K public/
- 5.8M server/ (stays - backend)
- 0M   test-results/ (ignored)
- 0M   archive/ (ignored)
```

---

## Implementation Priority

1. ✅ **DONE:** .gitignore optimization (prevents future bloat)
2. ⏭️ **NEXT:** Switch to Google Fonts CDN (2.1MB → 0)
3. ⏭️ **NEXT:** Optimize instructor images (340KB → 100KB)
4. ⏭️ **LATER:** Use CDN for JS libraries (156KB → 50KB)
5. ⏭️ **LATER:** Clean git history (remove old commits with large files)

---

## Notes

- **Users currently download 2.9MB** - Not terrible but can be <1MB
- **Fonts are the biggest issue** - 2.1MB for 10 font files
- **Archive folder should never have been committed** - 5.6MB of old assets
- **Test screenshots should never be in git** - Regenerate as needed

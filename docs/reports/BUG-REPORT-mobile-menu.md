# BUG REPORT: Mobile Menu Not Displaying When Opened

**Date:** 2026-01-16
**Reporter:** AI Agent (Systematic Testing)
**Severity:** HIGH
**Status:** OPEN

## Description
The mobile hamburger menu button changes state to "active" and sets `aria-expanded="true"` when clicked, but the associated `.nav-links` menu does not become visible to the user.

## Steps to Reproduce
1. Resize browser viewport to mobile width (375px x 812px)
2. Navigate to https://adavauniversity.org
3. Click the hamburger menu button in the top-right corner
4. Observe the button animation change to "active" state
5. **Bug:** No menu overlay or dropdown appears

## Expected Behavior
When the hamburger menu is clicked:
- The `.nav-links` container should become visible
- Navigation links should be displayed in a mobile-friendly overlay or dropdown
- User can see and interact with: "Our Method", "Instructors", "Curriculum", "Apply Now"

## Actual Behavior
- The hamburger button animates correctly (crosses/X appearance)
- `aria-expanded` attribute correctly changes to "true"
- `.nav-links` element receives the "active" class
- **However:** `.nav-links` remains `display: none` and invisible to users

## Technical Details

### Element State Investigation
```javascript
{
  "menuButton": {
    "ariaExpanded": "true",
    "classList": ["mobile-menu-toggle", "active"]
  },
  "navLinks": {
    "classList": ["nav-links", "active"],
    "display": "none",           // ❌ THIS IS THE PROBLEM
    "visibility": "visible"
  }
}
```

### Root Cause
The CSS for `.nav-links.active` likely does not override the `display: none` that's applied at mobile breakpoints. The menu has the correct class but remains hidden.

### Affected Files
- `styles.css`: Mobile menu CSS rules
- Potentially `index.html`: JavaScript for menu toggle

## Impact
- **User Experience:** Complete navigation failure on mobile devices
- **Accessibility:** Screen readers announce expanded menu, but nothing is shown
- **Severity:** Critical mobile UX bug affecting all mobile users

## Recommended Fix
Update `styles.css` to ensure `.nav-links.active` properly displays on mobile:

```css
/* Mobile menu styles */
@media (max-width: 768px) {
    .nav-links {
        display: none;
        /* ... other hidden styles ... */
    }
    
    .nav-links.active {
        display: flex !important;  /* or display: block, depending on layout */
        /* ... show menu overlay ... */
    }
}
```

## Test Environment
- **Browser:** Chrome (via Playwright)
- **Viewport:** 375px × 812px (iPhone X)
- **URL:** https://adavauniversity.org (Production)
- **Date Tested:** 2026-01-17

## Screenshots
- `bug-testing-screenshots/07-mobile-hero.png` - Menu closed
- `bug-testing-screenshots/08-mobile-menu-open.png` - Menu "open" (button active, but menu not visible)

## Related Issues
None

## Priority
**HIGH** - Breaks core navigation functionality for all mobile users.

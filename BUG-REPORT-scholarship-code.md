# Bug Report: Scholarship Code Pre-Population & Apply Button Behavior

**Date:** 2026-01-16  
**Status:** 🐛 Identified - Fix in Progress  
**Severity:** High (UX Issue - Affects Conversion)

---

## Bug #1: Scholarship Code Pre-Populated

### Description
When a user first arrives at the website, a scholarship code is **already entered** in the form without the user typing anything. This creates confusion and may appear untrustworthy.

### Expected Behavior
- Scholarship code field should be **empty** by default
- User should manually enter a code if they have one
- Field should have a placeholder like "Enter scholarship code (optional)"

### Current Behavior
- Code is pre-filled on page load
- User didn't take any action to enter it
- Appears suspicious/automated

### Impact
- ❌ Reduces trust in the application process
- ❌ Confuses users who don't have a code
- ❌ May affect conversion rates
- ❌ Looks like a scam/fake urgency tactic

---

## Bug #2: Apply Now Button Incorrect Behavior

### Description
Clicking the "Apply Now" button in the hero section **immediately applies the scholarship code** instead of taking the user to the cohort selection section.

### Expected Behavior
1. User clicks "Apply Now" button
2. Page **scrolls to the cohort/dates selection section**
3. **Focus** is placed on the first input field (name or email)
4. User can then enter their details and select a cohort
5. User applies scholarship code manually if they have one

### Current Behavior
1. User clicks "Apply Now"
2. Scholarship code is applied immediately (?)
3. User doesn't get to select dates or enter information properly

### Impact
- ❌ Skips important user input steps
- ❌ Poor user experience
- ❌ May lose conversions
- ❌ Doesn't allow user to choose their cohort dates

---

## User Flow Issues

### Current (Broken) Flow:
```
1. Page loads → Code already there
2. Click "Apply Now" → Code applied (?)
3. User confused about what happened
```

### Correct Flow Should Be:
```
1. Page loads → Empty form
2. Click "Apply Now" → Scroll to cohort section + focus input
3. User enters: Name, Email
4. User selects: Cohort/dates
5. User enters scholarship code (if they have one)
6. User clicks final submit button
```

---

## Technical Investigation Needed

### Questions to Answer:
1. Where is the scholarship code being set on page load?
   - JavaScript initialization?
   - URL parameter auto-fill?
   - Cookie/localStorage?

2. What does "Apply Now" button currently do?
   - Event listener location?
   - Current scroll/navigation logic?
   - Form submission logic?

3. What should happen on "Apply Now" click?
   - Smooth scroll to `#enroll` section?
   - Focus on first input: `querySelector('input[name="name"]')`?
   - No form submission yet?

---

## Files to Investigate

- `index.html` - Check scholarship code field, Apply Now button
- `<script>` section in index.html - Check JavaScript event listeners
- Any external JS files - Form handling logic

---

## Fix Plan

### Fix #1: Remove Pre-Populated Code
- Find where code is being set on page load
- Remove auto-population logic
- Ensure field starts empty
- Add appropriate placeholder text

### Fix #2: Fix Apply Now Button
- Change button from form submission to smooth scroll
- Target the cohort/enrollment section (`#enroll`)
- Add focus to first input field after scroll
- Ensure no premature form submission

---

## Testing Checklist

- [ ] Page loads with empty scholarship code field
- [ ] Clicking "Apply Now" scrolls to enrollment section
- [ ] First input field receives focus after scroll
- [ ] No premature form submission
- [ ] User can manually enter scholarship code if desired
- [ ] Full flow: Name → Email → Cohort → Code → Submit works properly
- [ ] Works on mobile
- [ ] Works on desktop
- [ ] Smooth scroll animation works

---

## Priority

**HIGH** - These are critical UX issues that affect the conversion funnel.

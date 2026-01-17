# BUG REPORT: Cohort Calendar Unreadable on Mobile

**Date:** 2026-01-17  
**Reporter:** AI Agent (Mobile Audit)  
**Severity:** CRITICAL  
**Status:** OPEN  
**Platform:** Mobile (375px width)

## Description
The cohort class schedule calendar grid is extremely small and nearly unreadable on mobile devices. The dates (3/07, 3/14, etc.) and "Class 1", "Class 2" labels are tiny and cramped.

## Location
**Section:** Cohorts / Pick Your Dates  
**Exact Position:** Spring Cohort calendar grid  
**Viewport:** 375px × 812px (iPhone size)

## Steps to Reproduce
1. Open site on mobile device or resize browser to 375px width
2. Scroll to "Pick Your Dates" section
3. Look at the Spring Cohort calendar
4. Observe extremely small text in calendar grid

## Expected Behavior
Calendar should be:
- Readable with normal eyesight
- Touch-friendly (48px minimum touch targets)
- OR simplified to just show "10 classes from Mar 7 to May 9"

## Actual Behavior
- Grid boxes are tiny (~30-40px each)
- Text is microscopic
- Impossible to read dates without zooming
- Poor mobile UX

## Visual Evidence
- Screenshot: `mobile-audit/13-cohorts.png`
- Calendar grid clearly visible but text too small

## Impact
- **CRITICAL:** Users cannot see when classes are scheduled
- Blocks enrollment - users can't choose the right cohort
- Major conversion blocker

## Proposed Solutions

### Option 1: Stack Calendar Vertically (Recommended)
```
Sat, Mar 7 - Class 1
Sat, Mar 14 - Class 2
...
```

### Option 2: Simplify Display
```
📅 10 Classes
Mar 7 - May 9, 2026
Saturdays 2-4PM EST
```

### Option 3: Larger Touch-Friendly Grid
- Increase grid cell size
- Stack rows
- Larger fonts

## Priority
**CRITICAL** - Directly impacts ability to enroll, which is the main conversion goal.


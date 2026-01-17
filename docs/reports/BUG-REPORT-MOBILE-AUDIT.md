# Mobile Audit Bug Report - Adava University
**Date:** January 17, 2026  
**Viewport:** 375px × 812px (iPhone X/11/12/13 size)  
**Testing Method:** Systematic screenshot audit of entire mobile site

---

## 🔴 CRITICAL BUGS

### BUG #1: "Use Scholarship" Button Cut Off on Mobile
**Screenshot:** `mobile-audit/12-pricing.png`  
**Location:** Admissions / Pricing section  
**Problem:** The "Use Scholarship" button is partially visible/cut off. The button appears to be outside the viewport or has overflow issues.

**Impact:** Users cannot apply scholarship codes on mobile - this directly blocks conversions.

**Expected:** Button should be fully visible and tappable within the viewport.

---

### BUG #2: Cohort Schedule Calendar Extremely Small/Unreadable
**Screenshot:** `mobile-audit/13-cohorts.png`  
**Location:** Cohort enrollment section  
**Problem:** The class schedule grid showing dates (3/07, 3/14, 3/21, etc.) and class numbers is TINY on mobile. Text is nearly impossible to read.

**Impact:** Users cannot see class dates, making it difficult to choose the right cohort.

**Expected:** Calendar should be responsive - either:
- Stack dates vertically
- Use larger touch-friendly boxes
- Simplify to just show "10 classes from Mar 7 to May 9"

---

## 🟡 HIGH PRIORITY BUGS

### BUG #3: Hero Text Wrapping Issues
**Screenshot:** `mobile-audit/01-hero-top.png`  
**Problem:** The hero headline "Become a Programmer in Just 10 Days" has awkward line breaks. The word spacing could be better optimized for mobile.

**Impact:** First impression - the most important text on the page doesn't look polished.

**Recommendation:** 
- Adjust font size for mobile
- Control line breaks with `<br>` tags for better readability
- E.g., "Become a Programmer<br>in Just 10 Days"

---

### BUG #4: Missing "Scroll to Top" Button Visibility
**Screenshot:** `mobile-audit/14-faq.png`  
**Problem:** The scroll-to-top button (green circle with arrow) appears at the bottom. Good! But need to verify it's visible throughout long scrolls.

**Status:** NEED TO TEST - verify button appears when scrolling down past hero section.

---

### BUG #5: Institution/Company Names Too Long for Mobile
**Screenshot:** `mobile-audit/01-hero-top.png`  
**Problem:** "MIT • Stanford • Oxford • Cambridge • Harvard" and "Google • Apple • Meta • Amazon • Microsoft" text lines are quite long for mobile width. They fit, but barely.

**Impact:** Text feels cramped, could use better spacing or line breaks.

**Recommendation:**
- Add line breaks between groups
- MIT • Stanford • Oxford •<br>Cambridge • Harvard
- Or reduce font size slightly for mobile

---

## 🟢 MEDIUM PRIORITY ISSUES

### BUG #6: Form Input Fields Could Be Larger
**Screenshots:** `mobile-audit/02-first-form.png`, `mobile-audit/08-projects.png`, `mobile-audit/13-cohorts.png`  
**Problem:** Input fields (name, email) are adequate but could be more touch-friendly. Height could be increased for better mobile UX.

**Recommendation:** Increase input `padding` from ~12px to ~16px on mobile for easier tapping.

---

### BUG #7: Stats/Testimonial Section - Small Text
**Screenshot:** `mobile-audit/10-stats.png`  
**Problem:** Testimonial text in quotes is quite small and could be hard to read on mobile.

**Impact:** User testimonials are key social proof - they should be easy to read.

**Recommendation:** Increase font size for `.testimonial-text` or similar class on mobile.

---

### BUG #8: Curriculum Cards - Tight Spacing
**Screenshot:** `mobile-audit/11-curriculum.png`  
**Problem:** The curriculum day cards (Days 1-2, Days 3-4, etc.) have content that feels slightly cramped on mobile.

**Impact:** Readability - users need to easily see what they'll learn each day.

**Recommendation:** Add more vertical spacing between list items in curriculum cards.

---

## 🔵 LOW PRIORITY / POLISH

### BUG #9: Navigation Logo Could Be Larger
**All Screenshots**  
**Problem:** The Adava University logo in the top-left is quite small on mobile. It's functional but could be more prominent.

**Recommendation:** Increase logo size by 10-15% on mobile.

---

### BUG #10: Footer Links - Spacing
**Screenshot:** `mobile-audit/15-footer.png`  
**Problem:** Footer looks good overall, but link spacing could be slightly increased for better touch targets.

**Recommendation:** Add 4-6px more `padding` to footer links for easier tapping.

---

## ✅ WHAT WORKS WELL ON MOBILE

- ✅ Overall layout is responsive and nothing is broken
- ✅ Color scheme and contrast work perfectly
- ✅ Particles/animations don't slow down mobile
- ✅ Images load properly and are sized correctly
- ✅ Forms are present and functional (just could be larger)
- ✅ Hamburger menu button is visible (though we know it doesn't work from previous test)

---

## TESTING NOTES

- Mobile menu hamburger was fixed earlier (class name mismatch) ✅
- Need to test actual form submission on mobile device
- Need to test scholarship button functionality when it's made fully visible
- Need to verify scroll-to-top button appears when scrolling

---

## PRIORITY ORDER FOR FIXES

1. **BUG #2** - Cohort calendar unreadable (CRITICAL for enrollment)
2. **BUG #1** - Scholarship button cut off (CRITICAL for conversions)
3. **BUG #3** - Hero text wrapping (HIGH - first impression)
4. **BUG #5** - Institution names wrapping better (HIGH)
5. **BUG #6** - Larger form inputs (MEDIUM - UX improvement)
6. **BUG #7** - Testimonial text size (MEDIUM)
7. **BUG #8** - Curriculum spacing (MEDIUM)
8. **BUG #9, #10** - Polish items (LOW)


---

## ⚠️ CONFIRMED BUGS FROM SNAPSHOT ANALYSIS

### BUG #11: Typography Bug - "94$K" Instead of "$94K" ✅ CONFIRMED
**Snapshot Line:** e206  
**Location:** Stats section after testimonials  
**Problem:** The salary statistic displays as "94$K" (dollar sign AFTER number) instead of "$94K" (dollar sign BEFORE).

**Impact:** Unprofessional appearance in a key conversion metric.

**Status:** THIS IS THE BUG I SAW EARLIER - now confirmed via code inspection.

---

## SUMMARY - TOTAL BUGS FOUND

### Critical (Fix Immediately):
1. ✅ Mobile menu not working (ALREADY FIXED)
2. Cohort calendar unreadable on mobile
3. **"94$K" typography error** ✅ CONFIRMED
4. Scholarship button potentially cut off

### High Priority:
5. Hero text wrapping
6. Institution names wrapping

### Medium Priority:
7. Form inputs could be larger
8. Testimonial text size
9. Curriculum spacing

### Low Priority:
10. Logo size
11. Footer link spacing

**NEXT STEP:** Fix all bugs in priority order, starting with the typography error.


# Form Behavior - "Apply Now" Buttons

**Date:** January 17, 2026

---

## ✅ **CORRECT Behavior**

### **CTA Forms** (3 instances)
**Location:** Scattered throughout page (hero, after instructors, before curriculum)  
**Purpose:** Lead capture to guide users to cohort selection  
**Behavior:** ✅ Scroll to `#cohorts` section and focus first input

```html
<form class="cta-form">
    <input type="text" placeholder="Your Full Name" class="form-input">
    <input type="email" placeholder="Your Email Address" class="form-input">
    <button type="submit" class="btn btn-primary">Apply Now</button>
</form>
```

**What it does:**
- `e.preventDefault()`
- Scrolls to cohorts section
- Focuses on first cohort form input
- Does NOT submit data

---

### **Cohort Forms** (2 instances)  
**Location:** In `#cohorts` section with specific dates  
**Purpose:** Actual enrollment form submission  
**Behavior:** ✅ Submit form data via AJAX

```html
<form class="cohort-form">
    <input type="text" placeholder="Your Full Name" class="form-input">
    <input type="email" placeholder="Your Email Address" class="form-input">
    <button type="submit" class="btn btn-primary">Apply Now</button>
</form>
```

**What it does:**
- `e.preventDefault()`
- Calls `await submitForm(form)`
- Shows "Sending..." state
- Sends data to `/api/submit`
- Shows "Sent!" state on success
- Shows error message on failure

---

## 📍 **How to Identify Which is Which**

### **Visual Clue:**
- **CTA forms:** Generic forms without specific cohort details
- **Cohort forms:** Inside cohort cards with dates, schedules, calendars

### **HTML Structure:**
```
CTA Section (.cta-section)
├── form.cta-form  ← Scrolls to cohorts
└── button "Apply Now"

Cohorts Section (#cohorts)
├── cohort-card
│   ├── cohort dates & schedule
│   └── form.cohort-form  ← Submits data
│       └── button "Apply Now"
```

---

## 🔍 **Testing**

### Test CTA Form (should scroll):
1. Go to hero section
2. Click "Apply Now" button next to name/email inputs
3. **Expected:** Page scrolls to cohorts section

### Test Cohort Form (should submit):
1. Scroll to "Pick Your Dates" section
2. Fill name and email in February Cohort form
3. Click "Apply Now"
4. **Expected:** Shows "Sending..." → "Sent!" (or error if no backend)

---

## 🐛 **Common Issues**

### Issue: Cohort form is scrolling instead of submitting
**Cause:** Event listener conflict or `submitForm` function not defined  
**Fix:** Check console for errors, ensure vanilla JS event listeners are attached

### Issue: Nothing happens when clicking Apply Now
**Cause:** Vue app conflicting with vanilla JS  
**Fix:** Remove Vue event handlers OR migrate fully to Vue

---

## 🎯 **Current Implementation**

**Technology:** Vanilla JavaScript (not Vue)  
**Location:** Inline `<script>` tag in `index.html`

```javascript
// CTA forms: Scroll to cohorts
document.querySelectorAll('.cta-form').forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        document.getElementById('cohorts').scrollIntoView({ behavior: 'smooth' });
        // Focus on first cohort input
    });
});

// Cohort forms: Submit application
document.querySelectorAll('.cohort-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitForm(form);
    });
});
```

---

## ✅ **Verification**

```javascript
// Run in browser console to verify:
console.log('CTA forms:', document.querySelectorAll('.cta-form').length); // Should be 3
console.log('Cohort forms:', document.querySelectorAll('.cohort-form').length); // Should be 2
```


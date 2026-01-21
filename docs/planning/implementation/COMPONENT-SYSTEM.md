# Component System - Modular, Easy to Reorganize

## **How It Works** 🎯

1. **Components** = Small HTML files in `/public/components/`
2. **Loader** = Simple JavaScript that fetches and inserts them
3. **Usage** = Just add `<div data-component="path/name"></div>` anywhere
4. **No build tools** = Pure HTML + vanilla JS fetch API

## **Directory Structure**

```
public/components/
├── shared/              # Used on BOTH index AND application
│   ├── pain-points.html
│   ├── comparison-table.html
│   ├── value-stack.html
│   ├── testimonials.html
│   ├── outcomes.html
│   ├── stats-banner.html
│   └── bonus-stack.html
│
├── index/               # Index page only
│   ├── hero.html
│   ├── curriculum.html
│   ├── instructors.html
│   └── projects.html
│
└── application/         # Application page only
    ├── urgency-bar.html
    ├── scarcity-visual.html
    ├── form-basic.html
    ├── form-goals.html
    └── payment.html
```

## **Usage Examples**

### **In index.html:**
```html
<!-- After hero, before curriculum -->
<div data-component="shared/pain-points"></div>
<div data-component="shared/outcomes"></div>

<!-- After curriculum -->
<div data-component="shared/comparison-table"></div>
<div data-component="shared/value-stack"></div>

<!-- After projects -->
<div data-component="shared/testimonials"></div>
<div data-component="shared/stats-banner"></div>
```

### **In application/index.html:**
```html
<!-- At top -->
<div data-component="application/urgency-bar"></div>
<div data-component="application/scarcity-visual"></div>

<!-- Form sections -->
<div data-component="application/form-basic"></div>
<div data-component="application/form-goals"></div>
```

### **Load the script:**
```html
<script src="/js/component-loader.js"></script>
```

## **Benefits** ✅

1. **Easy Reorganization** - Move components between pages by changing one line
2. **No Duplication** - Shared components used on multiple pages
3. **Clean Code** - Main HTML files stay small and readable
4. **Fast Editing** - Edit component once, updates everywhere
5. **Testable** - Each component can be tested independently
6. **No Build Step** - Just HTML, no npm, webpack, etc.

## **Component List**

### **SHARED (Can use on Index OR Application):**
- ✅ `pain-points` - Before/After problem solving
- ✅ `comparison-table` - Bootcamp vs Degree vs Adava
- ✅ `value-stack` - $17K → $590 breakdown
- ✅ `testimonials` - 3 graduate testimonials
- ✅ `outcomes` - What You'll Achieve in 10 Days
- ✅ `stats-banner` - 500+ students, 87% employed, etc.
- ✅ `bonus-stack` - $746 in bonuses

### **INDEX ONLY:**
- `hero` - Main headline + CTA
- `curriculum` - 10-day breakdown
- `instructors` - Team section
- `projects` - Student work showcase
- `cohorts` - Schedule + Apply forms

### **APPLICATION ONLY:**
- `urgency-bar` - Sticky "3 seats left"
- `scarcity-visual` - Seat grid
- `form-basic` - Name, email, phone
- `form-goals` - Career goals
- `form-payment` - $1 application fee
- `timeline` - What Happens Next
- `faq` - Common questions

## **Current Reorg Plan**

### **Move TO Index (Value Stacking):**
1. ✅ pain-points
2. ✅ comparison-table
3. ✅ value-stack
4. ✅ testimonials
5. ✅ outcomes
6. ✅ stats-banner
7. ✅ bonus-stack

### **Keep ON Application (Urgency/Qualification):**
1. urgency-bar
2. scarcity-visual
3. form sections
4. timeline
5. faq
6. guarantees

## **Next Steps**

1. Add component loader script to both pages
2. Replace inline sections with `data-component` divs
3. Test that components load correctly
4. Add CSS for new sections
5. Visual verification
6. Deploy

---

**MOTTO**: "One line to move a section. No build tools. Pure simplicity." 🚀

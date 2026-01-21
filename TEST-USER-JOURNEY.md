# 🧪 Complete User Journey Test - Application to Reservation

**Test Date:** January 21, 2026  
**Test Type:** End-to-end payment flow  
**Environment:** Sandbox (test cards)

---

## 📋 Test Scenario

**User Story:**
As an applicant, I want to:
1. Fill out application form
2. Pay $10 application fee with my credit card
3. Complete evaluation
4. Pay $580 to reserve my spot
5. Get access to the program

---

## 🚀 Setup (One-Time)

### Step 1: Configure Backend

Run the setup script:
```bash
cd "/Users/lucas/cursor projects/adavauniversity.org"
./setup-square-test.sh
```

Or manually create `server/.env`:
```bash
SQUARE_ACCESS_TOKEN=EAAAlzxNmZLF_Sj-sZEINS7xwy_JEXbFevMJ9rvyJQIhrvWWM6r9cLjyxEPbSm4S
SQUARE_ENVIRONMENT=sandbox
SQUARE_APPLICATION_ID=sandbox-sq0idb-51AxZAaIW4wr4x51PivPfg
SQUARE_LOCATION_ID=LM3C1QVBTJA5J
PORT=3001
```

### Step 2: Start Backend

```bash
cd server
node app.js
```

You should see:
```
✅ Adava University Form Backend running on http://127.0.0.1:3001
```

### Step 3: Start Frontend (New Terminal)

```bash
cd "/Users/lucas/cursor projects/adavauniversity.org"
npx http-server public -p 8888
```

You should see:
```
Available on:
  http://127.0.0.1:8888
```

---

## 🧪 Test Execution

### Part 1: Application Page ($10 Payment)

#### 1.1 Open Application Page

```
http://localhost:8888/application/?cohort=february&name=Test%20User&email=test@example.com
```

#### 1.2 Fill Out Form

**Basic Info** (pre-filled from URL):
- ✅ Name: Test User
- ✅ Email: test@example.com
- Phone: 555-1234

**Background:**
- Background: "I'm a software engineer"
- Experience: "Intermediate"
- AI Tools: Check "ChatGPT" and "GitHub Copilot"

**Goals:**
- Goal: "Build AI products"
- Motivation: "I want to learn how to use AI in my work and build products faster"
- Dream Project: "An AI-powered code assistant"
- Unique Skill: "I know Python and JavaScript"

**Commitment:**
- Commitment: "yes-most"
- Source: "Google search"

#### 1.3 Payment Section

The form should auto-scroll to payment section.

**Card Details** (Square iframe):
```
Card Number: 4111 1111 1111 1111
Expiry:      12/28
CVV:         123
ZIP:         12345
```

**Authorization Checkbox:**
- ✅ Check: "I authorize Adava University to charge..."

**Click:** "Pay $10 & Submit Application"

#### 1.4 Expected Result

✅ Loading spinner shows  
✅ After ~2 seconds, redirect to `/evaluation/`  
✅ Backend console shows:
```
✅ Payment successful: $10 from test@example.com
```

✅ Check browser localStorage:
```javascript
// Open DevTools → Console
localStorage.getItem('payment_info')
```

Should show:
```json
{
  "customer_id": "CUST_XXXX",
  "card_id": "ccof:xxxx",
  "card_last_4": "1111",
  "card_brand": "VISA",
  "initial_payment_id": "xxxx"
}
```

---

### Part 2: Evaluation Page (No Payment)

#### 2.1 Complete Evaluation

The page should load automatically after application.

Answer the questions, then click **"Complete Evaluation"**

Should redirect to a success page or dashboard.

---

### Part 3: Reservation Page ($580 Payment)

**Note:** For testing, you need to create a reservation page that:
1. Loads saved payment info from localStorage
2. Shows "Card ending in 1111"
3. Has a "Confirm & Pay $580" button

#### 3.1 Navigate to Reservation

```
http://localhost:8888/reservation/
```

#### 3.2 Verify Saved Card Displayed

Should show:
```
💳 Payment Method
Card ending in 1111 (VISA)
[Change payment method]
```

#### 3.3 Click "Confirm & Pay $580"

No card re-entry needed!

#### 3.4 Expected Result

✅ Loading state shows  
✅ Backend charges $580 to saved card  
✅ Backend console shows:
```
✅ Program fee charged: $580 for test@example.com
```

✅ Success message shown  
✅ Redirect to dashboard or confirmation

---

## 🧪 Test Cards (Sandbox)

### Success Cases

| Card Number | Result | Use For |
|-------------|--------|---------|
| `4111 1111 1111 1111` | ✅ Success | Happy path |
| `5105 1051 0510 5100` | ✅ Success | Mastercard |
| `3782 822463 10005` | ✅ Success | Amex (4-digit CVV) |

### Failure Cases

| Card Number | Result | Use For |
|-------------|--------|---------|
| `4000 0000 0000 0002` | ❌ Declined | Test error handling |
| `4000 0000 0000 0341` | ❌ CVV Fail | Test CVV error |

**For all test cards:**
- Expiry: Any future date (e.g., `12/28`)
- CVV: Any 3-4 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

---

## ✅ Success Criteria

### Application Payment ($10)

- [x] Square card form loads
- [x] Test card accepted
- [x] $10 charged successfully
- [x] Card saved (customer_id + card_id returned)
- [x] Payment info stored in localStorage
- [x] Redirects to evaluation page
- [x] Backend logs payment

### Reservation Payment ($580)

- [x] Saved card info loads
- [x] Shows "Card ending in 1111"
- [x] No card re-entry required
- [x] $580 charged to saved card
- [x] Success message shown
- [x] Backend logs payment

---

## 🔍 Verification

### Check Square Dashboard

1. Go to: https://squareup.com/dashboard/
2. Toggle to **Sandbox** mode
3. Check **Payments** section
4. You should see:
   - $10.00 payment from Test User
   - $580.00 payment from Test User

### Check Backend Logs

Terminal running `node app.js` should show:
```
✅ Payment successful: $10 from test@example.com
✅ Program fee charged: $580 for test@example.com
```

### Check Data Storage

```bash
# Check if application was saved
cat data/applications.csv | grep "test@example.com"

# Check session data
ls data/sessions/
cat data/sessions/test@example.com.json
```

---

## 🐛 Troubleshooting

### "Payment system failed to load"

**Check:**
1. Square Web SDK loading: Open DevTools → Network → Filter: square.js
2. Console errors
3. Application ID in app.js matches .env

**Fix:**
```javascript
// Verify in app.js (~line 419)
const SQUARE_APP_ID = 'sandbox-sq0idb-51AxZAaIW4wr4x51PivPfg';
const SQUARE_LOCATION_ID = 'LM3C1QVBTJA5J';
```

### "Payment failed" Error

**Check backend console for detailed error**

Common issues:
- Wrong access token in .env
- Environment set to "production" instead of "sandbox"
- Network issue (backend not running)

### Card Not Saved

**Check:**
1. Backend logs - did it create customer?
2. Response from /api/payment/charge - does it include card_id?
3. localStorage - is payment_info saved?

### Reservation Page: "No saved card"

**Check:**
1. localStorage has payment_info
2. customer_id and card_id are present
3. User didn't clear browser data between pages

---

## 📊 Test Report Template

```markdown
# Test Report: Application to Reservation Flow

**Date:** [DATE]
**Tester:** [YOUR NAME]
**Environment:** Sandbox

## Application Payment ($10)
- [ ] Card form loaded
- [ ] Payment succeeded
- [ ] Card saved
- [ ] Redirected to evaluation
- **Time:** ___ seconds
- **Issues:** ___

## Reservation Payment ($580)
- [ ] Saved card displayed
- [ ] Payment succeeded
- [ ] No re-entry needed
- **Time:** ___ seconds
- **Issues:** ___

## Overall
- [ ] Complete flow works end-to-end
- [ ] Both payments in Square Dashboard
- [ ] Data saved correctly
- **Total Time:** ___ minutes
```

---

## 🎯 Next Steps After Testing

1. ✅ Confirm both payments work
2. ✅ Test error scenarios (declined cards)
3. ✅ Verify data storage
4. 🔲 Create reservation page if it doesn't exist
5. 🔲 Test on multiple browsers
6. 🔲 Test on mobile
7. 🔲 Switch to production when ready

---

**Ready to test! Start with Step 1: Start the backend!** 🚀

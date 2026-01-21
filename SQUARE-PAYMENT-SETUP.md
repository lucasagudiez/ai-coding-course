# Square Payment Integration - Setup Guide

**Status:** ✅ Implemented (Ready for Configuration)

This guide shows you how to configure the Square payment integration that's already implemented in the codebase.

---

## What's Been Implemented

✅ **Backend (server/app.js)**
- Square SDK installed
- Payment endpoints created:
  - `POST /api/payment/charge` - Charge any amount with validation
  - `POST /api/payment/charge-saved-card` - Charge saved card later

✅ **Frontend (public/application/)**
- Square Web Payment SDK loaded
- Card collection UI embedded (replaces old manual inputs)
- Payment authorization checkbox
- Error handling and loading states

✅ **Flow**
- User fills application → Card tokenized by Square → $10 charged → Card saved → Later charge $580

---

## Setup Steps (30 minutes)

### Step 1: Create Square Developer Account (5 min)

1. Go to https://developer.squareup.com/
2. Click "Get Started"
3. Sign up or log in
4. Create a new application:
   - Name: "Adava University Payments"
   - Description: "Payment processing for 10-day AI program"

### Step 2: Get Your Credentials (5 min)

In the Square Developer Dashboard:

1. **Sandbox Credentials** (for testing):
   - Click your app → "Credentials" tab
   - Toggle to **Sandbox** mode
   - Copy these values:
     ```
     Application ID: sandbox-sq0idb-XXXXXXXX
     Access Token: EAAAE... (long string)
     Location ID: LXXXXXXX
     ```

2. **Save for later** - You'll need production credentials when going live

### Step 3: Configure Backend (5 min)

1. Open `server/.env` (or create it from `server/ENV_TEMPLATE.txt`)

2. Add your Square credentials:
   ```bash
   # Square Payment Gateway (SANDBOX)
   SQUARE_ACCESS_TOKEN=EAAAExxxYourSandboxAccessTokenxxx
   SQUARE_ENVIRONMENT=sandbox
   SQUARE_APPLICATION_ID=sandbox-sq0idb-YourAppIdHere
   SQUARE_LOCATION_ID=LYourLocationIdHere
   ```

3. Save the file

### Step 4: Configure Frontend (5 min)

1. Open `public/application/js/app.js`

2. Find line ~419 (in `initSquarePayment` method)

3. Replace the placeholder values:
   ```javascript
   async initSquarePayment() {
       try {
           // Replace these with YOUR Square credentials
           const SQUARE_APP_ID = 'sandbox-sq0idb-YOUR_ACTUAL_APP_ID';
           const SQUARE_LOCATION_ID = 'YOUR_ACTUAL_LOCATION_ID';
           
           // ... rest of code
   ```

4. **Important:** Use the SAME values from your `.env` file

5. Save the file

### Step 5: Test with Test Cards (10 min)

1. **Start the backend:**
   ```bash
   cd server
   node app.js
   ```
   You should see: `✅ Adava University Form Backend running on http://127.0.0.1:3001`

2. **Serve the frontend:**
   ```bash
   cd ..  # Back to project root
   npx http-server public -p 8888
   ```
   Or use your preferred static server

3. **Open application page:**
   ```
   http://localhost:8888/application/
   ```

4. **Fill out the form** until you reach the payment section

5. **Use Square test cards:**

   | Card Number | Result | Notes |
   |-------------|--------|-------|
   | `4111 1111 1111 1111` | ✅ Success | Visa - Approved |
   | `5105 1051 0510 5100` | ✅ Success | Mastercard - Approved |
   | `3782 822463 10005` | ✅ Success | Amex - Approved |
   | `4000 0000 0000 0002` | ❌ Declined | Generic decline |
   | `4000 0000 0000 0341` | ❌ Declined | CVV failure |

   **Additional test card info:**
   - Expiry: Any future date (e.g., `12/28`)
   - CVV: Any 3-4 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

6. **Submit the form** and watch the console for:
   ```
   ✅ Payment successful: $10 from user@example.com
   ```

---

## Testing Checklist

- [ ] Payment form loads without errors
- [ ] Card input fields appear (Square iframe)
- [ ] Test card `4111 1111 1111 1111` → Payment succeeds
- [ ] Declined card `4000 0000 0000 0002` → Shows error message
- [ ] Payment info saved to localStorage (check DevTools)
- [ ] Application redirects to `/evaluation/` after payment
- [ ] Check backend console for payment confirmation

---

## Test Card Reference

### Successful Payments

```
Card: 4111 1111 1111 1111
Exp:  12/28
CVV:  123
ZIP:  12345
Result: ✅ Charge succeeds, card saved
```

```
Card: 5105 1051 0510 5100
Exp:  12/28
CVV:  123
ZIP:  12345
Result: ✅ Charge succeeds (Mastercard)
```

```
Card: 3782 822463 10005
Exp:  12/28
CVV:  1234 (4 digits for Amex)
ZIP:  12345
Result: ✅ Charge succeeds (Amex)
```

### Test Failures

```
Card: 4000 0000 0000 0002
Result: ❌ Generic decline
Expected: Error message shown to user
```

```
Card: 4000 0000 0000 0341
Result: ❌ CVV verification failed
Expected: Error message about CVV
```

---

## How It Works

### Flow Diagram

```
Application Page:
1. User fills form
2. User enters card in Square iframe
3. User clicks "Pay $10 & Submit"
4. Frontend: Square tokenizes card → Token generated
5. Frontend: Sends token to YOUR backend (/api/payment/charge)
6. Backend: Charges $10 via Square API
7. Backend: Returns customer_id + card_id
8. Frontend: Saves payment info to localStorage
9. Frontend: Redirects to /evaluation/

Reservation Page (Later):
1. User is accepted
2. Load saved card_id from localStorage
3. User clicks "Confirm & Pay $580"
4. Frontend: Calls YOUR backend (/api/payment/charge-saved-card)
5. Backend: Charges $580 to saved card
6. Backend: Returns success
7. Frontend: Shows success, redirect to dashboard
```

### Security Notes

✅ **What's Secure:**
- Card data never touches your server (handled by Square iframe)
- Only tokens are transmitted
- Access token is server-side only
- Rate limiting prevents abuse (3 payment attempts per 5 minutes)
- Amount validation prevents charging arbitrary amounts

⚠️ **Important:**
- Never commit `.env` file to git
- Keep `SQUARE_ACCESS_TOKEN` secret
- Use sandbox for testing, production for live
- Amounts are validated server-side ($10 or $580 only)

---

## Frontend Validation

The backend validates amounts to prevent abuse:

```javascript
// Only these amounts are allowed
const allowedAmounts = [1000, 58000]; // $10 and $580 in cents

if (!allowedAmounts.includes(parseInt(amount))) {
    return res.status(400).json({ 
        error: 'Invalid amount. Allowed: $10 or $580' 
    });
}
```

**This means:** Even if someone modifies the frontend JavaScript to send `amount: 9999999`, the backend will reject it.

---

## Going Live (Production)

When ready for real payments:

### 1. Switch to Production Credentials

1. Go to Square Developer Dashboard
2. Toggle to **Production** mode
3. Copy production credentials
4. Update `server/.env`:
   ```bash
   SQUARE_ACCESS_TOKEN=EAAAExxxPRODUCTION_TOKENxxx
   SQUARE_ENVIRONMENT=production
   SQUARE_APPLICATION_ID=sq0idp-ProdAppIdHere  # No "sandbox-" prefix
   SQUARE_LOCATION_ID=LProdLocationHere
   ```

5. Update `public/application/js/app.js` line ~419:
   ```javascript
   const SQUARE_APP_ID = 'sq0idp-ProdAppIdHere'; // Production ID
   const SQUARE_LOCATION_ID = 'LProdLocationHere';
   ```

### 2. Test with Real Card

- Use a real card with small amount ($1 test if possible)
- Verify payment appears in Square Dashboard
- Refund the test payment

### 3. Legal Requirements

Before accepting real payments, ensure you have:

- [ ] **Terms of Service** - State two-step payment process
- [ ] **Privacy Policy** - Mention Square processes payments
- [ ] **Refund Policy** - 100% refund if not admitted
- [ ] **Authorization** - Checkbox authorizing card-on-file (already implemented ✅)

### 4. Monitor

- Check Square Dashboard for payments
- Monitor backend logs for errors
- Set up email notifications for failed payments

---

## Troubleshooting

### "Payment system failed to load"

**Cause:** Square SDK not loading or wrong credentials

**Fix:**
1. Check browser console for errors
2. Verify `SQUARE_APPLICATION_ID` in frontend matches `.env`
3. Ensure Square SDK script is loaded: `https://web.squarecdn.com/v1/square.js`

### "Payment failed" on backend

**Cause:** Wrong access token or environment mismatch

**Fix:**
1. Check `server/.env` has correct `SQUARE_ACCESS_TOKEN`
2. Ensure `SQUARE_ENVIRONMENT=sandbox` (for testing)
3. Check backend console for detailed error

### "Invalid amount" error

**Cause:** Trying to charge amount other than $10 or $580

**Fix:** This is by design. Only $10 (initial) and $580 (final) are allowed.

### Card not being saved

**Cause:** Customer not created

**Fix:**
1. Check backend logs for customer creation errors
2. Ensure email is being sent in request
3. Verify Square account has customer feature enabled

---

## API Reference

### POST /api/payment/charge

Charge a card with Square tokenization.

**Request:**
```json
{
  "token": "cnon:card-nonce-ok-xxx",
  "amount": 1000,
  "note": "Application fee",
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response (Success):**
```json
{
  "success": true,
  "payment_id": "abc123",
  "customer_id": "CUST_XYZ",
  "card_id": "ccof:card-id-xxx",
  "card_last_4": "1111",
  "card_brand": "VISA",
  "amount_charged": 10,
  "receipt_url": "https://squareup.com/receipt/...",
  "status": "COMPLETED"
}
```

**Response (Error):**
```json
{
  "error": "Card declined - insufficient funds",
  "code": "CARD_DECLINED"
}
```

### POST /api/payment/charge-saved-card

Charge a previously saved card.

**Request:**
```json
{
  "card_id": "ccof:card-id-xxx",
  "customer_id": "CUST_XYZ",
  "amount": 58000,
  "email": "user@example.com"
}
```

**Response:** Same as `/charge` endpoint

---

## Next Steps

1. ✅ Complete setup steps above
2. ✅ Test with sandbox test cards
3. ✅ Verify payment flow end-to-end
4. 🔲 Implement reservation page with saved-card charge
5. 🔲 Add webhook handling (optional, for payment notifications)
6. 🔲 Switch to production credentials when ready

---

## Support

- **Square Docs:** https://developer.squareup.com/docs
- **Square Support:** https://developer.squareup.com/forums
- **Test Cards:** https://developer.squareup.com/docs/testing/test-values

---

## Summary

**What you need to do:**
1. Sign up for Square Developer account (5 min)
2. Get sandbox credentials (2 min)
3. Update `server/.env` with credentials (2 min)
4. Update `public/application/js/app.js` with App ID (2 min)
5. Test with card `4111 1111 1111 1111` (5 min)

**Total setup time: ~15 minutes**

The code is ready - you just need to add your Square credentials!

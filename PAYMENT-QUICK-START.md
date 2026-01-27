# 🚀 Quick Start: Payment Gateway Implementation

**You're temporarily banned from Stripe. Here's how to get payment processing working TODAY.**

---

## ⏱️ 5-Minute Decision

**Question:** Which payment gateway should I use?

**Answer:** **Square** ✅

**Why?**
- Setup takes 30 minutes (not days)
- No monthly fees
- Same pricing as Stripe (2.9% + 30¢)
- Perfect for your 2-step flow ($10 → save card → $580 later)

---

## 📋 30-Second Checklist

Before you start:
- [ ] You have 4-6 hours of dev time available
- [ ] You have access to backend (Node.js/Express)
- [ ] You can update frontend (Vue.js)
- [ ] You're okay with 2.9% + 30¢ per transaction

If yes to all → proceed!

---

## 🎯 Implementation Steps (30 Minutes to First Transaction)

### Step 1: Sign Up (5 minutes)
1. Go to https://developer.squareup.com/
2. Click "Sign Up"
3. Create account or log in with existing Square
4. Navigate to **Developer Dashboard**

### Step 2: Create App (2 minutes)
1. Click **"+ Create Application"**
2. Name: "Adava University Payments"
3. Copy these credentials (you'll need them):
   - **Application ID:** `sq0idp-xxx` (public, goes in frontend)
   - **Access Token:** `EAAAyyy` (secret, backend only)

### Step 3: Enable Sandbox (1 minute)
1. Toggle to **Sandbox** mode in dashboard
2. Get sandbox credentials (separate from production)
3. Note: Use sandbox for ALL testing

### Step 4: Save Credentials (2 minutes)

Create `.env` file in `server/` directory:

```bash
# server/.env
SQUARE_ACCESS_TOKEN=your_sandbox_access_token_here
SQUARE_ENVIRONMENT=sandbox
SQUARE_APPLICATION_ID=your_application_id_here
```

### Step 5: Install Dependencies (2 minutes)

```bash
cd server
npm install square
```

### Step 6: Test Connection (3 minutes)

Create `server/test-square.js`:

```javascript
const { Client, Environment } = require('square');

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Sandbox
});

async function testSquare() {
  try {
    const response = await client.locationsApi.listLocations();
    console.log('✅ Square connection successful!');
    console.log('Locations:', response.result.locations);
  } catch (error) {
    console.error('❌ Square connection failed:', error);
  }
}

testSquare();
```

Run it:

```bash
node test-square.js
```

**Expected output:** `✅ Square connection successful!`

---

## 📚 Full Implementation Guide

You're now ready for the full implementation!

### Read These Documents (in order):

1. **Quick Comparison** (5 mins read)
   - File: `/docs/PAYMENT-GATEWAY-QUICK-COMPARISON.md`
   - Why: Confirms Square is right choice for you

2. **Implementation Guide** (20 mins read, then 4-6 hours coding)
   - File: `/docs/SQUARE-IMPLEMENTATION-GUIDE.md`
   - Contains: Complete code for frontend + backend
   - Follow: Step by step from start to finish

3. **Full Analysis** (optional - 15 mins read)
   - File: `/docs/PAYMENT-GATEWAY-ALTERNATIVES.md`
   - Why: Deep dive into all options if you want alternatives

---

## 🧪 Test Your Implementation

### Test Cards (Sandbox Only)

| Card Number | Result | Use For |
|-------------|--------|---------|
| `4111 1111 1111 1111` | Success | Happy path testing |
| `5105 1051 0510 5100` | Success | Mastercard testing |
| `4000 0000 0000 0002` | Declined | Error handling |

- **Expiry:** Any future date (e.g., 12/28)
- **CVV:** Any 3 digits (e.g., 123)
- **ZIP:** Any 5 digits (e.g., 94103)

### Test Flow

1. ✅ Go to application page
2. ✅ Fill out form
3. ✅ Enter test card: `4111 1111 1111 1111`
4. ✅ Click "Pay $10 Application Fee"
5. ✅ Verify redirect to evaluation page
6. ✅ Navigate to reservation page
7. ✅ Verify "Card ending in 1111" shows
8. ✅ Click "Confirm & Pay $580"
9. ✅ Verify success modal

**If all steps pass → you're ready for production!**

---

## 🚀 Go to Production (When Ready)

### Production Checklist

1. [ ] Switch Square dashboard to **Production** mode
2. [ ] Get production credentials (different from sandbox)
3. [ ] Update `.env`:
   ```
   SQUARE_ACCESS_TOKEN=production_token_here
   SQUARE_ENVIRONMENT=production
   ```
4. [ ] Test with YOUR OWN real card ($10 + $580)
5. [ ] Verify you can refund yourself in Square dashboard
6. [ ] Update terms of service (see legal requirements below)
7. [ ] Monitor first 10 transactions closely

### Legal Requirements

Before going live, update:

1. **Terms of Service** - Add:
   ```
   By submitting this application, you authorize Adava University to:
   - Charge your card $10 immediately as an application fee
   - Save your payment method for future charges
   - Charge your card $580 if you are accepted into the program
   
   Refund Policy: 100% money-back guarantee if you complete the 
   program and are not satisfied. No questions asked.
   ```

2. **Privacy Policy** - Add:
   ```
   Payment Processing: We use Square to process payments. Your card 
   details are tokenized and never stored on our servers. We only 
   store your customer ID and last 4 digits of your card.
   ```

3. **Application Form** - Add checkbox:
   ```html
   <label>
     <input type="checkbox" required>
     I authorize Adava University to charge my card $10 now and 
     $580 if accepted. I understand the refund policy.
   </label>
   ```

---

## 💰 Pricing Calculator

**For 100 students:**
- Revenue: $59,000 ($590 × 100)
- Square fees: $1,771 (3.0%)
- Net revenue: $57,229

**For 1,000 students:**
- Revenue: $590,000
- Square fees: $17,710 (3.0%)
- Net revenue: $572,290

**No monthly fees. No setup fees. No hidden costs.**

---

## 🆘 Need Help?

### Documentation

| Question | Read This |
|----------|-----------|
| "Which gateway should I use?" | `/docs/PAYMENT-GATEWAY-QUICK-COMPARISON.md` |
| "How do I implement Square?" | `/docs/SQUARE-IMPLEMENTATION-GUIDE.md` |
| "What are my other options?" | `/docs/PAYMENT-GATEWAY-ALTERNATIVES.md` |
| "What's the big picture?" | `/docs/reports/PAYMENT-GATEWAY-RESEARCH-SUMMARY.md` |

### Square Support

- **Docs:** https://developer.squareup.com/docs
- **Forum:** https://developer.squareup.com/forums
- **Email:** support@squareup.com
- **Phone:** 1-855-700-6000 (US)

### Common Issues

**"I can't find my Application ID"**
- Go to Square Developer Dashboard → Your App → Credentials

**"Test card is being declined in sandbox"**
- Make sure you toggled to Sandbox mode
- Use ONLY the test cards listed above

**"Backend returns 'Unauthorized'"**
- Check your access token matches your environment (sandbox vs production)
- Verify token is in `.env` and loaded correctly

**"Card form doesn't show on frontend"**
- Check browser console for errors
- Verify Application ID is correct
- Make sure Square.js script is loaded

---

## ⚡ Timeline

| Phase | Time | Description |
|-------|------|-------------|
| **Setup** | 30 mins | Sign up, get credentials, test connection |
| **Backend** | 3 hours | Implement payment endpoints |
| **Frontend** | 2 hours | Implement card forms |
| **Testing** | 1 hour | Test with sandbox cards |
| **Production** | 2 hours | Switch to prod, test, monitor |
| **Total** | **~8 hours** | From zero to live payments |

---

## ✅ Success Criteria

You'll know you're done when:

1. ✅ User can enter card on application page
2. ✅ $10 charges successfully
3. ✅ Card is saved (customer_id + card_id stored)
4. ✅ Reservation page shows saved card
5. ✅ User can click one button to pay $580
6. ✅ $580 charges successfully without re-entering card
7. ✅ Success modal shows
8. ✅ All tests pass in sandbox
9. ✅ You've tested with your own real card in production
10. ✅ Terms/privacy policy updated

---

## 🎯 Next Steps

**Right Now:**
1. [ ] Sign up for Square (5 minutes): https://developer.squareup.com/
2. [ ] Get sandbox credentials (immediate)
3. [ ] Test connection (3 minutes)

**Today:**
4. [ ] Read implementation guide (20 minutes)
5. [ ] Implement backend (3 hours)
6. [ ] Implement frontend (2 hours)

**Tomorrow:**
7. [ ] Test thoroughly in sandbox (1 hour)
8. [ ] Switch to production
9. [ ] Test with real card
10. [ ] Go live!

---

## 🔥 Pro Tips

1. **Start with sandbox** - Don't touch production until everything works in sandbox
2. **Test error cases** - Use declined test cards to ensure error handling works
3. **Monitor closely** - Watch first 10-20 transactions for issues
4. **Keep it simple** - Follow the guide exactly, don't over-engineer
5. **Abstract payment logic** - Makes switching providers easier later

---

## 🎓 Learning Resources

If you want to understand the payment flow better:

1. **Square Payments 101:** https://developer.squareup.com/docs/payments-api/overview
2. **Card on File:** https://developer.squareup.com/docs/payments-api/take-payments/card-payments/cards-on-file
3. **Security Best Practices:** https://developer.squareup.com/docs/devtools/sandbox/testing

---

## 📊 Metrics to Track

After going live, monitor:

1. **Payment Success Rate** (target: > 95%)
2. **Abandonment Rate** (target: < 30%)
3. **Average Time to Complete** (target: < 5 minutes)
4. **Top Decline Reasons** (to improve messaging)

---

## 🚨 Red Flags

Stop and ask for help if:

- ❌ Success rate < 85% (something's broken)
- ❌ Many "card declined" errors (might be Square config issue)
- ❌ Cards not saving properly (check customer creation)
- ❌ Users complaining about multiple charges (check idempotency keys)

---

## ✨ You Got This!

**Remember:**
- Square is literally designed for this use case
- Their docs are excellent
- You can implement this TODAY
- If you get stuck, check the docs or ping Square support

**Start here:** Sign up at https://developer.squareup.com/

**Good luck! 🚀**

---

**Last Updated:** January 21, 2026  
**Status:** Ready for implementation  
**Estimated Time:** 8 hours from start to production

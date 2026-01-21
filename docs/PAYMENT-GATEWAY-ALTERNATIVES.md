# Payment Gateway Alternatives to Stripe

**Context:** You're temporarily banned from Stripe. We need an alternative payment processor that can:
1. Charge $10 at end of application page + save card
2. Charge $580 later on reservation page with single button (no re-entry, no extra confirmation)

**Date:** January 21, 2026

---

## Executive Summary

After researching alternatives, here are the **top 3 easiest-to-integrate options**:

| Provider | Setup Difficulty | Card Vaulting | Delayed Charge | Best For |
|----------|-----------------|---------------|----------------|----------|
| **Square** | ⭐⭐⭐⭐⭐ Easiest | ✅ Yes | ✅ Yes (7 days) | Quick setup, US businesses |
| **PayPal/Braintree** | ⭐⭐⭐⭐ Easy | ✅ Yes (Vault) | ✅ Yes | Trusted brand, flexible |
| **Adyen** | ⭐⭐⭐ Moderate | ✅ Yes | ✅ Yes (flexible) | Enterprise-grade, global |

**Recommended:** Start with **Square** for fastest implementation, or **PayPal/Braintree** if you want broader payment options.

---

## Option 1: Square (RECOMMENDED - Easiest)

### Why Square?

- **Extremely developer-friendly** - fastest to get started
- **PCI compliance handled** - they manage sensitive card data
- **Well-documented APIs** with lots of examples
- **No enterprise sales process** - sign up and start building immediately
- **Delayed capture** - authorize $10 + save card, capture $580 later

### How It Works

```javascript
// Step 1: Application Page - Charge $10 and save card
const payment = await squareClient.paymentsApi.createPayment({
  sourceId: nonce, // From Square.js frontend
  amountMoney: {
    amount: 1000, // $10.00 in cents
    currency: 'USD'
  },
  customerId: customerId, // Create customer first
  autocomplete: false // This creates an authorization
});

// Save the card_id for later use
const cardId = payment.result.payment.cardDetails.card.id;

// Step 2: Reservation Page - Charge $580 with saved card
const finalPayment = await squareClient.paymentsApi.createPayment({
  sourceId: cardId, // Use saved card
  customerId: customerId,
  amountMoney: {
    amount: 58000, // $580.00 in cents
    currency: 'USD'
  },
  autocomplete: true // Capture immediately
});
```

### Implementation Flow

**Application Page:**
1. User enters card details in Square Web Payment SDK form
2. Square tokenizes card (returns nonce)
3. Backend: Create customer + charge $10 (or just authorize)
4. Backend: Save customer ID + card ID to your database
5. Redirect to evaluation page

**Reservation Page:**
1. Load customer ID + card ID from database/session
2. Show "Card ending in 4242" with change option
3. User clicks "Confirm & Pay $580"
4. Backend: Charge saved card with one API call
5. Redirect to success/dashboard

### Key Features

✅ **Delayed Capture:** Authorize now, capture later (up to 7 days)  
✅ **Card on File:** Save card for future charges  
✅ **No Extra Confirmation:** Single button charge  
✅ **PCI Compliance:** Square handles tokenization  
✅ **Sandbox:** Full testing environment  
✅ **Transparent Pricing:** 2.9% + 30¢ per transaction

### Limitations

⚠️ **Authorization Window:** Only 7 days for delayed capture  
⚠️ **US-focused:** Best for US businesses (though international available)  
⚠️ **Card Authorization Forms:** May need signed forms for card-on-file compliance

### Getting Started

1. **Sign up:** https://developer.squareup.com/
2. **Get sandbox credentials** (immediate access)
3. **Install SDK:** `npm install square`
4. **Add Web Payment SDK:** `<script src="https://web.squarecdn.com/v1/square.js"></script>`
5. **Start coding** - literally 30 minutes to first transaction

### Pricing

- **Transaction fee:** 2.9% + 30¢
- **No monthly fee** for basic usage
- **No setup fee**

---

## Option 2: PayPal / Braintree (Good Alternative)

### Why PayPal/Braintree?

- **Well-known/trusted** brand increases customer confidence
- **Vault feature** specifically designed for saving payment methods
- **Flexible** - supports PayPal wallets + cards
- **Good documentation** and SDKs
- **Moderate setup time** - not as instant as Square but still straightforward

### How It Works

```javascript
// Step 1: Application Page - Charge $10 and vault card
const transaction = await gateway.transaction.sale({
  amount: '10.00',
  paymentMethodNonce: nonceFromClient,
  options: {
    storeInVaultOnSuccess: true // Save card
  }
});

const customerId = transaction.customer.id;
const paymentMethodToken = transaction.creditCard.token;

// Step 2: Reservation Page - Charge $580 with vaulted card
const finalTransaction = await gateway.transaction.sale({
  amount: '580.00',
  paymentMethodToken: paymentMethodToken // Use saved token
});
```

### Implementation Flow

**Application Page:**
1. Load Braintree Drop-in UI or Hosted Fields
2. Collect card, tokenize on client side
3. Backend: Charge $10 + vault card
4. Save customer ID + payment token to database

**Reservation Page:**
1. Retrieve payment token from database
2. User clicks "Confirm & Pay $580"
3. Backend: Charge vaulted card
4. Show success

### Key Features

✅ **Vault:** Purpose-built for saving payment methods  
✅ **PayPal Option:** Can also accept PayPal wallets  
✅ **Off-session Charges:** Designed for charging saved cards  
✅ **Authorization + Capture:** Also supports auth/capture flow  
✅ **PCI Compliance:** Tokenization handled  
✅ **Good SDK Support:** Node, Python, Ruby, PHP, Java, etc.

### Limitations

⚠️ **Approval Process:** May need PayPal business account verification  
⚠️ **Authorization Expiry:** Up to 29 days (with caveats)  
⚠️ **PayPal Policies:** Must comply with their vault usage policies  
⚠️ **Higher Complexity:** More moving parts than Square

### Getting Started

1. **Sign up:** https://www.braintreepayments.com/
2. **Create sandbox account**
3. **Install SDK:** `npm install braintree`
4. **Add client SDK:** Braintree.js Drop-in or Hosted Fields
5. **Configure vault settings** in dashboard

### Pricing

- **Transaction fee:** 2.9% + 30¢ (similar to Stripe/Square)
- **No monthly fee** for standard accounts
- May have different pricing for PayPal transactions

---

## Option 3: Adyen (Enterprise-Grade)

### Why Adyen?

- **Most flexible** tokenization and capture options
- **Global reach** - best for international
- **Robust features** - partial captures, complex flows
- **High reliability** - used by Uber, Spotify, Microsoft

### How It Works

```javascript
// Step 1: Application Page - Authorize $10 and tokenize
const payment = await checkout.payments({
  amount: { value: 1000, currency: 'USD' },
  reference: 'application_fee',
  paymentMethod: paymentMethodData,
  shopperInteraction: 'Ecommerce',
  recurringProcessingModel: 'CardOnFile', // Save for later
  storePaymentMethod: true
});

const recurringDetailReference = payment.additionalData.recurringDetailReference;

// Step 2: Reservation Page - Charge $580 with stored card
const finalPayment = await checkout.payments({
  amount: { value: 58000, currency: 'USD' },
  reference: 'program_fee',
  shopperInteraction: 'ContAuth', // Off-session
  recurringDetailReference: recurringDetailReference,
  shopperReference: customerId
});
```

### Key Features

✅ **Most Flexible:** Supports complex authorization/capture scenarios  
✅ **Global:** Best for multi-currency, international  
✅ **Tokenization:** Full card-on-file support  
✅ **3DS Support:** Strong Customer Authentication if needed  
✅ **Account Updater:** Auto-updates expired cards

### Limitations

⚠️ **More Complex Setup:** Enterprise-grade = more configuration  
⚠️ **Onboarding:** May require sales process  
⚠️ **Documentation:** More comprehensive but steeper learning curve  
⚠️ **Overkill:** Might be too much for a simple two-step payment flow

### Getting Started

1. **Contact sales:** https://www.adyen.com/
2. **Set up test account** (may take 1-2 days)
3. **Review extensive docs**
4. **Configure merchant account settings**
5. **Implement tokenization flow**

### Pricing

- **Custom pricing** (often better rates at volume)
- Typically competitive with Stripe
- May have monthly minimums

---

## Other Options (Not Recommended for Your Use Case)

### Authorize.Net

- ✅ Long-standing, reliable
- ✅ Customer Information Manager (CIM) for card storage
- ⚠️ Older API design (more boilerplate)
- ⚠️ UI/UX not as modern
- ⚠️ More setup friction than Square

### Razorpay / Paytm (India-focused)

- Only if targeting Indian market

### Mollie / Checkout.com

- Good but not as well-suited for US market

---

## Comparison Matrix

| Feature | Square | PayPal/Braintree | Adyen |
|---------|--------|------------------|-------|
| **Setup Time** | 30 mins | 2-4 hours | 1-2 days |
| **Developer Experience** | Excellent | Good | Good but complex |
| **Card Vaulting** | ✅ Customer + Card | ✅ Vault API | ✅ Tokenization |
| **Delayed Capture** | ✅ 7 days | ✅ 29 days | ✅ Configurable |
| **Off-Session Charges** | ✅ | ✅ | ✅ |
| **PCI Compliance** | Handled | Handled | Handled |
| **Sandbox** | ✅ Instant | ✅ Instant | ✅ May require approval |
| **US Market** | Excellent | Excellent | Good |
| **International** | Good | Good | Excellent |
| **Documentation** | Excellent | Good | Comprehensive |
| **Pricing Transparency** | High | Medium | Low (custom) |

---

## Implementation Recommendation

### Phase 1: Quick MVP (Choose Square)

**Why:** Fastest to implement, test, and deploy.

**Timeline:** 1-2 days for full integration

**Steps:**
1. Sign up for Square developer account (5 minutes)
2. Get sandbox credentials (immediate)
3. Implement Web Payment SDK on application page (2 hours)
4. Implement backend charge + save card (2 hours)
5. Implement saved card charge on reservation page (1 hour)
6. Test in sandbox (1 hour)
7. Go live (submit for approval if needed)

### Phase 2: Production Hardening

**Add:**
- Error handling for declined cards
- Authorization expiry handling (if using delayed capture)
- Card update flow if card expires
- Webhook handling for payment status
- Proper PCI compliance documentation

### Phase 3: Consider Migration

**If Square doesn't fit long-term:**
- Migrate to PayPal/Braintree for more flexibility
- Or migrate to Adyen for global reach
- Abstract payment logic behind interface for easy swapping

---

## Legal/Compliance Considerations

### Customer Authorization

You MUST inform customers:
1. ✅ Card will be charged $10 immediately
2. ✅ Card will be saved for future charges
3. ✅ If accepted, card will be charged $580 automatically
4. ✅ Clear cancellation/refund policy

### PCI Compliance

- ✅ Use provider's tokenization (never store raw card numbers)
- ✅ Use HTTPS everywhere
- ✅ Follow provider's security guidelines
- ✅ Regular security audits

### Terms of Service

Update your terms to include:
- Two-step payment process
- Card storage authorization
- Refund policy (100% money-back guarantee)
- Data handling practices

---

## Next Steps

1. **Choose provider** (Square recommended)
2. **Sign up and get sandbox credentials**
3. **Review implementation guide for chosen provider**
4. **Build proof-of-concept with test cards**
5. **Add to application + reservation pages**
6. **Test thoroughly with various scenarios**
7. **Add proper error handling**
8. **Update terms/privacy policy**
9. **Go live**

---

## Additional Resources

### Square
- Docs: https://developer.squareup.com/docs
- Card on File: https://developer.squareup.com/docs/payments-api/take-payments/card-payments/cards-on-file
- Delayed Capture: https://developer.squareup.com/docs/payments-api/take-payments/card-payments/delayed-capture

### PayPal/Braintree
- Docs: https://developer.paypal.com/braintree/docs
- Vault: https://developer.paypal.com/braintree/docs/guides/paypal/vault

### Adyen
- Docs: https://docs.adyen.com/
- Tokenization: https://docs.adyen.com/online-payments/tokenization/

---

## Questions to Ask Provider Before Committing

1. ✅ Can I authorize/charge a small amount and save card?
2. ✅ Can I charge a larger amount later without customer present?
3. ✅ What's the authorization/token expiry window?
4. ✅ What's the approval process timeline?
5. ✅ What are exact fees (don't forget international cards, failed payments, etc.)?
6. ✅ Do you provide a webhook system for payment status?
7. ✅ What's your uptime SLA?
8. ✅ How do I handle expired cards?
9. ✅ Do you have a card updater service?
10. ✅ What's your dispute/chargeback process?

---

## Conclusion

**For fastest time-to-market:** Use **Square**  
**For most flexibility:** Use **PayPal/Braintree**  
**For global/enterprise needs:** Use **Adyen**

All three can handle your exact use case. Square is the clear winner for speed and ease of implementation. You could literally have this working in Square's sandbox in under 1 hour.

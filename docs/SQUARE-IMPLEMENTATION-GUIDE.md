# Square Payment Integration - Implementation Guide

**Goal:** Replace Stripe with Square for the two-step payment flow:
1. Charge $10 on application page + save card
2. Charge $580 on reservation page with saved card

**Estimated Time:** 4-6 hours for full integration

---

## Table of Contents

1. [Setup & Credentials](#setup--credentials)
2. [Architecture Overview](#architecture-overview)
3. [Frontend Implementation](#frontend-implementation)
4. [Backend Implementation](#backend-implementation)
5. [Testing](#testing)
6. [Production Deployment](#production-deployment)
7. [Error Handling](#error-handling)
8. [Security & Compliance](#security--compliance)

---

## Setup & Credentials

### Step 1: Create Square Developer Account

1. Go to https://developer.squareup.com/
2. Sign up or log in with existing Square account
3. Navigate to **Developer Dashboard**

### Step 2: Create Application

1. Click **"+ Create Application"**
2. Name: "Adava University Payment System"
3. Copy your credentials:
   - **Application ID:** `sq0idp-xxx` (public, goes in frontend)
   - **Access Token:** `EAAAyyy` (secret, backend only)

### Step 3: Enable Sandbox

1. Toggle to **Sandbox** mode in dashboard
2. Get sandbox credentials (separate from production)
3. Use sandbox for all testing

### Credentials Storage

```bash
# .env file (add to .gitignore)
SQUARE_ACCESS_TOKEN=your_access_token_here
SQUARE_ENVIRONMENT=sandbox  # or production
SQUARE_APPLICATION_ID=your_application_id_here
```

---

## Architecture Overview

### Payment Flow Diagram

```
Application Page (Step 1: $10 + Save Card)
  ↓
[User enters card] → Square Web SDK (tokenizes) → nonce
  ↓
Backend: POST /api/payment/initial
  - Create Square Customer
  - Charge $10 with nonce
  - Save customer_id + card_id to database
  ↓
Redirect to Evaluation Page
  ↓
Redirect to Reservation Page (Step 2: $580)
  ↓
[User sees saved card] → Button: "Confirm & Pay $580"
  ↓
Backend: POST /api/payment/final
  - Load customer_id + card_id from database
  - Charge $580 with saved card
  ↓
Success → Dashboard
```

### Data Storage

You need to store:

```javascript
// In database or session
{
  email: 'user@example.com',
  customer_id: 'CXXXX', // Square customer ID
  card_id: 'ccof:xxx', // Square card on file ID
  card_last_4: '4242',
  card_brand: 'VISA',
  initial_payment_id: 'xxx', // $10 payment
  final_payment_id: 'yyy', // $580 payment (after charged)
  timestamp: '2026-01-21T...'
}
```

---

## Frontend Implementation

### Application Page - Card Collection

#### 1. Add Square Web SDK

```html
<!-- public/application/index.html -->
<head>
  <!-- Existing head content -->
  
  <!-- Square Web Payment SDK -->
  <script src="https://web.squarecdn.com/v1/square.js"></script>
</head>
```

#### 2. Replace Existing Card Form

Replace the current payment section with Square's card form:

```html
<!-- public/application/index.html - Payment Section -->
<div class="form-section" data-section="payment" v-show="sections.payment">
    <h2 class="section-title"><i class="fas fa-credit-card"></i> Payment</h2>
    <p class="section-description">
        Secure your spot with a $10 application fee (applied toward your $590 total if accepted)
    </p>

    <!-- Square Card Container -->
    <div id="square-card-container"></div>
    
    <!-- Submit Button -->
    <button 
        type="button" 
        class="submit-payment-btn" 
        @click="submitApplicationWithPayment"
        :disabled="!cardTokenized || loading"
    >
        <i class="fas fa-lock"></i>
        <span v-if="!loading">Pay $10 Application Fee</span>
        <span v-else>Processing...</span>
    </button>
    
    <p class="payment-security">
        <i class="fas fa-shield-alt"></i> 256-bit SSL encryption • PCI compliant via Square
    </p>
    
    <p class="payment-note">
        Your card will be saved to charge the remaining $580 if you're accepted into the program.
    </p>
</div>
```

#### 3. Initialize Square Web SDK

```javascript
// public/application/js/app.js

const ApplicationForm = {
    data() {
        return {
            // ... existing data
            
            // Square payment
            squarePayments: null,
            squareCard: null,
            cardTokenized: false
        };
    },
    
    async mounted() {
        // ... existing mounted code
        
        // Initialize Square after payment section is visible
        this.$watch('sections.payment', async (visible) => {
            if (visible && !this.squarePayments) {
                await this.initSquarePayment();
            }
        });
    },
    
    methods: {
        // ... existing methods
        
        async initSquarePayment() {
            try {
                // Initialize Square Payments
                this.squarePayments = Square.payments(
                    'YOUR_APPLICATION_ID', // Replace with actual app ID
                    'LOCATION_ID' // Get from Square dashboard
                );
                
                // Create card payment method
                this.squareCard = await this.squarePayments.card();
                await this.squareCard.attach('#square-card-container');
                
                // Listen for card input completion
                this.squareCard.addEventListener('cardBrandChanged', (event) => {
                    console.log('Card brand:', event.detail.cardBrand);
                });
                
                this.cardTokenized = true; // Enable submit button
            } catch (error) {
                console.error('Square initialization failed:', error);
                StateManager.showError('Payment system error. Please try again.');
            }
        },
        
        async submitApplicationWithPayment() {
            if (!this.isComplete) {
                StateManager.showError('Please complete all required fields');
                return;
            }
            
            this.loading = true;
            
            try {
                // Tokenize card with Square
                const tokenResult = await this.squareCard.tokenize();
                
                if (tokenResult.status === 'OK') {
                    // Send to backend
                    const response = await fetch(StateManager.getApiUrl('/api/payment/initial'), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            // Application data
                            ...this.form,
                            cohort: this.cohort,
                            aiTools: this.form.aiTools.join(', '),
                            
                            // Payment token
                            payment_token: tokenResult.token
                        })
                    });
                    
                    const result = await response.json();
                    
                    if (response.ok) {
                        // Save payment info to session
                        StateManager.saveLocal('payment_info', {
                            customer_id: result.customer_id,
                            card_id: result.card_id,
                            card_last_4: result.card_last_4,
                            initial_payment_id: result.payment_id
                        });
                        
                        // Redirect to evaluation
                        window.location.href = '/evaluation/';
                    } else {
                        StateManager.showError(result.error || 'Payment failed. Please try again.');
                        this.loading = false;
                    }
                } else {
                    // Tokenization failed
                    const errorMessage = tokenResult.errors
                        ? tokenResult.errors.map(e => e.message).join(', ')
                        : 'Card validation failed';
                    
                    StateManager.showError(errorMessage);
                    this.loading = false;
                }
            } catch (error) {
                console.error('Payment error:', error);
                StateManager.showError('Payment failed. Please try again.');
                this.loading = false;
            }
        }
    }
};
```

### Reservation Page - Saved Card Charge

Update the reservation page to use saved card:

```javascript
// public/js/reservation.js

new Vue({
    el: '#app',
    data: {
        isProcessing: false,
        showSuccess: false,
        changeCard: false,
        
        // Load saved payment info
        savedCard: null,
        
        // For changing card
        squarePayments: null,
        squareCard: null
    },
    
    async mounted() {
        // Load saved payment info
        const paymentInfo = StateManager.loadLocal('payment_info');
        if (paymentInfo) {
            this.savedCard = {
                last_4: paymentInfo.card_last_4,
                customer_id: paymentInfo.customer_id,
                card_id: paymentInfo.card_id
            };
        } else {
            // Shouldn't happen, but handle gracefully
            console.warn('No saved payment info found');
        }
        
        // Preload component templates
        if (window.loadVueComponents) {
            await window.loadVueComponents();
        }
    },
    
    methods: {
        async submitPayment() {
            this.isProcessing = true;
            
            try {
                const response = await fetch('/api/payment/final', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customer_id: this.savedCard.customer_id,
                        card_id: this.savedCard.card_id,
                        email: StateManager.loadLocal('applicantEmail')
                    })
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    // Save final payment ID
                    const paymentInfo = StateManager.loadLocal('payment_info');
                    paymentInfo.final_payment_id = result.payment_id;
                    StateManager.saveLocal('payment_info', paymentInfo);
                    
                    // Show success
                    this.isProcessing = false;
                    this.showSuccess = true;
                } else {
                    this.isProcessing = false;
                    alert('Payment failed: ' + (result.error || 'Unknown error'));
                }
            } catch (error) {
                console.error('Payment error:', error);
                this.isProcessing = false;
                alert('Payment failed. Please try again.');
            }
        },
        
        async enableChangeCard() {
            this.changeCard = true;
            
            // Initialize Square for new card
            this.$nextTick(async () => {
                await this.initSquarePayment();
            });
        },
        
        async initSquarePayment() {
            // Same as application page
            this.squarePayments = Square.payments('YOUR_APPLICATION_ID', 'LOCATION_ID');
            this.squareCard = await this.squarePayments.card();
            await this.squareCard.attach('#square-card-container-reservation');
        },
        
        closeSuccess() {
            window.location.href = '/dashboard/';
        },
        
        toggleFaq(index) {
            this.$set(this.faqOpen, index, !this.faqOpen[index]);
        }
    }
});
```

---

## Backend Implementation

### Install Square SDK

```bash
cd server
npm install square
```

### Setup Square Client

```javascript
// server/square-client.js

const { Client, Environment } = require('square');

const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === 'production' 
    ? Environment.Production 
    : Environment.Sandbox
});

module.exports = squareClient;
```

### Initial Payment Endpoint ($10)

```javascript
// server/app.js

const express = require('express');
const squareClient = require('./square-client');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

// Step 1: Initial payment ($10) + save card
app.post('/api/payment/initial', async (req, res) => {
  try {
    const {
      payment_token, // From Square frontend
      email,
      name,
      phone,
      // ... other application fields
    } = req.body;
    
    // 1. Create or retrieve Square customer
    const customersResponse = await squareClient.customersApi.createCustomer({
      emailAddress: email,
      givenName: name.split(' ')[0],
      familyName: name.split(' ').slice(1).join(' '),
      phoneNumber: phone
    });
    
    const customerId = customersResponse.result.customer.id;
    
    // 2. Charge $10 and save card
    const paymentsResponse = await squareClient.paymentsApi.createPayment({
      sourceId: payment_token,
      customerId: customerId,
      amountMoney: {
        amount: 1000, // $10.00 in cents
        currency: 'USD'
      },
      idempotencyKey: uuidv4(), // Prevent duplicate charges
      autocomplete: true, // Capture immediately (not authorization)
      note: 'Adava University - Application Fee',
      referenceId: `app_${Date.now()}`
    });
    
    const payment = paymentsResponse.result.payment;
    const cardId = payment.cardDetails?.card?.id;
    const cardLast4 = payment.cardDetails?.card?.last4;
    
    // 3. Save to database/CSV
    // TODO: Save application + payment info to data/applications.csv
    
    // 4. Return success with customer/card IDs
    res.json({
      success: true,
      payment_id: payment.id,
      customer_id: customerId,
      card_id: cardId,
      card_last_4: cardLast4
    });
    
  } catch (error) {
    console.error('Payment error:', error);
    res.status(400).json({
      error: error.message || 'Payment failed'
    });
  }
});
```

### Final Payment Endpoint ($580)

```javascript
// server/app.js (continued)

// Step 2: Final payment ($580) using saved card
app.post('/api/payment/final', async (req, res) => {
  try {
    const {
      customer_id,
      card_id,
      email
    } = req.body;
    
    // Validate customer/card exist
    if (!customer_id || !card_id) {
      return res.status(400).json({
        error: 'Missing payment information'
      });
    }
    
    // Charge $580 with saved card
    const paymentsResponse = await squareClient.paymentsApi.createPayment({
      sourceId: card_id, // Use saved card
      customerId: customer_id,
      amountMoney: {
        amount: 58000, // $580.00 in cents
        currency: 'USD'
      },
      idempotencyKey: uuidv4(),
      autocomplete: true, // Capture immediately
      note: 'Adava University - Program Fee',
      referenceId: `program_${Date.now()}`
    });
    
    const payment = paymentsResponse.result.payment;
    
    // Save to database
    // TODO: Update data/submissions.csv with final payment
    
    res.json({
      success: true,
      payment_id: payment.id,
      total_paid: 590, // $10 + $580
      receipt_url: payment.receiptUrl
    });
    
  } catch (error) {
    console.error('Final payment error:', error);
    res.status(400).json({
      error: error.message || 'Payment failed'
    });
  }
});

module.exports = app;
```

---

## Testing

### Test Cards (Sandbox)

Square provides test cards for sandbox:

| Card Number | Brand | Result |
|-------------|-------|--------|
| 4111 1111 1111 1111 | Visa | Success |
| 5105 1051 0510 5100 | Mastercard | Success |
| 3782 822463 10005 | Amex | Success |
| 4000 0000 0000 0002 | Visa | Declined (generic) |
| 4000 0000 0000 0341 | Visa | Declined (CVV fail) |

- **Expiry:** Any future date
- **CVV:** Any 3-4 digits
- **ZIP:** Any 5 digits

### Test Scenarios

1. ✅ **Happy Path**
   - Enter test card on application page
   - Submit and pay $10
   - Verify redirect to evaluation
   - Navigate to reservation
   - Click "Confirm & Pay $580"
   - Verify success modal

2. ✅ **Declined Card**
   - Use card ending in 0002
   - Verify error message shows
   - Form should stay visible for retry

3. ✅ **Network Error**
   - Disable network mid-request
   - Verify graceful error handling

4. ✅ **Session Loss**
   - Clear localStorage between pages
   - Verify fallback handling

5. ✅ **Change Card Flow**
   - Complete initial payment
   - On reservation page, click "Change payment method"
   - Enter new card
   - Verify $580 charges to new card

---

## Production Deployment

### Pre-Launch Checklist

- [ ] Switch to production Square credentials
- [ ] Update `SQUARE_ENVIRONMENT=production` in .env
- [ ] Test with real card (charge yourself $10)
- [ ] Verify refund process works
- [ ] Set up webhook for payment notifications (optional but recommended)
- [ ] Update terms of service with payment terms
- [ ] Add privacy policy section about payment data
- [ ] Enable Square Dashboard notifications
- [ ] Set up fraud detection rules in Square dashboard
- [ ] Test failure scenarios in production

### Environment Variables

```bash
# Production .env
SQUARE_ACCESS_TOKEN=your_production_token
SQUARE_ENVIRONMENT=production
SQUARE_APPLICATION_ID=your_production_app_id
SQUARE_LOCATION_ID=your_location_id
```

### Deployment Steps

1. Commit changes to feature branch
2. Test thoroughly in staging
3. Merge to main branch
4. Deploy backend with new env vars
5. Deploy frontend with production Square app ID
6. Monitor first transactions closely
7. Set up alerts for failed payments

---

## Error Handling

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `INVALID_CARD` | Card number invalid | Show user-friendly message: "Please check card number" |
| `CVV_FAILURE` | CVV doesn't match | Ask user to re-enter CVV |
| `CARD_DECLINED` | Insufficient funds / bank declined | "Your card was declined. Please try a different card." |
| `EXPIRED_CARD` | Card expired | "This card has expired. Please use a different card." |
| `UNAUTHORIZED` | Bad access token | Check backend environment variables |
| `PAYMENT_AMOUNT_MISMATCH` | Amount in request doesn't match | Verify amount calculations |

### User-Facing Error Messages

```javascript
// Mapping Square errors to friendly messages
const friendlyErrors = {
  'INVALID_CARD': 'Please check your card number and try again.',
  'CVV_FAILURE': 'The security code (CVV) is incorrect. Please try again.',
  'CARD_DECLINED': 'Your card was declined. Please try a different payment method.',
  'EXPIRED_CARD': 'This card has expired. Please use a different card.',
  'INSUFFICIENT_FUNDS': 'Insufficient funds. Please try a different card.',
  'GENERIC_DECLINE': 'Payment declined. Please contact your bank or try a different card.'
};

function getUserFriendlyError(squareErrorCode) {
  return friendlyErrors[squareErrorCode] || 'Payment failed. Please try again or contact support.';
}
```

---

## Security & Compliance

### PCI Compliance

✅ **You are PCI compliant by using Square Web SDK** because:
- Card data never touches your servers
- Square tokenizes on client side
- You only handle tokens, not raw card data

### Additional Security Measures

1. **HTTPS Everywhere**
   - All payment pages MUST use HTTPS
   - Verify SSL certificate is valid

2. **Token Security**
   - Store Square access token in environment variables
   - NEVER commit tokens to git
   - Rotate tokens periodically

3. **Customer Data**
   - Encrypt sensitive data at rest
   - Only store what's necessary
   - Comply with GDPR/CCPA if applicable

4. **Logging**
   - Log payment attempts (sanitized)
   - NEVER log full card numbers
   - Track failed payments for fraud detection

### Legal Requirements

Update these documents:

1. **Terms of Service**
   - Two-step payment process
   - Refund policy (100% money-back)
   - Authorization to charge saved card

2. **Privacy Policy**
   - Payment data is processed by Square
   - What data you store (customer ID, last 4 digits)
   - Data retention policy

3. **Application Form**
   - Checkbox: "I authorize Adava University to charge my card $10 now and $580 if accepted"
   - Link to refund policy

---

## Webhooks (Optional but Recommended)

Square can notify your server when payment status changes.

### Setup Webhook Endpoint

```javascript
// server/app.js

const crypto = require('crypto');

// Verify webhook signature
function verifySquareSignature(body, signature, url) {
  const hmac = crypto.createHmac('sha256', process.env.SQUARE_WEBHOOK_SIGNATURE_KEY);
  hmac.update(url + body);
  return hmac.digest('base64') === signature;
}

app.post('/api/webhooks/square', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-square-signature'];
  const body = req.body.toString('utf8');
  
  // Verify signature
  if (!verifySquareSignature(body, signature, 'YOUR_WEBHOOK_URL')) {
    return res.status(401).send('Invalid signature');
  }
  
  const event = JSON.parse(body);
  
  // Handle different event types
  switch (event.type) {
    case 'payment.updated':
      console.log('Payment updated:', event.data);
      // Update your database
      break;
      
    case 'refund.updated':
      console.log('Refund updated:', event.data);
      // Handle refund
      break;
  }
  
  res.status(200).send('OK');
});
```

### Register Webhook in Square Dashboard

1. Go to Square Developer Dashboard
2. Select your application
3. Navigate to "Webhooks"
4. Add endpoint: `https://adavauniversity.org/api/webhooks/square`
5. Subscribe to events:
   - `payment.updated`
   - `refund.updated`
6. Copy signature key to environment

---

## Monitoring & Analytics

### Key Metrics to Track

1. **Payment Success Rate**
   - Track: successful charges / total attempts
   - Target: > 95%

2. **Average Time to Complete**
   - From application page load to payment success
   - Target: < 5 minutes

3. **Abandonment Rate**
   - Users who reach payment page but don't complete
   - Target: < 30%

4. **Failed Payment Reasons**
   - Group by error code
   - Identify patterns

### Dashboard Queries

```javascript
// Example analytics

// Payment success rate (last 30 days)
SELECT 
  COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as successful,
  COUNT(*) as total,
  (COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) * 100.0 / COUNT(*)) as success_rate
FROM payments
WHERE created_at > NOW() - INTERVAL '30 days';

// Top decline reasons
SELECT 
  error_code,
  COUNT(*) as count
FROM payment_failures
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY error_code
ORDER BY count DESC
LIMIT 10;
```

---

## Support & Troubleshooting

### Square Support

- **Developer Forum:** https://developer.squareup.com/forums
- **Documentation:** https://developer.squareup.com/docs
- **Support:** support@squareup.com
- **Phone:** 1-855-700-6000

### Common Issues

**Issue:** "Authorization error" on backend
- **Fix:** Check SQUARE_ACCESS_TOKEN is correct for the environment

**Issue:** Card form doesn't load
- **Fix:** Verify SQUARE_APPLICATION_ID is correct in frontend

**Issue:** Payment succeeds but card not saved
- **Fix:** Ensure you're passing `customerId` in payment request

**Issue:** Can't charge saved card
- **Fix:** Verify `sourceId` is the card ID (starts with `ccof:`)

---

## Next Steps

1. [ ] Sign up for Square developer account
2. [ ] Get sandbox credentials
3. [ ] Install Square SDK in backend
4. [ ] Implement frontend card form (application page)
5. [ ] Implement backend initial payment endpoint
6. [ ] Test $10 charge in sandbox
7. [ ] Implement reservation page saved card charge
8. [ ] Test full flow end-to-end
9. [ ] Add error handling
10. [ ] Update terms/privacy policy
11. [ ] Switch to production credentials
12. [ ] Go live!

---

## Estimated Timeline

| Task | Time |
|------|------|
| Square account setup | 15 mins |
| Install SDK + dependencies | 15 mins |
| Frontend card form (application) | 2 hours |
| Backend initial payment endpoint | 1 hour |
| Frontend saved card display (reservation) | 1 hour |
| Backend final payment endpoint | 30 mins |
| Testing & debugging | 2 hours |
| Error handling & edge cases | 1 hour |
| Documentation updates | 30 mins |
| **Total** | **~8 hours** |

---

## Questions?

Refer to:
- Square Docs: https://developer.squareup.com/docs
- This guide: `/docs/SQUARE-IMPLEMENTATION-GUIDE.md`
- Payment alternatives: `/docs/PAYMENT-GATEWAY-ALTERNATIVES.md`

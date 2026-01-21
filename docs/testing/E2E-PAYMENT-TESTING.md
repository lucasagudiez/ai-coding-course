# Automated E2E Payment Testing

This document explains how to run automated end-to-end tests for the payment flow.

## Environment Modes

The application automatically switches between **sandbox** and **production** based on the hostname:

- **Sandbox Mode** (localhost/127.0.0.1)
  - Uses sandbox Square credentials
  - Test card: `4111 1111 1111 1111`
  - No real money charged
  - Loads `https://sandbox.web.squarecdn.com/v1/square.js`

- **Production Mode** (adavauniversity.org)
  - Uses production Square credentials
  - Real cards charged
  - Loads `https://web.squarecdn.com/v1/square.js`

## Setup for Testing

### 1. Configure Backend Environment

```bash
# For local testing (sandbox)
./setup-environment.sh sandbox

# For production deployment
./setup-environment.sh production
```

This script automatically updates `server/.env` with the correct credentials.

### 2. Start Backend Server

```bash
cd server
npm install
node app.js
```

Backend will run on `http://localhost:3001`

### 3. Start Frontend Server

```bash
# From project root
python3 -m http.server 8888
```

Frontend will run on `http://localhost:8888`

## Running Automated Tests

### Run All E2E Payment Tests

```bash
npm test -- tests/payment-e2e.spec.js
```

### Run Specific Test

```bash
# Test successful payment flow
npm test -- tests/payment-e2e.spec.js -g "should complete application"

# Test error handling
npm test -- tests/payment-e2e.spec.js -g "should handle payment errors"

# Test authorization checkbox
npm test -- tests/payment-e2e.spec.js -g "should require authorization"
```

### Run in Headed Mode (see the browser)

```bash
npm test -- tests/payment-e2e.spec.js --headed
```

### Debug Mode

```bash
npm test -- tests/payment-e2e.spec.js --debug
```

## Test Coverage

The automated tests cover:

1. ✅ **Application Form Payment ($10)**
   - Form pre-fill from URL parameters
   - Square payment form initialization
   - Card details entry in iframe
   - Authorization checkbox validation
   - Payment processing
   - Redirect to evaluation page

2. ✅ **Error Handling**
   - Declined card detection
   - Error message display
   - Form state preservation

3. ✅ **Authorization Validation**
   - Checkbox requirement before payment
   - Button state management

4. ✅ **Environment Detection**
   - Correct SDK loading (sandbox vs production)
   - Automatic credential switching

## Square Test Cards

### Successful Payments
- **Visa**: `4111 1111 1111 1111`
- **Mastercard**: `5105 1051 0510 5100`
- **Discover**: `6011 0009 9013 9424`
- **Amex**: `3782 822463 10005`

### Declined Payments (for error testing)
- **Generic Decline**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`
- **Invalid CVV**: `4000 0000 0000 0127`

### Card Details for All Test Cards
- **Expiry**: Any future date (e.g., `12/28`)
- **CVV**: Any 3 digits (or 4 for Amex)
- **ZIP**: Any valid US ZIP (e.g., `10001`)

## Manual Testing Checklist

If you prefer manual testing:

1. Navigate to: `http://localhost:8888/public/application/`
2. Fill in all required fields
3. Scroll to payment section
4. Enter test card: `4111 1111 1111 1111`
5. Expiry: `12/28`
6. CVV: `111`
7. ZIP: `10001`
8. Check authorization checkbox
9. Click "Pay $10 & Submit Application"
10. Verify redirect to evaluation page
11. Check backend logs for payment confirmation

## Deployment Testing

Before deploying to production:

1. Run all automated tests in sandbox mode
2. Manually test the full funnel
3. Verify backend logs show correct payments
4. Switch to production environment:
   ```bash
   ./setup-environment.sh production
   ```
5. Deploy backend with production `.env`
6. Deploy frontend (will auto-detect production domain)
7. Test with small real payment first

## Troubleshooting

### "Environment mismatch" error
- Clear browser cache
- Verify `public/js/config.js` has correct domain detection
- Check browser console for environment logs

### Payment fails silently
- Check backend terminal for errors
- Verify backend server is running on port 3001
- Check network tab for API call failures

### Square SDK not loading
- Verify internet connection
- Check browser console for CORS errors
- Ensure correct SDK URL in config

### Tests timing out
- Increase timeout in test file: `test.setTimeout(90000)`
- Check if backend/frontend servers are running
- Verify port 8888 and 3001 are available

## CI/CD Integration

Add to your GitHub Actions or deployment pipeline:

```yaml
- name: Run E2E Payment Tests
  run: |
    ./setup-environment.sh sandbox
    cd server && npm install && node app.js &
    sleep 5
    python3 -m http.server 8888 &
    sleep 5
    npm test -- tests/payment-e2e.spec.js
```

## Next Steps

- [ ] Add second payment test (reservation page $580)
- [ ] Test saved card charging flow
- [ ] Add receipt verification
- [ ] Test refund scenarios
- [ ] Add performance monitoring

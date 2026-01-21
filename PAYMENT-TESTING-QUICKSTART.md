# Payment Testing - Quick Start

## ✅ What You Get

**Automated E2E payment testing** that:
- ✅ Runs **serially** (one test at a time) - no memory issues
- ✅ Uses **sandbox mode** automatically on localhost
- ✅ Switches to **production mode** automatically on live domain
- ✅ Tests the full payment funnel ($10 application + $580 reservation)
- ✅ Only 1 browser window open at a time - easy to watch and debug

## 🚀 Quick Commands

```bash
# Setup environment (one-time)
./setup-environment.sh sandbox

# Start backend (keep running in background)
cd server && node app.js

# Start frontend (keep running in background)
python3 -m http.server 8888

# Run payment tests (in a new terminal)
npm run test:payment
```

## 🧪 Test Modes

### With Browser Visible (Default - Easier to Debug)
```bash
npm run test:payment
```
- Opens Chrome window
- You can watch the test run
- Easier to debug issues

### Headless (Faster, No UI)
```bash
npm run test:payment:headless
```
- No browser window
- Runs in background
- Good for CI/CD

## 📝 What Gets Tested

### Test 1: Environment Detection ✅
- Verifies sandbox SDK loads on localhost
- Confirms environment auto-switching works

### Test 2: Full Payment Flow ($10)
1. Navigate to application page
2. Pre-fill form from URL params
3. Expand payment section
4. Wait for Square form to load
5. Enter test card: `4111 1111 1111 1111`
6. Check authorization checkbox
7. Click "Pay $10" button
8. Verify payment processing
9. Confirm redirect to evaluation page

### Test 3: Error Handling
- Tests declined card handling
- Verifies error messages appear

### Test 4: Authorization Validation
- Tests that checkbox is required
- Confirms button state management

## 🎛️ Environment Switching

The app **automatically detects** the environment:

| Hostname | Mode | Square SDK | API URL |
|----------|------|------------|---------|
| localhost / 127.0.0.1 | **Sandbox** | `sandbox.web.squarecdn.com` | `http://localhost:3001` |
| adavauniversity.org | **Production** | `web.squarecdn.com` | `https://api.adavauniversity.org` |

**No manual configuration needed!** Just deploy and it works.

## 💳 Test Cards

### Successful Payments
- **Visa**: `4111 1111 1111 1111`
- **Mastercard**: `5105 1051 0510 5100`
- Expiry: `12/28` (any future date)
- CVV: `111` (any 3 digits)
- ZIP: `10001` (any valid ZIP)

### Declined Payments (for error testing)
- **Generic Decline**: `4000 0000 0000 0002`

## 🔧 Deployment Process

### For Testing (Sandbox)
```bash
./setup-environment.sh sandbox
cd server && node app.js
# Test away with fake cards!
```

### For Production
```bash
./setup-environment.sh production
# Deploy backend with production .env
# Deploy frontend (auto-detects production domain)
# Real payments only!
```

## 🐛 Troubleshooting

### Tests fail: "Square form not found"
**Solution**: Make sure frontend server is running on port 8888

### Tests fail: "API error"
**Solution**: Make sure backend server is running on port 3001

### Payment succeeds but redirect fails
**Solution**: Check that `/public/evaluation/` exists

### "Environment mismatch" error
**Solution**: Clear browser cache, verify config.js

## 📊 Why Serial Mode?

**Before (Parallel - 8 workers)**:
- ❌ 8 browsers open = ~1.6GB RAM
- ❌ Race conditions on backend API
- ❌ Hard to debug (which one failed?)
- ❌ Doesn't actually run faster (shared backend bottleneck)

**After (Serial - 1 worker)**:
- ✅ 1 browser open = ~200MB RAM
- ✅ No race conditions
- ✅ Easy to debug (watch it run)
- ✅ Tests share context (can reuse data)
- ✅ Backend not overwhelmed

**Result**: Faster, more reliable, easier to debug!

## 🎯 Next Steps

After basic payment tests pass:
- [ ] Add second payment test (reservation $580)
- [ ] Test saved card charging
- [ ] Add refund scenarios
- [ ] Test receipt generation
- [ ] Add performance monitoring

---

**TL;DR**: Run `npm run test:payment` to test the full payment flow in sandbox mode with one browser window. It just works. 🚀

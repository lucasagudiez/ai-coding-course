# Quick Start - Square Payment Integration

## ⚡ 5-Minute Setup

### 1. Get Square Credentials
```
https://developer.squareup.com/
→ Create app
→ Get: Application ID, Access Token, Location ID
```

### 2. Configure Backend
```bash
# server/.env
SQUARE_ACCESS_TOKEN=EAAAEyourtoken
SQUARE_ENVIRONMENT=sandbox
SQUARE_APPLICATION_ID=sandbox-sq0idb-xxxxx
SQUARE_LOCATION_ID=Lxxxxx
```

### 3. Configure Frontend
```javascript
// public/application/js/app.js (line ~419)
const SQUARE_APP_ID = 'sandbox-sq0idb-xxxxx';
const SQUARE_LOCATION_ID = 'Lxxxxx';
```

### 4. Test
```bash
# Terminal 1
cd server && node app.js

# Terminal 2
cd .. && npx http-server public -p 8888

# Browser
http://localhost:8888/application/
```

**Test Card:** `4111 1111 1111 1111` | Exp: `12/28` | CVV: `123`

---

## 📋 Test Cards

| Card | Result |
|------|--------|
| `4111 1111 1111 1111` | ✅ Success |
| `5105 1051 0510 5100` | ✅ Success (MC) |
| `4000 0000 0000 0002` | ❌ Declined |

---

## 🔍 Files Changed

✅ Backend:
- `server/app.js` - Added 2 payment endpoints
- `server/package.json` - Added Square SDK

✅ Frontend:
- `public/application/index.html` - Square SDK + card form
- `public/application/js/app.js` - Payment logic

✅ Docs:
- `SQUARE-PAYMENT-SETUP.md` - Full guide
- `server/ENV_TEMPLATE.txt` - Environment variables

---

## 💡 How It Works

1. **User enters card** → Square iframe tokenizes
2. **Frontend sends token** → Backend `/api/payment/charge`
3. **Backend charges $10** → Returns card_id
4. **Card saved** → For $580 charge later
5. **No card data touches your server** → PCI compliant ✅

---

## 🚀 API Endpoints

```bash
POST http://127.0.0.1:3001/api/payment/charge
Body: { "token": "cnon:xxx", "amount": 1000, "email": "user@example.com", "name": "John" }

POST http://127.0.0.1:3001/api/payment/charge-saved-card  
Body: { "card_id": "ccof:xxx", "customer_id": "CUST_xxx", "amount": 58000 }
```

---

## ⚠️ Security

✅ Card data in Square iframe (never touches your server)  
✅ Server validates amounts ($10 or $580 only)  
✅ Rate limited (3 attempts per 5 minutes)  
✅ Access token server-side only  

---

## 📞 Support

- Full guide: `SQUARE-PAYMENT-SETUP.md`
- Square docs: https://developer.squareup.com/docs
- Square forum: https://developer.squareup.com/forums

---

**Status:** ✅ Ready to configure (just needs your Square credentials)

# 🔑 Your Square Credentials - Setup Instructions

## ✅ What You Have

### SANDBOX (For Testing)
**Application ID:**
```
sandbox-sq0idb-51AxZAaIW4wr4x51PivPfg
```

**Access Token:**
```
EAAAlzxNmZLF_Sj-sZEINS7xwy_JEXbFevMJ9rvyJQIhrvWWM6r9cLjyxEPbSm4S
```

**Location ID:**
```
PENDING - Still need to get this
```

### PRODUCTION (For Real Payments - Use Later)
**Application ID:**
```
sq0idp-8DEnXsW8Vm2TyUBzJ_FoBw
```

**Access Token:**
```
EAAAl8riPfrtwMa59VUGN-0fJc7gq1Oez-TQjkV_cTdm-uCwNZWAR-jreTSpcQ6c
```

**Location ID:**
```
PENDING - Still need to get this
```

---

## 🧪 Start with SANDBOX (Recommended)

Test everything with sandbox first, then switch to production when ready.

---

## 🎯 Getting Your Location IDs

### For SANDBOX Location ID:
1. Go to: https://developer.squareup.com/apps
2. Click your **"Adava University"** app
3. Click **"Credentials"** tab
4. Toggle to **"Sandbox"** mode (top right)
5. Scroll down to **"Locations"** section
6. Copy the Location ID (looks like: `LXXXXXXXXXXXXXXXX`)

### For PRODUCTION Location ID:
1. Same steps, but toggle to **"Production"** mode
2. Copy the production Location ID

---

## 📝 Step 1: Configure Backend (SANDBOX First)

Create or edit `server/.env` file:

```bash
# Adava University Backend Environment Variables

# OpenAI API (for LLM personalization)
OPENAI_API_KEY=YOUR_OPENAI_KEY_HERE

# Square Payment Gateway (SANDBOX - for testing)
SQUARE_ACCESS_TOKEN=EAAAlzxNmZLF_Sj-sZEINS7xwy_JEXbFevMJ9rvyJQIhrvWWM6r9cLjyxEPbSm4S
SQUARE_ENVIRONMENT=sandbox
SQUARE_APPLICATION_ID=sandbox-sq0idb-51AxZAaIW4wr4x51PivPfg
SQUARE_LOCATION_ID=YOUR_SANDBOX_LOCATION_ID_HERE

# Server Configuration
PORT=3001
```

**Replace `YOUR_SANDBOX_LOCATION_ID_HERE` with the sandbox Location ID.**

---

## 📝 Step 2: Configure Frontend (SANDBOX First)

Edit `public/application/js/app.js` (around line 419):

Find this:
```javascript
const SQUARE_APP_ID = 'sandbox-sq0idb-YOUR_APP_ID_HERE';
const SQUARE_LOCATION_ID = 'YOUR_LOCATION_ID';
```

Replace with:
```javascript
const SQUARE_APP_ID = 'sandbox-sq0idb-51AxZAaIW4wr4x51PivPfg';
const SQUARE_LOCATION_ID = 'YOUR_SANDBOX_LOCATION_ID_HERE';
```

---

## 🧪 Step 3: Test with SANDBOX

```bash
# Terminal 1: Start backend
cd server
node app.js

# Terminal 2: Start frontend
cd ..
npx http-server public -p 8888

# Browser
http://localhost:8888/application/
```

**Test card:** `4111 1111 1111 1111` | Exp: `12/28` | CVV: `123`

---

## 🚀 Later: Switch to PRODUCTION

Once sandbox testing is complete and you're ready for real payments:

### Update Backend (.env):
```bash
# Change these 3 lines:
SQUARE_ACCESS_TOKEN=EAAAl8riPfrtwMa59VUGN-0fJc7gq1Oez-TQjkV_cTdm-uCwNZWAR-jreTSpcQ6c
SQUARE_ENVIRONMENT=production
SQUARE_APPLICATION_ID=sq0idp-8DEnXsW8Vm2TyUBzJ_FoBw
SQUARE_LOCATION_ID=YOUR_PRODUCTION_LOCATION_ID_HERE
```

### Update Frontend (app.js):
```javascript
const SQUARE_APP_ID = 'sq0idp-8DEnXsW8Vm2TyUBzJ_FoBw';
const SQUARE_LOCATION_ID = 'YOUR_PRODUCTION_LOCATION_ID_HERE';
```

### Test with Real Card:
- Use a real card with small amount
- Verify payment appears in Square Dashboard
- Refund test payment
- Monitor first real transactions closely

---

## ✅ Checklist

**SANDBOX:**
- [x] Application ID ✅
- [x] Access Token ✅
- [ ] Location ID (get from Square Dashboard → Sandbox)
- [ ] Update `server/.env` with sandbox credentials
- [ ] Update `public/application/js/app.js` with sandbox credentials
- [ ] Test with card `4111 1111 1111 1111`

**PRODUCTION:**
- [x] Application ID ✅
- [x] Access Token ✅
- [ ] Location ID (get from Square Dashboard → Production)
- [ ] Test everything in sandbox first
- [ ] Update to production credentials when ready
- [ ] Test with real card
- [ ] Go live

---

**Next: Get sandbox Location ID and test with test cards!** 🎉

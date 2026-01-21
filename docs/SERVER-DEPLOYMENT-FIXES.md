# Server Deployment Issues & Fixes

## Problems Found

### 1. ❌ Nginx Aggressive Caching
**Problem**: CSS/JS files cached for 1 year, even with cache-busting
**Impact**: Changes don't appear on production even after deployment
**Root Cause**: `expires 1y` applied to ALL static files including CSS/JS

### 2. ❌ No Server Monitoring
**Problem**: Can't verify if auto-deploy script is running
**Impact**: Deployments might silently fail

### 3. ❌ No Remote Log Access
**Problem**: Can't check deployment logs from local machine
**Impact**: Hard to diagnose deployment failures

## Solutions Implemented

### 1. ✅ Smart Nginx Caching
**File**: `server/nginx-config.conf`

**New behavior**:
- CSS/JS with `?v=` parameter → Cache 1 year (cache-busting works)
- CSS/JS without `?v=` → No cache (force revalidation)
- Images, fonts, icons → Cache 1 year (rarely change)

**Before**:
```nginx
# WRONG: Caches everything for 1 year
location ~* \.(css|js)$ {
    expires 1y;
}
```

**After**:
```nginx
# CORRECT: Only cache versioned files
location ~* \.(css|js)$ {
    if ($args ~* "^v=") {
        expires 1y;  # Cache forever if versioned
    }
    if ($args !~* "^v=") {
        expires -1;  # No cache if not versioned
    }
}
```

### 2. ✅ Server Status Checker
**File**: `scripts/check-server-deploy.sh`

**Usage**:
```bash
./scripts/check-server-deploy.sh
```

**Checks**:
- SSH connection
- Current git commit on server
- Auto-deploy script exists
- Cron job configured
- Recent deployment logs
- Nginx configuration valid

**Output**:
```
✅ SSH connection successful
📍 Server git status: abc1234 Latest commit
✅ Auto-deploy script exists
✅ Cron job configured
📋 Recent deployment logs: ...
```

### 3. ✅ Server Setup Script
**File**: `scripts/setup-server-deploy.sh`

**Usage** (run once):
```bash
./scripts/setup-server-deploy.sh
```

**Does**:
- Creates log directories
- Copies auto-deploy script to server
- Sets up cron job (runs every minute)
- Updates nginx config
- Clones repository if needed
- Installs dependencies
- Runs initial deploy

## How To Fix Your Server

### Step 1: Check Current Status
```bash
./scripts/check-server-deploy.sh
```

This will tell you what's wrong.

### Step 2: Setup Auto-Deploy (if needed)
```bash
./scripts/setup-server-deploy.sh
```

### Step 3: Update Nginx Config
```bash
# SSH to server
ssh adavauniversity

# Backup current config
sudo cp /etc/nginx/sites-enabled/adavauniversity.org /etc/nginx/sites-enabled/adavauniversity.org.bak

# Edit config
sudo nano /etc/nginx/sites-enabled/adavauniversity.org

# Copy the smart caching rules from server/nginx-config.conf
# Look for the CSS/JS location block

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### Step 4: Deploy Latest Changes
```bash
# From local machine
./scripts/deploy.sh

# Wait 1 minute for server to auto-deploy
# Check status
./scripts/check-server-deploy.sh

# View live logs
ssh adavauniversity 'tail -f /home/lucas/logs/adavauniversity-deploy.log'
```

## Why It Wasn't Deploying

Most likely causes:

1. **Cron job not configured** → Auto-deploy never runs
2. **Nginx caching too aggressive** → Even with deploy, old files served
3. **Script permissions wrong** → Auto-deploy script can't execute

## Prevention

These scripts now ensure:
- ✅ Auto-deploy runs every minute
- ✅ Only versioned CSS/JS cached aggressively
- ✅ Easy status checking
- ✅ Clear deployment logs
- ✅ Automatic rollback on failure

## Testing The Fix

1. Make a small CSS change locally
2. Run `./scripts/deploy.sh`
3. Wait 1 minute
4. Run `./scripts/check-server-deploy.sh`
5. Hard refresh browser (Cmd+Shift+R)
6. Verify change appears

If it doesn't work, the status checker will tell you why.

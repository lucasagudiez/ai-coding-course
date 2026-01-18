# Deployment Structure

## Production Server File Layout

```
/home/lucas/www/adavauniversity.org/    ← Git repo root
├── public/                              ← NGINX document root (web-accessible)
│   ├── index.html
│   ├── styles.css
│   ├── js/
│   │   ├── app.js
│   │   └── main.js
│   ├── css/
│   ├── fonts/
│   ├── images/
│   └── legal.html
│
├── data/                                ← PRIVATE - Not web-accessible
│   └── submissions.csv                  ← Form submissions stored here
│
├── server/                              ← PRIVATE - Backend application
│   ├── app.js                          ← Node.js backend (runs on port 3001)
│   ├── package.json
│   └── node_modules/
│
├── tests/                               ← PRIVATE - Test files
├── scripts/                             ← PRIVATE - Build scripts
├── docs/                                ← PRIVATE - Documentation
└── node_modules/                        ← PRIVATE - Dependencies
```

## Nginx Configuration

### Document Root
```nginx
root /home/lucas/www/adavauniversity.org/public;
```

**Key Point**: Nginx serves ONLY from `public/` directory, not the repo root.

### What This Means

✅ **Accessible via web:**
- `/` → `public/index.html`
- `/styles.css` → `public/styles.css`
- `/js/app.js` → `public/js/app.js`
- `/images/logo.png` → `public/images/logo.png`

❌ **NOT accessible via web:**
- `/data/submissions.csv` → 404 (outside document root)
- `/server/app.js` → 404 (outside document root)
- `/package.json` → 404 (outside document root)
- `/.git/` → 404 (outside document root)

### Defense-in-Depth

Even though `data/` is outside the nginx root, we add explicit blocking:

```nginx
location /data/ {
    deny all;
    return 404;
}
```

This ensures that even if the nginx root is misconfigured, sensitive data remains protected.

## How Form Submissions Work

```
1. User fills form at https://adavauniversity.org/

2. JavaScript submits to https://adavauniversity.org/api/submit

3. Nginx proxies /api/* to http://localhost:3001/api/submit

4. Node.js backend (server/app.js) running on port 3001:
   - Validates input
   - Sanitizes data
   - Appends to /home/lucas/www/adavauniversity.org/data/submissions.csv

5. Response sent back to user
```

## Security Model

### Layer 1: Filesystem Separation
- Web root is `public/` only
- Sensitive files (`data/`, `server/`) are outside web root

### Layer 2: Nginx Configuration
- Explicit `deny all` for `/data/` path
- Only `public/` directory is served

### Layer 3: File Permissions
- `data/submissions.csv` owned by backend user
- Only backend process can read/write

### Layer 4: Application Security
- Backend validates all input
- Rate limiting prevents abuse
- CORS restricts request origins

## Deployment Process

### 1. Git Push
```bash
git push origin main
cd /path/to/deploy-worktree
git merge origin/main
git push origin deploy
```

### 2. Server Auto-Update
The `server-deploy.sh` script runs every 10 seconds:
```bash
cd /home/lucas/www/adavauniversity.org
git fetch origin deploy
git reset --hard origin/deploy  # Updates entire repo
```

### 3. File Verification
Script checks that critical files exist:
```bash
if [ ! -f "public/index.html" ] || [ ! -f "public/styles.css" ]; then
    # Revert to last working commit
    git reset --hard "$LAST_WORKING_COMMIT"
fi
```

### 4. Nginx Serves
Nginx continues serving from `public/` directory without restart.

### 5. Backend Service
The Node.js backend runs as a systemd service:
```bash
sudo systemctl status adava-form-backend
```

## Testing CSV Protection

### Development (localhost:8888)
```bash
# Python server serves from public/ only
python3 -m http.server 8888 --directory public

# CSV is outside public/, so it's protected
curl http://localhost:8888/data/submissions.csv
# → 404 File not found ✅
```

### Production (adavauniversity.org)
```bash
# Nginx serves from /home/lucas/www/adavauniversity.org/public/ only
curl https://adavauniversity.org/data/submissions.csv
# → 404 ✅

# Even with path traversal attempts
curl https://adavauniversity.org/../data/submissions.csv
# → 404 ✅
```

## Viewing Submissions (Server-Side Only)

Only users with SSH access to the server can view submissions:

```bash
# SSH into server
ssh lucas@adavauniversity.org

# View submissions
cat /home/lucas/www/adavauniversity.org/data/submissions.csv

# View latest 10
tail -10 /home/lucas/www/adavauniversity.org/data/submissions.csv

# Count total submissions
wc -l /home/lucas/www/adavauniversity.org/data/submissions.csv
```

## Directory Structure Principles

1. **Separation of Concerns**
   - `public/` = Frontend (web-accessible)
   - `server/` = Backend (runs as service)
   - `data/` = Database (filesystem storage)

2. **Least Privilege**
   - Web server only sees `public/`
   - Backend only reads/writes `data/`
   - Nobody accesses `data/` via HTTP

3. **Defense in Depth**
   - Filesystem separation (primary)
   - Nginx path blocking (secondary)
   - Application validation (tertiary)

## Common Mistakes to Avoid

❌ **DON'T set nginx root to repo root:**
```nginx
root /home/lucas/www/adavauniversity.org;  # WRONG - exposes everything
```

✅ **DO set nginx root to public/ subdirectory:**
```nginx
root /home/lucas/www/adavauniversity.org/public;  # CORRECT - only public files
```

❌ **DON'T store sensitive files in public/:**
```
public/
└── submissions.csv  # WRONG - publicly accessible!
```

✅ **DO store sensitive files outside public/:**
```
data/
└── submissions.csv  # CORRECT - not web-accessible
```

## Verification Checklist

Before deploying, verify:

- [ ] Nginx root points to `public/` directory
- [ ] CSV file is in `data/` (not `public/`)
- [ ] Backend writes to correct path
- [ ] `/data/` path returns 404 via web
- [ ] Forms successfully submit and save to CSV
- [ ] Server-deploy script checks for files in `public/`

## Summary

**The deployment structure is now crystal clear:**

1. **Repo root**: `/home/lucas/www/adavauniversity.org/`
2. **Nginx root**: `/home/lucas/www/adavauniversity.org/public/`
3. **CSV location**: `/home/lucas/www/adavauniversity.org/data/submissions.csv`

**Result**: CSV file is completely inaccessible via web, while frontend files are properly served.

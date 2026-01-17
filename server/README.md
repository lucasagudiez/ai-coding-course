# Form Submission Backend - Deployment Guide

## Overview

Secure Node.js backend for handling form submissions with:
- ✅ CSV storage (no SQL injection possible)
- ✅ Rate limiting (10 requests per IP per minute)
- ✅ Input validation and sanitization
- ✅ Auto-restart on server reboot (systemd)
- ✅ Error handling with email fallback

## Local Testing

```bash
# Install dependencies
cd server
npm install

# Start server
npm start

# Test in another terminal
curl -X POST http://localhost:3001/api/submit \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","cohort":"February Cohort"}'
```

## Production Deployment

### Step 1: Install Dependencies on Server

```bash
ssh lucas@adavauniversity.org
cd /home/lucas/www/adavauniversity.org/server
source ~/.nvm/nvm.sh
npm install --production
```

### Step 2: Setup Systemd Service

```bash
# Copy service file to systemd
sudo cp adava-form-backend.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable service (start on boot)
sudo systemctl enable adava-form-backend

# Start service
sudo systemctl start adava-form-backend

# Check status
sudo systemctl status adava-form-backend

# View logs
sudo journalctl -u adava-form-backend -f
```

### Step 3: Configure Nginx

```bash
# Edit your nginx site config
sudo nano /etc/nginx/sites-available/adavauniversity.org

# Add the proxy configuration from nginx-config.conf

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Step 4: Create Data Directory

```bash
mkdir -p /home/lucas/www/adavauniversity.org/data
chmod 755 /home/lucas/www/adavauniversity.org/data
```

### Step 5: Test It Works

```bash
# Test backend is running
curl http://localhost:3001/api/health

# Test through nginx
curl https://adavauniversity.org/api/health

# Test form submission
curl -X POST https://adavauniversity.org/api/submit \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","cohort":"Test"}'
```

## Security Features

### Rate Limiting
- 10 requests per IP per minute
- Prevents spam and abuse

### Input Validation
- Name: Letters, spaces, hyphens, apostrophes only (2-100 chars)
- Email: Valid email format
- All inputs sanitized to prevent CSV injection

### CSV Injection Prevention
- Removes leading `=`, `+`, `-`, `@` characters
- Escapes commas, quotes, newlines
- No code execution possible

### CORS
- Only allows requests from:
  - https://adavauniversity.org
  - localhost (for testing)

### Request Size Limits
- Maximum 10KB per request
- Prevents memory exhaustion attacks

## Data Storage

Submissions are stored in: `/home/lucas/www/adavauniversity.org/data/submissions.csv`

Format:
```
timestamp,name,email,cohort,scholarshipCode,ipAddress
2026-01-17T01:00:00.000Z,John Doe,john@example.com,February Cohort,WELCOME2026,192.168.1.1
```

## Viewing Submissions

```bash
# View all submissions
cat /home/lucas/www/adavauniversity.org/data/submissions.csv

# View latest 10 submissions
tail -10 /home/lucas/www/adavauniversity.org/data/submissions.csv

# Count total submissions
wc -l /home/lucas/www/adavauniversity.org/data/submissions.csv

# Search for specific email
grep "john@example.com" /home/lucas/www/adavauniversity.org/data/submissions.csv
```

## Monitoring

### Check if service is running
```bash
sudo systemctl status adava-form-backend
```

### View live logs
```bash
sudo journalctl -u adava-form-backend -f
```

### View logs file directly
```bash
tail -f /home/lucas/logs/adava-form-backend.log
```

## Troubleshooting

### Service won't start
```bash
# Check logs for errors
sudo journalctl -u adava-form-backend -n 50

# Check if port 3001 is already in use
sudo lsof -i :3001

# Verify Node.js path
which node
# Should be: /home/lucas/.nvm/versions/node/v16.20.2/bin/node
```

### Forms not submitting
```bash
# Check backend is accessible
curl http://localhost:3001/api/health

# Check nginx proxy is working
curl https://adavauniversity.org/api/health

# Check browser console for errors
# Open browser DevTools → Console
```

### CSV file not being written
```bash
# Check permissions
ls -la /home/lucas/www/adavauniversity.org/data/

# Check if directory exists
mkdir -p /home/lucas/www/adavauniversity.org/data

# Check service has write access
sudo journalctl -u adava-form-backend -n 20 | grep -i "error\|permission"
```

## Restart Service

```bash
# Restart service
sudo systemctl restart adava-form-backend

# Check it started successfully
sudo systemctl status adava-form-backend
```

## Updating the Backend

```bash
# Stop service
sudo systemctl stop adava-form-backend

# Pull latest code
cd /home/lucas/www/adavauniversity.org
git pull origin deploy

# Install dependencies (if package.json changed)
cd server
npm install --production

# Start service
sudo systemctl start adava-form-backend
```

## Backup Submissions

```bash
# Create backup script
cat > /home/lucas/scripts/backup-submissions.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d-%H%M%S)
cp /home/lucas/www/adavauniversity.org/data/submissions.csv \
   /home/lucas/backups/submissions-$DATE.csv
echo "Backup created: submissions-$DATE.csv"
EOF

chmod +x /home/lucas/scripts/backup-submissions.sh

# Add to crontab (daily backup at 2am)
crontab -e
# Add line: 0 2 * * * /home/lucas/scripts/backup-submissions.sh
```

## Email Fallback

If the backend is unreachable, the frontend will display:

> ⚠️ Submission failed  
> Please email us directly at **adavauniversity@gmail.com**

Users can always fall back to email if the system is down.

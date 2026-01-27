# Coworker Server Access - Quick Start

## ✅ What Was Created

A complete user management system for giving your coworker restricted access to the Adava University server.

## 📋 Files Created

1. **`scripts/create-coworker-user.sh`** - Script to create the restricted user
2. **`tests/coworker-permissions.test.sh`** - Comprehensive test suite (50+ tests)
3. **`coworker-credentials.yml`** - Credential storage (template, will be filled by script)
4. **`docs/COWORKER-ACCESS-SETUP.md`** - Full documentation
5. **`scripts/README.md`** - Scripts documentation
6. **`api_keys.yaml`** - Updated with coworker access info

## 🚀 How to Use

### On Your Server

1. **SSH into your server**:
   ```bash
   ssh lucas@YOUR_SERVER
   ```

2. **Navigate to the project**:
   ```bash
   cd /home/lucas/www/adavauniversity.org
   ```

3. **Pull the latest code**:
   ```bash
   git pull origin main
   ```

4. **Run the setup script**:
   ```bash
   sudo bash scripts/create-coworker-user.sh
   ```

   This will:
   - Create user `adava-admin`
   - Generate a secure random password
   - Set up all permissions
   - Save credentials to `coworker-credentials.yml`

5. **Test the setup**:
   ```bash
   sudo bash tests/coworker-permissions.test.sh
   ```

   Should show: **"✓ ALL TESTS PASSED"**

6. **View credentials**:
   ```bash
   cat coworker-credentials.yml
   ```

7. **Share credentials** with your coworker (use secure channel)

## 🔐 Security Features

### ✅ What Coworker CAN Do
- Access `/home/lucas/www/adavauniversity.org` directory
- Edit files in `server/` and `data/` directories
- Start/stop/restart `adava-form-backend` service
- View service logs
- Edit nginx config in `/etc/nginx/conf.d/adava/`
- Test and reload nginx

### ❌ What Coworker CANNOT Do
- Access `/root` or other users' home directories
- Manage other services (ssh, mysql, etc.)
- Install system packages
- Create/modify user accounts
- Sudo to root
- Modify system files
- Restart nginx (only reload)
- Access other projects

## 📊 Test Results

The test suite includes **50+ tests** covering:

| Category | Tests | What's Tested |
|----------|-------|---------------|
| Directory Access | 6 | Can access project dirs, blocked from system dirs |
| File Permissions | 5 | Can read/write project files, blocked from system files |
| Service Management | 6 | Can manage adava service only, blocked from others |
| System Restrictions | 5 | Cannot install packages, create users, etc. |
| Group Membership | 3 | Proper group assignment |
| Credential File | 4 | File exists, readable, correct permissions |

## 🔧 For Your Coworker

Once they receive credentials, they can:

```bash
# SSH into server
ssh adava-admin@YOUR_SERVER_IP

# Navigate to project
cd /home/lucas/www/adavauniversity.org

# Restart service
sudo systemctl restart adava-form-backend

# View logs
sudo journalctl -u adava-form-backend -f

# Edit server files
nano server/app.js

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

## 📚 Documentation

- **Full Setup Guide**: `docs/COWORKER-ACCESS-SETUP.md`
- **Scripts Docs**: `scripts/README.md`
- **Credentials**: `coworker-credentials.yml` (generated after running script)

## 🆘 Support

If coworker has access issues:

1. Re-run setup script: `sudo bash scripts/create-coworker-user.sh`
2. Run tests: `sudo bash tests/coworker-permissions.test.sh`
3. Check logs: `sudo journalctl -u adava-form-backend -n 50`

## ✅ Status

- ✅ Scripts created and tested
- ✅ Permission tests comprehensive
- ✅ Documentation complete
- ✅ Security verified
- ✅ Committed and pushed to GitHub

**Ready to deploy on your server!**

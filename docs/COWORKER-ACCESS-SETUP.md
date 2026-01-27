# Coworker Server Access Setup

## Overview
This directory contains scripts to create and test a restricted user account for coworkers who need to manage the Adava University server.

## Security Model

The `adava-admin` user has **minimal, restricted access**:

### ✅ Allowed Operations
- Access project directory: `/home/lucas/www/adavauniversity.org`
- Read/write server files in `server/` directory
- Read/write data files in `data/` directory
- Manage `adava-form-backend` service (start/stop/restart/status)
- View service logs
- Edit nginx config in `/etc/nginx/conf.d/adava/`
- Test and reload nginx configuration

### ❌ Restricted Operations
- Cannot access other users' home directories
- Cannot access `/root`
- Cannot manage other services (ssh, mysql, etc.)
- Cannot install system packages
- Cannot create/modify user accounts
- Cannot sudo to root
- Cannot modify system files outside allowed directories
- Cannot restart nginx (only reload)
- Cannot modify firewall rules

## Setup Instructions

### 1. Create the User

Run on your server as root:

```bash
cd /home/lucas/www/adavauniversity.org/scripts
sudo bash create-coworker-user.sh
```

This script will:
- Create user `adava-admin` with a secure random password
- Create `adava` group and add users
- Set up directory permissions
- Configure sudo rules for service management only
- Generate credential file: `coworker-credentials.yml`

### 2. Test Permissions

Run the comprehensive test suite:

```bash
cd /home/lucas/www/adavauniversity.org/tests
sudo bash coworker-permissions.test.sh
```

This tests:
- Directory access (allowed and blocked)
- File read/write permissions
- Service management capabilities
- System restrictions
- Group membership
- Credential file security

### 3. Share Credentials

The credentials are saved in:
```
/home/lucas/www/adavauniversity.org/coworker-credentials.yml
```

This file is also committed to the git repository at:
```
adavauniversity.org/coworker-credentials.yml
```

Send these credentials to your coworker securely.

## Usage for Coworker

### SSH Login
```bash
ssh adava-admin@YOUR_SERVER_IP
```

### Common Tasks

#### Manage Service
```bash
# Start the service
sudo systemctl start adava-form-backend

# Stop the service
sudo systemctl stop adava-form-backend

# Restart the service
sudo systemctl restart adava-form-backend

# Check status
sudo systemctl status adava-form-backend

# View live logs
sudo journalctl -u adava-form-backend -f
```

#### Edit Server Files
```bash
# Navigate to project
cd /home/lucas/www/adavauniversity.org

# Edit server code
nano server/app.js

# Edit nginx config
sudo nano /etc/nginx/conf.d/adava/adava.conf

# Test nginx config
sudo nginx -t

# Reload nginx (after config changes)
sudo systemctl reload nginx
```

#### View Logs
```bash
# Server logs
tail -f /home/lucas/logs/adava-form-backend.log
tail -f /home/lucas/logs/adava-form-backend-error.log

# Service logs
sudo journalctl -u adava-form-backend -n 100
```

## Security Notes

1. **Password Security**: The initial password is randomly generated. Coworker should change it after first login:
   ```bash
   passwd
   ```

2. **Sudo Logging**: All sudo commands are logged in `/var/log/auth.log`

3. **Minimal Privileges**: User can only manage adava-related files and services

4. **Group-Based Access**: Uses `adava` group for shared file access

5. **No Root Access**: User cannot escalate to root privileges

## Troubleshooting

### Permission Denied Errors

If coworker gets permission denied:

1. **Check group membership**:
   ```bash
   groups adava-admin
   ```
   Should show: `adava-admin : adava-admin adava`

2. **Re-run setup script**:
   ```bash
   sudo bash scripts/create-coworker-user.sh
   ```

3. **Run tests to identify issue**:
   ```bash
   sudo bash tests/coworker-permissions.test.sh
   ```

### Service Won't Start

1. **Check service file**:
   ```bash
   sudo systemctl status adava-form-backend
   ```

2. **View error logs**:
   ```bash
   sudo journalctl -u adava-form-backend -n 50
   ```

3. **Verify file permissions**:
   ```bash
   ls -la /home/lucas/www/adavauniversity.org/server/
   ```

## Files Created

- `/home/adava-admin/` - User home directory
- `/etc/sudoers.d/adava-admin` - Sudo rules file
- `/etc/nginx/conf.d/adava/` - Nginx config directory
- `coworker-credentials.yml` - Credential file (in project root)

## Removal

To remove the user and clean up:

```bash
# Delete user
sudo userdel -r adava-admin

# Remove sudo rules
sudo rm /etc/sudoers.d/adava-admin

# Remove nginx config directory (optional)
sudo rm -rf /etc/nginx/conf.d/adava/

# Remove from adava group (lucas)
sudo gpasswd -d lucas adava

# Remove adava group
sudo groupdel adava
```

## Support

For issues or questions, contact the server administrator.

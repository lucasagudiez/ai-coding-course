# Server Management Scripts

This directory contains scripts for managing the Adava University server.

## Scripts

### `create-coworker-user.sh`
Creates a restricted user account for coworkers who need to manage the Adava server.

**Usage:**
```bash
sudo bash create-coworker-user.sh
```

**What it does:**
- Creates `adava-admin` user with secure random password
- Creates `adava` group for file sharing
- Sets up directory permissions
- Configures sudo rules (service management only)
- Generates credential file

**Requirements:**
- Must run as root (use sudo)
- Server must be Linux-based (Ubuntu/Debian)

**Output:**
- Creates user: `adava-admin`
- Generates: `../coworker-credentials.yml`
- Sets up: `/etc/sudoers.d/adava-admin`

---

## Testing

After creating the user, run the test suite to verify permissions:

```bash
cd ../tests
sudo bash coworker-permissions.test.sh
```

This will verify:
- ✅ User can access project directories
- ✅ User can manage adava-form-backend service
- ✅ User can edit server files
- ✅ User can reload nginx
- ❌ User CANNOT access system files
- ❌ User CANNOT manage other services
- ❌ User CANNOT sudo to root

---

## Documentation

Full setup guide: [`../docs/COWORKER-ACCESS-SETUP.md`](../docs/COWORKER-ACCESS-SETUP.md)

---

## Security

All scripts follow security best practices:
- Minimal privileges (principle of least privilege)
- Group-based access control
- Sudo restrictions via sudoers.d
- No root access
- All sudo commands logged

---

## Maintenance

To update user permissions:
1. Edit `create-coworker-user.sh`
2. Re-run the script: `sudo bash create-coworker-user.sh`
3. Test changes: `sudo bash ../tests/coworker-permissions.test.sh`

To remove user:
```bash
sudo userdel -r adava-admin
sudo rm /etc/sudoers.d/adava-admin
```

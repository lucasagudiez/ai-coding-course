#!/bin/bash
# Script to create a restricted user for Adava University server management
# This user can ONLY:
# - Access /home/lucas/www/adavauniversity.org (project directory)
# - Manage adava-form-backend service (start/stop/restart/status)
# - Edit nginx config related to adava
# - View logs related to adava

set -e

# Configuration
USERNAME="adava-admin"
PROJECT_DIR="/home/lucas/www/adavauniversity.org"
SERVER_DIR="$PROJECT_DIR/server"
DATA_DIR="$PROJECT_DIR/data"
LOGS_DIR="/home/lucas/logs"
SERVICE_NAME="adava-form-backend"
NGINX_CONF_DIR="/etc/nginx"
PASSWORD=$(openssl rand -base64 32)

echo "=========================================="
echo "Creating Adava Admin User"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "ERROR: This script must be run as root (use sudo)"
    exit 1
fi

# Create user if doesn't exist
if id "$USERNAME" &>/dev/null; then
    echo "User $USERNAME already exists"
else
    echo "Creating user: $USERNAME"
    useradd -m -s /bin/bash -c "Adava University Admin" "$USERNAME"
    echo "$USERNAME:$PASSWORD" | chpasswd
    echo "✓ User created"
fi

# Create adava group if doesn't exist
if ! getent group adava &>/dev/null; then
    echo "Creating adava group"
    groupadd adava
    echo "✓ Group created"
fi

# Add users to adava group
usermod -a -G adava "$USERNAME"
usermod -a -G adava lucas
echo "✓ Users added to adava group"

# Set up project directory permissions
echo "Setting up directory permissions..."

# Main project directory - group read/write
chown -R lucas:adava "$PROJECT_DIR"
chmod 750 "$PROJECT_DIR"
chmod 770 "$SERVER_DIR"
chmod 770 "$DATA_DIR"

# Allow group write access to server files
find "$SERVER_DIR" -type f -exec chmod 660 {} \;
find "$SERVER_DIR" -type d -exec chmod 770 {} \;

# Make app.js executable
chmod 770 "$SERVER_DIR/app.js"

# Data directory - group read/write
find "$DATA_DIR" -type f -exec chmod 660 {} \; 2>/dev/null || true
find "$DATA_DIR" -type d -exec chmod 770 {} \; 2>/dev/null || true

echo "✓ Directory permissions set"

# Set up logs directory access
if [ -d "$LOGS_DIR" ]; then
    # Allow adava group to read adava-related logs
    chown lucas:adava "$LOGS_DIR"
    chmod 750 "$LOGS_DIR"
    
    # Set permissions on adava log files
    touch "$LOGS_DIR/adava-form-backend.log"
    touch "$LOGS_DIR/adava-form-backend-error.log"
    chown lucas:adava "$LOGS_DIR/adava-form-backend.log"
    chown lucas:adava "$LOGS_DIR/adava-form-backend-error.log"
    chmod 660 "$LOGS_DIR/adava-form-backend.log"
    chmod 660 "$LOGS_DIR/adava-form-backend-error.log"
    echo "✓ Logs directory access configured"
fi

# Set up sudo rules for service management ONLY
SUDOERS_FILE="/etc/sudoers.d/adava-admin"
echo "Creating sudo rules..."

cat > "$SUDOERS_FILE" << EOF
# Sudo rules for Adava Admin user
# Can ONLY manage adava-form-backend service

# Service management
$USERNAME ALL=(ALL) NOPASSWD: /bin/systemctl start $SERVICE_NAME
$USERNAME ALL=(ALL) NOPASSWD: /bin/systemctl stop $SERVICE_NAME
$USERNAME ALL=(ALL) NOPASSWD: /bin/systemctl restart $SERVICE_NAME
$USERNAME ALL=(ALL) NOPASSWD: /bin/systemctl status $SERVICE_NAME
$USERNAME ALL=(ALL) NOPASSWD: /bin/systemctl reload $SERVICE_NAME
$USERNAME ALL=(ALL) NOPASSWD: /bin/systemctl enable $SERVICE_NAME
$USERNAME ALL=(ALL) NOPASSWD: /bin/systemctl disable $SERVICE_NAME

# View service logs
$USERNAME ALL=(ALL) NOPASSWD: /bin/journalctl -u $SERVICE_NAME*

# Nginx management - ONLY reload/test (not restart/stop full nginx)
$USERNAME ALL=(ALL) NOPASSWD: /usr/sbin/nginx -t
$USERNAME ALL=(ALL) NOPASSWD: /bin/systemctl reload nginx

# View process status for adava services
$USERNAME ALL=(ALL) NOPASSWD: /bin/ps aux

# Deny everything else
EOF

chmod 440 "$SUDOERS_FILE"
echo "✓ Sudo rules created"

# Set up nginx config access (read-only for main config, write for adava-specific includes)
if [ -d "$NGINX_CONF_DIR" ]; then
    # Create adava-specific nginx config directory
    ADAVA_NGINX_DIR="$NGINX_CONF_DIR/conf.d/adava"
    mkdir -p "$ADAVA_NGINX_DIR"
    
    # Copy existing adava nginx config if exists
    if [ -f "$SERVER_DIR/nginx-config.conf" ]; then
        cp "$SERVER_DIR/nginx-config.conf" "$ADAVA_NGINX_DIR/adava.conf"
    fi
    
    # Set permissions - adava group can edit
    chown -R root:adava "$ADAVA_NGINX_DIR"
    chmod 770 "$ADAVA_NGINX_DIR"
    find "$ADAVA_NGINX_DIR" -type f -exec chmod 660 {} \; 2>/dev/null || true
    
    echo "✓ Nginx configuration access set up"
fi

# Create credential file
CREDENTIALS_FILE="$PROJECT_DIR/coworker-credentials.yml"
cat > "$CREDENTIALS_FILE" << EOF
# Coworker Access Credentials for Adava University Server
# Generated: $(date)

username: $USERNAME
password: $PASSWORD

# SSH Access
ssh_command: ssh $USERNAME@YOUR_SERVER_IP

# Allowed Operations
allowed_operations:
  - Start/stop/restart adava-form-backend service
  - View service status and logs
  - Edit files in: $SERVER_DIR
  - Edit files in: $DATA_DIR
  - Edit nginx config in: /etc/nginx/conf.d/adava/
  - Reload nginx (after config changes)

# Service Management Commands
service_commands:
  start: sudo systemctl start $SERVICE_NAME
  stop: sudo systemctl stop $SERVICE_NAME
  restart: sudo systemctl restart $SERVICE_NAME
  status: sudo systemctl status $SERVICE_NAME
  logs: sudo journalctl -u $SERVICE_NAME -f
  nginx_test: sudo nginx -t
  nginx_reload: sudo systemctl reload nginx

# Directory Access
directories:
  project_root: $PROJECT_DIR
  server_files: $SERVER_DIR
  data_files: $DATA_DIR
  logs: $LOGS_DIR
  nginx_config: /etc/nginx/conf.d/adava/

# Restrictions
restrictions:
  - Cannot access other users' home directories
  - Cannot manage other services
  - Cannot modify system files outside allowed directories
  - Cannot sudo to root
  - Cannot install system packages
  - Cannot modify user accounts
  - Cannot access other projects on the server

# Security Notes
notes:
  - Password is randomly generated and secure
  - User has minimal privileges
  - All sudo commands are logged
  - User is restricted by sudoers file
  - Change password after first login: passwd
EOF

chown lucas:adava "$CREDENTIALS_FILE"
chmod 640 "$CREDENTIALS_FILE"

echo ""
echo "=========================================="
echo "✓ Setup Complete!"
echo "=========================================="
echo ""
echo "Username: $USERNAME"
echo "Password: $PASSWORD"
echo ""
echo "Credentials saved to: $CREDENTIALS_FILE"
echo ""
echo "To test the user, run:"
echo "  sudo -u $USERNAME bash -c 'cd $PROJECT_DIR && pwd && ls -la'"
echo ""
echo "To switch to the user:"
echo "  sudo su - $USERNAME"
echo ""
echo "IMPORTANT: Add this password to your project's api_keys.yml file"
echo ""

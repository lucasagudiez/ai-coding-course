#!/bin/bash
# Setup auto-deploy on server
# Run this ONCE to configure the server for auto-deployment

set -e

echo "🚀 Setting up auto-deploy on server..."
echo ""

# Check SSH connection
if ! ssh -o ConnectTimeout=5 adavauniversity "echo connected" >/dev/null 2>&1; then
    echo "❌ Cannot connect to server. Configure SSH first:"
    echo ""
    echo "Add to ~/.ssh/config:"
    echo "Host adavauniversity"
    echo "  HostName YOUR_SERVER_IP"
    echo "  User lucas"
    echo "  IdentityFile ~/.ssh/id_rsa"
    exit 1
fi

echo "✅ Connected to server"
echo ""

# Create logs directory
echo "📁 Creating logs directory..."
ssh adavauniversity "mkdir -p /home/lucas/logs"

# Copy server-deploy script
echo "📝 Copying auto-deploy script..."
scp scripts/server-deploy.sh adavauniversity:/home/lucas/auto-deploy-adavauniversity.sh
ssh adavauniversity "chmod +x /home/lucas/auto-deploy-adavauniversity.sh"

# Setup cron job
echo "⏰ Setting up cron job..."
ssh adavauniversity "crontab -l 2>/dev/null | grep -v auto-deploy-adavauniversity > /tmp/crontab_backup || true"
ssh adavauniversity "echo '*/1 * * * * /home/lucas/auto-deploy-adavauniversity.sh' >> /tmp/crontab_backup"
ssh adavauniversity "crontab /tmp/crontab_backup"

echo "✅ Cron job configured (runs every minute)"
ssh adavauniversity "crontab -l | grep auto-deploy"
echo ""

# Update nginx config
echo "🌐 Updating nginx config..."
scp server/nginx-config.conf adavauniversity:/tmp/nginx-config.conf
echo "   ⚠️  Manual step required:"
echo "   ssh adavauniversity"
echo "   sudo nano /etc/nginx/sites-enabled/adavauniversity.org"
echo "   (Copy relevant sections from /tmp/nginx-config.conf)"
echo "   sudo nginx -t && sudo systemctl reload nginx"
echo ""

# Clone repository if needed
echo "📦 Checking repository..."
if ssh adavauniversity "[ -d /home/lucas/www/adavauniversity.org ]"; then
    echo "✅ Repository exists"
else
    echo "⚠️  Repository not found. Cloning..."
    ssh adavauniversity "mkdir -p /home/lucas/www"
    ssh adavauniversity "cd /home/lucas/www && git clone -b deploy https://github.com/lucasagudiez/adavauniversity.org.git"
fi
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
ssh adavauniversity "cd /home/lucas/www/adavauniversity.org && npm install"
echo ""

# Run first deploy
echo "🚀 Running initial deploy..."
ssh adavauniversity "/home/lucas/auto-deploy-adavauniversity.sh"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "  ✅ AUTO-DEPLOY CONFIGURED"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "The server will now:"
echo "- Check for updates every minute"
echo "- Auto-deploy when deploy branch changes"
echo "- Run tests before deploying"
echo "- Auto-rollback if tests fail"
echo ""
echo "Check status: ./scripts/check-server-deploy.sh"
echo "View logs: ssh adavauniversity 'tail -f /home/lucas/logs/adavauniversity-deploy.log'"

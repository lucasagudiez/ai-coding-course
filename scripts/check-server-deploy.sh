#!/bin/bash
# Check server deployment status and logs
# Usage: ./scripts/check-server-deploy.sh

echo "🔍 Checking server deployment status..."
echo ""

# Check if we can SSH to server
if ! ssh -o ConnectTimeout=5 adavauniversity "echo connected" >/dev/null 2>&1; then
    echo "❌ Cannot connect to server"
    echo "   Make sure SSH is configured:"
    echo "   Host adavauniversity"
    echo "     HostName YOUR_SERVER_IP"
    echo "     User lucas"
    echo "     IdentityFile ~/.ssh/id_rsa"
    exit 1
fi

echo "✅ SSH connection successful"
echo ""

# Check current git commit on server
echo "📍 Server git status:"
ssh adavauniversity "cd /home/lucas/www/adavauniversity.org && git log -1 --oneline"
echo ""

# Check local deploy branch commit
echo "📍 Local deploy branch:"
cd "/Users/lucas/cursor projects/adavauniversity.org-deploy" 2>/dev/null && git log -1 --oneline
echo ""

# Check if auto-deploy script exists
echo "🤖 Checking auto-deploy script:"
if ssh adavauniversity "[ -f /home/lucas/auto-deploy-adavauniversity.sh ]"; then
    echo "✅ Auto-deploy script exists"
    
    # Check if cron job is running
    if ssh adavauniversity "crontab -l 2>/dev/null | grep -q auto-deploy-adavauniversity"; then
        echo "✅ Cron job configured"
        ssh adavauniversity "crontab -l | grep auto-deploy-adavauniversity"
    else
        echo "❌ Cron job NOT configured!"
        echo "   Add to crontab:"
        echo "   */1 * * * * /home/lucas/auto-deploy-adavauniversity.sh"
    fi
else
    echo "❌ Auto-deploy script NOT found!"
    echo "   Create: /home/lucas/auto-deploy-adavauniversity.sh"
fi
echo ""

# Check deployment logs
echo "📋 Recent deployment logs:"
if ssh adavauniversity "[ -f /home/lucas/logs/adavauniversity-deploy.log ]"; then
    ssh adavauniversity "tail -20 /home/lucas/logs/adavauniversity-deploy.log"
else
    echo "⚠️  No log file found at /home/lucas/logs/adavauniversity-deploy.log"
fi
echo ""

# Check nginx configuration
echo "🌐 Nginx configuration:"
if ssh adavauniversity "sudo nginx -t" 2>&1 | grep -q "successful"; then
    echo "✅ Nginx config valid"
    
    # Check if serving from public/ directory
    if ssh adavauniversity "sudo grep -q 'root.*public' /etc/nginx/sites-enabled/adavauniversity*"; then
        echo "✅ Nginx serving from public/ directory"
    else
        echo "⚠️  Nginx might not be serving from public/ directory"
    fi
else
    echo "❌ Nginx config has errors!"
fi
echo ""

echo "💡 Quick fixes:"
echo "   - Force cache refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)"
echo "   - View full logs: ssh adavauniversity 'tail -f /home/lucas/logs/adavauniversity-deploy.log'"
echo "   - Manual deploy: ssh adavauniversity '/home/lucas/auto-deploy-adavauniversity.sh'"

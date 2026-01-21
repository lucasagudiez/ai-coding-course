#!/bin/bash

# Setup script for Square payment testing

echo "🔧 Setting up Square Payment Integration for Testing..."
echo ""

# Create .env file with sandbox credentials
cat > server/.env << 'EOF'
# Adava University Backend Environment Variables

# OpenAI API (for LLM personalization)
OPENAI_API_KEY=YOUR_OPENAI_KEY_HERE

# Square Payment Gateway (SANDBOX - for testing)
SQUARE_ACCESS_TOKEN=EAAAlzxNmZLF_Sj-sZEINS7xwy_JEXbFevMJ9rvyJQIhrvWWM6r9cLjyxEPbSm4S
SQUARE_ENVIRONMENT=sandbox
SQUARE_APPLICATION_ID=sandbox-sq0idb-51AxZAaIW4wr4x51PivPfg
SQUARE_LOCATION_ID=LM3C1QVBTJA5J

# Server Configuration
PORT=3001
EOF

echo "✅ Created server/.env with sandbox credentials"
echo ""

# Update frontend JavaScript with credentials
echo "📝 Now updating frontend JavaScript..."
echo ""
echo "⚠️  You need to manually update: public/application/js/app.js"
echo "   Find line ~419 and replace with:"
echo ""
echo "   const SQUARE_APP_ID = 'sandbox-sq0idb-51AxZAaIW4wr4x51PivPfg';"
echo "   const SQUARE_LOCATION_ID = 'LM3C1QVBTJA5J';"
echo ""
echo "🚀 After that, run:"
echo "   cd server && node app.js"
echo ""

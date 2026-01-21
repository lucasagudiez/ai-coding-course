#!/bin/bash
# Setup environment based on deployment mode

MODE=${1:-sandbox}  # Default to sandbox, pass "production" for live mode

if [ "$MODE" = "production" ]; then
    echo "🚀 Setting up PRODUCTION environment..."
    
    cat > server/.env << EOF
# Production Environment
SQUARE_ACCESS_TOKEN=EAAAl8riPfrtwMa59VUGN-0fJc7gq1Oez-TQjkV_cTdm-uCwNZWAR-jreTSpcQ6c
SQUARE_ENVIRONMENT=production
SQUARE_APPLICATION_ID=sq0idp-8DEnXsW8Vm2TyUBzJ_FoBw
SQUARE_LOCATION_ID=LGKFR26ZTVPGP

# OpenAI (optional - for LLM features)
OPENAI_API_KEY=sk-placeholder-replace-with-real-key

# CSV file paths
APPLICATIONS_CSV=../data/applications.csv
SUBMISSIONS_CSV=../data/submissions.csv

# Server port
PORT=3001
EOF

    echo "✅ Production credentials configured"
    echo "⚠️  Make sure your production domain is correct in public/js/config.js"
    
elif [ "$MODE" = "sandbox" ]; then
    echo "🧪 Setting up SANDBOX environment (for testing)..."
    
    cat > server/.env << EOF
# Sandbox Environment (Testing)
SQUARE_ACCESS_TOKEN=EAAAlzxNmZLF_Sj-sZEINS7xwy_JEXbFevMJ9rvyJQIhrvWWM6r9cLjyxEPbSm4S
SQUARE_ENVIRONMENT=sandbox
SQUARE_APPLICATION_ID=sandbox-sq0idb-51AxZAaIW4wr4x51PivPfg
SQUARE_LOCATION_ID=LM3C1QVBTJA5J

# OpenAI (optional - for LLM features)
OPENAI_API_KEY=sk-placeholder-replace-with-real-key

# CSV file paths
APPLICATIONS_CSV=../data/applications.csv
SUBMISSIONS_CSV=../data/submissions.csv

# Server port
PORT=3001
EOF

    echo "✅ Sandbox credentials configured"
    echo "💳 Use test card: 4111 1111 1111 1111"
    
else
    echo "❌ Invalid mode. Use: ./setup-environment.sh [sandbox|production]"
    exit 1
fi

echo ""
echo "📝 Server .env file updated"
echo "🌍 Environment: $MODE"
echo ""
echo "To start the backend:"
echo "  cd server && node app.js"

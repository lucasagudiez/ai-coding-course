#!/bin/bash
# Deploy to production using git worktree (no branch switching)
# Runs ALL tests (unit + UX) before allowing deploy

set -e

MAIN_DIR="/Users/lucas/cursor projects/adavauniversity.org"
DEPLOY_WORKTREE="/Users/lucas/cursor projects/adavauniversity.org-deploy"

echo "🚀 Preparing deployment..."
echo ""

# Step 1: Run unit tests
echo "═══════════════════════════════════════════════════════════════"
echo "  STEP 1: Running unit tests..."
echo "═══════════════════════════════════════════════════════════════"
cd "$MAIN_DIR"
node scripts/test-runner.js
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ DEPLOY BLOCKED: Unit tests failed!"
    exit 1
fi
echo "✅ Unit tests passed"
echo ""

# Step 2: Run UX tests (if playwright is available)
echo "═══════════════════════════════════════════════════════════════"
echo "  STEP 2: Running UX tests (including critical UI checks)..."
echo "═══════════════════════════════════════════════════════════════"
if command -v npx &> /dev/null && [ -f "playwright.config.js" ]; then
    # Run critical tests first (nav button visibility)
    echo "   Running critical UI tests..."
    npx playwright test tests/nav-button-visibility.spec.js --reporter=line 2>&1 | tee /tmp/playwright-critical.txt
    
    if grep -q "failed" /tmp/playwright-critical.txt; then
        echo ""
        echo "❌ DEPLOY BLOCKED: Critical UI test failed!"
        echo "   The 'Apply Now' button is cut off or not visible."
        echo "   Fix the CSS before deploying."
        exit 1
    fi
    
    # Run all playwright tests
    npx playwright test --reporter=line 2>&1 | tee /tmp/playwright-output.txt
    
    # Check final summary line for failures
    SUMMARY=$(tail -5 /tmp/playwright-output.txt | grep -E "^\s*[0-9]+ (passed|failed)" || echo "")
    if echo "$SUMMARY" | grep -q "failed"; then
        echo ""
        echo "❌ DEPLOY BLOCKED: UX tests failed!"
        echo "   $SUMMARY"
        exit 1
    else
        echo "✅ UX tests passed"
        echo "   $SUMMARY"
    fi
else
    echo "⚠️  Playwright not found, skipping UX tests"
fi
echo ""

# Step 3: Push main branch
echo "═══════════════════════════════════════════════════════════════"
echo "  STEP 3: Pushing to main..."
echo "═══════════════════════════════════════════════════════════════"
cd "$MAIN_DIR"
git push origin main
echo "✅ Main pushed"
echo ""

# Step 4: Update deploy worktree and push (with cache-busting)
echo "═══════════════════════════════════════════════════════════════"
echo "  STEP 4: Updating deploy branch with cache-busting..."
echo "═══════════════════════════════════════════════════════════════"
cd "$DEPLOY_WORKTREE"
git fetch origin
git merge origin/main -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')"

# Update cache-busting version ONLY in deploy branch (not committed to main)
echo "   Updating cache-busting version..."
node scripts/update-cache-version.js
git add public/*.html public/application/*.html public/evaluation/*.html public/reservation/*.html 2>/dev/null || true
git commit -m "chore: update cache-busting to $(git rev-parse --short HEAD)" || true

git push origin deploy
echo "✅ Deploy branch pushed with fresh cache version"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "  ✅ DEPLOYED SUCCESSFULLY"
echo "═══════════════════════════════════════════════════════════════"
echo "   Server will test and update (or rollback) automatically."
echo "   https://adavauniversity.org/"
echo ""

#!/bin/bash
# Comprehensive Permission Tests for Adava Coworker User
# Tests that the adava-admin user has correct access and restrictions

set -e

USERNAME="adava-admin"
PROJECT_DIR="/home/lucas/www/adavauniversity.org"
SERVER_DIR="$PROJECT_DIR/server"
DATA_DIR="$PROJECT_DIR/data"
SERVICE_NAME="adava-form-backend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

TESTS_PASSED=0
TESTS_FAILED=0

echo "=========================================="
echo "Adava Coworker Permissions Test Suite"
echo "=========================================="
echo ""

# Helper functions
pass_test() {
    echo -e "${GREEN}✓ PASS${NC}: $1"
    ((TESTS_PASSED++))
}

fail_test() {
    echo -e "${RED}✗ FAIL${NC}: $1"
    ((TESTS_FAILED++))
}

warn_test() {
    echo -e "${YELLOW}⚠ WARN${NC}: $1"
}

run_as_user() {
    sudo -u "$USERNAME" bash -c "$1" 2>/dev/null
}

run_as_user_expect_fail() {
    if sudo -u "$USERNAME" bash -c "$1" 2>/dev/null; then
        return 1
    else
        return 0
    fi
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}ERROR: This script must be run as root (use sudo)${NC}"
    exit 1
fi

# Check if user exists
if ! id "$USERNAME" &>/dev/null; then
    echo -e "${RED}ERROR: User $USERNAME does not exist. Run create-coworker-user.sh first${NC}"
    exit 1
fi

echo "Testing user: $USERNAME"
echo ""

# ============================================
# TEST CATEGORY 1: Directory Access
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST CATEGORY 1: Directory Access"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1.1: Can access project directory
if run_as_user "cd $PROJECT_DIR && pwd" >/dev/null; then
    pass_test "Can access project directory ($PROJECT_DIR)"
else
    fail_test "Cannot access project directory ($PROJECT_DIR)"
fi

# Test 1.2: Can access server directory
if run_as_user "cd $SERVER_DIR && pwd" >/dev/null; then
    pass_test "Can access server directory ($SERVER_DIR)"
else
    fail_test "Cannot access server directory ($SERVER_DIR)"
fi

# Test 1.3: Can access data directory
if run_as_user "cd $DATA_DIR && pwd" >/dev/null; then
    pass_test "Can access data directory ($DATA_DIR)"
else
    fail_test "Cannot access data directory ($DATA_DIR)"
fi

# Test 1.4: Can list project files
if run_as_user "ls $PROJECT_DIR" >/dev/null; then
    pass_test "Can list project files"
else
    fail_test "Cannot list project files"
fi

# Test 1.5: Cannot access other user home directories
if run_as_user_expect_fail "ls /root"; then
    pass_test "BLOCKED: Cannot access /root (correct restriction)"
else
    fail_test "SECURITY ISSUE: Can access /root (should be blocked)"
fi

# Test 1.6: Cannot access /etc/shadow
if run_as_user_expect_fail "cat /etc/shadow"; then
    pass_test "BLOCKED: Cannot read /etc/shadow (correct restriction)"
else
    fail_test "SECURITY ISSUE: Can read /etc/shadow (should be blocked)"
fi

echo ""

# ============================================
# TEST CATEGORY 2: File Permissions
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST CATEGORY 2: File Permissions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 2.1: Can read server files
if run_as_user "cat $SERVER_DIR/app.js" >/dev/null; then
    pass_test "Can read server files (app.js)"
else
    fail_test "Cannot read server files (app.js)"
fi

# Test 2.2: Can write to server files
TEST_FILE="$SERVER_DIR/.test-write-permission"
if run_as_user "echo 'test' > $TEST_FILE"; then
    pass_test "Can write to server directory"
    rm -f "$TEST_FILE"
else
    fail_test "Cannot write to server directory"
fi

# Test 2.3: Can read nginx config template
if run_as_user "cat $SERVER_DIR/nginx-config.conf" >/dev/null; then
    pass_test "Can read nginx config template"
else
    fail_test "Cannot read nginx config template"
fi

# Test 2.4: Can read service file
if run_as_user "cat $SERVER_DIR/adava-form-backend.service" >/dev/null; then
    pass_test "Can read service file"
else
    fail_test "Cannot read service file"
fi

# Test 2.5: Cannot modify /etc/passwd
if run_as_user_expect_fail "echo 'test' >> /etc/passwd"; then
    pass_test "BLOCKED: Cannot modify /etc/passwd (correct restriction)"
else
    fail_test "SECURITY ISSUE: Can modify /etc/passwd (should be blocked)"
fi

echo ""

# ============================================
# TEST CATEGORY 3: Service Management
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST CATEGORY 3: Service Management"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 3.1: Can check service status
if sudo -u "$USERNAME" sudo systemctl status "$SERVICE_NAME" >/dev/null 2>&1; then
    pass_test "Can check service status"
else
    warn_test "Cannot check service status (service may not be installed yet)"
fi

# Test 3.2: Can view service logs
if sudo -u "$USERNAME" sudo journalctl -u "$SERVICE_NAME" -n 1 >/dev/null 2>&1; then
    pass_test "Can view service logs"
else
    warn_test "Cannot view service logs (service may not be installed yet)"
fi

# Test 3.3: Can test nginx config
if sudo -u "$USERNAME" sudo nginx -t >/dev/null 2>&1; then
    pass_test "Can test nginx configuration"
else
    warn_test "Cannot test nginx config (nginx may not be installed)"
fi

# Test 3.4: Cannot restart nginx (only reload allowed)
if sudo -u "$USERNAME" sudo systemctl restart nginx >/dev/null 2>&1; then
    fail_test "SECURITY ISSUE: Can restart nginx (should only reload)"
else
    pass_test "BLOCKED: Cannot restart nginx (correct - only reload allowed)"
fi

# Test 3.5: Cannot manage other services
if run_as_user_expect_fail "sudo systemctl stop sshd"; then
    pass_test "BLOCKED: Cannot manage other services (correct restriction)"
else
    fail_test "SECURITY ISSUE: Can manage other services (should be blocked)"
fi

# Test 3.6: Cannot sudo to root
if run_as_user_expect_fail "sudo su -"; then
    pass_test "BLOCKED: Cannot sudo to root (correct restriction)"
else
    fail_test "SECURITY ISSUE: Can sudo to root (should be blocked)"
fi

echo ""

# ============================================
# TEST CATEGORY 4: System Restrictions
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST CATEGORY 4: System Restrictions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 4.1: Cannot install packages
if run_as_user_expect_fail "sudo apt install vim"; then
    pass_test "BLOCKED: Cannot install packages (correct restriction)"
else
    fail_test "SECURITY ISSUE: Can install packages (should be blocked)"
fi

# Test 4.2: Cannot create users
if run_as_user_expect_fail "sudo useradd testuser"; then
    pass_test "BLOCKED: Cannot create users (correct restriction)"
else
    fail_test "SECURITY ISSUE: Can create users (should be blocked)"
fi

# Test 4.3: Cannot modify firewall
if run_as_user_expect_fail "sudo ufw status"; then
    pass_test "BLOCKED: Cannot access firewall (correct restriction)"
else
    warn_test "Can access firewall commands (may need additional restrictions)"
fi

# Test 4.4: Cannot access other projects (test with common paths)
OTHER_PATHS=("/var/www/html" "/opt" "/srv")
for path in "${OTHER_PATHS[@]}"; do
    if [ -d "$path" ]; then
        if run_as_user_expect_fail "ls $path" 2>/dev/null; then
            pass_test "BLOCKED: Cannot access $path (correct restriction)"
        else
            warn_test "Can access $path (may be intentional or needs review)"
        fi
    fi
done

# Test 4.5: Cannot read other users' files
if run_as_user_expect_fail "cat /home/lucas/.bashrc" 2>/dev/null; then
    pass_test "BLOCKED: Cannot read lucas's .bashrc (correct restriction)"
else
    warn_test "Can read other user files (verify if intentional)"
fi

echo ""

# ============================================
# TEST CATEGORY 5: Group Membership
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST CATEGORY 5: Group Membership"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 5.1: User is in adava group
if groups "$USERNAME" | grep -q "adava"; then
    pass_test "User is member of adava group"
else
    fail_test "User is NOT member of adava group"
fi

# Test 5.2: User is NOT in sudo group
if groups "$USERNAME" | grep -q "sudo"; then
    fail_test "SECURITY ISSUE: User is in sudo group (should not be)"
else
    pass_test "User is NOT in sudo group (correct restriction)"
fi

# Test 5.3: User is NOT in root group
if groups "$USERNAME" | grep -q "root"; then
    fail_test "SECURITY ISSUE: User is in root group (should not be)"
else
    pass_test "User is NOT in root group (correct restriction)"
fi

echo ""

# ============================================
# TEST CATEGORY 6: Credential File
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST CATEGORY 6: Credential File"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

CRED_FILE="$PROJECT_DIR/coworker-credentials.yml"

# Test 6.1: Credential file exists
if [ -f "$CRED_FILE" ]; then
    pass_test "Credential file exists"
else
    fail_test "Credential file does not exist"
fi

# Test 6.2: Credential file has correct permissions
if [ -f "$CRED_FILE" ]; then
    PERMS=$(stat -c "%a" "$CRED_FILE" 2>/dev/null || stat -f "%A" "$CRED_FILE" 2>/dev/null)
    if [ "$PERMS" = "640" ]; then
        pass_test "Credential file has correct permissions (640)"
    else
        fail_test "Credential file has incorrect permissions ($PERMS, should be 640)"
    fi
fi

# Test 6.3: Credential file is readable by adava group
if run_as_user "cat $CRED_FILE" >/dev/null; then
    pass_test "Credential file is readable by adava-admin user"
else
    fail_test "Credential file is NOT readable by adava-admin user"
fi

# Test 6.4: Credential file contains required fields
if [ -f "$CRED_FILE" ]; then
    REQUIRED_FIELDS=("username" "password" "ssh_command" "service_commands")
    for field in "${REQUIRED_FIELDS[@]}"; do
        if grep -q "$field:" "$CRED_FILE"; then
            pass_test "Credential file contains '$field' field"
        else
            fail_test "Credential file missing '$field' field"
        fi
    done
fi

echo ""

# ============================================
# SUMMARY
# ============================================
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo ""
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
SUCCESS_RATE=$((TESTS_PASSED * 100 / TOTAL_TESTS))

echo "Success Rate: $SUCCESS_RATE%"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED${NC}"
    echo "The adava-admin user has correct permissions and restrictions."
    exit 0
else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    echo "Review the failures above and fix permission issues."
    exit 1
fi

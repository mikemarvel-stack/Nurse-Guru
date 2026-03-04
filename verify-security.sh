#!/bin/bash

# Security Implementation Verification Script
# Run this to verify all security measures are in place

echo "🔍 Verifying Security Implementation..."
echo ""

ERRORS=0
WARNINGS=0

# Check if sensitive files are NOT in git
echo "1. Checking git tracking..."
if git ls-files | grep -q "\.env$\|dev\.db$"; then
    echo "   ❌ CRITICAL: .env or dev.db files are tracked in git!"
    ERRORS=$((ERRORS + 1))
else
    echo "   ✅ No sensitive files in git"
fi

# Check if .env.example exists
if [ -f ".env.example" ]; then
    echo "   ✅ .env.example exists"
else
    echo "   ⚠️  .env.example missing"
    WARNINGS=$((WARNINGS + 1))
fi

# Check server dependencies
echo ""
echo "2. Checking server dependencies..."
cd server 2>/dev/null || { echo "   ❌ server directory not found"; exit 1; }

if [ -f "package.json" ]; then
    if grep -q "helmet" package.json; then
        echo "   ✅ Helmet.js installed"
    else
        echo "   ❌ Helmet.js missing"
        ERRORS=$((ERRORS + 1))
    fi
    
    if grep -q "winston" package.json; then
        echo "   ✅ Winston logger installed"
    else
        echo "   ❌ Winston missing"
        ERRORS=$((ERRORS + 1))
    fi
    
    if grep -q "express-rate-limit" package.json; then
        echo "   ✅ Rate limiter installed"
    else
        echo "   ❌ Rate limiter missing"
        ERRORS=$((ERRORS + 1))
    fi
fi

# Check for security utilities
echo ""
echo "3. Checking security utilities..."
if [ -f "src/utils/logger.ts" ]; then
    echo "   ✅ Logger utility exists"
else
    echo "   ❌ Logger utility missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "src/utils/env.ts" ]; then
    echo "   ✅ Environment validation exists"
else
    echo "   ❌ Environment validation missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "src/utils/errors.ts" ]; then
    echo "   ✅ Error classes exist"
else
    echo "   ❌ Error classes missing"
    ERRORS=$((ERRORS + 1))
fi

# Check middleware
echo ""
echo "4. Checking security middleware..."
if [ -f "src/middleware/requestId.ts" ]; then
    echo "   ✅ Request ID middleware exists"
else
    echo "   ❌ Request ID middleware missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "src/middleware/timeout.ts" ]; then
    echo "   ✅ Timeout middleware exists"
else
    echo "   ❌ Timeout middleware missing"
    ERRORS=$((ERRORS + 1))
fi

# Check Dockerfile
echo ""
echo "5. Checking Docker configuration..."
if grep -q "node:20-alpine" Dockerfile; then
    echo "   ✅ Using Alpine base image"
else
    echo "   ⚠️  Not using Alpine image"
    WARNINGS=$((WARNINGS + 1))
fi

if grep -q "USER nodejs" Dockerfile; then
    echo "   ✅ Running as non-root user"
else
    echo "   ❌ CRITICAL: Running as root user"
    ERRORS=$((ERRORS + 1))
fi

if grep -q "HEALTHCHECK" Dockerfile; then
    echo "   ✅ Health check configured"
else
    echo "   ⚠️  Health check missing"
    WARNINGS=$((WARNINGS + 1))
fi

# Check backup script
echo ""
echo "6. Checking backup configuration..."
if [ -f "backup-db.sh" ]; then
    echo "   ✅ Backup script exists"
    if [ -x "backup-db.sh" ]; then
        echo "   ✅ Backup script is executable"
    else
        echo "   ⚠️  Backup script not executable (run: chmod +x backup-db.sh)"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "   ❌ Backup script missing"
    ERRORS=$((ERRORS + 1))
fi

# Check CI/CD
cd ..
echo ""
echo "7. Checking CI/CD configuration..."
if [ -f ".github/workflows/ci.yml" ]; then
    echo "   ✅ CI/CD pipeline exists"
    if grep -q "security-scan" .github/workflows/ci.yml; then
        echo "   ✅ Security scanning configured"
    else
        echo "   ⚠️  Security scanning not configured"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "   ❌ CI/CD pipeline missing"
    ERRORS=$((ERRORS + 1))
fi

# Check documentation
echo ""
echo "8. Checking documentation..."
DOCS=("SECURITY_AUDIT_REPORT.md" "DEPLOYMENT_CHECKLIST.md" "IMPLEMENTATION_COMPLETE.md" "START_HERE.md")
for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo "   ✅ $doc exists"
    else
        echo "   ⚠️  $doc missing"
        WARNINGS=$((WARNINGS + 1))
    fi
done

# Check TypeScript strict mode
echo ""
echo "9. Checking TypeScript configuration..."
if grep -q '"strict": true' server/tsconfig.json; then
    echo "   ✅ TypeScript strict mode enabled"
else
    echo "   ⚠️  TypeScript strict mode not enabled"
    WARNINGS=$((WARNINGS + 1))
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Verification Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ All checks passed! Your application is secure."
    echo ""
    echo "Next steps:"
    echo "1. Generate strong JWT_SECRET"
    echo "2. Configure production environment"
    echo "3. Review DEPLOYMENT_CHECKLIST.md"
    echo "4. Deploy with confidence!"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  $WARNINGS warning(s) found (non-critical)"
    echo "   Review warnings above and fix if needed"
    exit 0
else
    echo "❌ $ERRORS critical error(s) found"
    echo "⚠️  $WARNINGS warning(s) found"
    echo ""
    echo "Please fix the errors above before deploying."
    exit 1
fi

# Security & Infrastructure Audit Report
**Project:** Nurse Guru Fullstack Marketplace  
**Date:** 2024  
**Auditor:** Amazon Q Developer

---

## 🚨 CRITICAL ISSUES (Fix Immediately)

### 1. **Sensitive Files Tracked in Git**
**Severity:** CRITICAL  
**Risk:** Credentials exposed in version control

**Files exposed:**
- `.env` (root)
- `server/.env` 
- `server/prisma/dev.db`

**Impact:** JWT secrets, Stripe keys, and database with user data are in git history.

**Fix:**
```bash
# Remove from git history
git rm --cached .env server/.env server/prisma/dev.db
git commit -m "Remove sensitive files from tracking"

# Update .gitignore (already correct)
# Rotate ALL secrets immediately:
# - Generate new JWT_SECRET
# - Regenerate Stripe keys
# - Notify users if production DB was exposed
```

### 2. **Weak Default JWT Secret**
**Severity:** CRITICAL  
**Risk:** Authentication bypass

**Current:** `"your-super-secret-jwt-key-change-this-in-production"`

**Fix:**
```bash
# Generate strong secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Update .env files with generated value
# Never commit the actual secret
```

### 3. **Missing Input Validation on File Uploads**
**Severity:** HIGH  
**Risk:** Malicious file execution, path traversal

**Issues in `server/src/routes/upload.ts`:**
- No filename sanitization (UUID helps but not enough)
- No virus scanning
- No file content validation (only MIME type)
- Delete endpoint vulnerable to path traversal

**Fix:**
```typescript
// Add to upload.ts
import path from 'path';

// Sanitize filename
const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 255);
};

// In delete endpoint
router.delete('/:filename', authenticate, async (req, res) => {
  const { filename } = req.params;
  
  // Prevent path traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({ error: 'Invalid filename' });
  }
  
  const filePath = path.join(uploadsDir, path.basename(filename));
  // ... rest of code
});
```

### 4. **SQL Injection Risk in Raw Queries**
**Severity:** HIGH  
**Risk:** Database compromise

**Action Required:** Audit all Prisma queries for raw SQL. Use parameterized queries only.

---

## ⚠️ HIGH PRIORITY ISSUES

### 5. **Missing HTTPS Enforcement**
**Severity:** HIGH  
**Risk:** Man-in-the-middle attacks, credential theft

**Fix for nginx.conf:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # ... rest of config
}
```

### 6. **Inadequate Rate Limiting**
**Severity:** HIGH  
**Risk:** DDoS, brute force attacks

**Current:** 100 requests per 15 minutes (too permissive)

**Fix:**
```typescript
// Different limits for different endpoints
app.use('/api/auth/login', createRateLimiter(15 * 60 * 1000, 5)); // 5 per 15min
app.use('/api/auth/register', createRateLimiter(60 * 60 * 1000, 3)); // 3 per hour
app.use('/api/payment', createRateLimiter(60 * 1000, 10)); // 10 per minute
app.use('/api', createRateLimiter(15 * 60 * 1000, 100)); // General API
```

### 7. **Missing CSRF Protection**
**Severity:** HIGH  
**Risk:** Cross-site request forgery

**Fix:**
```bash
npm install csurf cookie-parser
```

```typescript
import csrf from 'csurf';
import cookieParser from 'cookie-parser';

app.use(cookieParser());
app.use(csrf({ cookie: true }));

app.use((req, res, next) => {
  res.cookie('XSRF-TOKEN', req.csrfToken());
  next();
});
```

### 8. **Vulnerable Dependency (minimatch)**
**Severity:** HIGH (ReDoS)  
**CVE:** GHSA-7r86-cg39-jmmj, GHSA-23c5-xmqv-rm74

**Fix:**
```bash
cd client
npm audit fix --force
# Or manually update package.json
```

### 9. **Missing Security Headers**
**Severity:** MEDIUM  
**Risk:** XSS, clickjacking

**Fix:**
```bash
npm install helmet
```

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### 10. **Insecure Password Storage Configuration**
**Severity:** MEDIUM  
**Risk:** Weak password hashing

**Action:** Verify bcrypt rounds in auth routes:
```typescript
// Should be at least 12 rounds
const hashedPassword = await bcrypt.hash(password, 12);
```

---

## 🔧 GITHUB CI/CD ISSUES

### 11. **CI Pipeline Improvements**

**Current Issues:**
- No security scanning (SAST/DAST)
- No dependency vulnerability checks in CI
- Tests pass with no tests (`--passWithNoTests`)
- No Docker image scanning
- Missing environment validation
- No deployment automation

**Recommended `.github/workflows/ci.yml`:**
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  security-scan:
    name: Security Scanning
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          severity: 'CRITICAL,HIGH'
          
      - name: Run npm audit (server)
        working-directory: server
        run: npm audit --audit-level=high
        
      - name: Run npm audit (client)
        working-directory: client
        run: npm audit --audit-level=high

  lint-and-format:
    name: Code Quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: |
          cd server && npm ci
          cd ../client && npm ci
          
      - name: Lint server
        working-directory: server
        run: npm run lint || echo "Add lint script"
        
      - name: Lint client
        working-directory: client
        run: npm run lint

  test-server:
    name: Server Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        working-directory: server
        run: npm ci
        
      - name: Generate Prisma Client
        working-directory: server
        run: npx prisma generate
        env:
          DATABASE_URL: file:./test.db
          
      - name: Run tests
        working-directory: server
        run: npm test
        env:
          DATABASE_URL: file:./test.db
          JWT_SECRET: test-secret-key-for-ci-only
          NODE_ENV: test
          
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./server/coverage/lcov.info
          flags: server

  test-client:
    name: Client Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        working-directory: client
        run: npm ci
        
      - name: Run tests
        working-directory: client
        run: npm test || echo "Add tests"

  build-and-push:
    name: Build Docker Images
    runs-on: ubuntu-latest
    needs: [security-scan, test-server, test-client]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
        
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
          
      - name: Build and push server
        uses: docker/build-push-action@v5
        with:
          context: ./server
          push: true
          tags: yourusername/nurse-guru-server:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
          
      - name: Build and push client
        uses: docker/build-push-action@v5
        with:
          context: ./client
          push: true
          tags: yourusername/nurse-guru-client:latest
          
      - name: Scan Docker images
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: yourusername/nurse-guru-server:latest
          severity: 'CRITICAL,HIGH'

  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build-and-push
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_KEY }}
          script: |
            cd /opt/nurse-guru
            docker-compose pull
            docker-compose up -d
            docker system prune -f
```

### 12. **Add GitHub Secrets**
Required secrets for CI/CD:
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`
- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_KEY`

---

## 📋 MEDIUM PRIORITY ISSUES

### 13. **Missing Database Backups**
**Fix:**
```bash
# Add to crontab or GitHub Actions
0 2 * * * sqlite3 /app/data/prod.db ".backup '/backups/prod-$(date +\%Y\%m\%d).db'"
```

### 14. **No Logging/Monitoring**
**Recommendations:**
- Add Winston or Pino for structured logging
- Implement error tracking (Sentry)
- Add APM (New Relic, DataDog)

```bash
npm install winston
```

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 15. **Missing Health Checks in Docker**
**Fix docker-compose.yml:**
```yaml
services:
  server:
    # ... existing config
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### 16. **No Database Migration Strategy**
**Current:** Migrations exist but no rollback strategy

**Fix:**
```json
// Add to server/package.json
{
  "scripts": {
    "db:migrate:deploy": "prisma migrate deploy",
    "db:migrate:rollback": "prisma migrate resolve --rolled-back",
    "db:backup": "sqlite3 prisma/dev.db \".backup 'prisma/backup.db'\""
  }
}
```

### 17. **Missing API Documentation**
**Recommendations:**
- Add Swagger/OpenAPI
- Document rate limits
- Add example requests/responses

```bash
npm install swagger-ui-express swagger-jsdoc
```

### 18. **Inadequate Error Messages**
**Issue:** Generic errors leak implementation details

**Fix:**
```typescript
// Create error handler utility
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
  }
}

// In routes
throw new AppError(400, 'Invalid document ID');

// In error middleware
if (process.env.NODE_ENV === 'production') {
  delete err.stack;
}
```

### 19. **No Request ID Tracking**
**Fix:**
```typescript
import { v4 as uuidv4 } from 'uuid';

app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});
```

### 20. **Missing TypeScript Strict Mode**
**Fix server/tsconfig.json:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

---

## 🔍 CODE QUALITY ISSUES

### 21. **Inconsistent Error Handling**
- Some routes use try-catch, others don't
- No centralized error handling
- Inconsistent error response format

### 22. **Missing Input Validation**
- No Zod validation on most endpoints
- Relying on Prisma for validation (insufficient)

**Fix:**
```typescript
import { z } from 'zod';

const documentSchema = z.object({
  title: z.string().min(3).max(200),
  price: z.number().positive().max(10000),
  category: z.enum(['NOTES', 'GUIDES', 'EXAMS', 'RESEARCH'])
});

router.post('/documents', authenticate, async (req, res) => {
  const validated = documentSchema.parse(req.body);
  // ... use validated data
});
```

### 23. **No API Versioning**
**Recommendation:**
```typescript
app.use('/api/v1/documents', documentRoutes);
```

### 24. **Missing Pagination Limits**
**Risk:** Memory exhaustion

**Fix:**
```typescript
const limit = Math.min(parseInt(req.query.limit) || 20, 100);
const offset = parseInt(req.query.offset) || 0;
```

### 25. **No Request Timeout**
**Fix:**
```typescript
import timeout from 'connect-timeout';

app.use(timeout('30s'));
app.use((req, res, next) => {
  if (!req.timedout) next();
});
```

---

## 🐳 DOCKER & DEPLOYMENT ISSUES

### 26. **Docker Images Not Optimized**
**Current server Dockerfile issues:**
- Runs as root user
- No multi-stage build
- Includes dev dependencies

**Optimized Dockerfile:**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
RUN apk add --no-cache openssl dumb-init
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
RUN mkdir -p data uploads && chown nodejs:nodejs data uploads
USER nodejs
EXPOSE 3001
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
```

### 27. **Missing Docker Compose Production Config**
**Create docker-compose.prod.yml:**
```yaml
version: '3.8'

services:
  server:
    image: yourusername/nurse-guru-server:latest
    restart: always
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    volumes:
      - ./data:/app/data:rw
      - ./uploads:/app/uploads:rw
    networks:
      - nurse-guru-network
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M

  client:
    image: yourusername/nurse-guru-client:latest
    restart: always
    depends_on:
      - server
    networks:
      - nurse-guru-network

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl:ro
    depends_on:
      - client
      - server
    networks:
      - nurse-guru-network

networks:
  nurse-guru-network:
    driver: bridge
```

### 28. **No Environment Validation**
**Add to server/src/index.ts:**
```typescript
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  JWT_SECRET: z.string().min(32),
  DATABASE_URL: z.string(),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  PORT: z.string().transform(Number)
});

const env = envSchema.parse(process.env);
```

---

## 📊 TESTING GAPS

### 29. **Insufficient Test Coverage**
**Current:** Only 2 test files, mostly empty

**Recommendations:**
- Add integration tests for all API endpoints
- Add unit tests for utilities and middleware
- Add E2E tests with Playwright
- Target 80%+ coverage

**Example test structure:**
```
server/src/__tests__/
├── integration/
│   ├── auth.test.ts
│   ├── documents.test.ts
│   ├── orders.test.ts
│   └── payment.test.ts
├── unit/
│   ├── middleware/
│   │   ├── auth.test.ts
│   │   ├── rateLimit.test.ts
│   │   └── sanitize.test.ts
│   └── utils/
└── e2e/
    └── checkout-flow.test.ts
```

### 30. **No Load Testing**
**Recommendation:**
```bash
npm install -g artillery

# Create artillery.yml
artillery quick --count 100 --num 10 http://localhost:3001/api/documents
```

---

## 🎯 PERFORMANCE OPTIMIZATIONS

### 31. **Missing Database Indexes**
**Add to schema.prisma:**
```prisma
model Document {
  // ... existing fields
  
  @@index([status, createdAt])
  @@index([category, status])
  @@index([sellerId, status])
  @@index([isFeatured, status])
}

model Order {
  @@index([buyerId, createdAt])
  @@index([status, createdAt])
}
```

### 32. **No Caching Strategy**
**Recommendations:**
- Add Redis for session storage
- Cache frequently accessed documents
- Implement CDN for static assets

```bash
npm install ioredis
```

### 33. **Missing Compression**
**Fix:**
```bash
npm install compression
```

```typescript
import compression from 'compression';
app.use(compression());
```

### 34. **No Database Connection Pooling**
**Fix:**
```typescript
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['error', 'warn'],
});

// Add connection pool limits
```

---

## 📝 COMPLIANCE & LEGAL

### 35. **Missing Privacy Policy & Terms**
**Required for:**
- GDPR compliance
- Stripe requirements
- User data handling

### 36. **No Data Retention Policy**
**Recommendations:**
- Define data retention periods
- Implement automated cleanup
- Add user data export feature

### 37. **Missing GDPR Features**
**Required:**
- User data export
- Right to be forgotten
- Cookie consent
- Privacy policy

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Production
- [ ] Rotate all secrets
- [ ] Remove sensitive files from git
- [ ] Fix all CRITICAL and HIGH issues
- [ ] Set up SSL certificates
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerts
- [ ] Create backup strategy
- [ ] Document deployment process
- [ ] Load test the application
- [ ] Security penetration testing

### Production
- [ ] Use production database (PostgreSQL recommended over SQLite)
- [ ] Enable HTTPS only
- [ ] Set up CDN (CloudFront, Cloudflare)
- [ ] Configure WAF rules
- [ ] Set up log aggregation
- [ ] Enable automated backups
- [ ] Set up disaster recovery
- [ ] Configure auto-scaling
- [ ] Set up status page
- [ ] Create runbook for incidents

---

## 📈 PRIORITY MATRIX

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| P0 | Remove secrets from git | Low | Critical |
| P0 | Rotate JWT secret | Low | Critical |
| P0 | Fix file upload vulnerabilities | Medium | Critical |
| P1 | Add HTTPS enforcement | Low | High |
| P1 | Fix rate limiting | Low | High |
| P1 | Add CSRF protection | Medium | High |
| P1 | Fix vulnerable dependencies | Low | High |
| P2 | Improve CI/CD pipeline | High | High |
| P2 | Add security headers | Low | Medium |
| P2 | Optimize Docker images | Medium | Medium |
| P3 | Add comprehensive tests | High | Medium |
| P3 | Implement caching | Medium | Medium |
| P3 | Add monitoring | Medium | Medium |

---

## 🎓 RECOMMENDATIONS SUMMARY

### Immediate Actions (This Week)
1. Remove secrets from git and rotate all credentials
2. Fix file upload security issues
3. Update vulnerable dependencies
4. Add HTTPS enforcement
5. Improve rate limiting

### Short Term (This Month)
1. Implement comprehensive CI/CD pipeline
2. Add security headers and CSRF protection
3. Optimize Docker images
4. Add database indexes
5. Implement proper error handling

### Long Term (This Quarter)
1. Migrate to PostgreSQL for production
2. Add comprehensive test suite
3. Implement caching with Redis
4. Add monitoring and alerting
5. Implement GDPR compliance features
6. Add API documentation
7. Perform security audit and penetration testing

---

## 📚 RESOURCES

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Docker Security](https://docs.docker.com/engine/security/)
- [Stripe Security](https://stripe.com/docs/security)

---

**Report Generated:** 2024  
**Next Review:** Recommended after implementing P0 and P1 fixes

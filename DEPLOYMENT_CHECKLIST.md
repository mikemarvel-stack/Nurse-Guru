# Pre-Deployment Security Checklist

## Critical Security Steps

### 1. Environment Variables
- [ ] Generate new JWT_SECRET (min 64 bytes): `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- [ ] Set production Stripe keys (sk_live_*, pk_live_*)
- [ ] Configure production FRONTEND_URL and VITE_API_URL
- [ ] Set NODE_ENV=production
- [ ] Verify all secrets are NOT in git history

### 2. Database
- [ ] Migrate to PostgreSQL for production (SQLite not recommended)
- [ ] Run migrations: `npm run db:migrate:deploy`
- [ ] Set up automated backups (daily minimum)
- [ ] Configure database connection pooling
- [ ] Test database restore procedure

### 3. SSL/TLS
- [ ] Obtain SSL certificate (Let's Encrypt recommended)
- [ ] Configure nginx for HTTPS (uncomment HTTPS block in nginx.conf)
- [ ] Enable HSTS headers
- [ ] Test SSL configuration: https://www.ssllabs.com/ssltest/

### 4. Docker & Infrastructure
- [ ] Build production Docker images
- [ ] Scan images for vulnerabilities: `docker scan`
- [ ] Configure resource limits in docker-compose
- [ ] Set up health checks
- [ ] Configure log rotation
- [ ] Set up monitoring (CPU, memory, disk)

### 5. Security Hardening
- [ ] Configure firewall (allow only 80, 443, SSH)
- [ ] Disable SSH password authentication (use keys only)
- [ ] Set up fail2ban for SSH protection
- [ ] Configure WAF if using cloud provider
- [ ] Enable DDoS protection
- [ ] Set up intrusion detection

### 6. Application Security
- [ ] Review and test all rate limits
- [ ] Verify CSRF protection is enabled
- [ ] Test file upload restrictions
- [ ] Audit all API endpoints for authorization
- [ ] Review error messages (no sensitive data leaks)
- [ ] Test authentication flows

### 7. Monitoring & Logging
- [ ] Set up centralized logging (ELK, CloudWatch, etc.)
- [ ] Configure error tracking (Sentry)
- [ ] Set up uptime monitoring
- [ ] Configure alerts for critical errors
- [ ] Set up performance monitoring (APM)
- [ ] Create status page

### 8. Backup & Recovery
- [ ] Test database backup script
- [ ] Set up automated daily backups
- [ ] Store backups off-site
- [ ] Document restore procedure
- [ ] Test disaster recovery plan
- [ ] Set up backup monitoring/alerts

### 9. Compliance & Legal
- [ ] Add Privacy Policy
- [ ] Add Terms of Service
- [ ] Implement cookie consent (GDPR)
- [ ] Add data export feature (GDPR)
- [ ] Add account deletion feature (GDPR)
- [ ] Review data retention policies

### 10. Testing
- [ ] Run full test suite
- [ ] Perform load testing
- [ ] Security penetration testing
- [ ] Test payment flows end-to-end
- [ ] Test file upload/download
- [ ] Verify email notifications work

### 11. CI/CD
- [ ] Configure GitHub secrets
- [ ] Test CI/CD pipeline
- [ ] Set up deployment automation
- [ ] Configure rollback procedure
- [ ] Test staging environment

### 12. Documentation
- [ ] Update README with production setup
- [ ] Document deployment process
- [ ] Create runbook for common issues
- [ ] Document API endpoints
- [ ] Create admin guide

## Post-Deployment

### Immediate (First 24 hours)
- [ ] Monitor error logs continuously
- [ ] Check performance metrics
- [ ] Verify all features work in production
- [ ] Test payment processing
- [ ] Monitor resource usage

### First Week
- [ ] Review security logs daily
- [ ] Monitor user feedback
- [ ] Check backup success
- [ ] Review performance metrics
- [ ] Optimize based on real usage

### Ongoing
- [ ] Weekly security updates
- [ ] Monthly dependency audits
- [ ] Quarterly security reviews
- [ ] Regular backup testing
- [ ] Performance optimization

## Emergency Contacts
- DevOps Lead: [contact]
- Security Team: [contact]
- Database Admin: [contact]
- Hosting Provider Support: [contact]

## Rollback Plan
1. Stop new deployments
2. Revert to previous Docker images
3. Restore database from backup if needed
4. Verify system functionality
5. Investigate root cause

## Security Incident Response
1. Isolate affected systems
2. Notify security team
3. Preserve logs and evidence
4. Assess impact
5. Implement fixes
6. Notify affected users if required
7. Post-mortem analysis

# Email Service Migration Guide: SendGrid → AWS SES

## Overview
This guide documents the migration from SendGrid to AWS SES for the Strata Noble email service, implementing a feature flag approach for safe rollout.

## Implementation Summary

### ✅ Code Changes Completed

1. **AWS SDK Installation**
   ```bash
   npm install @aws-sdk/client-sesv2
   ```

2. **New Mailer Utility**: `src/lib/mailer.ts`
   - AWS SES v2 client configuration
   - Simple `sendEmail()` function with proper typing

3. **Updated Email Route**: `src/app/api/email/send/route.ts`
   - Feature flag support (`EMAIL_DRIVER` environment variable)
   - Dual service support (SendGrid + SES)
   - Unified email template system
   - Proper error handling for both services

4. **Unit Tests**: `tests/mailer.test.ts` & `tests/email-send-route.test.ts`
   - Comprehensive test coverage for both services
   - Mock implementations for AWS SDK and SendGrid
   - Validation testing for all form types

### 📋 Environment Configuration

```bash
# Feature flag to switch between services
EMAIL_DRIVER=sendgrid  # or 'ses'

# AWS SES Configuration (new)
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY=your_aws_access_key
AWS_SES_SECRET=your_aws_secret_key
SES_FROM_EMAIL=noreply@stratanoble.com

# SendGrid Configuration (legacy)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@stratanoble.com

# Admin notifications
ADMIN_EMAIL=steve@stratanoble.com
```

## Deployment Process

### Phase 1: AWS SES Setup
1. **Configure AWS SES**:
   - Set up SES in desired region (recommend us-east-1)
   - Verify domain: stratanoble.com
   - Set up DKIM authentication
   - Configure SPF/DMARC records
   - Request production access (if needed)

2. **Create IAM User**:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "ses:SendEmail",
           "ses:SendRawEmail"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

### Phase 2: Staging Deployment
1. **Deploy to Netlify Staging**:
   ```bash
   # Set environment variables in Netlify dashboard
   EMAIL_DRIVER=ses
   AWS_SES_REGION=us-east-1
   AWS_SES_ACCESS_KEY=your_access_key
   AWS_SES_SECRET=your_secret_key
   SES_FROM_EMAIL=noreply@stratanoble.com
   ADMIN_EMAIL=steve@stratanoble.com
   ```

2. **Smoke Tests**:
   - Submit contact form → Verify steve@ receives notification
   - Submit analysis request → Verify confirmation email sent
   - Submit brand-digital intake → Verify admin notification
   - Submit workshop signup → Verify customer confirmation

3. **Verify SES Metrics**:
   - AWS Console → SES → Metrics
   - Check delivery rates, bounce rates, complaint rates
   - Verify DKIM pass in Gmail "Show Original"

### Phase 3: Production Rollout
1. **Gradual Migration**:
   ```bash
   # Week 1: Test in staging
   EMAIL_DRIVER=ses
   
   # Week 2: Deploy to production
   # Monitor for 48 hours before proceeding
   
   # Week 3: Full production with monitoring
   ```

2. **Monitoring**:
   - Watch SES dashboard for delivery metrics
   - Monitor application logs for email errors
   - Check admin@ inbox for test notifications
   - Verify customer confirmations are received

### Phase 4: Cleanup (After 14 days)
1. **Remove SendGrid Dependencies**:
   ```bash
   npm uninstall @sendgrid/mail
   ```

2. **Clean Environment Variables**:
   - Remove `SENDGRID_API_KEY`
   - Remove `FROM_EMAIL` (keep `SES_FROM_EMAIL`)
   - Update `.env.example`

3. **Code Cleanup**:
   - Remove SendGrid imports
   - Remove feature flag logic
   - Simplify `sendEmailViaService` function

## Rollback Plan

### Immediate Rollback
```bash
# Set environment variable and redeploy
EMAIL_DRIVER=sendgrid

# Ensure SendGrid keys are still active
SENDGRID_API_KEY=your_active_sendgrid_key
```

### Extended Rollback Window
- Keep SendGrid configuration for 14 days
- Monitor both services during transition
- SendGrid API keys remain active during rollback period

## Testing Checklist

### Form Testing
- [ ] Contact form (all forms on /contact)
- [ ] Discovery call request (/discovery)
- [ ] Analysis request (/data-analysis)
- [ ] Brand & Digital intake (/services/brand-digital)
- [ ] Workshop signup (/workshops)

### Email Verification
- [ ] Admin notifications received at steve@
- [ ] Customer confirmations sent successfully
- [ ] HTML templates render correctly
- [ ] DKIM signatures pass validation
- [ ] No bounce/complaint issues

### SES Dashboard Metrics
- [ ] Send rate > 95%
- [ ] Bounce rate < 5%
- [ ] Complaint rate < 0.1%
- [ ] Delivery metrics updating correctly

## Troubleshooting

### Common Issues
1. **"Email service not configured"**:
   - Check all required environment variables are set
   - Verify AWS credentials have SES permissions

2. **SES sending limits exceeded**:
   - Check SES console for current limits
   - Request limit increase if needed

3. **DKIM/SPF failures**:
   - Verify DNS records are properly configured
   - Allow 24-48 hours for DNS propagation

4. **High bounce rates**:
   - Check domain reputation
   - Verify recipient email addresses
   - Review SES suppression list

### Debugging
```bash
# Test email configuration
curl -X POST /api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "formType": "contact",
    "name": "Test User",
    "email": "test@example.com",
    "topic": "Test",
    "message": "Testing email service"
  }'
```

## Benefits of Migration

### Cost Optimization
- **SendGrid**: $14.95/month for 40K emails
- **AWS SES**: $0.10 per 1,000 emails (~$4/month for 40K)
- **Annual Savings**: ~$130/year

### Technical Benefits
- Better deliverability with proper domain authentication
- Native AWS integration for future services
- More detailed delivery and bounce tracking
- Lower latency for email sending
- Better scalability for high-volume periods

### Operational Benefits  
- Consolidated AWS billing
- Better monitoring and alerting integration
- More granular access controls via IAM
- Compliance with enterprise email requirements

## Success Metrics
- **Delivery Rate**: >99% (target)
- **Bounce Rate**: <2% (target) 
- **Complaint Rate**: <0.1% (target)
- **Response Time**: <500ms average
- **Uptime**: 99.9% availability

---

**Migration Status**: ✅ Code Complete | ⏳ Awaiting Deployment
**Next Steps**: Deploy to staging → Smoke test → Production rollout
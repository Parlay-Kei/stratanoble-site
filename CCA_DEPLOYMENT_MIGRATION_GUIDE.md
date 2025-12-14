# Cold Calling Agent - Deployment & Migration Guide

**Date**: October 27, 2025  
**Purpose**: Complete guide for locating, deploying, and migrating the CCA system

---

## 📍 System Location

### Current Installation
```
Root Directory: c:\Dev\StrataNoble
Platform: Next.js (React)
Framework: App Router (Next.js 13+)
```

---

## 📁 Complete File Inventory

### Core CCA Files (Essential)

#### 1. Dashboard UI
```
📄 apps/website/src/app/cold-calling/page.tsx
```
**What it does**: Main dashboard with push button and scheduler
**Size**: ~350 lines
**Description**: Client-facing UI with manual calling and campaign tabs

#### 2. Backend APIs
```
📄 apps/website/src/app/api/voice/call/route.ts
   - Initiates phone calls
   
📄 apps/website/src/app/api/voice/twiml/route.ts
   - Generates TwiML for call routing
   
📄 apps/website/src/app/api/voice/conversation/route.ts
   - Handles Jake's conversations
   
📄 apps/website/src/app/api/voice/status/route.ts
   - Tracks call status
   
📄 apps/website/src/app/api/cold-calling/campaigns/route.ts
   - Manages campaigns (NEW)
```

#### 3. Core Libraries
```
📄 apps/website/src/lib/conversation-config.ts
   - Jake persona + 4 campaign scripts
   - Qualification helpers
   - 700+ lines of conversation logic
   
📄 apps/website/src/lib/call-evaluator.ts
   - GPT-4 powered call evaluation
   
📄 apps/website/src/lib/call-evaluator-dslv.ts
   - DSLV-specific evaluation logic
   
📄 apps/website/src/lib/campaign-scheduler.ts
   - Full campaign management system
   - Timezone-aware scheduling
   - Retry logic
   
📄 apps/website/src/lib/twilio.ts
   - Twilio integration
   - Call initiation logic
```

#### 4. Test Scripts
```
📄 apps/website/scripts/test-cold-calling.js
   - Interactive testing script
```

#### 5. Environment Configuration
```
📄 apps/website/.env.local
   - All API keys and credentials
   - CRITICAL: Contains sensitive data
```

### Documentation Files
```
📄 DSLV_COLD_CALLING_START_TO_FINISH.md
   - Complete technical implementation guide
   
📄 DSLV_COLD_CALLING_IMPLEMENTATION_COMPLETE.md
   - Implementation summary
   
📄 CCA_CLIENT_USAGE_GUIDE.md
   - Client usage instructions
   
📄 CCA_DEPLOYMENT_MIGRATION_GUIDE.md
   - This file
```

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended - Easiest)

**Best For**: Quick deployment, automatic scaling, Next.js optimized

#### Steps:

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Navigate to project**:
```bash
cd apps/website
```

3. **Deploy**:
```bash
vercel
```

4. **Configure Environment Variables in Vercel Dashboard**:
- Go to vercel.com → Your Project → Settings → Environment Variables
- Add all variables from `.env.local`:
  ```
  OPENAI_API_KEY
  TWILIO_ACCOUNT_SID
  TWILIO_AUTH_TOKEN
  TWILIO_PHONE_NUMBER_PRIMARY
  NEXT_PUBLIC_APP_URL (set to your Vercel URL)
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  ```

5. **Deploy to Production**:
```bash
vercel --prod
```

**Cost**: Free tier available, $20/month for Pro

---

### Option 2: Netlify

**Best For**: Alternative to Vercel, similar features

#### Steps:

1. **Install Netlify CLI**:
```bash
npm install -g netlify-cli
```

2. **Build the project**:
```bash
cd apps/website
npm run build
```

3. **Deploy**:
```bash
netlify deploy --prod
```

4. **Configure Environment Variables**:
- Netlify Dashboard → Site Settings → Environment Variables
- Add all variables from `.env.local`

**Cost**: Free tier available, $19/month for Pro

---

### Option 3: AWS (EC2 + Elastic Beanstalk)

**Best For**: Enterprise deployments, full control

#### Steps:

1. **Package the application**:
```bash
cd apps/website
npm run build
```

2. **Create EC2 instance** (or use Elastic Beanstalk)

3. **Install Node.js** on the server:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

4. **Transfer files**:
```bash
# From your local machine
scp -r apps/website ubuntu@your-ec2-ip:/home/ubuntu/
```

5. **Set up environment variables**:
```bash
# On the server
cd /home/ubuntu/website
nano .env.local
# Paste your environment variables
```

6. **Install dependencies and start**:
```bash
npm install
npm run build
npm start
```

7. **Set up Process Manager (PM2)**:
```bash
npm install -g pm2
pm2 start npm --name "cold-calling-agent" -- start
pm2 save
pm2 startup
```

**Cost**: ~$10-50/month depending on instance size

---

### Option 4: Docker (Any Platform)

**Best For**: Containerized deployment, Kubernetes, cloud-agnostic

#### Steps:

1. **Create Dockerfile**:
```dockerfile
# apps/website/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

2. **Create .dockerignore**:
```
node_modules
.next
.env.local
*.md
```

3. **Build Docker image**:
```bash
cd apps/website
docker build -t cold-calling-agent .
```

4. **Run container**:
```bash
docker run -p 3000:3000 \
  -e OPENAI_API_KEY="sk-..." \
  -e TWILIO_ACCOUNT_SID="AC..." \
  -e TWILIO_AUTH_TOKEN="..." \
  -e TWILIO_PHONE_NUMBER_PRIMARY="+17027668008" \
  -e NEXT_PUBLIC_APP_URL="https://your-domain.com" \
  cold-calling-agent
```

5. **Push to Docker Hub** (optional):
```bash
docker tag cold-calling-agent your-username/cold-calling-agent
docker push your-username/cold-calling-agent
```

**Deploy to**:
- AWS ECS
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform
- Any Kubernetes cluster

---

## 📦 Complete Migration Guide

### Scenario: Moving to a New Platform

#### Step 1: Export Current System

**Create migration package**:
```bash
# From c:\Dev\StrataNoble
cd apps/website

# Create export directory
mkdir -p ../../cca-export

# Copy essential files
cp -r src/app/cold-calling ../../cca-export/
cp -r src/app/api/voice ../../cca-export/api-voice/
cp -r src/app/api/cold-calling ../../cca-export/api-cold-calling/
cp -r src/lib/conversation-config.ts ../../cca-export/
cp -r src/lib/call-evaluator*.ts ../../cca-export/
cp -r src/lib/campaign-scheduler.ts ../../cca-export/
cp -r src/lib/twilio.ts ../../cca-export/
cp -r scripts/test-cold-calling.js ../../cca-export/
cp package.json ../../cca-export/
cp .env.local.example ../../cca-export/
```

**Or use this PowerShell script** (Windows):
```powershell
# Save as: export-cca.ps1

$exportDir = "C:\Temp\cca-export"
New-Item -ItemType Directory -Force -Path $exportDir

$files = @(
    "src/app/cold-calling/page.tsx",
    "src/app/api/voice/call/route.ts",
    "src/app/api/voice/twiml/route.ts",
    "src/app/api/voice/conversation/route.ts",
    "src/app/api/voice/status/route.ts",
    "src/app/api/cold-calling/campaigns/route.ts",
    "src/lib/conversation-config.ts",
    "src/lib/call-evaluator.ts",
    "src/lib/call-evaluator-dslv.ts",
    "src/lib/campaign-scheduler.ts",
    "src/lib/twilio.ts",
    "scripts/test-cold-calling.js",
    "package.json"
)

foreach ($file in $files) {
    $source = "C:\Dev\StrataNoble\apps\website\$file"
    $destPath = Join-Path $exportDir (Split-Path $file -Parent)
    New-Item -ItemType Directory -Force -Path $destPath
    Copy-Item $source -Destination $destPath -Force
}

Write-Host "✅ Export complete: $exportDir"
```

#### Step 2: Set Up New Platform

**On the new platform**:

1. **Create new Next.js project** (if starting fresh):
```bash
npx create-next-app@latest cold-calling-agent
cd cold-calling-agent
```

2. **Copy files from export**:
```bash
# Copy dashboard
cp -r /path/to/cca-export/cold-calling ./src/app/

# Copy APIs
cp -r /path/to/cca-export/api-voice ./src/app/api/voice
cp -r /path/to/cca-export/api-cold-calling ./src/app/api/cold-calling

# Copy libraries
cp /path/to/cca-export/*.ts ./src/lib/

# Copy test script
cp /path/to/cca-export/test-cold-calling.js ./scripts/
```

3. **Install dependencies**:
```bash
npm install @twilio/voice-sdk openai
```

4. **Configure environment**:
```bash
cp .env.local.example .env.local
# Edit .env.local with your credentials
```

5. **Test locally**:
```bash
npm run dev
# Visit http://localhost:3000/cold-calling
```

6. **Deploy**:
```bash
vercel deploy --prod
# or
netlify deploy --prod
```

---

## 🔐 Environment Variables Checklist

When migrating, ensure these are set on new platform:

```env
# OpenAI (Required)
OPENAI_API_KEY=sk-proj-...

# Twilio (Required)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER_PRIMARY=+17027668008

# App URL (Required - update for new platform)
NEXT_PUBLIC_APP_URL=https://your-new-domain.com

# Supabase (Optional - for data storage)
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Other (Optional)
NEXT_PUBLIC_BASE_URL=https://your-new-domain.com
```

---

## 🧪 Post-Migration Testing

After migrating, test these functions:

### 1. Manual Calling
```bash
# Test the push button
1. Navigate to /cold-calling
2. Enter test phone number
3. Click "CALL NOW"
4. Verify call is received
```

### 2. Campaign API
```bash
# Test campaign creation
curl -X POST https://your-domain.com/api/cold-calling/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Campaign",
    "campaign_type": "internet",
    "leads": []
  }'
```

### 3. Call API
```bash
# Test call initiation
curl -X POST https://your-domain.com/api/voice/call \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+17021234567",
    "testName": "Migration Test",
    "metadata": {"campaign_type": "internet"}
  }'
```

### 4. TwiML Generation
```bash
# Test TwiML endpoint
curl https://your-domain.com/api/voice/twiml?campaignType=internet
```

---

## 📊 Platform Comparison

| Feature | Vercel | Netlify | AWS EC2 | Docker |
|---------|--------|---------|---------|--------|
| **Ease of Setup** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **Cost (monthly)** | $0-20 | $0-19 | $10-50 | Varies |
| **Auto-scaling** | ✅ | ✅ | Manual | Manual |
| **SSL/HTTPS** | ✅ Free | ✅ Free | Manual | Manual |
| **Environment Vars** | ✅ Easy | ✅ Easy | Manual | Docker env |
| **Best For** | Next.js apps | Jamstack | Enterprise | Flexibility |

---

## 🚨 Common Migration Issues

### Issue 1: Webhook URLs

**Problem**: Twilio webhooks pointing to old URL

**Solution**:
1. Update `NEXT_PUBLIC_APP_URL` in environment variables
2. Update Twilio webhook URLs in Twilio Console:
   - Voice URL: `https://new-domain.com/api/voice/twiml`
   - Status Callback: `https://new-domain.com/api/voice/status`

### Issue 2: Missing Dependencies

**Problem**: Package installation errors

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue 3: Environment Variables Not Loading

**Problem**: App can't access environment variables

**Solution**:
- Vercel/Netlify: Check dashboard environment variables
- EC2: Verify `.env.local` exists and has correct permissions
- Docker: Pass as `-e` flags or use `docker-compose.yml`

### Issue 4: Build Failures

**Problem**: Next.js build fails

**Solution**:
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

---

## 📝 Migration Checklist

### Pre-Migration
- [ ] Export all CCA files
- [ ] Copy `.env.local` (keep secure!)
- [ ] Document current Twilio webhook URLs
- [ ] Test current system one final time
- [ ] Backup database (if using)

### During Migration
- [ ] Set up new platform account
- [ ] Copy all files to new platform
- [ ] Install dependencies
- [ ] Configure environment variables
- [ ] Update `NEXT_PUBLIC_APP_URL`
- [ ] Deploy to new platform

### Post-Migration
- [ ] Test manual calling
- [ ] Test all 4 campaign types
- [ ] Update Twilio webhooks
- [ ] Test campaign scheduler
- [ ] Monitor first few calls
- [ ] Update documentation with new URL

---

## 💾 Backup Strategy

### What to Backup

1. **Code Files** (all CCA files listed above)
2. **Environment Variables** (`.env.local`)
3. **Documentation** (all .md files)
4. **Call History** (if storing in database)
5. **Campaign Data** (if using campaigns)

### Backup Script

```bash
#!/bin/bash
# backup-cca.sh

BACKUP_DIR="cca-backup-$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Copy code
cp -r src/app/cold-calling $BACKUP_DIR/
cp -r src/app/api/voice $BACKUP_DIR/
cp -r src/app/api/cold-calling $BACKUP_DIR/
cp -r src/lib/conversation-config.ts $BACKUP_DIR/
cp -r src/lib/call-evaluator*.ts $BACKUP_DIR/
cp -r src/lib/campaign-scheduler.ts $BACKUP_DIR/

# Copy environment (SECURE THIS!)
cp .env.local $BACKUP_DIR/env.backup

# Copy docs
cp ../../*.md $BACKUP_DIR/

# Create archive
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
rm -rf $BACKUP_DIR

echo "✅ Backup created: $BACKUP_DIR.tar.gz"
```

---

## 🎯 Quick Migration Commands

### Export (Windows PowerShell)
```powershell
# Run from: C:\Dev\StrataNoble\apps\website
.\export-cca.ps1
```

### Import to New Platform
```bash
# Extract backup
tar -xzf cca-backup-20251027.tar.gz

# Copy to new project
cp -r cca-backup-20251027/* ./

# Install and deploy
npm install
npm run build
vercel deploy --prod
```

---

## 📞 Support

If you encounter issues during migration:

1. **Check the logs**:
   - Vercel: Dashboard → Deployments → Logs
   - Netlify: Dashboard → Deploys → Deploy log
   - EC2: `journalctl -u your-service`

2. **Test locally first**:
   ```bash
   npm run dev
   # Test at http://localhost:3000/cold-calling
   ```

3. **Review documentation**:
   - `DSLV_COLD_CALLING_START_TO_FINISH.md`
   - `CCA_CLIENT_USAGE_GUIDE.md`

---

## ✅ Success Criteria

Your migration is successful when:

- [ ] Dashboard loads at `/cold-calling`
- [ ] Manual calling button works
- [ ] Test call completes successfully
- [ ] All 4 campaign types accessible
- [ ] Qualification scoring works
- [ ] No console errors
- [ ] Environment variables loaded
- [ ] Twilio webhooks responding

---

**System Location**: `C:\Dev\StrataNoble\apps\website`  
**Migration Ready**: ✅ Yes  
**Deployment Options**: 4+ platforms supported  
**Time to Migrate**: 30-60 minutes

---

**Ready to deploy or migrate your Cold Calling Agent!** 🚀

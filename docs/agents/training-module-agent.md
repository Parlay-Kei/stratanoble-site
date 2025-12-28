# Training Module Agent

## Purpose
Manages barber training courses, tracks progress, handles quiz scoring, and issues certifications.

## Capabilities
- Serve training module content (videos, quizzes)
- Track video watch progress with completion validation
- Score quizzes with pass/fail logic (80% threshold)
- Issue "Direct Cuts Certified" badge
- Generate PDF certificates
- Unlock advanced training modules based on tenure

## Configuration

### Environment Variables
```env
TRAINING_VIDEO_CDN=https://cdn.directcuts.com/training
CERTIFICATE_SIGNING_KEY=your_signing_key
```

### Database Tables
```sql
-- Training modules catalog
CREATE TABLE IF NOT EXISTS training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  thumbnail_url TEXT,
  category TEXT CHECK (category IN ('onboarding', 'advanced', 'safety', 'customer_service', 'upselling')),
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  is_required BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  prerequisites UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz questions per module
CREATE TABLE IF NOT EXISTS training_quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES training_modules(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- ["Option A", "Option B", "Option C", "Option D"]
  correct_answer INTEGER NOT NULL, -- 0-based index
  explanation TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Barber progress tracking
CREATE TABLE IF NOT EXISTS barber_training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID REFERENCES users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES training_modules(id) ON DELETE CASCADE,
  video_progress_seconds INTEGER DEFAULT 0,
  video_completed BOOLEAN DEFAULT false,
  video_completed_at TIMESTAMPTZ,
  quiz_attempts INTEGER DEFAULT 0,
  quiz_passed BOOLEAN DEFAULT false,
  quiz_score DECIMAL(5,2),
  quiz_passed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(barber_id, module_id)
);

-- Certifications issued
CREATE TABLE IF NOT EXISTS barber_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID REFERENCES users(id) ON DELETE CASCADE,
  certification_type TEXT NOT NULL CHECK (certification_type IN ('direct_cuts_certified', 'fade_specialist', 'beard_master', 'kids_specialist')),
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  certificate_url TEXT,
  verification_code TEXT UNIQUE,
  UNIQUE(barber_id, certification_type)
);

CREATE INDEX idx_training_progress_barber ON barber_training_progress(barber_id);
CREATE INDEX idx_certifications_barber ON barber_certifications(barber_id);
```

## Edge Function: training-module

### Endpoint
`POST /functions/v1/training-module`

### Actions

#### Get Module List
```typescript
// Request
{
  "action": "list",
  "barberId": "uuid",
  "category": "onboarding" // optional filter
}

// Response
{
  "modules": [
    {
      "id": "uuid",
      "title": "Welcome to Direct Cuts",
      "duration": 180,
      "thumbnail": "https://...",
      "progress": {
        "videoCompleted": true,
        "quizPassed": false,
        "quizScore": null
      },
      "locked": false
    }
  ],
  "overallProgress": {
    "completed": 2,
    "total": 5,
    "percentComplete": 40
  }
}
```

#### Update Video Progress
```typescript
// Request
{
  "action": "updateProgress",
  "barberId": "uuid",
  "moduleId": "uuid",
  "currentSeconds": 120,
  "completed": false
}

// Response
{
  "success": true,
  "videoCompleted": false,
  "progressPercent": 67
}
```

#### Submit Quiz
```typescript
// Request
{
  "action": "submitQuiz",
  "barberId": "uuid",
  "moduleId": "uuid",
  "answers": [0, 2, 1, 3, 2] // indices of selected answers
}

// Response
{
  "passed": true,
  "score": 80,
  "correctAnswers": 4,
  "totalQuestions": 5,
  "passingScore": 80,
  "attempts": 1,
  "feedback": [
    { "question": 1, "correct": true },
    { "question": 2, "correct": false, "explanation": "..." }
  ]
}
```

#### Issue Certification
```typescript
// Request
{
  "action": "issueCertification",
  "barberId": "uuid",
  "certificationType": "direct_cuts_certified"
}

// Response
{
  "success": true,
  "certificationId": "uuid",
  "verificationCode": "DC-2024-ABC123",
  "certificateUrl": "https://cdn.directcuts.com/certs/xxx.pdf",
  "badgeUnlocked": true
}
```

## Onboarding Course Structure

### Required Modules (3-5 min each)
1. **Welcome to Direct Cuts** - Platform overview, mission
2. **How House Calls Work** - Scheduling, travel, setup
3. **Safety & Professionalism** - Client home protocols
4. **Customer Service Excellence** - Communication, ratings
5. **Maximizing Your Earnings** - Tips, upsells, bonuses

### Quiz Requirements
- 5 questions per module
- 80% to pass (4/5 correct)
- Unlimited retakes
- Must complete all 5 modules for certification

## Advanced Training (Unlocked after 90 days)
- Fade Mastery Techniques
- Beard Sculpting & Design
- Kids & Family Cuts
- Mobile Setup Optimization
- Product Knowledge & Upselling

## Certificate Generation

Uses Puppeteer to generate PDF certificates with:
- Barber name and photo
- Certification type and date
- Unique verification code (QR scannable)
- Direct Cuts branding
- Digital signature

## Profile Integration

When certified:
- "Direct Cuts Certified" badge on profile
- Verification code for customers
- Higher visibility in search results
- Access to premium booking slots

## CLI Commands
```bash
# Seed training content
npm run agent:training seed

# Check barber progress
npm run agent:training progress --barber-id=xxx

# Force issue certification (admin)
npm run agent:training certify --barber-id=xxx --type=direct_cuts_certified

# Generate progress report
npm run agent:training report --output=training-report.csv
```

## Analytics Events
- `training.module.started`
- `training.video.completed`
- `training.quiz.attempted`
- `training.quiz.passed`
- `training.certification.issued`

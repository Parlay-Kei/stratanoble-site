# AI Cut Finder - Technical Specification

**Version:** 0.1 (MVP)  
**Status:** Draft  
**Last Updated:** December 10, 2025

---

## Executive Summary

Build an AI-powered haircut recommendation system that helps customers discover styles suited to their face shape, then seamlessly attaches those preferences to bookings for barbers.

**Core insight:** Most guys don't know haircut terminology. This feature owns the "what should I get?" moment.

---

## Iteration Strategy

### Phase 0: Style Quiz (No CV Required) — 1-2 weeks
Validate demand before engineering investment.

### Phase 1: Face Shape Detection — 2-3 weeks  
Single selfie → face shape classification → style recommendations.

### Phase 2: Visual Previews — 4-6 weeks  
Hair segmentation + reference photo matching.

### Phase 3: AR Try-On — TBD  
Live preview with overlays. Scope after Phase 2 learnings.

---

## Phase 0: Style Quiz

### Purpose
- Validate user interest in style recommendations
- Build the recommendation engine and style catalog first
- Zero ML infrastructure required

### User Flow
```
HomeScreen → "Find Your Style" CTA → StyleQuizScreen
  ├── Q1: Face Shape (show examples with photos)
  ├── Q2: Hair Type (straight, wavy, curly, coily)
  ├── Q3: Lifestyle (professional, casual, trendy)
  ├── Q4: Maintenance (low, medium, high)
  └── Results: 3-4 recommended styles with photos
       └── "Book This Style" → BookingModal with style attached
```

### Data Model

```typescript
// New types in src/types/index.ts

export interface HaircutStyle {
  id: string;
  name: string;                    // "Low Skin Fade + Textured Crop"
  shortName: string;               // "Textured Crop"
  description: string;
  category: StyleCategory;
  
  // Recommendation factors
  suitableFaceShapes: FaceShape[];
  suitableHairTypes: HairType[];
  maintenanceLevel: MaintenanceLevel;
  professionalFriendly: boolean;
  
  // Visual
  referenceImages: string[];       // URLs to style photos
  
  // Barber guidance
  fadeLevel: FadeLevel;
  topLengthMm: { min: number; max: number };
  guardNumbers: string;            // "0, 0.5, 1.5"
  beardStyle?: BeardStyle;
  estimatedDurationMin: number;
  
  // Metadata
  popularity: number;              // 0-100, for trending
  createdAt: string;
}

export type FaceShape = 'oval' | 'round' | 'square' | 'heart' | 'oblong';
export type HairType = 'straight' | 'wavy' | 'curly' | 'coily';
export type MaintenanceLevel = 'low' | 'medium' | 'high';
export type StyleCategory = 'classic' | 'modern' | 'trendy' | 'professional';
export type FadeLevel = 'none' | 'low' | 'mid' | 'high' | 'skin';
export type BeardStyle = 'clean' | 'stubble' | 'short_boxed' | 'full' | 'tapered';

export interface StyleQuizResponse {
  faceShape: FaceShape;
  hairType: HairType;
  lifestyle: 'professional' | 'casual' | 'trendy';
  maintenance: MaintenanceLevel;
}

export interface StyleRecommendation {
  styleId: string;
  style: HaircutStyle;
  matchScore: number;              // 0-100
  matchReasons: string[];          // ["Great for round faces", "Low maintenance"]
}

// Extension to existing Appointment type
export interface AppointmentStyleInfo {
  appointmentId: string;
  recommendedStyleId?: string;
  faceShape?: FaceShape;
  customerNotes?: string;
  referenceImageUrl?: string;
}
```

### Database Schema

```sql
-- New table: haircut_styles
CREATE TABLE haircut_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('classic', 'modern', 'trendy', 'professional')),
  
  -- Recommendation factors (stored as JSONB arrays)
  suitable_face_shapes JSONB DEFAULT '[]'::jsonb,
  suitable_hair_types JSONB DEFAULT '[]'::jsonb,
  maintenance_level TEXT CHECK (maintenance_level IN ('low', 'medium', 'high')),
  professional_friendly BOOLEAN DEFAULT true,
  
  -- Visual
  reference_images JSONB DEFAULT '[]'::jsonb,
  
  -- Barber guidance
  fade_level TEXT CHECK (fade_level IN ('none', 'low', 'mid', 'high', 'skin')),
  top_length_mm_min INTEGER,
  top_length_mm_max INTEGER,
  guard_numbers TEXT,
  beard_style TEXT,
  estimated_duration_min INTEGER DEFAULT 45,
  
  -- Metadata
  popularity INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Style recommendations attached to appointments
CREATE TABLE appointment_style_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  recommended_style_id UUID REFERENCES haircut_styles(id),
  face_shape TEXT,
  customer_notes TEXT,
  reference_image_url TEXT,
  quiz_responses JSONB,           -- Store full quiz for analytics
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(appointment_id)
);

-- Index for style lookups
CREATE INDEX idx_styles_face_shape ON haircut_styles USING GIN (suitable_face_shapes);
CREATE INDEX idx_styles_active ON haircut_styles (is_active) WHERE is_active = true;

-- RLS Policies
ALTER TABLE haircut_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_style_info ENABLE ROW LEVEL SECURITY;

-- Styles are readable by everyone
CREATE POLICY "Styles are viewable by all" ON haircut_styles
  FOR SELECT USING (is_active = true);

-- Style info readable by appointment participants
CREATE POLICY "Style info viewable by participants" ON appointment_style_info
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.id = appointment_id
      AND (a.customer_id = auth.uid() OR a.barber_id = auth.uid())
    )
  );

-- Customers can insert style info for their bookings
CREATE POLICY "Customers can add style info" ON appointment_style_info
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.id = appointment_id
      AND a.customer_id = auth.uid()
    )
  );
```

### Service Layer

```typescript
// New file: src/services/styleService.ts

import { supabase } from '../lib/supabaseClient';
import { 
  HaircutStyle, 
  StyleQuizResponse, 
  StyleRecommendation,
  FaceShape 
} from '../types';

export const StyleService = {
  /**
   * Get all active styles
   */
  getAllStyles: async (): Promise<HaircutStyle[]> => {
    const { data, error } = await supabase
      .from('haircut_styles')
      .select('*')
      .eq('is_active', true)
      .order('popularity', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(mapToHaircutStyle);
  },

  /**
   * Get style recommendations based on quiz responses
   */
  getRecommendations: async (
    quiz: StyleQuizResponse
  ): Promise<StyleRecommendation[]> => {
    const styles = await StyleService.getAllStyles();
    
    const scored = styles.map(style => {
      let score = 0;
      const reasons: string[] = [];
      
      // Face shape match (40 points)
      if (style.suitableFaceShapes.includes(quiz.faceShape)) {
        score += 40;
        reasons.push(`Great for ${quiz.faceShape} faces`);
      }
      
      // Hair type match (30 points)
      if (style.suitableHairTypes.includes(quiz.hairType)) {
        score += 30;
        reasons.push(`Works well with ${quiz.hairType} hair`);
      }
      
      // Maintenance match (20 points)
      if (style.maintenanceLevel === quiz.maintenance) {
        score += 20;
        reasons.push(`${quiz.maintenance} maintenance`);
      }
      
      // Professional friendly bonus (10 points)
      if (quiz.lifestyle === 'professional' && style.professionalFriendly) {
        score += 10;
        reasons.push('Office appropriate');
      }
      
      // Trendy bonus
      if (quiz.lifestyle === 'trendy' && style.category === 'trendy') {
        score += 10;
        reasons.push('Currently trending');
      }
      
      return {
        styleId: style.id,
        style,
        matchScore: Math.min(score, 100),
        matchReasons: reasons
      };
    });
    
    // Return top 4 matches, minimum score 30
    return scored
      .filter(r => r.matchScore >= 30)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 4);
  },

  /**
   * Attach style info to an appointment
   */
  attachStyleToAppointment: async (
    appointmentId: string,
    styleId: string,
    quizResponses?: StyleQuizResponse
  ): Promise<void> => {
    const { error } = await supabase
      .from('appointment_style_info')
      .upsert({
        appointment_id: appointmentId,
        recommended_style_id: styleId,
        face_shape: quizResponses?.faceShape,
        quiz_responses: quizResponses
      });
    
    if (error) throw error;
  },

  /**
   * Get style info for an appointment (barber view)
   */
  getAppointmentStyleInfo: async (appointmentId: string) => {
    const { data, error } = await supabase
      .from('appointment_style_info')
      .select(`
        *,
        style:haircut_styles(*)
      `)
      .eq('appointment_id', appointmentId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Get trending styles for homepage
   */
  getTrendingStyles: async (limit = 6): Promise<HaircutStyle[]> => {
    const { data, error } = await supabase
      .from('haircut_styles')
      .select('*')
      .eq('is_active', true)
      .order('popularity', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return (data || []).map(mapToHaircutStyle);
  }
};

// Helper mapper
const mapToHaircutStyle = (row: any): HaircutStyle => ({
  id: row.id,
  name: row.name,
  shortName: row.short_name,
  description: row.description,
  category: row.category,
  suitableFaceShapes: row.suitable_face_shapes || [],
  suitableHairTypes: row.suitable_hair_types || [],
  maintenanceLevel: row.maintenance_level,
  professionalFriendly: row.professional_friendly,
  referenceImages: row.reference_images || [],
  fadeLevel: row.fade_level,
  topLengthMm: { 
    min: row.top_length_mm_min, 
    max: row.top_length_mm_max 
  },
  guardNumbers: row.guard_numbers,
  beardStyle: row.beard_style,
  estimatedDurationMin: row.estimated_duration_min,
  popularity: row.popularity,
  createdAt: row.created_at
});
```

### UI Components

```
src/
├── pages/
│   └── customer/
│       └── StyleQuizScreen.tsx      # Main quiz flow
├── components/
│   └── styles/
│       ├── StyleCard.tsx            # Style preview card
│       ├── StyleQuizQuestion.tsx    # Individual question component
│       ├── StyleResults.tsx         # Results with recommendations
│       ├── FaceShapeSelector.tsx    # Visual face shape picker
│       └── StyleDetailModal.tsx     # Full style details + book CTA
```

### Seed Data (Initial Styles)

```sql
-- Insert 10 starter styles
INSERT INTO haircut_styles (
  name, short_name, description, category,
  suitable_face_shapes, suitable_hair_types,
  maintenance_level, professional_friendly,
  fade_level, top_length_mm_min, top_length_mm_max,
  guard_numbers, estimated_duration_min, popularity
) VALUES
(
  'Low Skin Fade + Textured Crop',
  'Textured Crop',
  'Clean, modern look with textured top and sharp fade. Versatile for work and weekends.',
  'modern',
  '["oval", "square", "heart"]'::jsonb,
  '["straight", "wavy"]'::jsonb,
  'medium',
  true,
  'skin',
  25, 50,
  '0, 0.5, 1.5',
  45,
  95
),
(
  'Classic Taper + Side Part',
  'Side Part',
  'Timeless professional cut. Clean sides, structured top with natural part.',
  'classic',
  '["oval", "oblong", "heart"]'::jsonb,
  '["straight", "wavy"]'::jsonb,
  'low',
  true,
  'none',
  40, 75,
  '2, 3, 4',
  35,
  80
),
(
  'Mid Fade + Curly Top',
  'Curly Mid Fade',
  'Showcases natural curl texture on top with clean mid fade on sides.',
  'modern',
  '["round", "oval", "square"]'::jsonb,
  '["curly", "coily"]'::jsonb,
  'medium',
  true,
  'mid',
  30, 60,
  '0.5, 1, 2',
  50,
  88
),
(
  'High Fade + Pompadour',
  'Modern Pompadour',
  'Bold, trendy style with volume on top and dramatic high fade.',
  'trendy',
  '["round", "oval"]'::jsonb,
  '["straight", "wavy"]'::jsonb,
  'high',
  false,
  'high',
  50, 100,
  '0, 0.5, 1',
  55,
  75
),
(
  'Buzz Cut + Line Up',
  'Clean Buzz',
  'Low maintenance, sharp look. Even length all around with crisp edges.',
  'classic',
  '["oval", "square", "oblong"]'::jsonb,
  '["straight", "wavy", "curly", "coily"]'::jsonb,
  'low',
  true,
  'none',
  3, 12,
  '1, 2',
  25,
  70
),
(
  'Drop Fade + Quiff',
  'Drop Fade Quiff',
  'Trendy style with dramatic drop fade and voluminous front.',
  'trendy',
  '["oval", "heart", "square"]'::jsonb,
  '["straight", "wavy"]'::jsonb,
  'high',
  false,
  'low',
  50, 100,
  '0.5, 1, 2',
  50,
  82
),
(
  'Taper Fade + Afro',
  'Tapered Afro',
  'Natural afro shape with clean tapered sides. Celebrates texture.',
  'modern',
  '["oval", "round", "heart"]'::jsonb,
  '["curly", "coily"]'::jsonb,
  'medium',
  true,
  'low',
  40, 80,
  '1, 2, 3',
  45,
  78
),
(
  'Skin Fade + French Crop',
  'French Crop',
  'European-inspired cut with textured fringe and tight fade.',
  'trendy',
  '["oval", "oblong", "heart"]'::jsonb,
  '["straight", "wavy"]'::jsonb,
  'medium',
  true,
  'skin',
  20, 40,
  '0, 0.5, 1',
  40,
  85
),
(
  'Low Fade + Slick Back',
  'Slick Back',
  'Sophisticated look with length swept back and subtle fade.',
  'classic',
  '["oval", "square", "oblong"]'::jsonb,
  '["straight", "wavy"]'::jsonb,
  'medium',
  true,
  'low',
  75, 125,
  '1.5, 2, 3',
  40,
  72
),
(
  'Mid Fade + Faux Hawk',
  'Faux Hawk',
  'Edgy style with length down the middle and faded sides.',
  'trendy',
  '["oval", "round", "square"]'::jsonb,
  '["straight", "wavy", "curly"]'::jsonb,
  'high',
  false,
  'mid',
  30, 75,
  '0.5, 1, 2',
  45,
  68
);
```

### Barber View Enhancement

Add style info display to barber's appointment detail view:

```typescript
// In barber appointment detail component
const styleInfo = await StyleService.getAppointmentStyleInfo(appointmentId);

// Display component showing:
// - Recommended style name + photo
// - Face shape
// - Fade level, guard numbers, estimated time
// - "AI-Prepped Cut" badge
```

---

## Phase 1: Face Shape Detection

### Prerequisites
- Phase 0 complete and validated
- Style catalog has 15+ styles with diverse face shape coverage

### Technical Approach

**Option A: On-device (Recommended for MVP)**
- Use MediaPipe Face Mesh via TensorFlow.js
- Runs in browser, no backend required
- ~468 facial landmarks → calculate ratios → classify shape

**Option B: Backend API**
- Python FastAPI service
- Better accuracy, more control
- Requires infrastructure

### Face Shape Classification Logic

```typescript
// Face shape detection from MediaPipe landmarks
// Key measurements:
// - Face width: distance between cheekbones (landmarks 234, 454)
// - Face height: hairline to chin (landmarks 10, 152)
// - Jaw width: distance between jaw points (landmarks 172, 397)
// - Forehead width: between temples (landmarks 70, 300)

interface FaceMetrics {
  faceWidth: number;
  faceHeight: number;
  jawWidth: number;
  foreheadWidth: number;
}

const classifyFaceShape = (metrics: FaceMetrics): FaceShape => {
  const { faceWidth, faceHeight, jawWidth, foreheadWidth } = metrics;
  
  const widthToHeightRatio = faceWidth / faceHeight;
  const jawToForeheadRatio = jawWidth / foreheadWidth;
  const jawToFaceWidthRatio = jawWidth / faceWidth;
  
  // Oval: Length > Width, rounded jaw
  if (widthToHeightRatio < 0.75 && jawToFaceWidthRatio < 0.85) {
    return 'oval';
  }
  
  // Round: Similar width and height, soft features
  if (widthToHeightRatio > 0.85 && jawToFaceWidthRatio > 0.9) {
    return 'round';
  }
  
  // Square: Similar width and height, strong jaw
  if (widthToHeightRatio > 0.8 && jawToForeheadRatio > 0.95) {
    return 'square';
  }
  
  // Heart: Wide forehead, narrow jaw
  if (jawToForeheadRatio < 0.8) {
    return 'heart';
  }
  
  // Oblong: Long face
  if (widthToHeightRatio < 0.65) {
    return 'oblong';
  }
  
  return 'oval'; // Default fallback
};
```

### User Flow Update

```
StyleQuizScreen (updated)
  ├── "Take a Selfie" (new primary CTA)
  │   ├── Camera capture
  │   ├── MediaPipe analysis (2-3 seconds)
  │   ├── Show detected face shape with confidence
  │   └── Continue to Q2-Q4 of quiz
  │
  └── "I'll Choose Myself" (fallback to manual selection)
```

---

## Phase 2: Visual Previews

### Scope
- Hair segmentation to isolate current hair region
- Match user to reference photos of similar face shapes with target styles
- Not full AR try-on (that's Phase 3)

### Technical Stack
- Hair segmentation: MobileNet-UNet model (pretrained)
- Reference matching: Find closest face shape match in style photo database
- Display: Side-by-side "Similar to you" + "This style" comparison

### New Data Required
- Reference photos tagged with face shape
- Before/after pairs for popular styles

---

## Success Metrics

### Phase 0
- **Engagement:** 15% of users who see CTA complete the quiz
- **Conversion:** 25% of quiz completers book within 7 days
- **Quality:** Net Promoter Score from post-booking survey

### Phase 1
- **Adoption:** 50% of quiz users choose selfie over manual
- **Accuracy:** 80% user agreement with detected face shape
- **Speed:** Detection completes in <3 seconds

### Phase 2
- **Engagement:** +20% time on results page vs Phase 1
- **Sharing:** 10% of users share their preview

---

## Implementation Checklist

### Phase 0 Sprint

**Week 1:**
- [ ] Create `haircut_styles` and `appointment_style_info` tables
- [ ] Add types to `src/types/index.ts`
- [ ] Build `StyleService` with recommendation logic
- [ ] Seed database with 10 initial styles

**Week 2:**
- [ ] Build `StyleQuizScreen` with 4-question flow
- [ ] Create `FaceShapeSelector` with visual examples
- [ ] Build `StyleCard` and `StyleResults` components
- [ ] Add style info display to barber appointment view
- [ ] Add "Find Your Style" CTA to HomeScreen
- [ ] Analytics events for quiz funnel

---

## Open Questions

1. **Style photos:** Where are we sourcing reference images? Consider:
   - Stock photos (Unsplash, licensed)
   - User-submitted (with consent)
   - AI-generated style previews

2. **Style catalog management:** Who adds/updates styles?
   - Admin panel needed, or manual DB for MVP?

3. **Barber customization:** Should barbers be able to mark which styles they specialize in?

---

## Appendix: Face Shape Examples

| Shape | Characteristics | Example Styles |
|-------|----------------|----------------|
| Oval | Balanced proportions, slightly longer than wide | Most styles work well |
| Round | Equal width/height, soft features | Higher fades, textured tops to add length |
| Square | Strong jawline, angular features | Softer textures, mid fades |
| Heart | Wide forehead, narrow chin | Side parts, textured crops |
| Oblong | Long face, narrow width | Avoid excessive height, use fuller sides |

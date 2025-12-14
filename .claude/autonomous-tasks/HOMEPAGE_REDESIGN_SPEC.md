# StrataNoble Homepage Redesign - Autonomous Execution Specification

> **Execution Mode:** AUTONOMOUS - No human interaction required
> **Target:** Transform homepage from current state to consolidated messaging

---

## 1. Mission Objective

Transform the StrataNoble homepage from scattered multi-CTA state to focused structure:
- Clear identity statement
- Defined audience  
- Three solution pillars
- Single primary CTA path
- Consolidated statistics (ONE location)

---

## 2. Files to Modify

```
apps/website/src/app/page.tsx
apps/website/src/components/HeroSectionAligned.tsx
apps/website/src/components/WhatIsStrataNoble.tsx
apps/website/src/components/WhatWeDoFlow.tsx
apps/website/src/components/WhyStrataNobleGrid.tsx
apps/website/src/components/CtaSection.tsx
```

---

## 3. Task Queue (13 Tasks)

### Phase 1: Component Updates

**HERO-001** - Remove rotating stats from Hero
- Delete: useState for currentStatIndex, marketStats array, useEffect interval
- Delete: Market Intelligence motion.div

**HERO-002** - Reduce CTAs to single primary  
- Replace 3 buttons with: "Start Your Free Assessment" + text link

**WHAT-001** - Update identity statement
- Use Primary Statement from MESSAGING_FRAMEWORK.md
- Add "What We Are NOT" list

**WHAT-002** - Add Who We Serve section
- Three segments: Local Practices, Solo Firms, Small Teams

**FLOW-001** - Simplify to 3 steps
- Listen → Analyze → Build & Support

**WHY-001** - Consolidate stats
- Remove scattered stats, create ONE "Track Record" section

**WHY-002** - Verify mission statement present

**CTA-001** - Simplify CTA section
- Headline: "Ready to Stop Guessing?"
- Single button + text link
- Remove duplicate stats

### Phase 2: Integration

**PAGE-001** - Remove OpportunityInsightSection from page.tsx

### Phase 3: Testing

**TEST-001** - Visual regression test
**TEST-002** - Accessibility audit (Lighthouse ≥90)
**QA-001** - Code quality check

### Phase 4: Deployment

**DEPLOY-001** - Deploy to preview

---

## 4. Agent Assignments

| Task | Agent |
|------|-------|
| HERO-001/002 | frontend-developer |
| WHAT-001/002 | frontend-developer |
| FLOW-001 | frontend-developer |
| WHY-001/002 | frontend-developer |
| CTA-001 | frontend-developer |
| PAGE-001 | frontend-developer |
| TEST-001/002 | web-automation-tester |
| QA-001 | pre-deployment-quality-auditor |
| DEPLOY-001 | infra-deployment-specialist |

---

## 5. Validation Gates

### Gate 1: Pre-Flight
- Git clean
- Spec files exist
- Dependencies installed

### Gate 2: Per-Task
- TypeScript compiles
- ESLint passes
- Component renders

### Gate 3: Integration
- Build succeeds
- Bundle size delta <5%

### Gate 4: Visual
- Lighthouse scores maintained
- No console errors

### Gate 5: Pre-Deploy
- All tests pass
- Security audit clean

---

## 6. Rollback Triggers

| Condition | Action |
|-----------|--------|
| Build fails | git checkout -- . |
| Lighthouse drops >10 | git revert HEAD |
| Console errors | git revert HEAD |
| Bundle size +10% | git revert HEAD |

---

## 7. Success Criteria

Task COMPLETE when:
1. Homepage has 6 sections
2. Statistics in ONE location
3. Single primary CTA throughout
4. Hero has no rotating elements
5. Identity content matches framework
6. Process is 3 steps
7. Build succeeds
8. Lighthouse maintained
9. Deployed to preview

---

## 8. Execution Command

```bash
cd C:\Dev\StrataNoble
git checkout -b feature/homepage-redesign-autonomous

# Agents process tasks from TASK_QUEUE.json
# Each task updates status.json on completion
# Validation gates checked between phases

npm run build
netlify deploy --dir=apps/website/.next
```

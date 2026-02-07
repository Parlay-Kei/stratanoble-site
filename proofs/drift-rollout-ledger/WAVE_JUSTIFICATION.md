# Wave Assignment Justification

## Overview
This document provides detailed justification for the wave assignments in the Governance Drift Rollout Ledger.

## Wave Assignment Criteria

### Wave 0: Already Compliant
**Repositories**: Direct-Cuts, DSLV
**Justification**: These repositories already have proper ANX_ROOT.pointer files and resolve to the canonical governance root. No action required.

### Wave 1: Quick Wins (Feb 1-7)
**Repositories**: anx-audit-control, anx-audit-test*, anx-test-install, CREA
**Justification**:
- All have EASY_MISCONFIG (just missing pointer file)
- Test repositories with low risk
- Simple 5-minute fix
- Can be automated with script
- Good for testing remediation process

**Why WARN only**: Low impact repos, voluntary compliance encouraged

### Wave 2: Active Development (Feb 8-14)
**Repository**: StrataNoble
**Justification**:
- Critical platform repository
- Has pointer but also local governance overrides
- STRUCTURAL_MISMATCH requires careful handling
- Active development needs coordination
- High priority (35) due to importance

**Why BLOCK_BRANCHES**: Prevents new technical debt while allowing existing work

### Wave 3: Client Coordination (Feb 15-21)
**Repositories**: msaudreys-house, Household_Ticket, DC-2
**Justification**:
- Client-facing projects require stakeholder communication
- msaudreys-house has pointer but local overrides
- DC-2 and Household_Ticket have local governance
- Need scheduled maintenance windows
- Client approval required before changes

**Why BLOCK_MERGES**: Forces remediation before production updates

### Wave 4: Final Enforcement (Feb 22-28)
**Repositories**: MPL, flutter, Konjode
**Justification**:
- MPL has INTENTIONAL_DIVERGENCE (custom pointer content)
- flutter and Konjode have STRUCTURAL_MISMATCH
- May need architectural review
- Possible exemption candidates
- Lower priority or complex cases

**Why FULL_ENFORCEMENT**: Final deadline, no further delays

## Enforcement Escalation Rationale

### Progressive Enforcement Benefits
1. **Gradual Adoption**: Teams have time to plan
2. **Risk Mitigation**: Start with low-risk repos
3. **Learning Opportunity**: Early waves inform later ones
4. **Resource Management**: Support team not overwhelmed
5. **Client Relations**: Adequate notice for external stakeholders

### Enforcement Level Mapping
| Level | Impact | Rationale |
|-------|--------|-----------|
| WARN | Minimal | Education and awareness phase |
| BLOCK_BRANCHES | Moderate | Prevents new issues, allows fixes |
| BLOCK_MERGES | Significant | Forces action before production |
| FULL_ENFORCEMENT | Complete | Final deadline enforcement |

## Special Considerations

### Test Repositories (Wave 1)
- Named with "test" or "audit" prefixes
- Safe for experimentation
- No production dependencies
- Ideal for process validation

### Platform Critical (Wave 2)
- StrataNoble affects entire platform
- Needs architect involvement
- Careful testing required
- Rollback plan essential

### Client Projects (Wave 3)
- External stakeholder dependencies
- SLA considerations
- Communication lead time
- Possible custom requirements

### Complex Cases (Wave 4)
- MPL's intentional divergence needs analysis
- May require exemption process
- Architecture team review
- Possible valid business reasons

## Risk-Based Prioritization

### High Priority (30+)
- StrataNoble (35): Platform critical + structural issues
- msaudreys-house (30): Client project + has overrides

### Medium Priority (20-29)
- Household_Ticket (20): Client project, structural issues
- DC-2 (20): Client project, local governance

### Lower Priority (<20)
- Test repositories (5-15): Low risk, easy fixes
- MPL (5): Intentional divergence, needs analysis
- flutter, Konjode (15): Development projects

## Timeline Justification

### Why 4 Weeks Total
- **Week 1**: Establish process, handle easy cases
- **Week 2**: Address critical platform issues
- **Week 3**: Coordinate with clients
- **Week 4**: Final cleanup and exceptions

### Why February 2026
- After initial discovery (January)
- Before Q1 2026 end
- Avoids holiday periods
- Allows for Q2 planning with clean slate

## Success Factors

1. **Clear Communication**: Each wave has defined notification
2. **Adequate Support**: 2 hours/day allocated
3. **Rollback Provision**: 24-hour safety window
4. **Exemption Process**: CTO can approve exceptions
5. **Progressive Enforcement**: Gradual increase in strictness

---

This wave assignment balances technical requirements, business needs, and risk management to achieve 100% governance compliance by February 28, 2026.
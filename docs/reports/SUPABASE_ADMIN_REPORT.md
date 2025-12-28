# Supabase Admin Report

**Generated:** 12/26/2025, 8:13:16 PM
**Project:** bvneqoevtwodyfqglpzi
**URL:** https://bvneqoevtwodyfqglpzi.supabase.co

---

## Executive Summary

- **Total Issues:** 8
- **Critical Issues:** 8
- **Warnings:** 0
- **Recommendations:** 3

---

## Project Status

- **Status:** Could not determine project status

---

## Migrations

- **Local Migrations:** 25
- **Remote Migrations:** Unknown


⚠️ **Warning:** Migration count mismatch detected


### Local Migration Files

- 0001_init_core_tables.sql
- 0002_core_indexes.sql
- 0003_core_triggers.sql
- 0004_core_rls.sql
- 0005_saas_tables.sql
- 0006_saas_indexes.sql
- 0007_saas_triggers.sql
- 0008_saas_rls.sql
- 0009_saas_functions.sql
- 0010_seed_data.sql
- 0011_monitoring.sql
- 0012_fix_metric_summary.sql
- 0013_update_live_stripe_prices.sql
- 0014_fix_tier_detection.sql
- 0015_security_fixes.sql
- 0016_phase_three_leads_table.sql
- 0017_phase_three_email_sequences.sql
- 0018_early_access_signups.sql
- 0019_fix_leads_rls_and_security.sql
- 0021_security_definer_views_documentation.sql
- 0022_migration_drift_catchup.sql
- 0023_fix_credentials_due_for_rotation_view.sql
- APPLY_VIA_SQL_EDITOR_auto_security_fixes.sql
- APPLY_VIA_SQL_EDITOR_fix_leads_rls.sql
- APPLY_VIA_SQL_EDITOR_performance_fixes.sql

---

## Security Advisors


- **Total Issues:** 6
- **Errors:** 6
- **Warnings:** 0

### Critical Issues


#### Security Definer View

- **Type:** security_definer_view
- **Level:** ERROR
- **Detail:** View \`public.service_credentials_summary\` is defined with the SECURITY DEFINER property
- **Remediation:** [https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view](https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view)


#### Security Definer View

- **Type:** security_definer_view
- **Level:** ERROR
- **Detail:** View \`public.credentials_due_for_rotation\` is defined with the SECURITY DEFINER property
- **Remediation:** [https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view](https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view)


#### Security Definer View

- **Type:** security_definer_view
- **Level:** ERROR
- **Detail:** View \`public.service_health_summary\` is defined with the SECURITY DEFINER property
- **Remediation:** [https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view](https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view)


#### Security Definer View

- **Type:** security_definer_view
- **Level:** ERROR
- **Detail:** View \`public.current_client_metrics\` is defined with the SECURITY DEFINER property
- **Remediation:** [https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view](https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view)


#### Security Definer View

- **Type:** security_definer_view
- **Level:** ERROR
- **Detail:** View \`public.recent_vault_access\` is defined with the SECURITY DEFINER property
- **Remediation:** [https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view](https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view)


#### RLS Disabled in Public

- **Type:** rls_disabled_in_public
- **Level:** ERROR
- **Detail:** Table \`public.leads\` is public, but RLS has not been enabled.
- **Remediation:** [https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public](https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public)



---

## Issues Found


### ❌ Security Definer View

- **Category:** security
- **Details:** View \`public.service_credentials_summary\` is defined with the SECURITY DEFINER property
- **Remediation:** https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view


### ❌ Security Definer View

- **Category:** security
- **Details:** View \`public.credentials_due_for_rotation\` is defined with the SECURITY DEFINER property
- **Remediation:** https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view


### ❌ Security Definer View

- **Category:** security
- **Details:** View \`public.service_health_summary\` is defined with the SECURITY DEFINER property
- **Remediation:** https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view


### ❌ Security Definer View

- **Category:** security
- **Details:** View \`public.current_client_metrics\` is defined with the SECURITY DEFINER property
- **Remediation:** https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view


### ❌ Security Definer View

- **Category:** security
- **Details:** View \`public.recent_vault_access\` is defined with the SECURITY DEFINER property
- **Remediation:** https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view


### ❌ RLS Disabled in Public

- **Category:** security
- **Details:** Table \`public.leads\` is public, but RLS has not been enabled.
- **Remediation:** https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public


### ❌ RLS disabled on public tables

- **Category:** rls
- **Details:** Table \`public.leads\` is public, but RLS has not been enabled.



### ❌ Security definer views detected

- **Category:** security
- **Details:** View \`public.service_credentials_summary\` is defined with the SECURITY DEFINER property, View \`public.credentials_due_for_rotation\` is defined with the SECURITY DEFINER property, View \`public.service_health_summary\` is defined with the SECURITY DEFINER property, View \`public.current_client_metrics\` is defined with the SECURITY DEFINER property, View \`public.recent_vault_access\` is defined with the SECURITY DEFINER property
- **Remediation:** Review views and consider using SECURITY INVOKER instead


---

## Recommendations


### 🔴 High Priority: Fix critical security issues

Address RLS and security definer view issues immediately


### 🟡 Medium Priority: Sync migrations

Ensure local and remote migrations are in sync


### 🔴 High Priority: Review security advisors

Address 6 security errors


---

## Next Steps

1. **Review Critical Issues:** Address all error-level security issues
2. **Sync Migrations:** Ensure local and remote migrations match
3. **Run Performance Advisors:** Check database performance metrics
4. **Update RLS Policies:** Fix any RLS disabled issues
5. **Review Security Definer Views:** Consider converting to SECURITY INVOKER

---

**Report Generated:** 2025-12-27T04:13:17.051Z

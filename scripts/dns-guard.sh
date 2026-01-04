#!/bin/bash
# DNS Guard for SN-PL-002_PROD
# Fails if any critical domain doesn't resolve

set -e

PROD_DOMAIN="${1:-}"
AUTH_LINK_DOMAIN="${2:-}"

if [ -z "$PROD_DOMAIN" ]; then
  echo "Usage: ./scripts/dns-guard.sh <prod-domain> [auth-link-domain]"
  echo "Example: ./scripts/dns-guard.sh app.strataNoble.com supabase.strataNoble.com"
  exit 1
fi

echo "=== DNS Guard Check ==="
echo "Date: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo ""

FAILED=0

# Check production domain
echo "Checking production domain: $PROD_DOMAIN"
if nslookup "$PROD_DOMAIN" > /dev/null 2>&1; then
  echo "✅ $PROD_DOMAIN resolves"
  nslookup "$PROD_DOMAIN" | grep -A1 "Name:" || true
else
  echo "❌ $PROD_DOMAIN FAILED (NXDOMAIN or timeout)"
  FAILED=1
fi
echo ""

# Check auth link domain if provided
if [ -n "$AUTH_LINK_DOMAIN" ]; then
  echo "Checking auth link domain: $AUTH_LINK_DOMAIN"
  if nslookup "$AUTH_LINK_DOMAIN" > /dev/null 2>&1; then
    echo "✅ $AUTH_LINK_DOMAIN resolves"
    nslookup "$AUTH_LINK_DOMAIN" | grep -A1 "Name:" || true
  else
    echo "❌ $AUTH_LINK_DOMAIN FAILED (NXDOMAIN or timeout)"
    FAILED=1
  fi
  echo ""
fi

# Check Supabase project URL from env if available
if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  SUPABASE_HOST=$(echo "$NEXT_PUBLIC_SUPABASE_URL" | sed 's|https://||' | sed 's|/.*||')
  echo "Checking Supabase host: $SUPABASE_HOST"
  if nslookup "$SUPABASE_HOST" > /dev/null 2>&1; then
    echo "✅ $SUPABASE_HOST resolves"
  else
    echo "❌ $SUPABASE_HOST FAILED (NXDOMAIN or timeout)"
    FAILED=1
  fi
  echo ""
fi

echo "=== Summary ==="
if [ $FAILED -eq 0 ]; then
  echo "✅ All DNS checks passed"
  exit 0
else
  echo "❌ DNS check FAILED - do not deploy"
  exit 1
fi

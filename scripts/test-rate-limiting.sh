#!/bin/bash
# Rate Limiting QA Test Script
# Run this against production after deploy completes

BASE_URL="${1:-https://stratanoble.com}"
echo "Testing rate limiting on: $BASE_URL"
echo ""

# Test 1: Intake Rate Limiting (12 requests in 60 seconds)
echo "=== Test 1: Intake Rate Limiting (12 requests) ==="
echo "Expected: 429 on attempt 11"
echo ""

for i in {1..12}; do
  response=$(curl -X POST "$BASE_URL/api/intake/lead-leak-check" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","name":"Test User"}' \
    -w "\nHTTP %{http_code}" \
    -s -o /dev/null 2>&1)
  
  status=$(echo "$response" | grep -o "HTTP [0-9]*" | cut -d' ' -f2)
  echo "Request $i: HTTP $status"
  
  if [ "$status" = "429" ]; then
    echo "✅ Rate limited on attempt $i (as expected)"
    break
  fi
  
  sleep 1
done

echo ""
echo "=== Test 2: Auth Rate Limiting (6 requests) ==="
echo "Expected: 429 on attempt 6"
echo ""

for i in {1..6}; do
  start_time=$(date +%s%N)
  response=$(curl -X POST "$BASE_URL/api/auth/callback/credentials" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "email=test@example.com&password=wrongpassword" \
    -w "\nHTTP %{http_code}" \
    -s -o /dev/null 2>&1)
  end_time=$(date +%s%N)
  
  status=$(echo "$response" | grep -o "HTTP [0-9]*" | cut -d' ' -f2)
  duration=$(( (end_time - start_time) / 1000000 ))
  echo "Request $i: HTTP $status (${duration}ms)"
  
  if [ "$status" = "429" ]; then
    echo "✅ Rate limited on attempt $i (as expected)"
    if [ "$duration" -gt 300 ] && [ "$duration" -lt 1000 ]; then
      echo "✅ Delay present (${duration}ms) - fail-soft working"
    fi
    break
  fi
  
  sleep 1
done

echo ""
echo "=== Test 3: Benign Endpoints (should not be rate limited) ==="
echo "Testing /api/auth/session (50 rapid requests)"
echo ""

for i in {1..50}; do
  response=$(curl -X GET "$BASE_URL/api/auth/session" \
    -w "\nHTTP %{http_code}" \
    -s -o /dev/null 2>&1)
  
  status=$(echo "$response" | grep -o "HTTP [0-9]*" | cut -d' ' -f2)
  
  if [ "$status" = "429" ]; then
    echo "❌ FAILED: Benign endpoint rate limited on attempt $i"
    exit 1
  fi
  
  if [ $((i % 10)) -eq 0 ]; then
    echo "Request $i: HTTP $status (OK)"
  fi
  
  sleep 0.1
done

echo "✅ All 50 requests succeeded (no rate limiting on benign endpoint)"
echo ""
echo "=== Tests Complete ==="

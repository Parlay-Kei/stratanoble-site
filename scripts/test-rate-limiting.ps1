# Rate Limiting QA Test Script (PowerShell)
# Run this against production after deploy completes

param(
    [string]$BaseUrl = "https://stratanoble.com"
)

Write-Host "Testing rate limiting on: $BaseUrl" -ForegroundColor Cyan
Write-Host ""

# Test 1: Intake Rate Limiting (12 requests in 60 seconds)
Write-Host "=== Test 1: Intake Rate Limiting (12 requests) ===" -ForegroundColor Yellow
Write-Host "Expected: 429 on attempt 11"
Write-Host ""

for ($i = 1; $i -le 12; $i++) {
    try {
        # Send valid payload with all required fields
        $body = @{
            name = "Test User $i"
            email = "test$i@example.com"
            businessName = "Test Business $i"
            leadSource = "other"
            whatsBreaking = "Testing rate limiting - request $i"
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "$BaseUrl/api/intake/lead-leak-check" `
            -Method POST `
            -Headers @{"Content-Type"="application/json"} `
            -Body $body `
            -UseBasicParsing `
            -ErrorAction SilentlyContinue
        
        $status = $response.StatusCode
        Write-Host "Request $i`: HTTP $status" -ForegroundColor Green
        
        if ($status -eq 429) {
            Write-Host "✅ Rate limited on attempt $i (as expected)" -ForegroundColor Green
            break
        }
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        Write-Host "Request $i`: HTTP $status" -ForegroundColor $(if ($status -eq 429) { "Yellow" } else { "Red" })
        
        if ($status -eq 429) {
            Write-Host "✅ Rate limited on attempt $i (as expected)" -ForegroundColor Green
            break
        }
    }
    
    Start-Sleep -Seconds 1
}

Write-Host ""
Write-Host "=== Test 2: Auth Rate Limiting (6 requests) ===" -ForegroundColor Yellow
Write-Host "Expected: 429 on attempt 6"
Write-Host ""

for ($i = 1; $i -le 6; $i++) {
    $startTime = Get-Date
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/api/auth/callback/credentials" `
            -Method POST `
            -Headers @{"Content-Type"="application/x-www-form-urlencoded"} `
            -Body "email=test@example.com&password=wrongpassword" `
            -UseBasicParsing `
            -ErrorAction SilentlyContinue
        
        $status = $response.StatusCode
        $duration = ((Get-Date) - $startTime).TotalMilliseconds
        Write-Host "Request $i`: HTTP $status (${duration}ms)" -ForegroundColor Green
        
        if ($status -eq 429) {
            Write-Host "✅ Rate limited on attempt $i (as expected)" -ForegroundColor Green
            if ($duration -gt 300 -and $duration -lt 1000) {
                Write-Host "✅ Delay present (${duration}ms) - fail-soft working" -ForegroundColor Green
            }
            break
        }
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        $duration = ((Get-Date) - $startTime).TotalMilliseconds
        Write-Host "Request $i`: HTTP $status (${duration}ms)" -ForegroundColor $(if ($status -eq 429) { "Yellow" } else { "Red" })
        
        if ($status -eq 429) {
            Write-Host "✅ Rate limited on attempt $i (as expected)" -ForegroundColor Green
            if ($duration -gt 300 -and $duration -lt 1000) {
                Write-Host "✅ Delay present (${duration}ms) - fail-soft working" -ForegroundColor Green
            }
            break
        }
    }
    
    Start-Sleep -Seconds 1
}

Write-Host ""
Write-Host "=== Test 3: Benign Endpoints (should not be rate limited) ===" -ForegroundColor Yellow
Write-Host "Testing /api/auth/session (50 rapid requests)"
Write-Host ""

for ($i = 1; $i -le 50; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/api/auth/session" `
            -Method GET `
            -UseBasicParsing `
            -ErrorAction SilentlyContinue
        
        $status = $response.StatusCode
        
        if ($status -eq 429) {
            Write-Host "❌ FAILED: Benign endpoint rate limited on attempt $i" -ForegroundColor Red
            exit 1
        }
        
        if ($i % 10 -eq 0) {
            Write-Host "Request $i`: HTTP $status (OK)" -ForegroundColor Green
        }
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        if ($status -eq 429) {
            Write-Host "❌ FAILED: Benign endpoint rate limited on attempt $i" -ForegroundColor Red
            exit 1
        }
    }
    
    Start-Sleep -Milliseconds 100
}

Write-Host "✅ All 50 requests succeeded (no rate limiting on benign endpoint)" -ForegroundColor Green
Write-Host ""
Write-Host "=== Tests Complete ===" -ForegroundColor Cyan

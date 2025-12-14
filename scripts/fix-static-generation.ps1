# StrataNoble Build Fix Script
# Adds 'export const dynamic = force-dynamic' to all page.tsx files
# This fixes Next.js 15 static generation errors with client components

param(
    [switch]$DryRun = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"

# Configuration
$appDir = Join-Path $PSScriptRoot ".." "apps" "website" "src" "app"
$exportLine = "export const dynamic = 'force-dynamic';"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  StrataNoble Build Fix Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "[DRY RUN MODE - No files will be modified]" -ForegroundColor Yellow
    Write-Host ""
}

# Counters
$fixed = 0
$skipped = 0
$errors = 0

# Find all page.tsx files
$pages = Get-ChildItem -Path $appDir -Recurse -Filter "page.tsx" -ErrorAction SilentlyContinue

if (-not $pages) {
    Write-Host "ERROR: No page.tsx files found in $appDir" -ForegroundColor Red
    exit 1
}

Write-Host "Found $($pages.Count) page.tsx files" -ForegroundColor Green
Write-Host ""

foreach ($page in $pages) {
    $relativePath = $page.FullName.Replace($appDir, "").TrimStart("\", "/")
    
    try {
        $content = Get-Content $page.FullName -Raw -ErrorAction Stop
        
        # Skip if already has force-dynamic or any dynamic export
        if ($content -match "export\s+const\s+dynamic\s*=") {
            if ($Verbose) {
                Write-Host "SKIP: $relativePath (already has dynamic export)" -ForegroundColor Gray
            }
            $skipped++
            continue
        }
        
        # Skip API routes (they don't need this)
        if ($page.FullName -match "[\\/]api[\\/]") {
            if ($Verbose) {
                Write-Host "SKIP: $relativePath (API route)" -ForegroundColor Gray
            }
            $skipped++
            continue
        }
        
        # Skip layout files (we handle those separately)
        if ($page.Name -eq "layout.tsx") {
            if ($Verbose) {
                Write-Host "SKIP: $relativePath (layout file)" -ForegroundColor Gray
            }
            $skipped++
            continue
        }
        
        # Find the best insertion point (after imports, before component)
        $lines = $content -split "`r?`n"
        $insertIndex = 0
        $foundImport = $false
        
        for ($i = 0; $i -lt $lines.Count; $i++) {
            $line = $lines[$i].Trim()
            
            # Track imports
            if ($line -match "^import\s+" -or $line -match "^'use client'") {
                $foundImport = $true
                $insertIndex = $i + 1
            }
            # Stop at first non-import, non-empty, non-comment line after imports
            elseif ($foundImport -and $line -ne "" -and -not $line.StartsWith("//") -and -not $line.StartsWith("/*")) {
                break
            }
            # Handle empty lines after imports
            elseif ($foundImport -and $line -eq "") {
                $insertIndex = $i + 1
            }
        }
        
        # Build new content
        $newLines = @()
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($i -eq $insertIndex) {
                # Add blank line before if needed
                if ($newLines.Count -gt 0 -and $newLines[-1].Trim() -ne "") {
                    $newLines += ""
                }
                $newLines += $exportLine
                $newLines += ""
            }
            $newLines += $lines[$i]
        }
        
        # If we never found a good spot, add at the very beginning
        if ($insertIndex -eq 0) {
            $newLines = @($exportLine, "") + $lines
        }
        
        $newContent = $newLines -join "`n"
        
        if (-not $DryRun) {
            Set-Content -Path $page.FullName -Value $newContent -NoNewline -Encoding UTF8
        }
        
        Write-Host "FIXED: $relativePath" -ForegroundColor Green
        $fixed++
        
    } catch {
        Write-Host "ERROR: $relativePath - $($_.Exception.Message)" -ForegroundColor Red
        $errors++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Fixed:   $fixed" -ForegroundColor Green
Write-Host "  Skipped: $skipped" -ForegroundColor Yellow
Write-Host "  Errors:  $errors" -ForegroundColor $(if ($errors -gt 0) { "Red" } else { "Gray" })
Write-Host ""

if ($DryRun) {
    Write-Host "This was a dry run. Run without -DryRun to apply changes." -ForegroundColor Yellow
} else {
    Write-Host "Done! Now run: cd apps/website && npm run build" -ForegroundColor Cyan
}

exit $errors

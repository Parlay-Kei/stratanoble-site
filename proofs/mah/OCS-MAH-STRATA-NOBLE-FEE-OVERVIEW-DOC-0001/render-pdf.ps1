# Renders MAH operating budget overview PDF from Markdown (Pandoc fragment + Strata Noble HTML shell + Edge headless).
$ErrorActionPreference = "Stop"
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..\..")
$md = Join-Path $repoRoot "docs\clients\ms-audreys-house\financials\MAH_Monthly_Operating_Budget_Financial_Overview_Strata_Noble.md"
$templateDir = Join-Path $PSScriptRoot "template"
$fragPath = Join-Path $templateDir "_body-fragment.html"
$htmlPath = Join-Path $templateDir "MAH_Monthly_Operating_Budget_Financial_Overview_Strata_Noble_print.html"
$cssPath = Join-Path $templateDir "budget-overview-print.css"
$pdfOut = Join-Path $repoRoot "docs\clients\ms-audreys-house\financials\MAH_Monthly_Operating_Budget_Financial_Overview_Strata_Noble.pdf"
$pandoc = (Get-Command pandoc -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source)
if (-not $pandoc) { $pandoc = "C:\Users\MrSte\AppData\Local\Pandoc\pandoc.exe" }
if (-not (Test-Path $pandoc)) { throw "Pandoc not found. Install from https://pandoc.org" }
if (-not (Test-Path $md)) { throw "Source markdown not found: $md" }

& $pandoc $md -f gfm -t html -o $fragPath
$body = [System.IO.File]::ReadAllText($fragPath, [System.Text.UTF8Encoding]::new($false))

$logoSvg = @'
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g transform="translate(100, 100)"><circle cx="0" cy="0" r="80" fill="none" stroke="#6B7B8C" stroke-width="2" opacity="0.8"/><circle cx="0" cy="0" r="68" fill="none" stroke="#B8D4C2" stroke-width="1.5" opacity="0.6"/><rect x="-30" y="-15" width="60" height="8" rx="4" fill="#B8D4C2"/><rect x="-35" y="-3" width="70" height="8" rx="4" fill="#5A9B6B"/><rect x="-40" y="9" width="80" height="8" rx="4" fill="#2C3E50"/></g></svg>
'@

$cssUrl = ([Uri]$cssPath).AbsoluteUri

$html = @"
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Ms. Audrey's House — Monthly Operating Budget Financial Overview</title>
<link rel="stylesheet" href="$cssUrl"/>
</head>
<body>
<div class="doc-shell">
  <header class="doc-top">
    <div class="brand-block">
      $logoSvg
      <div>
        <p class="company-legal">Strata Noble</p>
        <p class="company-tag">Strata Noble LLC</p>
      </div>
    </div>
    <div class="doc-meta-right">
      <p class="doc-main-title">Monthly Operating Budget Financial Overview</p>
      <div class="meta-row"><span>Client</span><span>Ms. Audrey's House</span></div>
      <div class="meta-row"><span>Version</span><span>1.0</span></div>
      <div class="meta-row"><span>Date</span><span>2026-05-04</span></div>
      <div class="meta-row"><span>Status</span><span>Client review draft</span></div>
    </div>
  </header>
  $body
</div>
</body>
</html>
"@

[System.IO.File]::WriteAllText($htmlPath, $html, [System.Text.UTF8Encoding]::new($false))

$edge = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edge)) { $edge = "${env:ProgramFiles}\Microsoft\Edge\Application\msedge.exe" }
if (-not (Test-Path $edge)) { throw "Microsoft Edge not found for PDF export." }

$htmlUri = ([Uri]$htmlPath).AbsoluteUri
Write-Host "Printing PDF via Edge headless..."
& $edge --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="$pdfOut" $htmlUri
Start-Sleep -Seconds 2
if (-not (Test-Path $pdfOut) -or ((Get-Item $pdfOut).Length -lt 1000)) { throw "PDF was not created at $pdfOut" }
Write-Host "Wrote $pdfOut"

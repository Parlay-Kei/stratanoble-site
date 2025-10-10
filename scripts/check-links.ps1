param(
  [string]$Root = "."
)

$ErrorActionPreference = "Stop"
$broken = @()
$skipped = @()
$checked = 0

$mdFiles = Get-ChildItem -Path $Root -Recurse -Filter *.md -File |
  Where-Object { ($_.FullName -notmatch "\\\.git\\") -and ($_.FullName -notmatch "\\node_modules\\") }

foreach ($file in $mdFiles) {
  $dir = Split-Path -Parent $file.FullName
  $text = $null
  try {
    $text = Get-Content -Path $file.FullName -Raw -Encoding UTF8
  } catch {
    $skipped += [pscustomobject]@{ File=$file.FullName; Target="<file>"; Reason="read-error" }
    continue
  }
  if ([string]::IsNullOrEmpty($text)) { continue }

  $regex = '!\[[^\]]*\]\(([^)]+)\)|\[[^\]]*\]\(([^)]+)\)'
  $matches = [System.Text.RegularExpressions.Regex]::Matches($text, $regex)
  foreach ($m in $matches) {
    # capture target
    $target = if ($m.Groups[1].Value) { $m.Groups[1].Value } else { $m.Groups[2].Value }
    $target = $target.Trim()
    if ($target.StartsWith('#')) { continue }
    if ($target -match '^(https?|mailto|tel|data):') { continue }
    if ($target.StartsWith('<') -and $target.EndsWith('>')) { $target = $target.Substring(1, $target.Length-2) }
    # trim optional title (space + quoted)
    $cutIdx = $target.IndexOf(' "')
    if ($cutIdx -ge 0) { $target = $target.Substring(0,$cutIdx).Trim() }
    $cutIdx2 = $target.IndexOf(" '")
    if ($cutIdx2 -ge 0) { $target = $target.Substring(0,$cutIdx2).Trim() }
    $target = [System.Uri]::UnescapeDataString($target)
    $pathPart = $target
    if ($target.Contains('#')) { $pathPart = $target.Split('#')[0] }
    if (-not $pathPart -or $pathPart -eq '') { continue }

    # Skip targets with parentheses in path (regex limitation for nested parens in Markdown)
    if ($pathPart -match '[()]') { $skipped += [pscustomobject]@{ File=$file.FullName; Target=$target; Reason='contains-parentheses' }; continue }

    $norm = $pathPart -replace '/', '\\'

    $checked++
    # Skip targets with illegal path characters to avoid exceptions
    $invalid = [System.IO.Path]::GetInvalidPathChars()
    $hasInvalid = $false
    foreach ($ch in $invalid) { if ($norm.Contains([string]$ch)) { $hasInvalid = $true; break } }
    if ($hasInvalid) {
      $skipped += [pscustomobject]@{ File=$file.FullName; Target=$target; Reason="invalid-path-chars" }
      continue
    }

    try {
      if ([System.IO.Path]::IsPathRooted($norm)) {
        $full = $norm
      } else {
        $full = Join-Path -Path $dir -ChildPath $norm
      }
    } catch {
      $skipped += [pscustomobject]@{ File=$file.FullName; Target=$target; Reason="path-parse-error" }
      continue
    }

    if (-not (Test-Path -LiteralPath $full)) {
      $alt = "$full.md"
      if (-not (Test-Path -LiteralPath $alt)) {
        $lineNums = @()
        $lineIndex = 0
        (Get-Content -Path $file.FullName -Encoding UTF8) | ForEach-Object {
          $lineIndex++
          if ($_ -like "*]($target)*") { $lineNums += $lineIndex }
        }
        if ($lineNums.Count -eq 0) { $lineNums = @('?') }
        $broken += [pscustomobject]@{
          File = $file.FullName
          Line = ($lineNums -join ',')
          Target = $target
          Resolved = $full
        }
      }
    }
  }
}

$docsBroken = $broken | Where-Object { $_.File -like "*docs*" -or $_.File -like "*README.md" }

if ($docsBroken.Count -eq 0) {
  Write-Output "OK: No broken local links found (docs scope). Checked $checked references. Skipped $($skipped.Count)."
  exit 0
} else {
  Write-Output "BROKEN LINKS (docs scope): $($docsBroken.Count) (of $checked checked; skipped $($skipped.Count))"
  $docsBroken | Sort-Object File, Line | ForEach-Object {
    Write-Output ("- {0}:{1} -> {2} (resolved: {3})" -f $_.File, $_.Line, $_.Target, $_.Resolved)
  }
  $skSummary = $skipped | Group-Object Reason | ForEach-Object { "SKIPPED $_.Name: $($_.Count)" }
  if ($skSummary) { $skSummary }
  exit 1
}

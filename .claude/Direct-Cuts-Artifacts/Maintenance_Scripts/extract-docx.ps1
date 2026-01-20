Add-Type -AssemblyName System.IO.Compression.FileSystem

$docxPath = "C:\Users\MrSte\Downloads\DC\DirectCuts-Execution-Plan.docx"
$tempDir = Join-Path $env:TEMP "docx-extract"

if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}

New-Item -ItemType Directory -Path $tempDir | Out-Null

$zip = [System.IO.Compression.ZipFile]::OpenRead($docxPath)
$entry = $zip.Entries | Where-Object { $_.FullName -eq "word/document.xml" }
$outPath = Join-Path $tempDir "document.xml"
[System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $outPath, $true)
$zip.Dispose()

# Parse XML and extract text
[xml]$xmlDoc = Get-Content $outPath
$ns = New-Object System.Xml.XmlNamespaceManager($xmlDoc.NameTable)
$ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")

$textNodes = $xmlDoc.SelectNodes("//w:t", $ns)
$text = ($textNodes | ForEach-Object { $_.InnerText }) -join ""

# Output to a readable text file
$txtPath = Join-Path $tempDir "extracted.txt"
$text | Out-File -FilePath $txtPath -Encoding UTF8

Write-Output $txtPath

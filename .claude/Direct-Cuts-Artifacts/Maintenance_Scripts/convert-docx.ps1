$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Open("C:\Users\MrSte\Downloads\DC\DirectCuts-Enhanced-Barber-Onboarding-Spec.docx")
$pdfPath = "C:\Users\MrSte\Downloads\DC\DirectCuts-Enhanced-Barber-Onboarding-Spec.pdf"
$doc.SaveAs([ref]$pdfPath, [ref]17)
$doc.Close()
$word.Quit()
Write-Host "PDF created at: $pdfPath"

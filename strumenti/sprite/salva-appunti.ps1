# salva-appunti.ps1 — salva l'immagine che sta negli APPUNTI di Windows in un PNG.
# E' la seconda meta' della via di download dei fogli di Nano Banana (voce #158,
# PROMPT.md «Download»): Chrome blocca i download multipli dalla pagina e la CSP
# blocca fetch/POST, quindi un pulsante iniettato nella pagina (copia-gemini.js)
# copia l'immagine negli appunti su un click vero, e questo script la scrive su disco.
# USO: powershell -File strumenti/sprite/salva-appunti.ps1 fuori/sprite/ingresso/nb33-cross.png
param([Parameter(Mandatory=$true)][string]$Uscita, [int]$Attesa = 0)
if ($Attesa -gt 0) { Start-Sleep -Seconds $Attesa }
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$img = [System.Windows.Forms.Clipboard]::GetImage()
if ($null -eq $img) { Write-Output "NIENTE: gli appunti non contengono un'immagine"; exit 3 }
$dir = Split-Path -Parent $Uscita
if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force $dir | Out-Null }
$img.Save((Resolve-Path -LiteralPath (Split-Path -Parent $Uscita)).Path + '\' + (Split-Path -Leaf $Uscita), [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output ("salvato {0} ({1}x{2})" -f $Uscita, $img.Width, $img.Height)

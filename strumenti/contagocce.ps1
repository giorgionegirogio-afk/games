# CONTAGOCCE — media 20x20 su punti di solo manto e tinta (hue) di ciascuno.
# Uso: powershell -File strumenti/contagocce.ps1 foto/x.png "120,150 900,400 1500,560"
param([string]$png, [string]$punti = "")
Add-Type -AssemblyName System.Drawing
$b = [System.Drawing.Bitmap]::FromFile((Resolve-Path $png))
Write-Host ("{0}  {1}x{2}" -f (Split-Path $png -Leaf), $b.Width, $b.Height)
if ([string]::IsNullOrWhiteSpace($punti)) {
  # due angoli opposti del prato, in frazioni del quadro
  $lista = @(
    ([int]($b.Width * 0.07)).ToString() + "," + ([int]($b.Height * 0.30)).ToString(),
    ([int]($b.Width * 0.50)).ToString() + "," + ([int]($b.Height * 0.50)).ToString(),
    ([int]($b.Width * 0.93)).ToString() + "," + ([int]($b.Height * 0.72)).ToString()
  )
} else { $lista = $punti.Split(" ") }
$hues = New-Object System.Collections.ArrayList
foreach ($p in $lista) {
  $xy = $p.Split(","); $x0 = [int]$xy[0]; $y0 = [int]$xy[1]
  $r = 0.0; $g = 0.0; $bl = 0.0; $n = 0
  for ($x = $x0; $x -lt $x0 + 20; $x++) {
    for ($y = $y0; $y -lt $y0 + 20; $y++) {
      if ($x -lt 0 -or $y -lt 0 -or $x -ge $b.Width -or $y -ge $b.Height) { continue }
      $c = $b.GetPixel($x, $y); $r += $c.R; $g += $c.G; $bl += $c.B; $n++
    }
  }
  $r = $r / $n; $g = $g / $n; $bl = $bl / $n
  $col = [System.Drawing.Color]::FromArgb([int][Math]::Round($r), [int][Math]::Round($g), [int][Math]::Round($bl))
  $h = $col.GetHue()
  [void]$hues.Add($h)
  $luce = (0.2126 * $r + 0.7152 * $g + 0.0722 * $bl) / 255
  $riga = "  (" + $x0 + "," + $y0 + ")  rgb " + $r.ToString("N1") + " " + $g.ToString("N1") + " " + $bl.ToString("N1") +
          "   tinta " + $h.ToString("N1") + "   luce " + $luce.ToString("N3")
  Write-Host $riga
}
$d = ($hues | Measure-Object -Maximum).Maximum - ($hues | Measure-Object -Minimum).Minimum
Write-Host ("  ESCURSIONE DI TINTA: {0:N1} gradi   (cancello 15)" -f $d)
$b.Dispose()

# ==============================================
# SPRITE BACKGROUND REMOVER
# Entfernt automatisch weiße/helle Hintergründe
# ==============================================

param(
    [string]$InputFolder = ".\sprites-original",
    [string]$OutputFolder = ".\sprites-transparent",
    [int]$Tolerance = 30  # Wie dunkel Pixel sein müssen um entfernt zu werden (0-255, niedriger = nur sehr schwarze Pixel)
)

Write-Host @"

╔══════════════════════════════════════════════╗
║   SPRITE BACKGROUND REMOVER                  ║
║   Macht Sprites transparent                  ║
╚══════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

# Erstelle Output-Ordner wenn nicht vorhanden
if (!(Test-Path $OutputFolder)) {
    New-Item -ItemType Directory -Path $OutputFolder | Out-Null
    Write-Host "✅ Erstellt: $OutputFolder" -ForegroundColor Green
}

# Lade .NET Image Libraries
Add-Type -AssemblyName System.Drawing

# Funktion zum Entfernen des Hintergrunds
function Remove-Background {
    param(
        [string]$ImagePath,
        [string]$OutputPath,
        [int]$Tolerance
    )
    
    try {
        # Lade Bild
        $bitmap = [System.Drawing.Bitmap]::new($ImagePath)
        
        # Erstelle neues Bitmap mit Alpha-Kanal
        $result = [System.Drawing.Bitmap]::new($bitmap.Width, $bitmap.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        
        # Durchlaufe alle Pixel
        for ($y = 0; $y -lt $bitmap.Height; $y++) {
            for ($x = 0; $x -lt $bitmap.Width; $x++) {
                $pixel = $bitmap.GetPixel($x, $y)
                
                # Prüfe ob Pixel schwarz/dunkel ist (Hintergrund)
                $brightness = ($pixel.R + $pixel.G + $pixel.B) / 3
                
                if ($brightness -le $Tolerance) {
                    # Mache schwarze/dunkle Pixel transparent
                    $transparent = [System.Drawing.Color]::FromArgb(0, 0, 0, 0)
                    $result.SetPixel($x, $y, $transparent)
                } else {
                    # Behalte Original-Pixel
                    $result.SetPixel($x, $y, $pixel)
                }
            }
        }
        
        # Speichere als PNG mit Transparenz
        $result.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        # Cleanup
        $bitmap.Dispose()
        $result.Dispose()
        
        return $true
    }
    catch {
        Write-Host "❌ Fehler bei $ImagePath : $_" -ForegroundColor Red
        return $false
    }
}

# Finde alle PNG/JPG Dateien
$imageFiles = Get-ChildItem -Path $InputFolder -Include *.png,*.jpg,*.jpeg -Recurse

if ($imageFiles.Count -eq 0) {
    Write-Host "⚠️ Keine Bilder gefunden in: $InputFolder" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 VERWENDUNG:" -ForegroundColor Cyan
    Write-Host "1. Erstelle Ordner 'sprites-original' im Gatefall-Verzeichnis"
    Write-Host "2. Kopiere alle Sprites in diesen Ordner"
    Write-Host "3. Führe dieses Script erneut aus"
    Write-Host ""
    Write-Host "Oder verwende: .\remove-sprite-backgrounds.ps1 -InputFolder 'C:\Pfad\zu\Sprites'"
    exit
}

Write-Host "📦 Gefunden: $($imageFiles.Count) Bilder" -ForegroundColor Green
Write-Host "🎯 Tolerance: $Tolerance (0 = nur reines Weiß, 100 = auch helle Grautöne)" -ForegroundColor Yellow
Write-Host ""

$processed = 0
$successful = 0

foreach ($file in $imageFiles) {
    $processed++
    $fileName = $file.Name
    $outputPath = Join-Path $OutputFolder $fileName
    
    Write-Host "[$processed/$($imageFiles.Count)] 🖼️  $fileName ... " -NoNewline
    
    if (Remove-Background -ImagePath $file.FullName -OutputPath $outputPath -Tolerance $Tolerance) {
        Write-Host "✅" -ForegroundColor Green
        $successful++
    } else {
        Write-Host "❌" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Fertig! $successful von $processed Sprites erfolgreich konvertiert" -ForegroundColor Green
Write-Host "📁 Ausgabe: $OutputFolder" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Tipp: Wenn zu viel entfernt wurde, verwende niedrigere Tolerance:" -ForegroundColor Yellow
Write-Host "   .\remove-sprite-backgrounds.ps1 -Tolerance 30" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Wenn zu wenig entfernt wurde, verwende höhere Tolerance:" -ForegroundColor Yellow
Write-Host "   .\remove-sprite-backgrounds.ps1 -Tolerance 80" -ForegroundColor Gray
Write-Host ""

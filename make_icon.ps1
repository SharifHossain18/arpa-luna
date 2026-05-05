Add-Type -AssemblyName System.Drawing

$src = "c:\Users\User\Desktop\Ai Claud\period-tracker\assets\WhatsApp Image 2026-05-05 at 12.20.57 PM.jpeg"
$img = [System.Drawing.Image]::FromFile($src)

$width = $img.Width
$height = $img.Height
$minSize = [math]::Min($width, $height)

# Crop to perfect square
$cropRect = New-Object System.Drawing.Rectangle([math]::Floor(($width - $minSize)/2), [math]::Floor(($height - $minSize)/2), $minSize, $minSize)
$bmpCropped = New-Object System.Drawing.Bitmap($minSize, $minSize)
$g = [System.Drawing.Graphics]::FromImage($bmpCropped)
$g.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, $minSize, $minSize)), $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

# Save 512x512
$bmp512 = New-Object System.Drawing.Bitmap($bmpCropped, 512, 512)
$bmp512.Save("c:\Users\User\Desktop\Ai Claud\period-tracker\icon-512.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Save 192x192
$bmp192 = New-Object System.Drawing.Bitmap($bmpCropped, 192, 192)
$bmp192.Save("c:\Users\User\Desktop\Ai Claud\period-tracker\icon-192.png", [System.Drawing.Imaging.ImageFormat]::Png)

$img.Dispose()
$bmpCropped.Dispose()
$bmp512.Dispose()
$bmp192.Dispose()

Write-Host "Icons generated successfully!"

# معركة الشلة — records every line of the game with ElevenLabs voices (one voice per role).
# Runs on your computer; your API key stays here. It can stop and resume any time (already recorded lines are skipped).
$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch { }
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here
$lines = Get-Content -Raw -Encoding UTF8 (Join-Path $here 'lines.json') | ConvertFrom-Json
$out = Join-Path $here 'recorded'
New-Item -ItemType Directory -Force -Path $out | Out-Null
$keyFile = Join-Path $here 'api-key.txt'
if (Test-Path $keyFile) { $key = (Get-Content -Raw $keyFile).Trim() }
else {
  Write-Host ''
  Write-Host 'Paste your ElevenLabs API key, then press Enter  /  حط مفتاح ElevenLabs واضغط Enter' -ForegroundColor Yellow
  $sec = Read-Host -AsSecureString
  $key = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)).Trim()
}
if (-not $key) { Write-Host 'No key / ما في مفتاح'; pause; exit 1 }
$model = 'eleven_multilingual_v2'
$cfg = @{
  'nar'  = @(0.55, 0.80, 0.20); 'old' = @(0.50, 0.80, 0.30); 'dark' = @(0.40, 0.85, 0.45); 'boss' = @(0.45, 0.85, 0.35); 'kw' = @(0.45, 0.85, 0.35)
  'y1'   = @(0.42, 0.80, 0.30); 'y2' = @(0.42, 0.80, 0.30); 'y3' = @(0.42, 0.80, 0.30); 'y4' = @(0.42, 0.80, 0.30)
}
$total = $lines.Count; $i = 0; $fails = 0
Write-Host "Lines: $total  —  recording… (you can close and run again to continue)" -ForegroundColor Cyan
foreach ($ln in $lines) {
  $i++
  $file = Join-Path $out ('{0:D4}.mp3' -f $i)
  if ((Test-Path $file) -and ((Get-Item $file).Length -gt 800)) { continue }
  $vs = $cfg[$ln.tag]; if (-not $vs) { $vs = @(0.45, 0.8, 0.3) }
  $body = @{ text = $ln.t; model_id = $model; voice_settings = @{ stability = $vs[0]; similarity_boost = $vs[1]; style = $vs[2]; use_speaker_boost = $true } } | ConvertTo-Json -Depth 4
  $bytes = [Text.Encoding]::UTF8.GetBytes($body)
  $url = 'https://api.elevenlabs.io/v1/text-to-speech/' + $ln.v + '?output_format=mp3_44100_128'
  $try = 0
  while ($true) {
    try {
      Invoke-WebRequest -Uri $url -Method Post -Headers @{ 'xi-api-key' = $key; 'Accept' = 'audio/mpeg' } -ContentType 'application/json; charset=utf-8' -Body $bytes -OutFile $file -UseBasicParsing -TimeoutSec 120
      break
    } catch {
      $code = 0; try { $code = [int]$_.Exception.Response.StatusCode } catch { }
      $msg = ''; try { $sr = New-Object IO.StreamReader($_.Exception.Response.GetResponseStream()); $msg = $sr.ReadToEnd() } catch { }
      if (Test-Path $file) { Remove-Item $file -Force }
      if ($code -eq 401 -and $msg -notmatch 'quota') { Write-Host 'Wrong API key (401)  /  المفتاح غلط' -ForegroundColor Red; Write-Host $msg; pause; exit 1 }
      if ($msg -match 'quota_exceeded' -or $code -eq 402) { Write-Host 'Out of credits  /  خلص الرصيد — run again after topping up' -ForegroundColor Red; Write-Host $msg; pause; exit 1 }
      if ($msg -match 'voice_not_found' -or $code -eq 404) { Write-Host ('Voice not in your account: ' + $ln.tag + ' (' + $ln.v + ') — add it from the Voice Library, then run again') -ForegroundColor Red; Write-Host $msg; pause; exit 1 }
      $try++
      if ($try -gt 5) { Write-Host ('Skipped line ' + $i + ': ' + $msg) -ForegroundColor DarkYellow; $fails++; break }
      Start-Sleep -Seconds ([Math]::Min(30, 3 * $try))
    }
  }
  Write-Progress -Activity 'Shilla voices / تسجيل أصوات الشلة' -Status ("$i / $total") -PercentComplete ([int]($i * 100 / $total))
}
Copy-Item (Join-Path $here 'lines.json') (Join-Path $out 'lines.json') -Force
$zip = Join-Path $here 'pro-voices-recorded.zip'
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path (Join-Path $out '*') -DestinationPath $zip
Write-Host ''
Write-Host "Done! Skipped: $fails  —  send this file to Claude:" -ForegroundColor Green
Write-Host $zip -ForegroundColor Green
pause

# Life Cycle - Public Link Launcher Script
param()

$Host.UI.RawUI.WindowTitle = "Life Cycle - Online Public Link"
Clear-Host

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "             LIFE CYCLE - ONLINE PUBLIC LINK               " -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$baseDir = "d:\Life_Cycle"
$cloudflared = Join-Path $baseDir ".tools\cloudflared.exe"

# 1. Ensure cloudflared.exe exists
if (-not (Test-Path $cloudflared)) {
    Write-Host "[1/3] Downloading cloudflared..." -ForegroundColor Yellow
    $toolsDir = Join-Path $baseDir ".tools"
    if (-not (Test-Path $toolsDir)) { New-Item -ItemType Directory -Path $toolsDir -Force | Out-Null }
    curl.exe -L -o $cloudflared "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
}

# 2. Function to check if a port is open
function Test-PortOpen([int]$port) {
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $iar = $tcp.BeginConnect("127.0.0.1", $port, $null, $null)
        $wait = $iar.AsyncWaitHandle.WaitOne(800, $false)
        if ($wait) {
            $tcp.EndConnect($iar)
            $tcp.Close()
            return $true
        }
        $tcp.Close()
        return $false
    } catch {
        return $false
    }
}

# 3. Check / Start Backend (Port 3000)
$backendProc = $null
Write-Host "[1/3] Checking Backend server (port 3000)..." -NoNewline
if (Test-PortOpen 3000) {
    Write-Host " [RUNNING]" -ForegroundColor Green
} else {
    Write-Host " [STARTING]" -ForegroundColor Yellow
    $backendProc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd /d $baseDir\lifeplan\backend && npm run dev" -WindowStyle Minimized -PassThru
    $waited = 0
    while (-not (Test-PortOpen 3000) -and $waited -lt 20) {
        Start-Sleep -Seconds 1
        $waited++
    }
    if (Test-PortOpen 3000) {
        Write-Host "      Backend started successfully!" -ForegroundColor Green
    } else {
        Write-Host "      Warning: Backend took longer than usual to start." -ForegroundColor Yellow
    }
}

# 4. Check / Start Frontend (Port 5173)
$frontendProc = $null
Write-Host "[2/3] Checking Frontend server (port 5173)..." -NoNewline
if (Test-PortOpen 5173) {
    Write-Host " [RUNNING]" -ForegroundColor Green
} else {
    Write-Host " [STARTING]" -ForegroundColor Yellow
    $frontendProc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd /d $baseDir\lifeplan\frontend && npm run dev" -WindowStyle Minimized -PassThru
    $waited = 0
    while (-not (Test-PortOpen 5173) -and $waited -lt 20) {
        Start-Sleep -Seconds 1
        $waited++
    }
    if (Test-PortOpen 5173) {
        Write-Host "      Frontend started successfully!" -ForegroundColor Green
    } else {
        Write-Host "      Warning: Frontend took longer than usual to start." -ForegroundColor Yellow
    }
}

# 5. Start Cloudflare Tunnel
Write-Host "[3/3] Creating Public Cloudflare Link..." -ForegroundColor Yellow
$logPath = Join-Path $baseDir ".tools\tunnel_runner.log"
if (Test-Path $logPath) { Remove-Item -Force $logPath -ErrorAction SilentlyContinue }

# Kill any existing background cloudflared to avoid conflicts
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Use http://127.0.0.1:5173 to avoid IPv6 [::1] resolution mismatches on Windows
$cfProc = Start-Process -FilePath $cloudflared -ArgumentList "tunnel --url http://127.0.0.1:5173" -NoNewWindow -PassThru -RedirectStandardError $logPath

$foundUrl = $null
$attempts = 0
while (-not $foundUrl -and $attempts -lt 25) {
    Start-Sleep -Milliseconds 600
    if (Test-Path $logPath) {
        $lines = Get-Content $logPath -ErrorAction SilentlyContinue
        foreach ($line in $lines) {
            if ($line -match "(https://[a-zA-Z0-9-]+\.trycloudflare\.com)") {
                $foundUrl = $matches[1]
                break
            }
        }
    }
    $attempts++
}

if ($foundUrl) {
    try {
        Set-Clipboard -Value $foundUrl
        $copiedMsg = "[Copied to Clipboard! You can paste with Ctrl+V immediately]"
    } catch {
        $copiedMsg = ""
    }

    Clear-Host
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host "            LIFE CYCLE - ONLINE PUBLIC LINK READY           " -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host " Public URL:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   $foundUrl" -ForegroundColor Yellow
    Write-Host ""
    if ($copiedMsg) {
        Write-Host " $copiedMsg" -ForegroundColor Green
    }
    Write-Host ""
    Write-Host " Notes:" -ForegroundColor DarkGray
    Write-Host " - Share this link with anyone (mobile or desktop outside your Wi-Fi)." -ForegroundColor DarkGray
    Write-Host " - Keep this window OPEN while sharing." -ForegroundColor DarkYellow
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host " [O] Open in Browser  |  [Q] Exit & Stop Services" -ForegroundColor White
    Write-Host "============================================================" -ForegroundColor Green

    # Interactive key loop
    while ($true) {
        $key = $null
        try {
            if ([Console]::KeyAvailable) {
                $key = [Console]::ReadKey($true).Key
            }
        } catch {}

        if ($key) {
            if ($key -eq 'O') {
                Start-Process $foundUrl
            } elseif ($key -eq 'Q' -or $key -eq 'Escape') {
                break
            }
        }
        Start-Sleep -Milliseconds 200
        if ($cfProc.HasExited) {
            Write-Host "Tunnel connection closed." -ForegroundColor Red
            break
        }
    }
} else {
    Write-Host "Error: Could not retrieve Cloudflare Tunnel URL. Please check your internet connection." -ForegroundColor Red
    if (Test-Path $logPath) {
        Get-Content $logPath -Tail 10
    }
    Write-Host "Press any key to exit..."
    [Console]::ReadKey($true) | Out-Null
}

# Cleanup on exit
Write-Host "Stopping tunnel and services..." -ForegroundColor DarkGray
if ($cfProc -and -not $cfProc.HasExited) {
    Stop-Process -Id $cfProc.Id -Force -ErrorAction SilentlyContinue
}
if ($backendProc -and -not $backendProc.HasExited) {
    Stop-Process -Id $backendProc.Id -Force -ErrorAction SilentlyContinue
}
if ($frontendProc -and -not $frontendProc.HasExited) {
    Stop-Process -Id $frontendProc.Id -Force -ErrorAction SilentlyContinue
}
Write-Host "Stopped successfully." -ForegroundColor Green

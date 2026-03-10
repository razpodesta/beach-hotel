<#
    .SYNOPSIS
    Auditoría de Rendimiento v3.0 (Sintaxis Segura)
#>

# --- CONFIGURACIÓN ---
$ErrorActionPreference = "SilentlyContinue"
Clear-Host

# 1. LISTA BLANCA
$WhiteList = @(
    "code", "Code", "node", "npm", "pnpm", "git", "cmd", "powershell", "pwsh", "conhost", "nx",
    "System", "Idle", "smss", "csrss", "wininit", "services", "lsass", "svchost", "fontdrvhost",
    "dwm", "explorer", "taskmgr", "spoolsv", "SearchUI", "RuntimeBroker", "ApplicationFrameHost",
    "wlanext", "MsMpEng", "Registry", "Memory Compression", "OpenConsole", "WindowsTerminal"
)

# --- COLORES ---
$cTitle = "Cyan"
$cWarn = "Yellow"
$cBad = "Red"
$cGood = "Green"

function Print-Title ($text) {
    Write-Host "`n=======================================================" -ForegroundColor $cTitle
    Write-Host " $text" -ForegroundColor $cTitle
    Write-Host "=======================================================" -ForegroundColor $cTitle
}

# --- FASE 1: HARDWARE ---
Print-Title "FASE 1: DIAGNÓSTICO DE RECURSOS"

$os = Get-CimInstance Win32_OperatingSystem
$totalRam = [math]::Round($os.TotalVisibleMemorySize / 1MB, 2)
$freeRam = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
$usedRam = $totalRam - $freeRam
$percentRam = [math]::Round(($usedRam / $totalRam) * 100, 1)

$ramColor = if($percentRam -gt 85) { $cBad } else { $cGood }

# -- CORRECCIÓN: Simplificación de variables para evitar error de parser --
Write-Host "Memoria RAM Total : $totalRam GB"
Write-Host "Memoria RAM Usada : $usedRam GB ($percentRam%)" -ForegroundColor $ramColor
Write-Host "Memoria RAM Libre : $freeRam GB"

# --- FASE 2: PROCESOS ---
Print-Title "FASE 2: LOS MAYORES CONSUMIDORES (TOP 15)"

$processes = Get-Process | Select-Object Id, ProcessName, @{Name="MemoriaMB";Expression={[math]::Round($_.WorkingSet / 1MB, 0)}}, Responding
$topMemory = $processes | Sort-Object "MemoriaMB" -Descending | Select-Object -First 15

# Cabecera simple
Write-Host "ID      NOMBRE                         MEMORIA (MB)    ESTADO" -ForegroundColor Gray
Write-Host "-------------------------------------------------------------" -ForegroundColor Gray

$HeavyCandidates = @()

foreach ($proc in $topMemory) {
    $isSafe = $WhiteList -contains $proc.ProcessName
    $color = if ($isSafe) { "Green" } else { "Red" }
    $status = if ($proc.Responding) { "OK" } else { "LAG" }

    # Formateo manual para evitar error de operador -f
    $linea = "{0,-8} {1,-30} {2,-15} {3,-10}" -f $proc.Id, $proc.ProcessName, $proc.MemoriaMB, $status
    Write-Host $linea -ForegroundColor $color

    if (-not $isSafe -and $proc.MemoriaMB -gt 150) {
        $HeavyCandidates += $proc
    }
}

Write-Host "`n(Verde = Protegido | Rojo = Consumo Alto)" -ForegroundColor Gray

# --- FASE 3: REPORTE ---
$desktopPath = [Environment]::GetFolderPath("Desktop")
$reportPath = Join-Path -Path $desktopPath -ChildPath "Diagnostico_PC.txt"

$ReportData = @"
DIAGNÓSTICO DE SISTEMA - $(Get-Date)
RAM Total: $totalRam GB | Libre: $freeRam GB | Uso: $percentRam%

TOP PROCESOS:
$($topMemory | Format-Table -AutoSize | Out-String)
"@

$ReportData | Out-File $reportPath -Encoding UTF8
Write-Host "`n[i] Informe guardado en: $reportPath" -ForegroundColor Gray

# --- FASE 4: LIMPIEZA ---
Print-Title "FASE 3: LIMPIEZA QUIRÚRGICA"

if ($HeavyCandidates.Count -eq 0) {
    Write-Host "¡Genial! No hay procesos pesados externos." -ForegroundColor $cGood
} else {
    Write-Host "Procesos pesados detectados:" -ForegroundColor $cWarn

    foreach ($candidate in $HeavyCandidates) {
        Write-Host "`n--> Proceso: $($candidate.ProcessName) ($($candidate.MemoriaMB) MB)" -ForegroundColor $cWarn
        $resp = Read-Host "¿Cerrar este proceso? (S/N)"

        if ($resp -eq 'S' -or $resp -eq 's') {
            try {
                Stop-Process -Id $candidate.Id -Force -ErrorAction Stop
                Write-Host "   [KILLED] Terminado." -ForegroundColor $cGood
                [System.GC]::Collect()
            } catch {
                Write-Host "   [ERROR] Requiere Admin." -ForegroundColor $cBad
            }
        } else {
            Write-Host "   [OMITIDO]" -ForegroundColor Gray
        }
    }
}

# --- FASE 5: TEMPORALES ---
Print-Title "FASE 4: LIMPIEZA DE TEMP"
$cleanTemp = Read-Host "¿Limpiar archivos temporales? (S/N)"

if ($cleanTemp -eq 'S' -or $cleanTemp -eq 's') {
    Write-Host "Limpiando..."
    $folders = @($env:TEMP, "$env:WINDIR\Temp")

    foreach ($folder in $folders) {
        if (Test-Path $folder) {
            Get-ChildItem -Path $folder -Recurse -Force -ErrorAction SilentlyContinue |
            Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
        }
    }
    Write-Host "Limpieza finalizada." -ForegroundColor $cGood
}

Print-Title "LISTO"
Write-Host "Proceso completado." -ForegroundColor $cGood

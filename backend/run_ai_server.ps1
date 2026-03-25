$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$venvPython = Join-Path $scriptDir '..\.venv\Scripts\python.exe'
$requirementsFile = Join-Path $scriptDir 'requirements.txt'

if (-not (Test-Path $venvPython)) {
    Write-Host '[setup] Creating virtual environment at ..\.venv'
    Push-Location $scriptDir
    python -m venv ..\.venv
    Pop-Location
}

Write-Host '[setup] Installing Python dependencies from requirements.txt'
& $venvPython -m pip install -r $requirementsFile

Write-Host '[run] Starting AI server on http://localhost:5001'
Push-Location $scriptDir
& $venvPython ai_server.py
Pop-Location

@echo off
title Life Cycle - Online Public Link
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-online.ps1"

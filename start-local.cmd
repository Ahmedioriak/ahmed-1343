@echo off
cd /d "%~dp0"
node tools\serve-local.cjs
if errorlevel 1 pause

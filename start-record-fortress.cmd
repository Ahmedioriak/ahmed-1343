@echo off
cd /d "%~dp0"
node tools\serve-local.cjs --record-fortress
if errorlevel 1 pause

@echo off
powershell -ExecutionPolicy Bypass -File "%~dp0..\powershell\services-up.ps1" %*

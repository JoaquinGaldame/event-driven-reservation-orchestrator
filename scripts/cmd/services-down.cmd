@echo off
powershell -ExecutionPolicy Bypass -File "%~dp0..\powershell\services-down.ps1" %*

@echo off
powershell -ExecutionPolicy Bypass -File "%~dp0..\powershell\db-seed.ps1" %*

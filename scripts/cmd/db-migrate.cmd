@echo off
powershell -ExecutionPolicy Bypass -File "%~dp0..\powershell\db-migrate.ps1" %*

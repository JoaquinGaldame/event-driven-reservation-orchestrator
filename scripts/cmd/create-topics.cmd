@echo off
powershell -ExecutionPolicy Bypass -File "%~dp0..\powershell\create-topics.ps1" %*

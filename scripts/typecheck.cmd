@echo off
set "ROOT=%~dp0.."
set "PATH=%ROOT%\.tools\node-v22.21.1-win-x64;%PATH%"
set "HOME=%ROOT%\.expo-home"
set "USERPROFILE=%ROOT%\.expo-home"
cd /d "%ROOT%"
npm run typecheck

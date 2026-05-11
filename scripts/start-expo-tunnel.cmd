@echo off
set "ROOT=%~dp0.."
set "PATH=%ROOT%\.tools\node-v22.21.1-win-x64;%PATH%"
set "HOME=%ROOT%\.expo-home"
set "USERPROFILE=%ROOT%\.expo-home"
set "EXPO_NO_TELEMETRY=1"
set "EXPO_NO_DEPENDENCY_VALIDATION=1"
cd /d "%ROOT%"
npm run start -- --tunnel --clear

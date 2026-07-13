@echo off
title bruchimichis
cd /d "%~dp0..\.."
echo.
echo  bruchimichis
echo  Abriendo administrador en http://localhost:8090
echo.
start http://localhost:8090
python -m http.server 8090

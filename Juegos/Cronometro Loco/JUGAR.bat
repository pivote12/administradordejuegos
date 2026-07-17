@echo off
title Cronometro Loco
cd /d "%~dp0..\.."
echo.
echo  Cronometro Loco
echo  Abriendo administrador en http://localhost:8090
echo.
start http://localhost:8090
python -m http.server 8090

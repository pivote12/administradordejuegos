@echo off
title Country Notes
cd /d "%~dp0..\.."
echo.
echo  Country Notes
echo  Abriendo administrador en http://localhost:8090
echo.
start http://localhost:8090
python -m http.server 8090

@echo off
title Shape Bowl Race
cd /d "%~dp0..\.."
echo.
echo  Shape Bowl Race
echo  Abriendo administrador en http://localhost:8090
echo.
start http://localhost:8090
python -m http.server 8090

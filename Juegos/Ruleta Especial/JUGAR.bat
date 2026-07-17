@echo off
title Ruleta Especial
cd /d "%~dp0..\.."
echo.
echo  Ruleta Especial
echo  Abriendo administrador en http://localhost:8090
echo.
start http://localhost:8090
python -m http.server 8090

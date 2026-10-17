@echo off
title Tipo Knowledge
cd /d "%~dp0..\.."
echo.
echo  Tipo Knowledge
echo  Abriendo administrador en http://localhost:8090
echo.
start http://localhost:8090
python -m http.server 8090

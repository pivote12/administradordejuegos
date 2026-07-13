@echo off
title Bloc De Notas
cd /d "%~dp0..\.."
echo.
echo  Bloc De Notas
echo  Abriendo administrador en http://localhost:8090
echo.
start http://localhost:8090
python -m http.server 8090

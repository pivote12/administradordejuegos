@echo off
setlocal
cd /d "%~dp0"

echo.
echo  Administrador De Juegos
echo  ---------------------
echo  Abriendo en http://localhost:8090
echo  Cierra esta ventana para detener el servidor.
echo.

start "" "http://localhost:8090"
python serve.py
if errorlevel 1 python -m http.server 8090

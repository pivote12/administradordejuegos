@echo off
setlocal
cd /d "%~dp0"

echo.
echo  Creador 2D
echo  ----------
echo  Abriendo en http://localhost:8092
echo  Cierra esta ventana para detener el servidor.
echo.

start "" "http://localhost:8092"
python -m http.server 8092

@echo off
setlocal
cd /d "%~dp0"

echo.
echo  Object Battle
echo  -------------
echo  Abriendo en http://localhost:8093
echo  Cierra esta ventana para detener el servidor.
echo.

start "" "http://localhost:8093"
python -m http.server 8093

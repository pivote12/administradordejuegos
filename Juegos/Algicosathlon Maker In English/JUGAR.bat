@echo off
setlocal
cd /d "%~dp0"

echo.
echo  Algicosathlon Maker In English
echo  ------------------------------
echo  Abriendo en http://localhost:8091
echo  Cierra esta ventana para detener el servidor.
echo.

start "" "http://localhost:8091"
python -m http.server 8091

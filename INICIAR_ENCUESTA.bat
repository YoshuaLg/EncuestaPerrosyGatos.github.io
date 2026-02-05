@echo off
title SERVIDOR DE ENCUESTA - NO CERRAR ESTA VENTANA
color 0A

echo ==================================================
echo    INICIANDO EL SISTEMA DE ENCUESTA INOCENTE
echo ==================================================
echo.
echo [1/2] Verificando Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado o no se encuentra.
    echo Por favor instala Node.js desde https://nodejs.org/
    pause
    exit
)
echo [OK] Node.js detectado.
echo.
echo [2/2] Arrancando el servidor...
echo.
echo --------------------------------------------------
echo    CUANDO VEAS "SERVER ACTIVO", ESTARA LISTO.
echo    NO CIERRES ESTA VENTANA NEGRA.
echo    VE AL NAVEGADOR Y USA LOS ENLACES.
echo --------------------------------------------------
echo.

node server.js
pause

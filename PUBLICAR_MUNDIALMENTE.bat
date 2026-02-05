@echo off
title HACKING MODE :: PUBLICANDO AL MUNDO 🌐
color 0C

echo ==========================================================
echo    GENERADOR DE ENLACE PUBLICO (MUNDIAL)
echo ==========================================================
echo.
echo [!] IMPORTANTE:
echo     1. Tu servidor "INICIAR_ENCUESTA.bat" debe estar ABIERTO.
echo     2. Si se cierra esta ventana, el enlace deja de funcionar.
echo.
echo [~] Conectando satelites...
echo.
echo ----------------------------------------------------------
echo    COPIA EL ENLACE VERDE QUE APARECERA ABAJO
echo    (Ejemplo: https://algo.serveo.net)
echo ----------------------------------------------------------
echo.

:: Usamos Serveo.net que no requiere instalacion, solo SSH (que viene en Windows 10/11)
ssh -R 80:localhost:8080 serveo.net

pause

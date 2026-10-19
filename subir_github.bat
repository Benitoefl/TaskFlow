@echo off
title TaskFlow - Enviar para o GitHub
echo ======================================================
echo           Enviando TaskFlow para o GitHub
echo ======================================================
echo.

set "PATH=C:\Program Files\Git\cmd;%PATH%"

echo Enviando arquivos para https://github.com/Benitoefl/TaskFlow.git ...
git push -u origin main

echo.
echo Processo finalizado!
pause

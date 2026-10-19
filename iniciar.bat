@echo off
title TaskFlow - Servidor Local
echo ======================================================
echo           Iniciando TaskFlow (Custo R$ 0)
echo ======================================================
echo.

set "PATH=C:\Users\DELL\AppData\Local\Programs\nodejs;%PATH%"

echo Verificando se o arquivo .env contem as chaves do Supabase...
findstr /C:"seu-projeto.supabase.co" .env >nul
if %errorlevel% == 0 (
    echo [AVISO] O arquivo .env ainda esta com o link de exemplo!
    echo Lembre-se de colar a URL e a chave anon do seu projeto Supabase no arquivo .env
    echo O app vai abrir uma tela interativa com o passo a passo caso precise.
    echo.
)

echo Abrindo o servidor Vite em http://localhost:5173 ...
echo.
npm run dev
pause

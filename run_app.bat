@echo off
chcp 65001 >nul
title WeGoGym — Servidor Local (PWA)

echo ===================================================
echo           WeGoGym — Treino Pessoal (iOS PWA)
echo ===================================================
echo.
echo Iniciando servidor local na porta 8080...
echo.

REM Obter IP da máquina para facilitar o acesso pelo iPhone
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found_ip
)
:found_ip
set IP=%IP: =%

echo [Computador] Acesse no PC: http://localhost:8080
if defined IP (
    echo [iPhone]     Acesse no Safari do iPhone (no mesmo Wi-Fi): http://%IP%:8080
)
echo.
echo Dica para o iPhone:
echo No Safari, toque no botao Compartilhar e selecione "Adicionar a Tela de Inicio"
echo para usar em tela cheia como aplicativo!
echo.
echo Pressione Ctrl+C para encerrar o servidor.
echo.

start "" "http://localhost:8080"

python -m http.server 8080 --bind 0.0.0.0
pause

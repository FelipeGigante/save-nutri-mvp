@echo off
REM Script de inicializacao rapida para Windows

echo.
echo ========================================================
echo  ECOMERENDA - Iniciando API
echo ========================================================
echo.

REM Verifica se o venv existe
if not exist "venv\" (
    echo [INFO] Criando ambiente virtual...
    python -m venv venv
)

REM Ativa o ambiente virtual
echo [INFO] Ativando ambiente virtual...
call venv\Scripts\activate.bat

REM Instala dependencias
echo [INFO] Instalando dependencias...
pip install -r requirements.txt --quiet

REM Inicia a API
echo.
echo ========================================================
echo  API iniciando em http://localhost:8000
echo  Documentacao: http://localhost:8000/docs
echo ========================================================
echo.
echo Pressione CTRL+C para parar o servidor
echo.

python main.py

#!/bin/bash
# Script de inicializacao rapida para Linux/Mac

echo ""
echo "========================================================"
echo " ECOMERENDA - Iniciando API"
echo "========================================================"
echo ""

# Verifica se o venv existe
if [ ! -d "venv" ]; then
    echo "[INFO] Criando ambiente virtual..."
    python3 -m venv venv
fi

# Ativa o ambiente virtual
echo "[INFO] Ativando ambiente virtual..."
source venv/bin/activate

# Instala dependencias
echo "[INFO] Instalando dependencias..."
pip install -r requirements.txt --quiet

# Inicia a API
echo ""
echo "========================================================"
echo " API iniciando em http://localhost:8000"
echo " Documentacao: http://localhost:8000/docs"
echo "========================================================"
echo ""
echo "Pressione CTRL+C para parar o servidor"
echo ""

python main.py

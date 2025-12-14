# 🌾 SaveNutri 

> Plataforma SaaS B2G que conecta Escolas Públicas a Agricultores Familiares locais para cumprir a lei do PNAE (30% da merenda escolar deve ser de origem local)

## 📋 Sobre o Projeto

SaveNutri é um MVP desenvolvido para hackathons que resolve um problema real: facilitar a conexão entre escolas públicas e agricultores familiares, garantindo o cumprimento da Lei 11.947/2009 (PNAE) que exige que 30% do orçamento da merenda escolar seja destinado à compra de produtos da agricultura familiar local.

### Principais Funcionalidades

- 📍 **Mapeamento Geoespacial**: Visualização de escolas e agricultores em mapa interativo
- 🔍 **Busca por Proximidade**: Matching inteligente baseado em distância geográfica
- 💰 **Cálculo de Economia**: Estimativa de economia ao comprar local vs atacadista
- 🌱 **Dados Enriquecidos**: Sistema de "Mock Inteligente" que adiciona dados de negócio ao OpenStreetMap

## 🚀 Tecnologias Utilizadas

- **Python 3.10+**
- **FastAPI** - Framework web moderno e rápido
- **Pydantic** - Validação de dados e serialização
- **Geopy** - Cálculos geodésicos (distâncias reais)
- **Uvicorn** - Servidor ASGI de alta performance

## 📦 Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd MVP-Safe-Nutri
```

### 2. Crie um ambiente virtual

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 3. Instale as dependências

```bash
pip install -r requirements.txt
```

## ▶️ Como Executar

### Modo Desenvolvimento

```bash
python main.py
```

Ou usando uvicorn diretamente:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

A API estará disponível em: `http://localhost:8000`

### Documentação Interativa

Acesse a documentação Swagger em: `http://localhost:8000/docs`

## 📡 Endpoints da API

### 1. GET `/geojson/enriched`

Retorna o GeoJSON completo enriquecido com dados de negócio.

**Resposta:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {"type": "Point", "coordinates": [-42.9656, -22.4128]},
      "properties": {
        "id": "school_001",
        "name": "Escola Municipal Professora Maria das Dores",
        "tipo": "escola",
        "orcamento_mensal": 35000.50,
        "alunos": 520,
        "demanda_atual": "Cenoura"
      }
    }
  ]
}
```

### 2. GET `/schools`

Lista todas as escolas cadastradas.

**Resposta:**
```json
[
  {
    "id": "school_001",
    "name": "Escola Municipal Professora Maria das Dores",
    "coordinates": {"longitude": -42.9656, "latitude": -22.4128},
    "orcamento_mensal": 35000.50,
    "alunos": 520,
    "demanda_atual": "Cenoura"
  }
]
```

### 3. GET `/match/calculate`

Calcula matches entre escola e agricultores próximos.

**Parâmetros:**
- `school_id` (obrigatório): ID da escola (ex: "school_001")
- `raio_km` (opcional, padrão 10): Raio de busca em km (1-100)

**Exemplo:**
```bash
GET /match/calculate?school_id=school_001&raio_km=15
```

**Resposta:**
```json
{
  "school_id": "school_001",
  "school_name": "Escola Municipal Professora Maria das Dores",
  "raio_km": 15.0,
  "total_agricultores_encontrados": 8,
  "matches": [
    {
      "farmer": {
        "id": "farmer_001",
        "name": "Sítio Vale Verde",
        "coordinates": {"longitude": -42.9789, "latitude": -22.4312},
        "produtos_disponiveis": ["Cenoura", "Caqui", "Inhame"],
        "tem_dap": true,
        "preco_frete": 0.0
      },
      "distancia_km": 2.34,
      "economia_estimada": 540.00,
      "produtos_em_comum": ["Cenoura"]
    }
  ]
}
```

### Cálculo de Economia

```
Atacadista:
  - Preço: R$ 3,50/kg
  - Frete: R$ 0,80/km × 50km = R$ 40,00
  - Total: R$ 1.790,00 (para 500kg)

Agricultor Local:
  - Preço: R$ 2,50/kg
  - Frete: R$ 0,00 (incentivo PNAE)
  - Total: R$ 1.250,00 (para 500kg)

Economia = R$ 540,00/mês por produto
```

## 📁 Estrutura do Projeto

```
MVP-Safe-Nutri/
├── main.py                                    # API principal
├── requirements.txt                           # Dependências Python
├── data/
│   └── TeresopolisEscolasELocaisDeProducao.geojson  # Dados geográficos
└── README.md                                  # Documentação
```

## 🗺️ Dados Geográficos

O arquivo `data/TeresopolisEscolasELocaisDeProducao.geojson` contém:
- **7 Escolas** em Teresópolis/RJ
- **13 Locais de Produção** (fazendas, sítios, chácaras)

Os dados são baseados no OpenStreetMap e enriquecidos automaticamente no startup.

## 🔧 Configuração CORS

O CORS está configurado para aceitar todas as origens (`*`) para facilitar a integração com o frontend durante o desenvolvimento. Para produção, altere em `main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://seu-frontend.com"],  # Especifique seu domínio
    ...
)
```

## 🐛 Troubleshooting

### Erro: "GeoJSON não carregado"

Certifique-se de que o arquivo `data/TeresopolisEscolasELocaisDeProducao.geojson` existe e está no formato correto.

### Erro: "Nenhuma escola encontrada"

Verifique se o arquivo GeoJSON contém features com `amenity=school`.

### Porta 8000 já em uso

Altere a porta no comando:
```bash
uvicorn main:app --reload --port 8001
```

## 📝 Próximos Passos (Roadmap)

- [ ] Integração com banco de dados PostgreSQL + PostGIS
- [ ] Autenticação JWT para escolas e agricultores
- [ ] Sistema de pedidos e contratos
- [ ] Integração com API de pagamentos
- [ ] Dashboard administrativo
- [ ] Notificações por e-mail/SMS

## 📄 Licença

Este projeto foi desenvolvido como MVP para hackathon.

## 👥 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

---

**Desenvolvido com 💚 para conectar escolas e agricultores familiares**

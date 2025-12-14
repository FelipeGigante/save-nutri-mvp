# 🌾 Save&Nutri - Conectando Escolas e Agricultores Locais

## 🚨 O Problema Real

**Hoje, 50% dos municípios brasileiros falham em cumprir a Lei 11.947/2009**, que exige que no mínimo 30% do orçamento do PNAE (Programa Nacional de Alimentação Escolar) seja destinado à compra de produtos da agricultura familiar local.

**As consequências são devastadoras:**
- ❌ **Bloqueio de verbas federais** pelo FNDE
- ⚖️ **Rejeição de contas** pelo TCU/TCE, tornando gestores **inelegíveis** (Lei da Ficha Limpa)
- 🏛️ **Processos por improbidade administrativa** com perda de direitos políticos
- 💸 **40% de desperdício** em alimentos perecíveis devido ao transporte longo e inadequado
- 📉 **Evasão de recursos públicos** para grandes atacadistas fora do município

### Por que isso acontece?

**A "Cegueira Logística"**: Gestores públicos compram de grandes distribuidores distantes porque **desconhecem a oferta local** de agricultores familiares, mesmo com produtores a poucos quilômetros das escolas.

---

## 💡 Nossa Solução

**Save&Nutri é uma plataforma SaaS B2G que elimina essa cegueira logística**, conectando escolas públicas a agricultores familiares através de georreferenciamento inteligente.

### 🎯 Transformamos 4 Problemas em Oportunidades:

#### 1. 📍 **Logística e Desperdício → Georreferenciamento Inteligente**
- Mapa interativo com isócronas mostrando produtores num raio configurável
- Redução drástica de "Food Miles" (quilômetros rodados por alimento)
- **Economia de até 30% no custo total** (produto + frete)

#### 2. ⚖️ **Risco Legal → Blindagem Jurídica Automatizada**
- Conexão apenas com produtores com documentação regular (DAP/CAF)
- Relatórios de auditoria automáticos para prestação de contas ao TCU
- **Prova documental** de que o gestor priorizou compra local conforme a lei

#### 3. 🥗 **Qualidade Nutricional → Sazonalidade Inteligente**
- Sistema cruza calendário de safra local com cardápio escolar
- Sugere alimentos frescos (colhidos no dia) da época
- **Alimentos com maior valor nutricional** chegam frescos aos alunos

#### 4. 💰 **Evasão de Recursos → Economia Circular**
- Dinheiro público fica no município, gerando renda local
- Fortalecimento da agricultura familiar regional
- **Movimentação da economia local** e desenvolvimento sustentável

---

## 📊 Impacto Mensurável

### Exemplo Real de Economia:

**Cenário Tradicional (Atacadista):**
```
Produto: Cenoura (500kg)
Preço: R$ 3,50/kg × 500kg = R$ 1.750,00
Frete: R$ 0,80/km × 50km = R$ 40,00
TOTAL: R$ 1.790,00
Desperdício: 40% (R$ 716,00 perdidos)
```

**Com Save&Nutri (Agricultor Local):**
```
Produto: Cenoura (500kg)
Preço: R$ 2,50/kg × 500kg = R$ 1.250,00
Frete: R$ 0,00 (incentivo PNAE)
TOTAL: R$ 1.250,00
Desperdício: <5% (produto fresco)
ECONOMIA: R$ 540,00/mês por produto
```

**Multiplicando por 12 meses e múltiplos produtos: economia de R$ 30.000 - R$ 80.000/ano por escola.**

---

## 🚀 A Tecnologia

### Stack Tecnológico

- **Python 3.10+** - Linguagem base
- **FastAPI** - Framework web moderno e de alta performance
- **Pydantic** - Validação robusta de dados
- **Geopy** - Cálculos geodésicos precisos (distâncias reais em km)
- **Uvicorn** - Servidor ASGI assíncrono

### Principais Funcionalidades

- 📍 **Mapeamento Geoespacial**: Visualização de escolas e agricultores em mapa interativo
- 🔍 **Busca por Proximidade**: Matching inteligente baseado em distância geográfica
- 💰 **Cálculo de Economia**: Estimativa automática de economia ao comprar local vs atacadista
- 🌱 **Mock Inteligente**: Sistema que enriquece dados do OpenStreetMap com informações de negócio
- 📊 **Relatórios de Compliance**: Geração de documentação para auditoria (TCU/TCE)

---

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

---

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

---

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

Calcula matches entre escola e agricultores próximos com cálculo de economia.

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

---

## 🧠 Lógica do "Mock Inteligente"

O sistema utiliza dados do OpenStreetMap, que não contém informações de negócio. Durante o startup, a API:

1. **Identifica** automaticamente quem é escola (`amenity=school`) e produtor (`landuse=farmland`, etc)
2. **Injeta dados fictícios realistas** baseados em pesquisas de mercado:
   - **Escolas**: orçamento mensal (R$ 15k-50k), número de alunos (200-800), produto demandado
   - **Agricultores**: produtos cultivados (2-5 produtos da safra local), DAP (90% possuem), frete zero
3. **Armazena** em memória para acesso rápido via endpoints REST

### Por que "Mock Inteligente"?

Para um MVP funcional em hackathon, sem necessidade de integração complexa com sistemas governamentais (SIGAE, CAF Digital) ou visitas in loco. Os dados simulam cenários reais baseados em:
- Estatísticas do FNDE sobre orçamento PNAE
- Calendário de safra de Teresópolis/RJ
- Taxas de posse de DAP na região serrana

---

## 📁 Estrutura do Projeto

```
MVP-Safe-Nutri/
├── main.py                                    # API principal FastAPI
├── requirements.txt                           # Dependências Python
├── data/
│   └── TeresopolisEscolasELocaisDeProducao.geojson  # Dados geográficos base
├── embasamento.md                             # Documentação de negócio
└── README.md                                  # Este arquivo
```

---

## 🗺️ Dados Geográficos

O arquivo `data/TeresopolisEscolasELocaisDeProducao.geojson` contém:
- **7 Escolas Municipais** em Teresópolis/RJ
- **13 Locais de Produção** (fazendas, sítios, chácaras)

Os dados são extraídos do OpenStreetMap e enriquecidos automaticamente no startup da aplicação.

---

## 🔧 Configuração CORS

O CORS está configurado para aceitar todas as origens (`*`) para facilitar a integração com o frontend durante o desenvolvimento.

**Para produção, altere em `main.py`:**

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://seu-frontend.com"],  # Especifique seu domínio
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🐛 Troubleshooting

### Erro: "GeoJSON não carregado"

Certifique-se de que o arquivo `data/TeresopolisEscolasELocaisDeProducao.geojson` existe e está no formato GeoJSON válido.

### Erro: "Nenhuma escola encontrada"

Verifique se o arquivo GeoJSON contém features com a tag `amenity=school` nas properties.

### Porta 8000 já em uso

Altere a porta no comando:
```bash
uvicorn main:app --reload --port 8001
```

### Erro ao calcular distâncias

Verifique se as coordenadas no GeoJSON estão no formato `[longitude, latitude]` (ordem GeoJSON padrão).

---

## 📝 Roadmap - Próximas Funcionalidades

### Fase 1 - Infraestrutura (Q1 2026)
- [ ] Migração para banco PostgreSQL + PostGIS
- [ ] Sistema de autenticação JWT (escolas e agricultores)
- [ ] API Gateway com rate limiting

### Fase 2 - Funcionalidades de Negócio (Q2 2026)
- [ ] Sistema de pedidos e contratos digitais
- [ ] Integração com CAF Digital e SIGAE (sistemas governamentais)
- [ ] Calendário de safra dinâmico por região
- [ ] Sistema de licitação simplificada (Chamada Pública)

### Fase 3 - Expansão (Q3 2026)
- [ ] Dashboard administrativo para secretarias de educação
- [ ] Integração com sistemas de pagamento (PIX, TED)
- [ ] Notificações push, e-mail e SMS
- [ ] App mobile para agricultores (Android/iOS)

### Fase 4 - Inteligência (Q4 2026)
- [ ] ML para previsão de demanda escolar
- [ ] Otimização de rotas de entrega
- [ ] Sistema de recomendação de cardápio baseado em safra

---

## 🎯 Modelo de Negócio

### B2G (Business to Government) - SaaS

**Plano Básico** - Gratuito
- Até 5 escolas
- Matching básico por raio
- Suporte por e-mail

**Plano Municipal** - R$ 499/mês
- Escolas ilimitadas
- Relatórios de auditoria TCU
- Suporte prioritário
- Treinamento para gestores

**Plano Regional** - R$ 1.999/mês
- Multi-municípios (até 10)
- API para integração com sistemas legados
- Consultoria em compliance PNAE
- Dashboard executivo

---

## 📊 Métricas de Sucesso

- **Compliance**: % de municípios que atingem os 30% de compra da agricultura familiar
- **Economia**: Valor economizado por município (real vs projetado)
- **Desperdício**: Redução de perda de alimentos perecíveis
- **Desenvolvimento Local**: Aumento de renda dos agricultores familiares
- **Qualidade**: Melhoria nutricional das refeições escolares (medida por nutricionistas)

---

## 📄 Licença

Este projeto foi desenvolvido como MVP para hackathon. Licenciamento em definição.

---

## 👥 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

---

## 📞 Contato

**Dúvidas sobre o projeto?** Abra uma issue ou entre em contato.

---

## 🌟 Por que Save&Nutri?

> **"Transformamos a compra de merenda escolar de um processo burocrático e ineficiente em uma operação logística inteligente, que reduz desperdício, garante cumprimento da lei e coloca comida fresca no prato do aluno."**

**Desenvolvido com 💚 para conectar escolas e agricultores familiares, fortalecendo a economia local e garantindo alimentação de qualidade para nossas crianças.**

---

**O descumprimento da Lei 11.947 não gera apenas multa. Gera inelegibilidade. Save&Nutri é a solução que protege o gestor e beneficia a comunidade.**

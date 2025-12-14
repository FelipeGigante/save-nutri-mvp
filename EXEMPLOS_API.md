# 📚 Exemplos de Uso da API EcoMerenda

Este arquivo contém exemplos práticos de como usar todos os endpoints da API.

## 🚀 Iniciando a API

```bash
# Método 1: Usando o script principal
python main.py

# Método 2: Usando uvicorn diretamente
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

A API estará disponível em: `http://localhost:8000`

---

## 📡 Exemplos de Requisições

### 1. Health Check

Verifica se a API está funcionando e quantos dados foram carregados.

**cURL:**
```bash
curl http://localhost:8000/health
```

**Python:**
```python
import requests

response = requests.get("http://localhost:8000/health")
print(response.json())
```

**Resposta esperada:**
```json
{
  "status": "healthy",
  "schools_loaded": 7,
  "farmers_loaded": 13
}
```

---

### 2. Listar Escolas

Retorna todas as escolas cadastradas com seus dados enriquecidos.

**cURL:**
```bash
curl http://localhost:8000/schools
```

**Python:**
```python
import requests

response = requests.get("http://localhost:8000/schools")
schools = response.json()

for school in schools:
    print(f"{school['name']} - {school['alunos']} alunos")
```

**Resposta esperada:**
```json
[
  {
    "id": "school_001",
    "name": "Escola Municipal Professora Maria das Dores",
    "coordinates": {
      "longitude": -42.9656,
      "latitude": -22.4128
    },
    "orcamento_mensal": 35421.75,
    "alunos": 512,
    "demanda_atual": "Cenoura"
  },
  ...
]
```

---

### 3. Calcular Matching (Escola <-> Agricultores)

Encontra agricultores próximos a uma escola e calcula a economia.

**cURL:**
```bash
# Busca com raio padrão (10km)
curl "http://localhost:8000/match/calculate?school_id=school_001"

# Busca com raio personalizado (20km)
curl "http://localhost:8000/match/calculate?school_id=school_001&raio_km=20"
```

**Python:**
```python
import requests

params = {
    "school_id": "school_001",
    "raio_km": 15
}

response = requests.get("http://localhost:8000/match/calculate", params=params)
result = response.json()

print(f"Escola: {result['school_name']}")
print(f"Agricultores encontrados: {result['total_agricultores_encontrados']}")

for match in result['matches']:
    farmer = match['farmer']
    print(f"\n{farmer['name']}")
    print(f"  - Distância: {match['distancia_km']}km")
    print(f"  - Produtos: {', '.join(farmer['produtos_disponiveis'])}")
    print(f"  - Economia: R$ {match['economia_estimada']:.2f}/mês")
```

**Resposta esperada:**
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
        "coordinates": {
          "longitude": -42.9789,
          "latitude": -22.4312
        },
        "produtos_disponiveis": ["Cenoura", "Caqui", "Inhame"],
        "tem_dap": true,
        "preco_frete": 0.0
      },
      "distancia_km": 2.34,
      "economia_estimada": 540.00,
      "produtos_em_comum": ["Cenoura"]
    },
    ...
  ]
}
```

---

### 4. GeoJSON Enriquecido

Retorna o GeoJSON completo com todos os dados enriquecidos (ideal para Mapbox).

**cURL:**
```bash
curl http://localhost:8000/geojson/enriched > mapa.geojson
```

**Python:**
```python
import requests

response = requests.get("http://localhost:8000/geojson/enriched")
geojson = response.json()

print(f"Total de features: {len(geojson['features'])}")

# Filtra escolas
escolas = [f for f in geojson['features'] if f['properties'].get('tipo') == 'escola']
print(f"Escolas: {len(escolas)}")

# Filtra agricultores
agricultores = [f for f in geojson['features'] if f['properties'].get('tipo') == 'agricultor']
print(f"Agricultores: {len(agricultores)}")
```

**Estrutura de uma feature de escola:**
```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [-42.9656, -22.4128]
  },
  "properties": {
    "id": "school_001",
    "name": "Escola Municipal Professora Maria das Dores",
    "tipo": "escola",
    "amenity": "school",
    "orcamento_mensal": 35421.75,
    "alunos": 512,
    "demanda_atual": "Cenoura",
    "addr:city": "Teresópolis",
    "addr:state": "RJ"
  }
}
```

**Estrutura de uma feature de agricultor:**
```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [-42.9789, -22.4312]
  },
  "properties": {
    "id": "farmer_001",
    "name": "Sítio Vale Verde",
    "tipo": "agricultor",
    "landuse": "farmland",
    "produtos_disponiveis": ["Cenoura", "Caqui", "Inhame"],
    "tem_dap": true,
    "preco_frete": 0.0,
    "addr:city": "Teresópolis",
    "addr:state": "RJ"
  }
}
```

---

## 🧪 Script de Teste Completo

Incluímos um script Python que testa todos os endpoints:

```bash
# Certifique-se de que a API está rodando
python main.py

# Em outro terminal, execute:
python test_api.py
```

---

## 🌐 Integração com Frontend

### Exemplo: Carregar Mapa no Mapbox (React)

```javascript
import { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';

function MapaEcoMerenda() {
  const [geojson, setGeojson] = useState(null);

  useEffect(() => {
    // Carrega GeoJSON da API
    fetch('http://localhost:8000/geojson/enriched')
      .then(res => res.json())
      .then(data => {
        setGeojson(data);

        // Inicializa mapa
        const map = new mapboxgl.Map({
          container: 'map',
          style: 'mapbox://styles/mapbox/streets-v11',
          center: [-42.9656, -22.4128],
          zoom: 12
        });

        map.on('load', () => {
          // Adiciona escolas (pontos vermelhos)
          map.addSource('escolas', {
            type: 'geojson',
            data: {
              ...data,
              features: data.features.filter(f => f.properties.tipo === 'escola')
            }
          });

          map.addLayer({
            id: 'escolas',
            type: 'circle',
            source: 'escolas',
            paint: {
              'circle-radius': 8,
              'circle-color': '#FF0000'
            }
          });

          // Adiciona agricultores (pontos verdes)
          map.addSource('agricultores', {
            type: 'geojson',
            data: {
              ...data,
              features: data.features.filter(f => f.properties.tipo === 'agricultor')
            }
          });

          map.addLayer({
            id: 'agricultores',
            type: 'circle',
            source: 'agricultores',
            paint: {
              'circle-radius': 6,
              'circle-color': '#00AA00'
            }
          });

          // Popup ao clicar
          map.on('click', 'escolas', (e) => {
            const props = e.features[0].properties;
            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(`
                <h3>${props.name}</h3>
                <p>Alunos: ${props.alunos}</p>
                <p>Orçamento: R$ ${props.orcamento_mensal}</p>
                <p>Demanda: ${props.demanda_atual}</p>
              `)
              .addTo(map);
          });
        });
      });
  }, []);

  return <div id="map" style={{ width: '100%', height: '600px' }} />;
}
```

---

## 🔧 Parâmetros de Query

### `/match/calculate`

| Parâmetro | Tipo | Obrigatório | Padrão | Descrição |
|-----------|------|-------------|--------|-----------|
| `school_id` | string | Sim | - | ID da escola (ex: "school_001") |
| `raio_km` | float | Não | 10.0 | Raio de busca em km (1-100) |

---

## ❌ Tratamento de Erros

### Escola não encontrada

**Requisição:**
```bash
curl "http://localhost:8000/match/calculate?school_id=escola_invalida"
```

**Resposta (404):**
```json
{
  "detail": "Escola 'escola_invalida' não encontrada. Use /schools para listar as escolas disponíveis."
}
```

### Arquivo GeoJSON não encontrado

Se o arquivo `data/TeresopolisEscolasELocaisDeProducao.geojson` não existir:

**Resposta (503):**
```json
{
  "detail": "GeoJSON não carregado. Verifique se o arquivo data/TeresopolisEscolasELocaisDeProducao.geojson existe."
}
```

---

## 📊 Dados de Exemplo

### Produtos disponíveis na safra local:
- Cenoura
- Beterraba
- Caqui
- Inhame
- Brócolis
- Couve
- Alface
- Tomate

### Escolas cadastradas:
1. Escola Municipal Professora Maria das Dores
2. Colégio Estadual Clodomiro Vasconcelos
3. Escola Municipal João Kopke
4. Centro Educacional Serra dos Órgãos
5. Escola Municipal Bairro Alto
6. Colégio Estadual Heloísa Lessa
7. Escola Monteiro Lobato

### Locais de produção:
13 fazendas, sítios e chácaras em Teresópolis/RJ

---

**Desenvolvido com 💚 para conectar escolas e agricultores familiares**

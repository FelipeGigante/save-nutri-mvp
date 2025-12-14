import json
import random
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from geopy.distance import geodesic # <--- O segredo do cálculo real

app = FastAPI()

# Configuração do CORS (Para o Front falar com o Back sem travar)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- BANCO DE DADOS EM MEMÓRIA ---
DB = {
    "features": []
}

# --- FUNÇÃO DE INICIALIZAÇÃO (CARREGA E ENRIQUECE OS DADOS) ---
@app.on_event("startup")
async def load_data():
    try:
        # Tenta carregar o arquivo. Se der erro, verifique o caminho!
        with open("data/TeresopolisEscolasELocaisDeProducao.geojson", "r", encoding="utf-8") as f:
            raw_data = json.load(f)
            
        # ENRIQUECIMENTO DE DADOS (O "Mock Inteligente")
        processed_features = []
        
        # Listas de dados falsos para dar vida ao sistema
        PRODUTOS_SAFRA = ["Alface", "Couve", "Tomate", "Cenoura", "Beterraba", "Inhame", "Brócolis", "Caqui"]
        DEMANDAS_ESCOLA = ["Hortifruti Variado", "Legumes", "Frutas da Estação", "Folhosas"]
        
    # ... dentro da função load_data ...
        
        # MUDANÇA: Adicione o 'i' no enumerate para ter um contador único (0, 1, 2...)
        for i, feature in enumerate(raw_data['features']):
            props = feature['properties']
            
            # 1. É ESCOLA?
            if props.get('amenity') == 'school':
                props['tipo'] = 'escola'
                # USA O CONTADOR 'i' PARA GARANTIR ID ÚNICO
                props['id'] = props.get('id', f"school_{i}") 
                props['alunos'] = random.randint(100, 800)
                props['orcamento_mensal'] = round(random.uniform(5000, 50000), 2)
                props['demanda_atual'] = random.choice(DEMANDAS_ESCOLA)
                processed_features.append(feature)
                
            # 2. É AGRICULTOR?
            elif props.get('landuse') in ['farmland', 'farm', 'orchard', 'meadow']:
                props['tipo'] = 'agricultor'
                # USA O CONTADOR 'i' AQUI TAMBÉM
                props['id'] = props.get('id', f"farmer_{i}") 
                qtd_prod = random.randint(3, 5)
                props['produtos_disponiveis'] = random.sample(PRODUTOS_SAFRA, qtd_prod)
                props['tem_dap'] = True 
                processed_features.append(feature)
        
        DB["features"] = processed_features
        print(f"✅ DADOS CARREGADOS! {len(processed_features)} itens prontos.")
        
    except Exception as e:
        print(f"❌ ERRO CRÍTICO AO CARREGAR DADOS: {e}")

# --- ROTA 1: MAPA (Retorna tudo colorido) ---
@app.get("/geojson/enriched")
def get_map_data():
    return {
        "type": "FeatureCollection",
        "features": DB["features"]
    }

# --- ROTA 2: O CÉREBRO (Cálculo de Distância) ---
@app.get("/match/calculate")
def calculate_match(school_id: str):
    print(f"🔎 Calculando rota para escola: {school_id}")
    
    # 1. Achar a escola no banco
    school = next((f for f in DB["features"] if f['properties'].get('id') == school_id), None)
    
    if not school:
        raise HTTPException(status_code=404, detail="Escola não encontrada")
    
    # GeoJSON é [Longitude, Latitude], mas Geopy pede (Lat, Long)
    school_coords = (school['geometry']['coordinates'][1], school['geometry']['coordinates'][0])
    
    # 2. Pegar todos os agricultores
    farmers = [f for f in DB["features"] if f['properties'].get('tipo') == 'agricultor']
    
    matches = []
    
    # 3. Calcular distância um por um
    for farmer in farmers:
        farmer_coords = (farmer['geometry']['coordinates'][1], farmer['geometry']['coordinates'][0])
        
        # AQUI É O PULO DO GATO: Cálculo Geodésico Real
        dist_km = geodesic(school_coords, farmer_coords).km
        
        # Simula economia: R$ 500 base - custo por km
        # Se for muito longe, a economia cai
        economia = max(0, 500 - (dist_km * 15)) 
        
        matches.append({
            "farmer_id": farmer['properties']['id'],
            "farmer_name": farmer['properties'].get('name', f"Sítio Familiar {farmer['properties']['id']}"),
            "distance": round(dist_km, 1), # Arredonda para 1 casa decimal (ex: 1.2 km)
            "savings": round(economia, 2),
            "products": farmer['properties']['produtos_disponiveis']
        })
    
    # 4. Ordenar: O menor 'distance' fica em primeiro
    matches.sort(key=lambda x: x['distance'])
    
    # Pega o campeão (índice 0)
    best = matches[0] if matches else None
    
    return {
        "school_id": school_id,
        "matches_found": len(matches),
        "best_match": best,       # O melhor para desenhar a linha
        "alternatives": matches[1:4] # Top 3 alternativas
    }
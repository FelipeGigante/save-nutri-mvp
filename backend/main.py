"""
EcoMerenda - Backend API para Hackathon
Sistema B2G que conecta Escolas Públicas a Agricultores Familiares (PNAE)

Desenvolvido para MVP rápido com persistência em memória.
"""

import json
import random
from pathlib import Path
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from geopy.distance import geodesic


# =====================================================================
# CONFIGURAÇÃO DA APLICAÇÃO
# =====================================================================

app = FastAPI(
    title="EcoMerenda API",
    description="API para conectar Escolas Públicas a Agricultores Familiares locais (PNAE)",
    version="1.0.0-hackathon"
)

# Configuração CORS para integração com Front-end
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Libera todas as origens (ideal para MVP)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================================
# MODELOS PYDANTIC
# =====================================================================

class Coordinates(BaseModel):
    """Coordenadas geográficas (longitude, latitude)"""
    longitude: float
    latitude: float


class School(BaseModel):
    """Modelo de dados de uma Escola enriquecida"""
    id: str
    name: str
    coordinates: Coordinates
    orcamento_mensal: float = Field(..., description="Orçamento mensal em R$ para merenda")
    alunos: int = Field(..., description="Número de alunos matriculados")
    demanda_atual: str = Field(..., description="Produto mais demandado atualmente")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "school_001",
                "name": "Escola Estadual João Silva",
                "coordinates": {"longitude": -42.965, "latitude": -22.413},
                "orcamento_mensal": 25000.50,
                "alunos": 450,
                "demanda_atual": "Cenoura"
            }
        }


class Farmer(BaseModel):
    """Modelo de dados de um Produtor/Agricultor enriquecido"""
    id: str
    name: str
    coordinates: Coordinates
    produtos_disponiveis: List[str] = Field(..., description="Lista de produtos que o agricultor cultiva")
    tem_dap: bool = Field(True, description="Possui Declaração de Aptidão ao PRONAF (DAP)")
    preco_frete: float = Field(0.0, description="Custo de frete (R$) - Zero para agricultores locais")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "farmer_001",
                "name": "Sítio Boa Esperança",
                "coordinates": {"longitude": -42.970, "latitude": -22.410},
                "produtos_disponiveis": ["Cenoura", "Caqui", "Inhame"],
                "tem_dap": True,
                "preco_frete": 0.0
            }
        }


class MatchResult(BaseModel):
    """Resultado do matching entre escola e agricultores"""
    farmer: Farmer
    distancia_km: float = Field(..., description="Distância em quilômetros da escola")
    economia_estimada: float = Field(..., description="Economia estimada em R$ comparado ao atacadista")
    produtos_em_comum: List[str] = Field(..., description="Produtos que atendem à demanda da escola")


class MatchResponse(BaseModel):
    """Resposta completa do endpoint de matching"""
    school_id: str
    school_name: str
    raio_km: float
    total_agricultores_encontrados: int
    matches: List[MatchResult]


# =====================================================================
# ARMAZENAMENTO EM MEMÓRIA (DATABASES GLOBAIS)
# =====================================================================

SCHOOLS_DB: List[School] = []
FARMERS_DB: List[Farmer] = []
GEOJSON_ENRICHED: Dict[str, Any] = {}


# =====================================================================
# FUNÇÕES AUXILIARES DE ENRIQUECIMENTO DE DADOS (MOCK INTELIGENTE)
# =====================================================================

def gerar_dados_escola_mock(feature_properties: Dict) -> Dict:
    """
    Injeta dados fictícios de negócio em uma Escola.

    OSM não possui informações como orçamento, número de alunos ou demanda.
    Esta função simula esses dados para o MVP do hackathon.

    Args:
        feature_properties: Propriedades originais do GeoJSON (OSM)

    Returns:
        Dicionário com dados enriquecidos
    """
    # Lista de produtos típicos da agricultura familiar (safra da região serrana do RJ)
    produtos_safra = ["Cenoura", "Beterraba", "Caqui", "Inhame", "Brócolis", "Couve", "Alface"]

    # Gera valores realistas baseados em escolas públicas brasileiras
    orcamento = round(random.uniform(15000, 50000), 2)  # R$ 15k - 50k/mês
    alunos = random.randint(200, 800)  # 200 a 800 alunos
    demanda = random.choice(produtos_safra)

    return {
        "orcamento_mensal": orcamento,
        "alunos": alunos,
        "demanda_atual": demanda
    }


def gerar_dados_agricultor_mock(feature_properties: Dict) -> Dict:
    """
    Injeta dados fictícios de negócio em um Produtor/Agricultor.

    OSM não possui informações sobre produtos cultivados, DAP ou frete.
    Esta função simula esses dados para o MVP do hackathon.

    Args:
        feature_properties: Propriedades originais do GeoJSON (OSM)

    Returns:
        Dicionário com dados enriquecidos
    """
    # Produtos típicos da agricultura familiar da região serrana
    todos_produtos = ["Cenoura", "Beterraba", "Caqui", "Inhame", "Brócolis", "Couve", "Alface", "Tomate"]

    # Cada agricultor cultiva de 2 a 5 produtos diferentes
    num_produtos = random.randint(2, 5)
    produtos = random.sample(todos_produtos, num_produtos)

    # 90% dos agricultores familiares possuem DAP (realista)
    tem_dap = random.random() < 0.9

    # Frete zero para agricultores locais (incentivo do programa)
    preco_frete = 0.0

    return {
        "produtos_disponiveis": produtos,
        "tem_dap": tem_dap,
        "preco_frete": preco_frete
    }


def identificar_tipo_feature(properties: Dict) -> Optional[str]:
    """
    Identifica se um feature do GeoJSON é Escola ou Agricultor.

    Baseado nas tags do OpenStreetMap:
    - Escola: amenity=school
    - Agricultor: landuse=farmland, place=farm, landuse=farmyard

    Args:
        properties: Propriedades do feature GeoJSON

    Returns:
        "school", "farmer" ou None
    """
    # Verifica se é escola
    if properties.get("amenity") == "school":
        return "school"

    # Verifica se é produtor/fazenda
    landuse = properties.get("landuse", "").lower()
    place = properties.get("place", "").lower()

    if landuse in ["farmland", "farmyard"] or place == "farm":
        return "farmer"

    return None


def calcular_economia_estimada(distancia_km: float, demanda_escola: str, produtos_agricultor: List[str]) -> float:
    """
    Calcula a economia estimada ao comprar de um agricultor local vs atacadista.

    Lógica do Mock Inteligente:
    - Atacadista: R$ 3,50/kg + frete de R$ 0,80/km
    - Agricultor Local: R$ 2,50/kg + frete R$ 0,00 (programa PNAE)
    - Assume compra de 500kg/mês por produto em comum

    Args:
        distancia_km: Distância do agricultor à escola
        demanda_escola: Produto demandado pela escola
        produtos_agricultor: Lista de produtos do agricultor

    Returns:
        Economia mensal estimada em R$
    """
    # Verifica se há match de produtos
    produtos_em_comum = [p for p in produtos_agricultor if demanda_escola in p or p in demanda_escola]
    if not produtos_em_comum:
        produtos_em_comum = produtos_agricultor  # Considera todos se não houver match exato

    # Parâmetros de cálculo (valores realistas)
    preco_atacadista_kg = 3.50
    preco_agricultor_kg = 2.50
    frete_atacadista_km = 0.80
    frete_agricultor = 0.00  # Incentivo PNAE
    quantidade_mensal_kg = 500

    # Custo no atacadista (assume 50km de distância média)
    custo_atacadista = (preco_atacadista_kg * quantidade_mensal_kg) + (frete_atacadista_km * 50)

    # Custo no agricultor local
    custo_agricultor = (preco_agricultor_kg * quantidade_mensal_kg) + (frete_agricultor * distancia_km)

    # Economia = diferença positiva
    economia = max(0, custo_atacadista - custo_agricultor)

    return round(economia, 2)


# =====================================================================
# LÓGICA DE STARTUP: CARREGAMENTO E ENRIQUECIMENTO DO GEOJSON
# =====================================================================

@app.on_event("startup")
async def load_and_enrich_geojson():
    """
    Evento de inicialização da API.

    Carrega o arquivo GeoJSON do OpenStreetMap e realiza o "Mock Inteligente":
    1. Lê o arquivo TeresopolisEscolasELocaisDeProducao.geojson
    2. Identifica quem é Escola (amenity=school) e quem é Produtor (landuse=farmland, etc)
    3. Injeta dados fictícios de negócio (orçamento, alunos, produtos, DAP, etc)
    4. Popula as databases globais SCHOOLS_DB e FARMERS_DB
    5. Cria um GeoJSON enriquecido para o endpoint /geojson/enriched
    """
    global SCHOOLS_DB, FARMERS_DB, GEOJSON_ENRICHED

    # Caminho do arquivo GeoJSON
    geojson_path = Path("data/TeresopolisEscolasELocaisDeProducao.geojson")

    # Verifica se o arquivo existe
    if not geojson_path.exists():
        print(f"⚠️  AVISO: Arquivo {geojson_path} não encontrado!")
        print("📝 A API iniciará com databases vazias. Crie o arquivo GeoJSON para popular os dados.")
        GEOJSON_ENRICHED = {"type": "FeatureCollection", "features": []}
        return

    # Carrega o arquivo GeoJSON
    try:
        with open(geojson_path, "r", encoding="utf-8") as f:
            geojson_data = json.load(f)
    except Exception as e:
        print(f"❌ Erro ao ler GeoJSON: {e}")
        GEOJSON_ENRICHED = {"type": "FeatureCollection", "features": []}
        return

    # Inicializa contadores para log
    school_count = 0
    farmer_count = 0

    # Cria lista de features enriquecidos
    enriched_features = []

    # Processa cada feature do GeoJSON
    for feature in geojson_data.get("features", []):
        properties = feature.get("properties", {})
        geometry = feature.get("geometry", {})

        # Extrai coordenadas (formato GeoJSON: [longitude, latitude])
        if geometry.get("type") == "Point":
            coords = geometry.get("coordinates", [])
            if len(coords) < 2:
                continue

            longitude, latitude = coords[0], coords[1]
        else:
            continue  # Ignora geometrias que não são pontos

        # Identifica tipo do feature
        tipo = identificar_tipo_feature(properties)

        # Cria cópia do feature para enriquecer
        enriched_feature = feature.copy()

        # ENRIQUECIMENTO: ESCOLA
        if tipo == "school":
            school_count += 1

            # Gera ID único
            school_id = f"school_{school_count:03d}"

            # Extrai nome (OSM pode ter "name" ou ser vazio)
            name = properties.get("name", f"Escola {school_count}")

            # Injeta dados fictícios
            mock_data = gerar_dados_escola_mock(properties)

            # Adiciona ao feature enriquecido
            enriched_feature["properties"].update({
                "id": school_id,
                "tipo": "escola",
                **mock_data
            })

            # Cria objeto School e adiciona ao DB
            school = School(
                id=school_id,
                name=name,
                coordinates=Coordinates(longitude=longitude, latitude=latitude),
                **mock_data
            )
            SCHOOLS_DB.append(school)

        # ENRIQUECIMENTO: AGRICULTOR
        elif tipo == "farmer":
            farmer_count += 1

            # Gera ID único
            farmer_id = f"farmer_{farmer_count:03d}"

            # Extrai nome
            name = properties.get("name", f"Produtor {farmer_count}")

            # Injeta dados fictícios
            mock_data = gerar_dados_agricultor_mock(properties)

            # Adiciona ao feature enriquecido
            enriched_feature["properties"].update({
                "id": farmer_id,
                "tipo": "agricultor",
                **mock_data
            })

            # Cria objeto Farmer e adiciona ao DB
            farmer = Farmer(
                id=farmer_id,
                name=name,
                coordinates=Coordinates(longitude=longitude, latitude=latitude),
                **mock_data
            )
            FARMERS_DB.append(farmer)

        # Adiciona feature enriquecido à lista (mesmo que não seja escola ou agricultor)
        enriched_features.append(enriched_feature)

    # Salva GeoJSON enriquecido
    GEOJSON_ENRICHED = {
        "type": "FeatureCollection",
        "features": enriched_features
    }

    # Log de inicialização
    print("=" * 60)
    print("🚀 EcoMerenda API - Inicialização Completa!")
    print("=" * 60)
    print(f"📚 Escolas carregadas: {school_count}")
    print(f"🌾 Agricultores carregados: {farmer_count}")
    print(f"📍 Total de features no GeoJSON: {len(enriched_features)}")
    print("=" * 60)


# =====================================================================
# ENDPOINTS DA API
# =====================================================================

@app.get("/", tags=["Info"])
async def root():
    """Endpoint raiz com informações básicas da API"""
    return {
        "message": "EcoMerenda API - Sistema B2G para PNAE",
        "version": "1.0.0-hackathon",
        "docs": "/docs",
        "endpoints": {
            "geojson_enriquecido": "/geojson/enriched",
            "lista_escolas": "/schools",
            "calcular_matches": "/match/calculate"
        }
    }


@app.get("/geojson/enriched", tags=["GeoData"])
async def get_enriched_geojson():
    """
    Retorna o GeoJSON completo já enriquecido com dados de negócio.

    Este endpoint é ideal para o Front-end (Mapbox) pintar o mapa com cores
    diferentes para escolas e agricultores, mostrando informações extras nos popups.

    Returns:
        GeoJSON com features enriquecidos (escolas e agricultores)
    """
    if not GEOJSON_ENRICHED.get("features"):
        raise HTTPException(
            status_code=503,
            detail="GeoJSON não carregado. Verifique se o arquivo data/TeresopolisEscolasELocaisDeProducao.geojson existe."
        )

    return GEOJSON_ENRICHED


@app.get("/schools", response_model=List[School], tags=["Escolas"])
async def list_schools():
    """
    Lista todas as escolas cadastradas.

    Útil para popular dropdowns no Front-end onde o usuário
    seleciona uma escola para buscar agricultores próximos.

    Returns:
        Lista de objetos School com todos os dados enriquecidos
    """
    if not SCHOOLS_DB:
        raise HTTPException(
            status_code=404,
            detail="Nenhuma escola encontrada. Verifique o arquivo GeoJSON."
        )

    return SCHOOLS_DB


@app.get("/match/calculate", response_model=MatchResponse, tags=["Matching"])
async def calculate_matches(
    school_id: str = Query(..., description="ID da escola (ex: school_001)"),
    raio_km: float = Query(10.0, ge=1.0, le=100.0, description="Raio de busca em quilômetros (1-100)")
):
    """
    Calcula matches entre uma escola e agricultores no raio especificado.

    Este é o endpoint principal do sistema. Ele:
    1. Busca a escola pelo ID
    2. Filtra agricultores que estão dentro do raio especificado
    3. Calcula a distância exata usando geopy.distance.geodesic
    4. Calcula a economia estimada ao comprar de cada agricultor
    5. Ordena os resultados por distância (mais próximo primeiro)

    Args:
        school_id: ID da escola (ex: "school_001")
        raio_km: Raio de busca em quilômetros (padrão: 10km)

    Returns:
        MatchResponse com lista de agricultores ordenados por distância,
        incluindo economia estimada para cada um
    """
    # Busca a escola
    school = next((s for s in SCHOOLS_DB if s.id == school_id), None)
    if not school:
        raise HTTPException(
            status_code=404,
            detail=f"Escola '{school_id}' não encontrada. Use /schools para listar as escolas disponíveis."
        )

    # Coordenadas da escola (formato para geopy: (latitude, longitude))
    school_coords = (school.coordinates.latitude, school.coordinates.longitude)

    # Lista para armazenar matches
    matches: List[MatchResult] = []

    # Itera sobre todos os agricultores
    for farmer in FARMERS_DB:
        # Coordenadas do agricultor
        farmer_coords = (farmer.coordinates.latitude, farmer.coordinates.longitude)

        # Calcula distância real usando geodesic (considera curvatura da Terra)
        distancia_km = geodesic(school_coords, farmer_coords).kilometers

        # Verifica se está dentro do raio
        if distancia_km <= raio_km:
            # Calcula economia estimada
            economia = calcular_economia_estimada(
                distancia_km,
                school.demanda_atual,
                farmer.produtos_disponiveis
            )

            # Identifica produtos em comum
            produtos_em_comum = [
                p for p in farmer.produtos_disponiveis
                if school.demanda_atual.lower() in p.lower() or p.lower() in school.demanda_atual.lower()
            ]

            # Se não houver match exato, considera todos os produtos (agricultor pode fornecer outros)
            if not produtos_em_comum:
                produtos_em_comum = farmer.produtos_disponiveis

            # Cria resultado do match
            match = MatchResult(
                farmer=farmer,
                distancia_km=round(distancia_km, 2),
                economia_estimada=economia,
                produtos_em_comum=produtos_em_comum
            )
            matches.append(match)

    # Ordena matches por distância (mais próximo primeiro)
    matches.sort(key=lambda x: x.distancia_km)

    # Monta resposta
    response = MatchResponse(
        school_id=school.id,
        school_name=school.name,
        raio_km=raio_km,
        total_agricultores_encontrados=len(matches),
        matches=matches
    )

    return response


@app.get("/health", tags=["Info"])
async def health_check():
    """Endpoint de health check para monitoramento"""
    return {
        "status": "healthy",
        "schools_loaded": len(SCHOOLS_DB),
        "farmers_loaded": len(FARMERS_DB)
    }


# =====================================================================
# EXECUÇÃO DIRETA (para desenvolvimento)
# =====================================================================

if __name__ == "__main__":
    import uvicorn

    print("\n" + "=" * 60)
    print("🌾 Iniciando EcoMerenda API...")
    print("=" * 60 + "\n")

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload em desenvolvimento
        log_level="info"
    )

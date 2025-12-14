"""
Script de teste rápido para a API EcoMerenda
Execute: python test_api.py (com a API rodando em outra janela)
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Testa o endpoint de health check"""
    print("\n" + "="*60)
    print("🏥 Testando Health Check...")
    print("="*60)

    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Resposta: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")

def test_schools():
    """Testa o endpoint de listagem de escolas"""
    print("\n" + "="*60)
    print("🏫 Testando Listagem de Escolas...")
    print("="*60)

    response = requests.get(f"{BASE_URL}/schools")
    schools = response.json()

    print(f"Status: {response.status_code}")
    print(f"Total de escolas: {len(schools)}")

    if schools:
        print(f"\nPrimeira escola:")
        print(json.dumps(schools[0], indent=2, ensure_ascii=False))

def test_match():
    """Testa o endpoint de matching"""
    print("\n" + "="*60)
    print("🔍 Testando Matching Escola <-> Agricultores...")
    print("="*60)

    # Primeiro pega uma escola
    schools_response = requests.get(f"{BASE_URL}/schools")
    schools = schools_response.json()

    if not schools:
        print("❌ Nenhuma escola encontrada!")
        return

    school_id = schools[0]["id"]
    raio_km = 20

    print(f"Buscando agricultores para: {schools[0]['name']}")
    print(f"Raio de busca: {raio_km}km")

    # Faz o matching
    response = requests.get(
        f"{BASE_URL}/match/calculate",
        params={"school_id": school_id, "raio_km": raio_km}
    )

    result = response.json()

    print(f"\nStatus: {response.status_code}")
    print(f"Agricultores encontrados: {result['total_agricultores_encontrados']}")

    if result['matches']:
        print(f"\n🥇 Agricultor mais próximo:")
        match = result['matches'][0]
        print(f"  - Nome: {match['farmer']['name']}")
        print(f"  - Distância: {match['distancia_km']}km")
        print(f"  - Produtos: {', '.join(match['farmer']['produtos_disponiveis'])}")
        print(f"  - Economia estimada: R$ {match['economia_estimada']:.2f}/mês")

def test_geojson():
    """Testa o endpoint de GeoJSON enriquecido"""
    print("\n" + "="*60)
    print("🗺️  Testando GeoJSON Enriquecido...")
    print("="*60)

    response = requests.get(f"{BASE_URL}/geojson/enriched")
    geojson = response.json()

    print(f"Status: {response.status_code}")
    print(f"Total de features: {len(geojson['features'])}")

    # Conta por tipo
    escolas = sum(1 for f in geojson['features'] if f['properties'].get('tipo') == 'escola')
    agricultores = sum(1 for f in geojson['features'] if f['properties'].get('tipo') == 'agricultor')

    print(f"  - Escolas: {escolas}")
    print(f"  - Agricultores: {agricultores}")

if __name__ == "__main__":
    print("\n" + "🌾" + "="*58 + "🌾")
    print("   TESTE DA API ECOMERENDA")
    print("🌾" + "="*58 + "🌾")

    try:
        test_health()
        test_schools()
        test_match()
        test_geojson()

        print("\n" + "="*60)
        print("✅ Todos os testes concluídos!")
        print("="*60)
        print("\n📖 Acesse a documentação interativa em: http://localhost:8000/docs\n")

    except requests.exceptions.ConnectionError:
        print("\n❌ ERRO: Não foi possível conectar à API!")
        print("⚠️  Certifique-se de que a API está rodando:")
        print("   python main.py")
        print()
    except Exception as e:
        print(f"\n❌ ERRO: {e}")

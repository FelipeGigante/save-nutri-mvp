"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import MapComponent from "@/components/MapComponent";
import type { MatchResponse } from "@/types";
import { Loader2 } from "lucide-react";

// --- URL CHUMBADA (HARDCODED) ---
const API_BASE_URL = "http://localhost:8000";

export default function Page() {
  const [schools, setSchools] = useState<any[]>([]);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<any | null>(null);
  const [matchedFarmerId, setMatchedFarmerId] = useState<string | null>(null);

  const [matchResult, setMatchResult] = useState<MatchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log("Page: Buscando dados...");
        const response = await fetch(`${API_BASE_URL}/geojson/enriched`);

        if (!response.ok) throw new Error("Falha ao buscar dados");

        const data = await response.json();
        console.log("Page: Dados carregados!", data.features.length, "items");

        const schoolsData = data.features.filter(
          (f: any) => f.properties.tipo === "escola"
        );
        const farmersData = data.features.filter(
          (f: any) => f.properties.tipo === "agricultor"
        );

        setSchools(schoolsData);
        setFarmers(farmersData);
      } catch (err) {
        console.error(err);
        setError(
          "Erro ao conectar com http://localhost:8000. O Python está rodando?"
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSchoolSelect = (school: any) => {
    setMatchResult(null);
    setMatchedFarmerId(null);
    setSelectedSchool(school);
  };

  const handleMapSchoolClick = (schoolId: string) => {
    const schoolFound = schools.find((s) => s.properties.id === schoolId);
    if (schoolFound) {
      if (selectedSchool?.properties.id !== schoolId) {
        handleSchoolSelect(schoolFound);
      }
    }
  };

  const handleFindProducers = async (schoolId: string) => {
    setIsLoadingMatch(true);

    try {
      console.log(
        `📡 Pedindo para o Python calcular a rota da escola ${schoolId}...`
      );

      // 1. CHAMADA REAL AO SEU BACKEND
      // O Python vai rodar o Geopy, medir distâncias e achar o vizinho mais próximo
      const response = await fetch(
        `${API_BASE_URL}/match/calculate?school_id=${schoolId}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erro no servidor");
      }

      const data = await response.json();
      console.log("✅ Python respondeu:", data);

      if (data.best_match) {
        // 2. FORMATA O RESULTADO PARA O FRONT MOSTRAR
        const realMatch = {
          school_id: schoolId,
          matches: [
            {
              farmer_id: data.best_match.farmer_id,
              // Se o Python mandar nome, usa. Se não, fallback bonito.
              farmer_name:
                data.best_match.farmer_name || "Agricultor Familiar Local",
              distance: data.best_match.distance,
              savings: data.best_match.savings,
            },
          ],
        };

        // 3. ATUALIZA A TELA
        setMatchResult(realMatch as any);

        // O Pulo do Gato: Isso faz a linha roxa aparecer no lugar CERTINHO
        setMatchedFarmerId(data.best_match.farmer_id);
      } else {
        alert(
          "O sistema não encontrou nenhum agricultor próximo o suficiente."
        );
      }
    } catch (err) {
      console.error("❌ Erro na conexão:", err);
      alert(
        "Erro ao conectar com a inteligência logística. Verifique se o Python está rodando."
      );
    } finally {
      setIsLoadingMatch(false);
    }
  };

  const handleCloseMatch = () => {
    setMatchResult(null);
    setMatchedFarmerId(null);
  };

  if (isLoading)
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-emerald-600" />
      </div>
    );
  if (error) return <div className="p-10 text-red-500 font-bold">{error}</div>;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-100">
      <div className="absolute inset-0 z-0">
        <MapComponent
          selectedSchoolId={selectedSchool?.properties.id}
          matchedFarmerId={matchedFarmerId}
          onSchoolClick={handleMapSchoolClick}
        />
      </div>

      <div className="absolute left-4 top-4 bottom-4 z-10 w-[400px] pointer-events-none">
        <div className="pointer-events-auto h-full">
          <Sidebar
            schools={schools}
            selectedSchool={selectedSchool}
            onSchoolSelect={handleSchoolSelect}
            onFindProducers={(id) => handleFindProducers(id)}
            matchResult={matchResult}
            onCloseMatch={handleCloseMatch}
            isLoadingMatch={isLoadingMatch}
          />
        </div>
      </div>
    </div>
  );
}

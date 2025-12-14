"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/Sidebar"
import MapComponent from "@/components/MapComponent" 
import type { School, Farmer, MatchResponse } from "@/types" // Se tiver tipos definidos, se não use any por enquanto
import { Loader2 } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function Page() {
  // IDs agora são STRING porque o JSON manda "school_001"
  const [schools, setSchools] = useState<any[]>([])
  const [farmers, setFarmers] = useState<any[]>([])
  const [selectedSchool, setSelectedSchool] = useState<any | null>(null)
  const [matchedFarmerId, setMatchedFarmerId] = useState<string | null>(null)
  
  const [matchResult, setMatchResult] = useState<MatchResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMatch, setIsLoadingMatch] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`${API_BASE_URL}/geojson/enriched`) // URL que retorna seu JSON
        if (!response.ok) throw new Error("Failed to fetch data")
        const data = await response.json()

        // --- CORREÇÃO AQUI: FILTRAR POR 'tipo' ---
        // O JSON tem "tipo": "escola" e "tipo": "agricultor"
        const schoolsData = data.features.filter((f: any) => f.properties.tipo === 'escola')
        const farmersData = data.features.filter((f: any) => f.properties.tipo === 'agricultor')

        setSchools(schoolsData)
        setFarmers(farmersData)
      } catch (err) {
        console.error(err)
        setError("Erro ao carregar dados.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSchoolSelect = (school: any) => {
    setSelectedSchool(school)
    setMatchResult(null)
    setMatchedFarmerId(null)
  }

  // Recebe ID string do mapa
  const handleMapSchoolClick = (schoolId: string) => {
    const schoolFound = schools.find(s => s.properties.id === schoolId)
    if (schoolFound) handleSchoolSelect(schoolFound)
  }

  const handleFindProducers = async (schoolId: string) => {
    setIsLoadingMatch(true)
    setTimeout(() => {
        // Simulação de Match
         const mockMatch = {
            school_id: schoolId,
            matches: [
               { farmer_id: "farmer_001", farmer_name: "Sítio Exemplo", distance: 1.2, savings: 350.00 }
            ]
         }
         setMatchResult(mockMatch as any)
         
         // --- Pega o primeiro agricultor da lista que você carregou ---
         if (farmers.length > 0) {
             setMatchedFarmerId(farmers[0].properties.id) 
         }
         setIsLoadingMatch(false)
    }, 1000)
  }

  const handleCloseMatch = () => {
    setMatchResult(null)
    setMatchedFarmerId(null)
  }

  if (isLoading) return <div className="h-screen w-screen flex items-center justify-center"><Loader2 className="animate-spin"/></div>
  if (error) return <div>{error}</div>

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
                onFindProducers={(id) => handleFindProducers(id)} // ID já é string agora
                matchResult={matchResult}
                onCloseMatch={handleCloseMatch}
                isLoadingMatch={isLoadingMatch}
            />
        </div>
      </div>
    </div>
  )
}
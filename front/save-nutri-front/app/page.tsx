"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/Sidebar"
import type { School, Farmer, GeoJSONResponse, MatchResponse } from "@/types"
import { Loader2 } from "lucide-react"

const API_BASE_URL = "http://localhost:8000"

export default function Page() {
  const [schools, setSchools] = useState<School[]>([])
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [matchResult, setMatchResult] = useState<MatchResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMatch, setIsLoadingMatch] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`${API_BASE_URL}/geojson/enriched`)

        if (!response.ok) {
          throw new Error("Failed to fetch data")
        }

        const data: GeoJSONResponse = await response.json()

        // Separate schools and farmers based on properties
        const schoolsData = data.features.filter((feature) => "students" in feature.properties) as School[]

        const farmersData = data.features.filter((feature) => "products" in feature.properties) as Farmer[]

        setSchools(schoolsData)
        setFarmers(farmersData)
        setError(null)
      } catch (err) {
        console.error("[v0] Error fetching data:", err)
        setError("Erro ao carregar dados. Verifique se o backend está rodando.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSchoolSelect = (school: School) => {
    setSelectedSchool(school)
    setMatchResult(null)
  }

  const handleFindProducers = async (schoolId: string) => {
    try {
      setIsLoadingMatch(true)
      const response = await fetch(`${API_BASE_URL}/match/calculate?school_id=${schoolId}`)

      if (!response.ok) {
        throw new Error("Failed to calculate matches")
      }

      const data: MatchResponse = await response.json()
      setMatchResult(data)
    } catch (err) {
      console.error("[v0] Error calculating matches:", err)
      alert("Erro ao buscar produtores. Tente novamente.")
    } finally {
      setIsLoadingMatch(false)
    }
  }

  const handleCloseMatch = () => {
    setMatchResult(null)
  }

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-100">
        <div className="text-center p-6 bg-white rounded-xl shadow-lg max-w-md">
          <p className="text-destructive font-medium mb-2">Erro de Conexão</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Map Placeholder */}
      <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-slate-300 rounded-full mx-auto mb-4 flex items-center justify-center">
            <div className="text-4xl">🗺️</div>
          </div>
          <p className="text-slate-600 font-medium">Mapa Placeholder</p>
          <p className="text-sm text-slate-500 mt-1">
            {schools.length} escolas • {farmers.length} agricultores
          </p>
        </div>
      </div>

      {/* Floating Sidebar */}
      <Sidebar
        schools={schools}
        selectedSchool={selectedSchool}
        onSchoolSelect={handleSchoolSelect}
        onFindProducers={handleFindProducers}
        matchResult={matchResult}
        onCloseMatch={handleCloseMatch}
        isLoadingMatch={isLoadingMatch}
      />
    </div>
  )
}

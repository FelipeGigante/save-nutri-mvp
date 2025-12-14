"use client"

import type { School, MatchResponse } from "@/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SchoolIcon, Users, MapPin, TrendingDown, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  schools: School[]
  selectedSchool: School | null
  onSchoolSelect: (school: School) => void
  onFindProducers: (schoolId: string) => void
  matchResult: MatchResponse | null
  onCloseMatch: () => void
  isLoadingMatch: boolean
}

export function Sidebar({
  schools,
  selectedSchool,
  onSchoolSelect,
  onFindProducers,
  matchResult,
  onCloseMatch,
  isLoadingMatch,
}: SidebarProps) {
  return (
    <div className="fixed left-4 top-4 bottom-4 w-96 z-10 flex flex-col gap-4">
      {/* Summary Card */}
      <Card className="p-6 bg-slate-900 border-slate-700 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <SchoolIcon className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{schools.length}</h2>
            <p className="text-sm text-slate-300">Escolas Conectadas</p>
          </div>
        </div>
      </Card>

      {/* Schools List or Match Results */}
      <Card className="flex-1 p-4 bg-white shadow-xl overflow-hidden flex flex-col">
        {matchResult ? (
          <div className="flex flex-col h-full">
            {/* Match Results Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              <div>
                <h3 className="font-semibold text-lg">Produtores Próximos</h3>
                <p className="text-sm text-muted-foreground">{matchResult.school.properties.name}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onCloseMatch} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Savings Summary */}
            <div className="mb-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-700">
                <TrendingDown className="w-5 h-5" />
                <div>
                  <p className="text-xs font-medium">Economia Estimada</p>
                  <p className="text-xl font-bold">R$ {matchResult.total_savings.toLocaleString("pt-BR")}</p>
                </div>
              </div>
            </div>

            {/* Farmers List */}
            <ScrollArea className="flex-1">
              <div className="space-y-3">
                {matchResult.matches.map((match, idx) => (
                  <div key={idx} className="p-3 rounded-lg border bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{match.farmer.properties.name}</h4>
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                        {match.distance.toFixed(1)} km
                      </span>
                    </div>
                    {match.farmer.properties.products && (
                      <p className="text-xs text-muted-foreground">{match.farmer.properties.products.join(", ")}</p>
                    )}
                    <p className="text-xs text-slate-600 mt-1">Capacidade: {match.potential_supply} kg/mês</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Schools Header */}
            <div className="mb-4 pb-4 border-b">
              <h3 className="font-semibold text-lg">Lista de Escolas</h3>
              <p className="text-sm text-muted-foreground">Selecione uma escola para encontrar produtores</p>
            </div>

            {/* Schools List */}
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {schools.map((school) => (
                  <button
                    key={school.id}
                    onClick={() => onSchoolSelect(school)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left transition-all hover:shadow-md",
                      selectedSchool?.id === school.id
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 bg-white hover:border-slate-300",
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm line-clamp-2">{school.properties.name}</h4>
                      {selectedSchool?.id === school.id && <div className="h-2 w-2 bg-emerald-500 rounded-full mt-1" />}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {school.properties.students} alunos
                      </span>
                      {school.properties.address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {school.properties.address.split(",")[0]}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>

            {/* Find Producers Button */}
            {selectedSchool && (
              <div className="mt-4 pt-4 border-t">
                <Button
                  onClick={() => onFindProducers(selectedSchool.id)}
                  disabled={isLoadingMatch}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg"
                >
                  {isLoadingMatch ? "Buscando..." : "Encontrar Produtores"}
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}

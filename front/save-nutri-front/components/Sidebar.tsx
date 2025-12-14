import { School, ArrowRight, TrendingUp, ChevronRight, Leaf, Utensils } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

// Adicionei esses tipos aqui pra facilitar
type SidebarProps = {
  schools: any[]
  selectedSchool: any | null
  onSchoolSelect: (school: any) => void
  onFindProducers: (id: string) => void
  matchResult: any | null
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
  
  // Estado para controlar o Modal da IA (Simulado dentro da sidebar)
  const [showAiMenu, setShowAiMenu] = useState(false);

  // --- RENDERIZAÇÃO: CARDÁPIO IA (O GRAND FINALE) ---
  if (showAiMenu) {
    return (
      <Card className="w-full h-full shadow-2xl border-emerald-100 bg-white/95 backdrop-blur overflow-hidden flex flex-col">
        <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
          <div className="flex items-center gap-2">
             <Utensils className="h-5 w-5" />
             <CardTitle className="text-lg">Nutri-IA 🤖</CardTitle>
          </div>
          <CardDescription className="text-emerald-100 text-xs">
            Cardápio gerado com base na safra local.
          </CardDescription>
        </CardHeader>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <h4 className="font-bold text-emerald-800 text-sm mb-1">📅 Sugestão para Segunda-feira</h4>
                <p className="text-sm text-slate-700">
                  <strong>Prato Principal:</strong> Omelete de Forno com <span className="text-emerald-600 font-bold">Espinafre</span> e <span className="text-emerald-600 font-bold">Tomate</span>.
                </p>
                <p className="text-xs text-slate-500 mt-2 italic">
                  "Utiliza os tomates do Sítio do João que estão maduros e com ótimo preço."
                </p>
             </div>

             <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                <h4 className="font-bold text-orange-800 text-sm mb-1">📅 Sugestão para Terça-feira</h4>
                <p className="text-sm text-slate-700">
                  <strong>Prato Principal:</strong> Purê de <span className="text-orange-600 font-bold">Abóbora</span> com Carne Moída.
                </p>
                <p className="text-xs text-slate-500 mt-2 italic">
                  "A abóbora local está 40% mais barata que no mercado atacadista."
                </p>
             </div>
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => setShowAiMenu(false)}
          >
            Voltar para Logística
          </Button>
        </div>
      </Card>
    )
  }

  // --- RENDERIZAÇÃO: RESULTADO DO MATCH ---
  if (matchResult) {
    const match = matchResult.matches[0]; // Pega o primeiro match
    return (
      <Card className="w-full h-auto shadow-2xl border-emerald-200 bg-white/95 backdrop-blur animate-in slide-in-from-left-10 duration-500">
        <CardHeader className="bg-emerald-50 border-b border-emerald-100 pb-4">
          <CardTitle className="flex items-center gap-2 text-emerald-800">
            <TrendingUp className="h-5 w-5" />
            Match Encontrado!
          </CardTitle>
          <CardDescription>
            Melhor opção logística e financeira.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          
          {/* AGRICULTOR ENCONTRADO */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Produtor Parceiro</p>
            <div className="flex items-center justify-between">
               <h3 className="text-xl font-bold text-slate-800">{match.farmer_name}</h3>
               <Badge className="bg-emerald-500 hover:bg-emerald-600">DAP Ativa</Badge>
            </div>
            <p className="text-sm text-slate-500 flex items-center gap-1">
               📍 A apenas <strong>{match.distance}km</strong> da escola
            </p>
          </div>

          {/* IMPACTO FINANCEIRO */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
             <div className="flex justify-between items-end mb-1">
                <span className="text-sm text-emerald-700 font-medium">Economia Estimada</span>
                <span className="text-2xl font-bold text-emerald-600">R$ {match.savings.toFixed(2)}</span>
             </div>
             <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[70%]" />
             </div>
             <p className="text-[10px] text-emerald-600 mt-2 text-right">70% mais barato que o Ceasa</p>
          </div>

          {/* BOTÕES DE AÇÃO */}
          <div className="space-y-3 pt-2">
            <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-12 text-md shadow-lg shadow-indigo-200"
                onClick={() => setShowAiMenu(true)} // AQUI CHAMA A MÁGICA DA IA
            >
              <Utensils className="mr-2 h-4 w-4" />
              Gerar Cardápio com IA
            </Button>
            
            <Button variant="ghost" className="w-full text-slate-500" onClick={onCloseMatch}>
              Buscar outra escola
            </Button>
          </div>

        </CardContent>
      </Card>
    )
  }

  // --- RENDERIZAÇÃO: DETALHE DA ESCOLA (PRÉ-MATCH) ---
  if (selectedSchool) {
    return (
      <Card className="w-full shadow-xl border-slate-200 bg-white/95 backdrop-blur">
        <CardHeader>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-fit -ml-2 mb-2 text-slate-400 hover:text-slate-600"
            onClick={() => onSchoolSelect(null as any)}
          >
            ← Voltar para lista
          </Button>
          <CardTitle className="text-xl text-slate-800">{selectedSchool.properties.name}</CardTitle>
          <div className="flex gap-2 mt-2">
             <Badge variant="secondary" className="text-xs">
                {selectedSchool.properties.alunos} Alunos
             </Badge>
             <Badge variant="outline" className="text-xs border-orange-200 text-orange-600 bg-orange-50">
                Demanda: {selectedSchool.properties.demanda_atual || "Frutas"}
             </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500">Orçamento PNAE:</span>
              <span className="font-mono font-semibold text-slate-700">R$ {selectedSchool.properties.orcamento_mensal?.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Status:</span>
              <span className="text-red-500 font-medium flex items-center gap-1">
                 🔴 Pendente Compra
              </span>
            </div>
          </div>

          <Button 
            className="w-full bg-slate-900 hover:bg-slate-800 h-12 text-md" 
            onClick={() => onFindProducers(selectedSchool.properties.id)}
            disabled={isLoadingMatch}
          >
            {isLoadingMatch ? (
               "Calculando Logística..." 
            ) : (
               <>Encontrar Produtores <ArrowRight className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // --- RENDERIZAÇÃO: LISTA PADRÃO (INÍCIO) ---
  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-2rem)]">
      {/* HEADER DE RESUMO */}
      <Card className="bg-slate-900 text-white border-none shadow-lg shrink-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
               <School className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{schools.length}</h1>
              <p className="text-slate-400 text-xs uppercase tracking-wide">Escolas Conectadas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* LISTA DE ESCOLAS */}
      <Card className="flex-1 overflow-hidden shadow-xl bg-white/90 backdrop-blur border-slate-200 flex flex-col">
        <CardHeader className="pb-3 shrink-0">
          <CardTitle className="text-sm font-medium text-slate-500">Lista de Escolas</CardTitle>
          <p className="text-xs text-slate-400">Selecione uma escola para encontrar produtores</p>
        </CardHeader>
        <ScrollArea className="flex-1 px-4 pb-4">
          <div className="space-y-2">
            {schools.map((school) => (
              <div
                key={school.properties.id}
                onClick={() => onSchoolSelect(school)}
                className="group flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-white hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-slate-700 truncate group-hover:text-emerald-700 transition-colors">
                    {school.properties.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Leaf className="w-3 h-3" /> {school.properties.demanda_atual || "Diversos"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500" />
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  )
}
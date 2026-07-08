import { useState } from "react"
import {
  Users,
  Banknote,
  TrendingDown,
  Route,
  ClipboardList,
  HeartHandshake,
  AlertTriangle,
  Scale,
  Map as MapIcon,
  LayoutDashboard,
} from "lucide-react"
import {
  indicators,
  bairros,
  getVal,
} from "@/lib/data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, ScatterChart, RegiaoDonutChart } from "@/components/Charts"
import { ChoroplethMap } from "@/components/ChoroplethMap"
import { BentoTile } from "./BentoTile"
import { KpiCard } from "./KpiCard"
import { useRegiaoAggregation } from "@/lib/useRegiaoAggregation"

interface OverviewPanelProps {
  selectedBairro: string | null
  onSelectBairro: (name: string) => void
}

function staggered(i: number): React.CSSProperties {
  return { animationDelay: `${i * 80}ms` }
}

export function OverviewPanel({ selectedBairro, onSelectBairro }: OverviewPanelProps) {
  const [mapIndicatorKey, setMapIndicatorKey] = useState("POPULACAO")
  const mapIndicator = indicators.find((i) => i.key === mapIndicatorKey) ?? indicators[0]

  const popInd = indicators[0]
  const rendaInd = indicators.find((i) => i.key === "RENDA_ESTIMADA_2025")!

  const totalPop = bairros.reduce((s, b) => s + getVal(b, "POPULACAO"), 0)
  const avgIncome = bairros.reduce((s, b) => s + getVal(b, "RENDA_ESTIMADA_2025"), 0) / bairros.length
  const avgUnemployment = bairros.reduce((s, b) => s + getVal(b, "DESOCUPADO_PCT"), 0) / bairros.length
  const avgPaved = bairros.reduce((s, b) => s + getVal(b, "PAVIMENTADA_PCT"), 0) / bairros.length
  const totalCadUnico = bairros.reduce((s, b) => s + getVal(b, "CADUNICO"), 0)
  const totalBolsaFamilia = bairros.reduce((s, b) => s + getVal(b, "BOLSA_FAMILIA"), 0)
  const totalViolencia = bairros.reduce((s, b) => s + getVal(b, "MULHERES_VIOLENCIA"), 0)

  const regiaoPop = useRegiaoAggregation("POPULACAO")

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="animate-grid-rise" style={staggered(0)}>
        <BentoTile variant="feature" className="p-6 sm:p-8">
          <div className="flex flex-col gap-3">
            <p className="text-[11px] uppercase tracking-widest text-gold/85 font-bold">
              <LayoutDashboard size={12} className="inline -mt-0.5 mr-1" />
              Visão Geral · 74 bairros
            </p>
            <h1
              className="text-3xl sm:text-5xl font-bold leading-tight"
              style={{ fontFamily: "Outfit, Inter, sans-serif" }}
            >
              Campo Grande <span className="text-grain-gold">em números</span>
            </h1>
            <p className="text-sm text-slate-300/85 max-w-2xl leading-relaxed">
              Indicadores socioeconômicos dos 74 bairros da capital de Mato Grosso
              do Sul — renda, infraestrutura, saúde, educação e mais. Clique num
              bairro no mapa para abrir o seu perfil.
            </p>
          </div>
        </BentoTile>
      </div>

      {/* KPI strip */}
      <div
        className="animate-grid-rise grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3"
        style={staggered(1)}
      >
        <KpiCard label="População" value={totalPop} format="number" Icon={Users} note="74 bairros" />
        <KpiCard label="Renda Média" value={avgIncome} format="currency" Icon={Banknote} note="estimada 2025" />
        <KpiCard label="Desocupação" value={avgUnemployment} format="percent" Icon={TrendingDown} note="média 2022" accent="#f97316" />
        <KpiCard label="Vias Pavimentadas" value={avgPaved} format="percent" Icon={Route} note="média" accent="#10b981" />
        <KpiCard label="CadÚnico" value={totalCadUnico} format="number" Icon={ClipboardList} note="2022" accent="#0891b2" />
        <KpiCard label="Bolsa Família" value={totalBolsaFamilia} format="number" Icon={HeartHandshake} note="2022" accent="#7c3aed" />
        <KpiCard label="Viol. contra Mulheres" value={totalViolencia} format="number" Icon={AlertTriangle} note="2022" accent="#dc2626" />
      </div>

      {/* Map — clickable hero */}
      <div className="animate-grid-rise" style={staggered(2)}>
        <BentoTile
          title="Mapa dos bairros · clique para explorar"
          Icon={MapIcon}
          variant="sheen"
          bodyClassName="p-0"
          action={
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-[10px] text-slate-400 uppercase tracking-wide font-semibold">
                Indicador
              </span>
              <Select value={mapIndicatorKey} onValueChange={(v) => v && setMapIndicatorKey(v)}>
                <SelectTrigger className="h-8 text-sm w-[210px] sm:w-[320px] max-w-full border-[rgba(255,214,10,0.18)]">
                  <SelectValue>{mapIndicator.label}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {indicators.map((ind) => (
                    <SelectItem key={ind.key} value={ind.key}>
                      {ind.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
        >
          <ChoroplethMap
            indicator={mapIndicator}
            height="clamp(340px, 58vh, 520px)"
            selectable
            selectedBairro={selectedBairro}
            onBairroClick={onSelectBairro}
          />
        </BentoTile>
      </div>

      {/* Bento charts grid */}
      <div className="animate-grid-rise grid grid-cols-1 lg:grid-cols-2 gap-4" style={staggered(3)}>
        <BentoTile title="População por bairro" Icon={Users}>
          <div className="h-56 sm:h-64 md:h-72">
            <BarChart data={bairros} indicatorKey="POPULACAO" indicator={popInd} limit={15} />
          </div>
        </BentoTile>
        <BentoTile title="Renda familiar estimada" Icon={Banknote}>
          <div className="h-56 sm:h-64 md:h-72">
            <BarChart data={bairros} indicatorKey="RENDA_ESTIMADA_2025" indicator={rendaInd} limit={15} />
          </div>
        </BentoTile>
      </div>

      <div className="animate-grid-rise grid grid-cols-1 lg:grid-cols-2 gap-4" style={staggered(4)}>
        <BentoTile title="Desocupação vs Renda · clique num ponto" Icon={Scale}>
          <div className="h-56 sm:h-64 md:h-72">
            <ScatterChart
              data={bairros}
              xKey="DESOCUPADO_PCT"
              yKey="RENDA_ESTIMADA_2025"
              xLabel="Desocupação (%)"
              yLabel="Renda (R$)"
              sizeKey="POPULACAO"
              onPointClick={onSelectBairro}
            />
          </div>
        </BentoTile>
        <BentoTile
          title="Distribuição por Região Urbana"
          Icon={MapIcon}
          action={
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              {regiaoPop.ready ? `${regiaoPop.data.length} regiões` : "carregando…"}
            </span>
          }
        >
          <div className="h-56 sm:h-64 md:h-72">
            {regiaoPop.ready ? (
              <RegiaoDonutChart data={regiaoPop.data} format="number" />
            ) : (
              <div className="h-full grid place-items-center text-slate-400 text-sm">
                Carregando regiões…
              </div>
            )}
          </div>
        </BentoTile>
      </div>

      {/* Footer note — transparent callout that explains the redesign shift */}
      <p className="text-[11px] text-slate-500 max-w-2xl">
        <span className="text-gold/80 font-semibold">Notas sobre os dados:</span>{" "}
        Rankings respeitam o sentido do indicador (menor é melhor para desocupação,
        analfabetismo e moradias precárias). A "Distribuição populacional" agora
        agrupa por Região Urbana — 7 fatias — em vez de empilhar 64 bairros sob
        o rótulo "Outros".
      </p>
    </div>
  )
}
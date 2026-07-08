import { useMemo } from "react"
import {
  Users,
  Banknote,
  TrendingDown,
  Route,
  SearchCode,
  Map as MapIcon,
} from "lucide-react"
import {
  type IndicatorCategory,
  type IndicatorDef,
  categoryLabels,
  getIndicatorsByCategory,
  bairros,
  getVal,
  formatValue,
} from "@/lib/data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChoroplethMap } from "@/components/ChoroplethMap"
import { BentoTile } from "./BentoTile"
import { KpiCard } from "./KpiCard"
import type { CategoryIconMap } from "./types"

interface ComparisonPanelProps {
  selectedBairro: string
  onSelectBairro: (name: string) => void
  categoryIcons: CategoryIconMap
}

export function ComparisonPanel({
  selectedBairro,
  onSelectBairro,
  categoryIcons,
}: ComparisonPanelProps) {
  const bairro = useMemo(
    () => bairros.find((b) => b.nome === selectedBairro) ?? bairros[0],
    [selectedBairro],
  )

  const categories: IndicatorCategory[] = [
    "demografia", "economia", "habitacao", "social", "saude", "educacao", "infraestrutura",
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <BentoTile
          key={bairro.nome}
          variant="glass"
          className="flex-1 min-w-[280px] p-3 select-flash"
        >
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-10 h-10 rounded-xl bg-gold text-ink">
              <SearchCode size={18} />
            </span>
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                Perfil de bairro
              </p>
              <p
                className="text-xl font-bold text-gold leading-tight animate-pop"
                style={{ fontFamily: "Outfit" }}
              >
                {bairro.nome}
              </p>
            </div>
          </div>
        </BentoTile>
        <Select value={selectedBairro} onValueChange={(v) => v && onSelectBairro(v)}>
          <SelectTrigger className="w-full sm:w-[260px] h-10 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {bairros.map((b) => (
              <SelectItem key={b.nome} value={b.nome}>
                {b.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* key remounts the grid on bairro change so the flash replays */}
      <div key={`kpi-${bairro.nome}`} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard className="select-flash" label="População" value={getVal(bairro, "POPULACAO")} format="number" Icon={Users} />
        <KpiCard
          className="select-flash"
          label="Renda Estimada"
          value={getVal(bairro, "RENDA_ESTIMADA_2025")}
          format="currency"
          Icon={Banknote}
          note="2025"
        />
        <KpiCard
          className="select-flash"
          label="Desocupação"
          value={getVal(bairro, "DESOCUPADO_PCT")}
          format="percent"
          Icon={TrendingDown}
          accent="#f97316"
        />
        <KpiCard
          className="select-flash"
          label="Vias Pavimentadas"
          value={getVal(bairro, "PAVIMENTADA_PCT")}
          format="percent"
          Icon={Route}
          accent="#10b981"
        />
      </div>

      <BentoTile
        title="Mapa · clique noutro bairro para mudar"
        Icon={MapIcon}
        variant="sheen"
        bodyClassName="p-0"
      >
        <ChoroplethMap
          indicator={{
            key: "POPULACAO",
            label: "População",
            category: "demografia",
            format: "number",
          } satisfies IndicatorDef}
          height={420}
          selectable
          selectedBairro={selectedBairro}
          onBairroClick={onSelectBairro}
        />
      </BentoTile>

      <div key={`cats-${bairro.nome}`} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const CatIcon = categoryIcons[cat]
          return (
            <BentoTile key={cat} title={categoryLabels[cat]} Icon={CatIcon} variant="glass" className="select-flash">
              <ul className="divide-y divide-[rgba(255,214,10,0.06)] text-xs">
                {getIndicatorsByCategory(cat).map((ind) => (
                  <li
                    key={ind.key}
                    className="py-1.5 flex items-center justify-between gap-2 hover:bg-[rgba(255,214,10,0.05)] transition-colors rounded-md px-1"
                  >
                    <span className="text-slate-400 truncate">{ind.label}</span>
                    <span className="text-gold font-semibold tabular-nums shrink-0">
                      {formatValue(getVal(bairro, ind.key), ind.format)}
                    </span>
                  </li>
                ))}
              </ul>
            </BentoTile>
          )
        })}
      </div>
    </div>
  )
}
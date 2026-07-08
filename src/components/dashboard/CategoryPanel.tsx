import { useState } from "react"
import { ClipboardList, BarChart3, ListOrdered } from "lucide-react"
import {
  type IndicatorCategory,
  type IndicatorDef,
  categoryLabels,
  getIndicatorsByCategory,
  bairros,
} from "@/lib/data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, HorizontalBar } from "@/components/Charts"
import { BentoTile } from "./BentoTile"
import { RankingTable } from "./RankingTable"
import type { CategoryIconMap } from "./types"
import { cn } from "@/lib/utils"

interface CategoryPanelProps {
  category: IndicatorCategory
  categoryIcons: CategoryIconMap
}

export function CategoryPanel({ category, categoryIcons }: CategoryPanelProps) {
  const catIndicators = getIndicatorsByCategory(category)
  const [selectedKey, setSelectedKey] = useState(catIndicators[0]?.key ?? "POPULACAO")
  const activeIndicator =
    catIndicators.find((i) => i.key === selectedKey) ?? catIndicators[0]
  const [chartType, setChartType] = useState<"bar" | "horizontal">("bar")
  const CatIcon = categoryIcons[category]

  if (!activeIndicator) return null

  return (
    <div className="space-y-4">
      <BentoTile variant="sheen" className="p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="grid place-items-center w-10 h-10 rounded-xl bg-gold text-ink">
            <CatIcon size={18} />
          </span>
          <p
            className="text-lg font-bold text-gold leading-tight flex-1"
            style={{ fontFamily: "Outfit" }}
          >
            {categoryLabels[category]}
          </p>
          <Select value={selectedKey} onValueChange={(v) => v && setSelectedKey(v)}>
            <SelectTrigger className="w-full sm:w-[300px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {catIndicators.map((ind) => (
                <SelectItem key={ind.key} value={ind.key}>
                  {ind.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex rounded-xl overflow-hidden text-[11px] border border-[rgba(255,214,10,0.16)]">
            {(["bar", "horizontal"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setChartType(t)}
                className={cn(
                  "px-3 py-1.5 flex items-center gap-1.5 transition-colors",
                  chartType === t
                    ? "bg-gold text-ink font-semibold"
                    : "text-slate-300 hover:bg-[rgba(255,214,10,0.08)]",
                )}
              >
                {t === "bar" ? <BarChart3 size={13} /> : <ListOrdered size={13} />}
                {t === "bar" ? "Barras" : "Ranking"}
              </button>
            ))}
          </div>
        </div>
      </BentoTile>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BentoTile title={activeIndicator.label} Icon={CatIcon}>
          <div className="h-56 sm:h-72 md:h-80">
            {chartType === "bar" ? (
              <BarChart
                data={bairros}
                indicatorKey={activeIndicator.key}
                indicator={activeIndicator}
              />
            ) : (
              <HorizontalBar
                data={bairros}
                indicatorKey={activeIndicator.key}
                indicator={activeIndicator}
              />
            )}
          </div>
        </BentoTile>

        <BentoTile title="Ranking completo — 74 bairros" Icon={ClipboardList}>
          <div className="overflow-y-auto max-h-56 sm:max-h-72 md:max-h-80 -mx-1">
            <RankingTable indicator={activeIndicator satisfies IndicatorDef} />
          </div>
        </BentoTile>
      </div>
    </div>
  )
}
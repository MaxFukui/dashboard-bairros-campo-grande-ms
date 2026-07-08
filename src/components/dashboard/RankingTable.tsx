import { useMemo } from "react"
import { type IndicatorDef, bairros, getVal, formatValue } from "@/lib/data"
import { sortByIndicator, rankingPrefix, isWorstFirst } from "@/lib/ranking"
import { cn } from "@/lib/utils"

export function RankingTable({
  indicator,
  limit = 74,
}: {
  indicator: IndicatorDef
  limit?: number
}) {
  const sorted = useMemo(
    () => sortByIndicator(bairros, indicator, limit),
    [indicator, limit],
  )

  const max = Math.max(...bairros.map((b) => getVal(b, indicator.key)), 1)
  const label = rankingPrefix(indicator)
  const worst = isWorstFirst(indicator)

  return (
    <table className="w-full text-xs">
      <thead className="sticky top-0 z-10">
        <tr className="bg-[rgba(0,29,61,0.95)] text-slate-300 text-left backdrop-blur">
          <th className="py-2 px-2 w-7 text-right">#</th>
          <th className="py-2 px-2">Bairro</th>
          <th className="py-2 px-2 text-right">Valor</th>
          <th className="py-2 px-2 w-24">Dist.</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((b, i) => {
          const val = getVal(b, indicator.key)
          const pct = (val / max) * 100
          // Colour scale by rank position — gold for the biggest values,
          // or red when the top of the table is the worst cases.
          const ratio = i / Math.max(sorted.length - 1, 1)
          const barColor = worst
            ? ratio < 0.15 ? "#ef4444" :
              ratio < 0.40 ? "#f97316" :
              ratio < 0.70 ? "#991b1b" :
              "#003566"
            : ratio < 0.15 ? "#ffd60a" :
              ratio < 0.40 ? "#ffc300" :
              ratio < 0.70 ? "#1d4ed8" :
              "#003566"
          return (
            <tr
              key={b.nome}
              className="hover:bg-[rgba(255,214,10,0.06)] transition-colors border-b border-[rgba(255,214,10,0.04)]"
            >
              <td className="py-1.5 px-2 text-slate-500 text-right tabular-nums">{i + 1}</td>
              <td className="py-1.5 px-2 font-medium text-slate-100">{b.nome}</td>
              <td
                className={cn(
                  "py-1.5 px-2 text-right tabular-nums font-semibold",
                  worst ? "text-red-400" : "text-gold",
                )}
              >
                {formatValue(val, indicator.format)}
              </td>
              <td className="py-1.5 px-2">
                <div className="h-2 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: barColor }}
                  />
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={4} className="py-1.5 px-2 text-[10px] text-slate-500 text-right">
            Ordem: {label} primeiro
          </td>
        </tr>
      </tfoot>
    </table>
  )
}
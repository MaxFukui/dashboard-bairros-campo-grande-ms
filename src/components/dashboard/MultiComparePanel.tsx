import { Scale } from "lucide-react"
import { bairros, getVal, formatValue, indicators } from "@/lib/data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BentoTile } from "./BentoTile"
import { cn } from "@/lib/utils"

interface MultiComparePanelProps {
  selectedA: string
  selectedB: string
  onSelectA: (n: string) => void
  onSelectB: (n: string) => void
}

export function MultiComparePanel({
  selectedA,
  selectedB,
  onSelectA,
  onSelectB,
}: MultiComparePanelProps) {
  const bairro1 = bairros.find((b) => b.nome === selectedA) ?? bairros[0]
  const bairro2 = bairros.find((b) => b.nome === selectedB) ?? bairros[1]

  const diffIndicators = indicators.filter(
    (ind) => getVal(bairro1, ind.key) !== getVal(bairro2, ind.key),
  )

  return (
    <div className="space-y-4">
      <BentoTile variant="sheen" className="p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="grid place-items-center w-10 h-10 rounded-xl bg-gold text-ink">
            <Scale size={18} />
          </span>
          <p className="text-[11px] uppercase tracking-widest text-gold/80 font-bold">
            Comparação entre bairros
          </p>
          <Select value={selectedA} onValueChange={(v) => v && onSelectA(v)}>
            <SelectTrigger className="w-full sm:w-[180px] h-10 text-sm">
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
          <span className="text-sm text-slate-400 font-semibold uppercase tracking-widest">vs</span>
          <Select value={selectedB} onValueChange={(v) => v && onSelectB(v)}>
            <SelectTrigger className="w-full sm:w-[180px] h-10 text-sm">
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
      </BentoTile>

      <BentoTile title={`${bairro1.nome} × ${bairro2.nome}`} Icon={Scale} variant="glass">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-400 text-left border-b border-[rgba(255,214,10,0.10)]">
              <th className="py-2 px-4">Indicador</th>
              <th className="text-right py-2 px-4 text-gold/90">{bairro1.nome}</th>
              <th className="text-right py-2 px-4 text-gold/90">{bairro2.nome}</th>
              <th className="text-right py-2 px-4">Diferença</th>
            </tr>
          </thead>
          <tbody>
            {diffIndicators.slice(0, 35).map((ind, i) => {
              const v1 = getVal(bairro1, ind.key)
              const v2 = getVal(bairro2, ind.key)
              const diff = v1 - v2
              // When higherIsBetter===false the "good" side is reversed.
              const b1Better = ind.higherIsBetter === false ? diff < 0 : diff > 0
              return (
                <tr
                  key={ind.key}
                  className={cn(
                    "border-b border-[rgba(255,214,10,0.05)] hover:bg-[rgba(255,214,10,0.05)] transition-colors",
                    i % 2 === 0 ? "bg-white/[0.015]" : "",
                  )}
                >
                  <td className="py-1.5 px-4 text-slate-300">{ind.label}</td>
                  <td
                    className={cn(
                      "text-right py-1.5 px-4 tabular-nums font-medium",
                      b1Better ? "text-gold" : "text-slate-200",
                    )}
                  >
                    {formatValue(v1, ind.format)}
                  </td>
                  <td
                    className={cn(
                      "text-right py-1.5 px-4 tabular-nums font-medium",
                      !b1Better ? "text-gold" : "text-slate-200",
                    )}
                  >
                    {formatValue(v2, ind.format)}
                  </td>
                  <td
                    className={cn(
                      "text-right py-1.5 px-4 tabular-nums font-semibold",
                      diff > 0 ? "text-emerald-400" : diff < 0 ? "text-rose-400" : "text-slate-500",
                    )}
                  >
                    {diff > 0 ? "+" : ""}
                    {formatValue(diff, ind.format)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </BentoTile>
    </div>
  )
}
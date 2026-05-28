import {
  type IndicatorDef,
  formatValue,
  type IndicatorCategory,
  categoryLabels,
  categoryIcons,
  getIndicatorsByCategory,
  indicators,
  bairros,
  getVal,
} from "@/lib/data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useMemo } from "react"
import { BarChart, HorizontalBar, ScatterChart, PieChart } from "@/components/Charts"

type ActiveSection = "overview" | "compare" | "multi" | IndicatorCategory

function KPICard({
  label,
  value,
  format,
  icon,
  note,
}: {
  label: string
  value: number
  format: IndicatorDef["format"]
  icon?: string
  note?: string
}) {
  return (
    <div className="bg-white border border-slate-200 rounded p-3">
      <div className="flex items-start justify-between gap-1">
        <p className="text-xs text-slate-500 leading-tight">{label}</p>
        {icon && <span className="text-base leading-none shrink-0">{icon}</span>}
      </div>
      <p className="text-lg font-bold text-slate-800 mt-1 tabular-nums">{formatValue(value, format)}</p>
      {note && <p className="text-[10px] text-slate-400 mt-0.5">{note}</p>}
    </div>
  )
}

function RankingTable({ indicator, limit = 74 }: { indicator: IndicatorDef; limit?: number }) {
  const order = indicator.higherIsBetter === false ? "asc" : "desc"
  const sorted = useMemo(
    () =>
      [...bairros]
        .sort((a, b) => {
          const va = getVal(a, indicator.key)
          const vb = getVal(b, indicator.key)
          return order === "desc" ? vb - va : va - vb
        })
        .slice(0, limit),
    [indicator, limit, order]
  )
  const max = Math.max(...bairros.map((b) => getVal(b, indicator.key)), 1)

  return (
    <table className="w-full text-xs">
      <thead className="sticky top-0">
        <tr className="bg-slate-100 text-slate-600 text-left">
          <th className="py-1.5 px-2 w-7">#</th>
          <th className="py-1.5 px-2">Bairro</th>
          <th className="py-1.5 px-2 text-right">Valor</th>
          <th className="py-1.5 px-2 w-24">Dist.</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((b, i) => {
          const val = getVal(b, indicator.key)
          const pct = (val / max) * 100
          const isGood = indicator.higherIsBetter !== false
          const barColor =
            isGood
              ? pct > 66 ? "#16a34a" : pct > 33 ? "#ca8a04" : "#dc2626"
              : pct > 66 ? "#dc2626" : pct > 33 ? "#ca8a04" : "#16a34a"
          return (
            <tr key={b.nome} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
              <td className="py-1 px-2 text-slate-400 text-right tabular-nums">{i + 1}</td>
              <td className="py-1 px-2 font-medium text-slate-700">{b.nome}</td>
              <td className="py-1 px-2 text-right tabular-nums text-slate-800">{formatValue(val, indicator.format)}</td>
              <td className="py-1 px-2">
                <div className="h-3 bg-slate-200 rounded-sm overflow-hidden">
                  <div className="h-full rounded-sm" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="border-b border-slate-200 pb-2 mb-4">
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</h2>
    </div>
  )
}

function PanelBox({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-slate-200 rounded overflow-hidden ${className}`}>
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2">
        <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">{title}</p>
      </div>
      {children}
    </div>
  )
}

function OverviewPanel() {
  const totalPop = bairros.reduce((s, b) => s + getVal(b, "POPULACAO"), 0)
  const avgIncome = bairros.reduce((s, b) => s + getVal(b, "RENDA_ESTIMADA_2025"), 0) / bairros.length
  const avgUnemployment = bairros.reduce((s, b) => s + getVal(b, "DESOCUPADO_PCT"), 0) / bairros.length
  const avgPaved = bairros.reduce((s, b) => s + getVal(b, "PAVIMENTADA_PCT"), 0) / bairros.length
  const totalCadUnico = bairros.reduce((s, b) => s + getVal(b, "CADUNICO"), 0)
  const totalBolsaFamilia = bairros.reduce((s, b) => s + getVal(b, "BOLSA_FAMILIA"), 0)
  const totalViolencia = bairros.reduce((s, b) => s + getVal(b, "MULHERES_VIOLENCIA"), 0)

  const popInd = indicators[0]
  const rendaInd = indicators.find((i) => i.key === "RENDA_ESTIMADA_2025")!

  return (
    <div className="space-y-5">
      <SectionHeader title="Indicadores consolidados — 74 bairros" />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        <KPICard label="População Total" value={totalPop} format="number" icon="👥" note="74 bairros" />
        <KPICard label="Renda Média" value={avgIncome} format="currency" icon="💰" note="estimada 2025" />
        <KPICard label="Desocupação Média" value={avgUnemployment} format="percent" icon="📊" note="2022" />
        <KPICard label="Vias Pavimentadas" value={avgPaved} format="percent" icon="🛣️" note="média" />
        <KPICard label="CadÚnico" value={totalCadUnico} format="number" icon="📋" note="2022" />
        <KPICard label="Bolsa Família" value={totalBolsaFamilia} format="number" icon="🤝" note="2022" />
        <KPICard label="Viol. contra Mulheres" value={totalViolencia} format="number" icon="⚠️" note="2022" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PanelBox title="População por bairro (Top 15)">
          <div className="h-72 p-2">
            <BarChart data={bairros} indicatorKey="POPULACAO" indicator={popInd} limit={15} />
          </div>
        </PanelBox>
        <PanelBox title="Renda familiar estimada (Top 15)">
          <div className="h-72 p-2">
            <BarChart data={bairros} indicatorKey="RENDA_ESTIMADA_2025" indicator={rendaInd} limit={15} />
          </div>
        </PanelBox>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PanelBox title="Desocupação vs Renda (por bairro)">
          <div className="h-72 p-2">
            <ScatterChart
              data={bairros}
              xKey="DESOCUPADO_PCT"
              yKey="RENDA_ESTIMADA_2025"
              xLabel="Desocupação (%)"
              yLabel="Renda (R$)"
              sizeKey="POPULACAO"
            />
          </div>
        </PanelBox>
        <PanelBox title="Distribuição populacional">
          <div className="h-72 p-2">
            <PieChart data={bairros} indicatorKey="POPULACAO" limit={10} />
          </div>
        </PanelBox>
      </div>
    </div>
  )
}

function ComparisonPanel() {
  const [selectedBairro, setSelectedBairro] = useState("CARANDÁ")
  const bairro = useMemo(() => bairros.find((b) => b.nome === selectedBairro), [selectedBairro])

  if (!bairro) return null

  const categories: IndicatorCategory[] = [
    "demografia", "economia", "habitacao", "social", "saude", "educacao", "infraestrutura",
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <SectionHeader title="Perfil de bairro" />
        <Select value={selectedBairro} onValueChange={(v) => { if (v) setSelectedBairro(v) }}>
          <SelectTrigger className="w-[220px] h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {bairros.map((b) => (
              <SelectItem key={b.nome} value={b.nome}>{b.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <KPICard label="População" value={getVal(bairro, "POPULACAO")} format="number" icon="👥" />
        <KPICard label="Renda Estimada" value={getVal(bairro, "RENDA_ESTIMADA_2025")} format="currency" icon="💰" note="2025" />
        <KPICard label="Desocupação" value={getVal(bairro, "DESOCUPADO_PCT")} format="percent" icon="📊" />
        <KPICard label="Vias Pavimentadas" value={getVal(bairro, "PAVIMENTADA_PCT")} format="percent" icon="🛣️" />
      </div>

      {categories.map((cat) => {
        const catIndicators = getIndicatorsByCategory(cat)
        return (
          <PanelBox key={cat} title={`${categoryIcons[cat]}  ${categoryLabels[cat]}`}>
            <table className="w-full text-xs">
              <tbody>
                {catIndicators.map((ind, i) => (
                  <tr key={ind.key} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="py-1.5 px-4 text-slate-500">{ind.label}</td>
                    <td className="py-1.5 px-4 text-right font-semibold text-slate-800 tabular-nums">
                      {formatValue(getVal(bairro, ind.key), ind.format)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </PanelBox>
        )
      })}
    </div>
  )
}

function MultiComparePanel() {
  const [b1, setB1] = useState("CARANDÁ")
  const [b2, setB2] = useState("CENTRO OESTE")
  const bairro1 = bairros.find((b) => b.nome === b1)!
  const bairro2 = bairros.find((b) => b.nome === b2)!

  const diffIndicators = indicators
    .filter((ind) => getVal(bairro1, ind.key) !== getVal(bairro2, ind.key))
    .slice(0, 35)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <SectionHeader title="Comparação entre bairros" />
        <Select value={b1} onValueChange={(v) => { if (v) setB1(v) }}>
          <SelectTrigger className="w-[200px] h-8 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>{bairros.map((b) => <SelectItem key={b.nome} value={b.nome}>{b.nome}</SelectItem>)}</SelectContent>
        </Select>
        <span className="text-sm text-slate-400 font-semibold">vs</span>
        <Select value={b2} onValueChange={(v) => { if (v) setB2(v) }}>
          <SelectTrigger className="w-[200px] h-8 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>{bairros.map((b) => <SelectItem key={b.nome} value={b.nome}>{b.nome}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <PanelBox title={`${bairro1.nome} × ${bairro2.nome}`}>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-600 text-left">
              <th className="py-2 px-4">Indicador</th>
              <th className="text-right py-2 px-4">{bairro1.nome}</th>
              <th className="text-right py-2 px-4">{bairro2.nome}</th>
              <th className="text-right py-2 px-4">Diferença</th>
            </tr>
          </thead>
          <tbody>
            {diffIndicators.map((ind, i) => {
              const v1 = getVal(bairro1, ind.key)
              const v2 = getVal(bairro2, ind.key)
              const diff = v1 - v2
              return (
                <tr key={ind.key} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="py-1.5 px-4 text-slate-600">{ind.label}</td>
                  <td className="text-right py-1.5 px-4 tabular-nums font-medium text-slate-800">{formatValue(v1, ind.format)}</td>
                  <td className="text-right py-1.5 px-4 tabular-nums font-medium text-slate-800">{formatValue(v2, ind.format)}</td>
                  <td
                    className={`text-right py-1.5 px-4 tabular-nums font-semibold ${
                      diff > 0 ? "text-green-700" : diff < 0 ? "text-red-700" : "text-slate-400"
                    }`}
                  >
                    {diff > 0 ? "+" : ""}
                    {formatValue(diff, ind.format)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </PanelBox>
    </div>
  )
}

function CategoryPanel({ category }: { category: IndicatorCategory }) {
  const catIndicators = getIndicatorsByCategory(category)
  const [selectedKey, setSelectedKey] = useState(catIndicators[0]?.key ?? "POPULACAO")
  const activeIndicator = catIndicators.find((i) => i.key === selectedKey) ?? catIndicators[0]
  const [chartType, setChartType] = useState<"bar" | "horizontal">("bar")

  if (!activeIndicator) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <SectionHeader title={`${categoryIcons[category]}  ${categoryLabels[category]}`} />
        <Select value={selectedKey} onValueChange={(v) => { if (v) setSelectedKey(v) }}>
          <SelectTrigger className="w-[300px] h-8 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            {catIndicators.map((ind) => (
              <SelectItem key={ind.key} value={ind.key}>{ind.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex border border-slate-200 rounded overflow-hidden text-[11px]">
          {(["bar", "horizontal"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setChartType(t)}
              className={`px-3 py-1.5 transition-colors ${
                chartType === t ? "bg-[#1a2d3d] text-white" : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t === "bar" ? "Barras" : "Ranking"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PanelBox title={activeIndicator.label}>
          <div className="h-80 p-2">
            {chartType === "bar" ? (
              <BarChart data={bairros} indicatorKey={activeIndicator.key} indicator={activeIndicator} />
            ) : (
              <HorizontalBar data={bairros} indicatorKey={activeIndicator.key} indicator={activeIndicator} />
            )}
          </div>
        </PanelBox>

        <PanelBox title="Ranking completo — todos os bairros">
          <div className="overflow-y-auto max-h-80">
            <RankingTable indicator={activeIndicator} />
          </div>
        </PanelBox>
      </div>
    </div>
  )
}

function NavItem({
  label,
  icon,
  active,
  onClick,
}: {
  label: string
  icon?: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm rounded transition-colors ${
        active
          ? "bg-blue-600 text-white font-medium"
          : "text-slate-300 hover:bg-slate-700 hover:text-white"
      }`}
    >
      {icon && <span className="text-sm leading-none shrink-0">{icon}</span>}
      <span className="leading-tight truncate">{label}</span>
    </button>
  )
}

export default function Dashboard() {
  const [active, setActive] = useState<ActiveSection>("overview")

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f0f2f5" }}>
      {/* Top header */}
      <header
        className="flex items-center justify-between px-4 py-2 shrink-0 border-b"
        style={{ background: "#1a2d3d", borderColor: "#0f1e2a" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: "#2563eb" }}
          >
            CG
          </div>
          <div className="leading-tight">
            <span className="text-sm font-semibold text-white">Campo Grande — Painel de Bairros</span>
            <span className="ml-3 text-xs" style={{ color: "#94a3b8" }}>DAFO Carandá</span>
          </div>
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded tabular-nums"
          style={{ background: "#0f2030", color: "#94a3b8" }}
        >
          74 bairros
        </span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className="w-52 shrink-0 flex flex-col overflow-y-auto"
          style={{ background: "#1a2d3d" }}
        >
          <nav className="p-2 pt-3 space-y-0.5">
            <NavItem label="Visão Geral" icon="📊" active={active === "overview"} onClick={() => setActive("overview")} />
            <NavItem label="Perfil de Bairro" icon="🔍" active={active === "compare"} onClick={() => setActive("compare")} />
            <NavItem label="Comparar" icon="⚖️" active={active === "multi"} onClick={() => setActive("multi")} />
          </nav>

          <div className="mx-3 my-2 border-t" style={{ borderColor: "#2d4a5f" }} />

          <div className="px-3 mb-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>
              Por Categoria
            </p>
          </div>

          <nav className="px-2 pb-2 space-y-0.5">
            {(Object.keys(categoryLabels) as IndicatorCategory[]).map((cat) => (
              <NavItem
                key={cat}
                label={categoryLabels[cat]}
                icon={categoryIcons[cat]}
                active={active === cat}
                onClick={() => setActive(cat)}
              />
            ))}
          </nav>

          <div className="mt-auto px-3 py-3 text-[10px] leading-relaxed" style={{ color: "#475569" }}>
            Fontes: Censo IBGE 2010 · CadÚnico 2022 · MS Transparência
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-5">
          {active === "overview" && <OverviewPanel />}
          {active === "compare" && <ComparisonPanel />}
          {active === "multi" && <MultiComparePanel />}
          {(Object.keys(categoryLabels) as IndicatorCategory[]).map((cat) =>
            active === cat ? <CategoryPanel key={cat} category={cat as IndicatorCategory} /> : null
          )}
        </main>
      </div>
    </div>
  )
}

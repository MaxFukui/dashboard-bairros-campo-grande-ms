import {
  type IndicatorDef,
  formatValue,
  type IndicatorCategory,
  categoryLabels,
  getIndicatorsByCategory,
  indicators,
  bairros,
  getVal,
} from "@/lib/data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useMemo, useEffect } from "react"
import { BarChart, HorizontalBar, ScatterChart, PieChart } from "@/components/Charts"
import {
  Users,
  Banknote,
  Home,
  HeartHandshake,
  Activity,
  BookOpen,
  Construction,
  LayoutDashboard,
  SearchCode,
  Scale,
  ClipboardList,
  TrendingDown,
  Route,
  AlertTriangle,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react"

type ActiveSection = "overview" | "compare" | "multi" | IndicatorCategory

const CATEGORY_ICONS: Record<IndicatorCategory, LucideIcon> = {
  demografia: Users,
  economia: Banknote,
  habitacao: Home,
  social: HeartHandshake,
  saude: Activity,
  educacao: BookOpen,
  infraestrutura: Construction,
}

function SidebarContent({
  active,
  onNavigate,
}: {
  active: ActiveSection
  onNavigate: (section: ActiveSection) => void
}) {
  return (
    <>
      <nav className="p-2 pt-3 space-y-0.5">
        <NavItem label="Visão Geral" Icon={LayoutDashboard} active={active === "overview"} onClick={() => onNavigate("overview")} />
        <NavItem label="Perfil de Bairro" Icon={SearchCode} active={active === "compare"} onClick={() => onNavigate("compare")} />
        <NavItem label="Comparar" Icon={Scale} active={active === "multi"} onClick={() => onNavigate("multi")} />
      </nav>

      <div className="mx-3 my-2 border-t" style={{ borderColor: "#2d4a5f" }} />

      <div className="px-3 mb-1.5">
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>
          Por Categoria
        </p>
      </div>

      <nav className="px-2 pb-2 space-y-0.5">
        {(Object.keys(CATEGORY_ICONS) as IndicatorCategory[]).map((cat) => (
          <NavItem
            key={cat}
            label={categoryLabels[cat]}
            Icon={CATEGORY_ICONS[cat]}
            active={active === cat}
            onClick={() => onNavigate(cat)}
          />
        ))}
      </nav>

      <div className="mt-auto px-3 py-3 text-[10px] leading-relaxed" style={{ color: "#475569" }}>
        Fontes: Censo IBGE 2010 · CadÚnico 2022 · MS Transparência
      </div>
    </>
  )
}

function KPICard({
  label,
  value,
  format,
  Icon,
  note,
}: {
  label: string
  value: number
  format: IndicatorDef["format"]
  Icon?: LucideIcon
  note?: string
}) {
  return (
    <div className="bg-white border border-slate-200 rounded p-3">
      <div className="flex items-start justify-between gap-1">
        <p className="text-xs text-slate-500 leading-tight">{label}</p>
        {Icon && <Icon size={16} className="text-slate-400 shrink-0 mt-0.5" />}
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

function SectionHeader({ title, Icon }: { title: string; Icon?: LucideIcon }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-4">
      {Icon && <Icon size={14} className="text-slate-500 shrink-0" />}
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</h2>
    </div>
  )
}

function PanelBox({
  title,
  Icon,
  children,
  className = "",
}: {
  title: string
  Icon?: LucideIcon
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`bg-white border border-slate-200 rounded overflow-hidden ${className}`}>
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center gap-2">
        {Icon && <Icon size={13} className="text-slate-500 shrink-0" />}
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
      <SectionHeader title="Indicadores consolidados — 74 bairros" Icon={LayoutDashboard} />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        <KPICard label="População Total" value={totalPop} format="number" Icon={Users} note="74 bairros" />
        <KPICard label="Renda Média" value={avgIncome} format="currency" Icon={Banknote} note="estimada 2025" />
        <KPICard label="Desocupação Média" value={avgUnemployment} format="percent" Icon={TrendingDown} note="2022" />
        <KPICard label="Vias Pavimentadas" value={avgPaved} format="percent" Icon={Route} note="média" />
        <KPICard label="CadÚnico" value={totalCadUnico} format="number" Icon={ClipboardList} note="2022" />
        <KPICard label="Bolsa Família" value={totalBolsaFamilia} format="number" Icon={HeartHandshake} note="2022" />
        <KPICard label="Viol. contra Mulheres" value={totalViolencia} format="number" Icon={AlertTriangle} note="2022" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PanelBox title="População por bairro (Top 15)" Icon={Users}>
          <div className="h-52 sm:h-60 md:h-72 p-2">
            <BarChart data={bairros} indicatorKey="POPULACAO" indicator={popInd} limit={15} />
          </div>
        </PanelBox>
        <PanelBox title="Renda familiar estimada (Top 15)" Icon={Banknote}>
          <div className="h-52 sm:h-60 md:h-72 p-2">
            <BarChart data={bairros} indicatorKey="RENDA_ESTIMADA_2025" indicator={rendaInd} limit={15} />
          </div>
        </PanelBox>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PanelBox title="Desocupação vs Renda" Icon={Scale}>
          <div className="h-52 sm:h-60 md:h-72 p-2">
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
        <PanelBox title="Distribuição populacional" Icon={Users}>
          <div className="h-52 sm:h-60 md:h-72 p-2">
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
        <SectionHeader title="Perfil de bairro" Icon={SearchCode} />
        <Select value={selectedBairro} onValueChange={(v) => { if (v) setSelectedBairro(v) }}>
          <SelectTrigger className="w-full sm:w-[220px] h-8 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            {bairros.map((b) => (
              <SelectItem key={b.nome} value={b.nome}>{b.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <KPICard label="População" value={getVal(bairro, "POPULACAO")} format="number" Icon={Users} />
        <KPICard label="Renda Estimada" value={getVal(bairro, "RENDA_ESTIMADA_2025")} format="currency" Icon={Banknote} note="2025" />
        <KPICard label="Desocupação" value={getVal(bairro, "DESOCUPADO_PCT")} format="percent" Icon={TrendingDown} />
        <KPICard label="Vias Pavimentadas" value={getVal(bairro, "PAVIMENTADA_PCT")} format="percent" Icon={Route} />
      </div>

      {categories.map((cat) => {
        const CatIcon = CATEGORY_ICONS[cat]
        return (
          <PanelBox key={cat} title={categoryLabels[cat]} Icon={CatIcon}>
            <table className="w-full text-xs">
              <tbody>
                {getIndicatorsByCategory(cat).map((ind, i) => (
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
        <SectionHeader title="Comparação entre bairros" Icon={Scale} />
        <Select value={b1} onValueChange={(v) => { if (v) setB1(v) }}>
          <SelectTrigger className="w-full sm:w-[180px] h-8 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>{bairros.map((b) => <SelectItem key={b.nome} value={b.nome}>{b.nome}</SelectItem>)}</SelectContent>
        </Select>
        <span className="text-sm text-slate-400 font-semibold">vs</span>
        <Select value={b2} onValueChange={(v) => { if (v) setB2(v) }}>
          <SelectTrigger className="w-full sm:w-[180px] h-8 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>{bairros.map((b) => <SelectItem key={b.nome} value={b.nome}>{b.nome}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <PanelBox title={`${bairro1.nome}  ×  ${bairro2.nome}`} Icon={Scale}>
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
  const CatIcon = CATEGORY_ICONS[category]

  if (!activeIndicator) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <SectionHeader title={categoryLabels[category]} Icon={CatIcon} />
        <Select value={selectedKey} onValueChange={(v) => { if (v) setSelectedKey(v) }}>
          <SelectTrigger className="w-full sm:w-[300px] h-8 text-sm"><SelectValue /></SelectTrigger>
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
        <PanelBox title={activeIndicator.label} Icon={CatIcon}>
          <div className="h-56 sm:h-72 md:h-80 p-2">
            {chartType === "bar" ? (
              <BarChart data={bairros} indicatorKey={activeIndicator.key} indicator={activeIndicator} />
            ) : (
              <HorizontalBar data={bairros} indicatorKey={activeIndicator.key} indicator={activeIndicator} />
            )}
          </div>
        </PanelBox>

        <PanelBox title="Ranking completo — todos os bairros" Icon={ClipboardList}>
          <div className="overflow-y-auto max-h-56 sm:max-h-72 md:max-h-80">
            <RankingTable indicator={activeIndicator} />
          </div>
        </PanelBox>
      </div>
    </div>
  )
}

function NavItem({
  label,
  Icon,
  active,
  onClick,
}: {
  label: string
  Icon: LucideIcon
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-sm rounded transition-colors ${
        active
          ? "bg-blue-600 text-white font-medium"
          : "text-slate-300 hover:bg-slate-700 hover:text-white"
      }`}
    >
      <Icon size={14} className="shrink-0" />
      <span className="leading-tight truncate">{label}</span>
    </button>
  )
}

export default function Dashboard() {
  const [active, setActive] = useState<ActiveSection>("overview")
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [mobileSidebarOpen])

  const closeMobileSidebar = () => setMobileSidebarOpen(false)
  const navigate = (section: ActiveSection) => {
    setActive(section)
    setMobileSidebarOpen(false)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f0f2f5" }}>
      <header
        className="flex items-center justify-between px-3 md:px-4 py-2 shrink-0 border-b"
        style={{ background: "#1a2d3d", borderColor: "#0f1e2a" }}
      >
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden text-white hover:text-blue-300 transition-colors p-1 -ml-1"
            aria-label="Abrir menu"
          >
            <Menu size={20} />
          </button>
          <div
            className="w-6 h-6 md:w-7 md:h-7 rounded flex items-center justify-center text-[10px] md:text-[11px] font-bold text-white shrink-0"
            style={{ background: "#2563eb" }}
          >
            CG
          </div>
          <div className="leading-tight">
            <span className="text-xs md:text-sm font-semibold text-white">Campo Grande — Painel de Bairros</span>
            <span className="hidden sm:inline ml-3 text-[10px] md:text-xs" style={{ color: "#94a3b8" }}>DAFO Carandá</span>
          </div>
        </div>
        <span
          className="text-[10px] md:text-xs px-2 py-0.5 rounded tabular-nums"
          style={{ background: "#0f2030", color: "#94a3b8" }}
        >
          74 bairros
        </span>
      </header>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={closeMobileSidebar}
          />
          <aside
            className="fixed top-0 left-0 bottom-0 w-52 z-50 md:hidden flex flex-col overflow-y-auto"
            style={{ background: "#1a2d3d" }}
          >
            <div className="flex justify-end p-2">
              <button
                onClick={closeMobileSidebar}
                className="text-slate-300 hover:text-white transition-colors"
                aria-label="Fechar menu"
              >
                <X size={18} />
              </button>
            </div>
            <SidebarContent active={active} onNavigate={navigate} />
          </aside>
        </>
      )}

      <div className="flex flex-1 overflow-hidden">
        <aside
          className="hidden md:flex w-52 shrink-0 flex-col overflow-y-auto"
          style={{ background: "#1a2d3d" }}
        >
          <SidebarContent active={active} onNavigate={setActive} />
        </aside>

        <main className="flex-1 overflow-y-auto p-3 md:p-5">
          {active === "overview" && <OverviewPanel />}
          {active === "compare" && <ComparisonPanel />}
          {active === "multi" && <MultiComparePanel />}
          {(Object.keys(CATEGORY_ICONS) as IndicatorCategory[]).map((cat) =>
            active === cat ? <CategoryPanel key={cat} category={cat} /> : null
          )}
        </main>
      </div>
    </div>
  )
}

import { useState, useEffect } from "react"
import {
  Users,
  Banknote,
  Home,
  HeartHandshake,
  Activity,
  BookOpen,
  Construction,
  LayoutGrid,
  MoreHorizontal,
} from "lucide-react"
import { type IndicatorCategory, getIndicatorsByCategory } from "@/lib/data"
import { OverviewPanel } from "@/components/dashboard/OverviewPanel"
import { ComparisonPanel } from "@/components/dashboard/ComparisonPanel"
import { MultiComparePanel } from "@/components/dashboard/MultiComparePanel"
import { defaultPairState } from "@/lib/charts-helpers"
import { CategoryPanel } from "@/components/dashboard/CategoryPanel"
import {
  SidebarContent,
  MobileCategorySheet,
} from "@/components/dashboard/Sidebar"
import type { ActiveSection, CategoryIconMap } from "@/components/dashboard/types"

const CATEGORY_ICONS: CategoryIconMap = {
  demografia: Users,
  economia: Banknote,
  habitacao: Home,
  social: HeartHandshake,
  saude: Activity,
  educacao: BookOpen,
  infraestrutura: Construction,
}

const TAB_COLORS = ["#ffd60a", "#ffc300", "#003566", "#0891b2"]

const CATEGORY_COUNTS: Record<IndicatorCategory, number> = {
  demografia: getIndicatorsByCategory("demografia").length,
  economia: getIndicatorsByCategory("economia").length,
  habitacao: getIndicatorsByCategory("habitacao").length,
  social: getIndicatorsByCategory("social").length,
  saude: getIndicatorsByCategory("saude").length,
  educacao: getIndicatorsByCategory("educacao").length,
  infraestrutura: getIndicatorsByCategory("infraestrutura").length,
}

function BottomNavItem({
  label,
  Icon,
  active,
  color,
  onClick,
  badge,
}: {
  label: string
  Icon: typeof LayoutGrid
  active: boolean
  color: string
  onClick: () => void
  badge?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors"
      style={{ color: active ? color : "#94a3b8" }}
    >
      <span className={`relative inline-flex${active ? " animate-breathe" : ""}`}>
        <Icon size={20} />
        {badge && (
          <span
            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-pulse"
            style={{ background: "#ffd60a" }}
          />
        )}
      </span>
      <span className="text-[10px] leading-none font-medium">{label}</span>
    </button>
  )
}

export default function Dashboard() {
  const [active, setActive] = useState<ActiveSection>("overview")
  const [sheetOpen, setSheetOpen] = useState(false)
  const [categoryUnexplored, setCategoryUnexplored] = useState(
    () => typeof localStorage === "undefined" || !localStorage.getItem("cg_cats_explored"),
  )

  // Lifted state: clicking the map or scatter fills the comparison panel.
  const [selectedBairro, setSelectedBairro] = useState<string>("CARANDÁ")
  const [pairState, setPairState] = useState<[string, string]>(() => defaultPairState())

  const categories = Object.keys(CATEGORY_ICONS) as IndicatorCategory[]
  const isCategoryActive = categories.includes(active as IndicatorCategory)

  const activeTabIndex =
    active === "overview" ? 0 :
    active === "compare" ? 1 :
    active === "multi" ? 2 : 3

  useEffect(() => {
    document.body.style.overflow = sheetOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [sheetOpen])

  const navigate = (section: ActiveSection) => {
    setActive(section)
    setSheetOpen(false)
  }

  const openCategories = () => {
    // I want the sheet to take over the bottom of the screen; "Selecting"
    // an item inside the sheet hides it.
    setSheetOpen(true)
    if (categoryUnexplored) {
      // eslint-disable-next-line no-empty
      try { localStorage.setItem("cg_cats_explored", "1") } catch {}
      setCategoryUnexplored(false)
    }
  }

  const onSelectBairro = (name: string) => {
    setSelectedBairro(name)
    setActive("compare")
  }

  const onSelectA = (n: string) => setPairState((p) => [n, p[1]])
  const onSelectB = (n: string) => setPairState((p) => [p[0], n])

  const headerCountPill = "74 bairros · 7 regiões urbanas"

  return (
    <div className="min-h-screen flex flex-col text-foreground">
      {/* Header — slim, branded, glass */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-3 md:px-5 py-3 shrink-0 border-b border-[rgba(255,214,10,0.10)] glass">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl grid place-items-center font-bold text-ink shadow-[0_4px_18px_-4px_rgba(255,214,10,0.65)]"
            style={{ background: "linear-gradient(135deg, #ffd60a 0%, #ffc300 100%)" }}
          >
            CG
          </div>
          <div className="leading-tight">
            <div
              className="text-base sm:text-lg font-bold text-gold"
              style={{ fontFamily: "Outfit" }}
            >
              Campo Grande<span className="text-slate-300 font-normal"> · Painel de Bairros</span>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500">
              {headerCountPill}
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-2 text-[11px] px-2.5 py-1 rounded-full border border-[rgba(255,214,10,0.22)] text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          v2 · Censo 2022
        </span>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-60 shrink-0 flex-col overflow-y-auto px-1 py-3 glass">
          <SidebarContent active={active} onNavigate={setActive} categoryIcons={CATEGORY_ICONS} />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-3 md:p-6 pb-24 md:pb-8">
          {active === "overview" && (
            <OverviewPanel
              selectedBairro={selectedBairro}
              onSelectBairro={onSelectBairro}
            />
          )}
          {active === "compare" && (
            <ComparisonPanel
              selectedBairro={selectedBairro}
              onSelectBairro={setSelectedBairro}
              categoryIcons={CATEGORY_ICONS}
            />
          )}
          {active === "multi" && (
            <MultiComparePanel
              selectedA={pairState[0]}
              selectedB={pairState[1]}
              onSelectA={onSelectA}
              onSelectB={onSelectB}
            />
          )}
          {categories.map((cat) =>
            active === cat ? (
              <CategoryPanel
                key={cat}
                category={cat}
                categoryIcons={CATEGORY_ICONS}
              />
            ) : null,
          )}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden z-30 flex border-t border-[rgba(255,214,10,0.10)] glass">
        <div
          aria-hidden
          className="absolute top-0 left-0 h-[3px] rounded-b"
          style={{
            width: "25%",
            background: TAB_COLORS[activeTabIndex],
            transform: `translateX(${activeTabIndex * 100}%)`,
            transition: "transform 240ms cubic-bezier(.4,0,.2,1), background 240ms ease",
          }}
        />
        <BottomNavItem label="Visão Geral" Icon={LayoutGrid} active={active === "overview"} color={TAB_COLORS[0]} onClick={() => navigate("overview")} />
        <BottomNavItem label="Perfil" Icon={LayoutGrid} active={active === "compare"} color={TAB_COLORS[1]} onClick={() => navigate("compare")} />
        <BottomNavItem label="Comparar" Icon={LayoutGrid} active={active === "multi"} color={TAB_COLORS[2]} onClick={() => navigate("multi")} />
        <BottomNavItem label="Categorias" Icon={MoreHorizontal} active={isCategoryActive} color={TAB_COLORS[3]} onClick={openCategories} badge={categoryUnexplored} />
      </nav>

      {/* Mobile categories sheet */}
      <MobileCategorySheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        active={active}
        onNavigate={navigate}
        categoryIcons={CATEGORY_ICONS}
        categoryCounts={CATEGORY_COUNTS}
      />
    </div>
  )
}
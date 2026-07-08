import {
  type LucideIcon,
  X,
  LayoutGrid,
  SearchCode,
  Scale,
} from "lucide-react"
import { type IndicatorCategory, categoryLabels, getIndicatorsByCategory } from "@/lib/data"
import { cn } from "@/lib/utils"
import type { ActiveSection, CategoryIconMap } from "./types"

interface NavItemProps {
  label: string
  Icon: LucideIcon
  active: boolean
  onClick: () => void
  count?: number
}

export function NavItem({ label, Icon, active, onClick, count }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm rounded-xl transition-all duration-200 group",
        active
          ? "bg-[rgba(255,214,10,0.14)] text-gold font-semibold"
          : "text-slate-300/90 hover:text-gold hover:bg-[rgba(255,214,10,0.06)]",
      )}
    >
      <span
        className={cn(
          "grid place-items-center w-8 h-8 rounded-lg shrink-0 transition-transform duration-200 group-hover:scale-110",
          active
            ? "bg-gold text-ink shadow-[0_4px_18px_-4px_rgba(255,214,10,0.65)]"
            : "bg-[rgba(255,255,255,0.05)] text-slate-300 group-hover:text-gold",
        )}
      >
        <Icon size={15} />
      </span>
      <span className="leading-tight truncate flex-1">{label}</span>
      {count != null && (
        <span
          className={cn(
            "text-[10px] px-1.5 py-0.5 rounded-md tabular-nums",
            active
              ? "bg-gold/20 text-gold"
              : "bg-white/5 text-slate-400",
          )}
        >
          {count}
        </span>
      )}
    </button>
  )
}

interface SidebarContentProps {
  active: ActiveSection
  onNavigate: (s: ActiveSection) => void
  categoryIcons: CategoryIconMap
}

export function SidebarContent({ active, onNavigate, categoryIcons }: SidebarContentProps) {
  const categories = Object.keys(categoryIcons) as IndicatorCategory[]
  return (
    <>
      <div className="px-3 pt-4 pb-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Painel
        </p>
      </div>
      <nav className="px-2 space-y-1">
        <NavItem label="Visão Geral" Icon={LayoutGrid} active={active === "overview"} onClick={() => onNavigate("overview")} />
        <NavItem label="Perfil de Bairro" Icon={SearchCode} active={active === "compare"} onClick={() => onNavigate("compare")} />
        <NavItem label="Comparar" Icon={Scale} active={active === "multi"} onClick={() => onNavigate("multi")} />
      </nav>

      <div className="mx-3 my-3 border-t border-[rgba(255,214,10,0.10)]" />

      <div className="px-3 pb-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Por Categoria
        </p>
      </div>

      <nav className="px-2 pb-3 space-y-1">
        {categories.map((cat) => (
          <NavItem
            key={cat}
            label={categoryLabels[cat]}
            Icon={categoryIcons[cat]}
            active={active === cat}
            onClick={() => onNavigate(cat)}
            count={getIndicatorsByCategory(cat).length}
          />
        ))}
      </nav>

      <div className="mt-auto px-3 py-3 text-[10px] leading-relaxed text-slate-500">
        Fontes: Censo IBGE 2022 · CadÚnico 2022 · MS Transparência
      </div>
    </>
  )
}

interface MobileSheetProps {
  open: boolean
  onClose: () => void
  active: ActiveSection
  onNavigate: (s: ActiveSection) => void
  categoryIcons: CategoryIconMap
  categoryCounts: Record<IndicatorCategory, number>
}

/** Mobile categories sheet — sized larger so discovery is easy. */
export function MobileCategorySheet({
  open,
  onClose,
  active,
  onNavigate,
  categoryIcons,
  categoryCounts,
}: MobileSheetProps) {
  if (!open) return null
  const categories = Object.keys(categoryIcons) as IndicatorCategory[]

  return (
    <>
      <button
        aria-label="Fechar categorias"
        onClick={onClose}
        className="fixed inset-0 z-40 md:hidden bg-ink/70 backdrop-blur-sm"
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden rounded-t-3xl overflow-hidden glass-sheen max-h-[80vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-[rgba(255,214,10,0.14)]">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500">Explorar por</p>
            <p className="text-base font-semibold text-gold" style={{ fontFamily: "Outfit" }}>
              Categoria
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid place-items-center w-9 h-9 rounded-full bg-white/5 text-slate-300 hover:text-gold hover:bg-white/10 transition-colors"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-3 pb-6 grid grid-cols-2 gap-2.5 overflow-y-auto">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat]
            const isActive = active === cat
            return (
              <button
                key={cat}
                onClick={() => onNavigate(cat)}
                className={cn(
                  "relative flex flex-col items-start gap-2 p-3 rounded-2xl text-left transition-all",
                  isActive
                    ? "bg-gold/15 border border-gold/40"
                    : "bg-[rgba(0,53,102,0.35)] border border-[rgba(255,214,10,0.10)] hover:border-gold/30",
                )}
              >
                <span
                  className={cn(
                    "grid place-items-center w-10 h-10 rounded-xl",
                    isActive ? "bg-gold text-ink" : "bg-white/5 text-gold",
                  )}
                >
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-100" style={{ fontFamily: "Outfit" }}>
                    {categoryLabels[cat]}
                  </p>
                  <p className="text-[11px] text-slate-400">{categoryCounts[cat]} indicadores</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
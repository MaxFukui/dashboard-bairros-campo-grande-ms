import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * BentoTile — the modular glass card the redesign is built around.
 *
 * Variants:
 *   - default  : solid Prussian base + subtle gold rim
 *   - glass     : liquid-glass with backdrop blur
 *   - sheen     : glass + top light streak (premium feel)
 *   - feature   : extra-large tile for hero-style modules
 */
export type BentoVariant = "default" | "glass" | "sheen" | "feature"

export interface BentoTileProps {
  title?: string
  Icon?: LucideIcon
  children: React.ReactNode
  className?: string
  bodyClassName?: string
  variant?: BentoVariant
  /** Reveal-on-scroll entrance (IntersectionObserver). Default true. */
  reveal?: boolean
  /** Action chip rendered on the right of the title (e.g. sort toggle). */
  action?: React.ReactNode
}

const variantClass: Record<BentoVariant, string> = {
  default:
    "bg-gradient-to-br from-[#001d3d]/90 to-[#000814]/95 border-[rgba(255,214,10,0.10)]",
  glass: "glass border-[rgba(255,214,10,0.12)]",
  sheen: "glass glass-sheen border-[rgba(255,214,10,0.14)]",
  feature:
    "glass glass-sheen border-[rgba(255,214,10,0.18)] shadow-[0_24px_60px_-30px_rgba(255,211,0,0.45)]",
}

export function BentoTile({
  title,
  Icon,
  children,
  className,
  bodyClassName,
  variant = "glass",
  action,
}: BentoTileProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "transition-transform duration-300 will-change-transform",
        "hover:-translate-y-0.5",
        variantClass[variant],
        className,
      )}
    >
      {title && (
        <header className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-[rgba(255,214,10,0.10)]">
          {Icon && (
            <span className="grid place-items-center w-7 h-7 rounded-md bg-[rgba(255,214,10,0.10)] text-gold shrink-0">
              <Icon size={14} />
            </span>
          )}
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gold/85 flex-1 leading-tight min-w-32">
            {title}
          </h3>
          {action && <div className="ml-auto min-w-0 max-w-full">{action}</div>}
        </header>
      )}
      <div className={cn("p-2 sm:p-3", bodyClassName)}>{children}</div>
    </section>
  )
}
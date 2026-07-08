import { type LucideIcon } from "lucide-react"
import { type IndicatorDef, formatValue } from "@/lib/data"
import { cn } from "@/lib/utils"

export interface KpiCardProps {
  label: string
  value: number
  format?: IndicatorDef["format"]
  Icon?: LucideIcon
  note?: string
  /** Accent colour for the icon chip (gold by default). */
  accent?: string
  className?: string
}

export function KpiCard({
  label,
  value,
  format = "number",
  Icon,
  note,
  accent = "#ffd60a",
  className,
}: KpiCardProps) {
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl glass p-3.5",
        "group transition-all duration-300 hover:-translate-y-0.5",
        "hover:border-[rgba(255,214,10,0.32)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] uppercase tracking-wider text-slate-300/85 font-medium leading-tight">
          {label}
        </p>
        {Icon && (
          <span
            className="grid place-items-center w-8 h-8 rounded-lg shrink-0 transition-transform duration-300 group-hover:scale-110"
            style={{ background: `${accent}1f`, color: accent }}
          >
            <Icon size={16} />
          </span>
        )}
      </div>
      <p
        className="mt-2 text-2xl font-bold tabular-nums leading-tight"
        style={{ fontFamily: "Outfit, Inter, sans-serif" }}
      >
        {formatValue(value, format)}
      </p>
      {note && <p className="mt-1 text-[10px] text-slate-400/85">{note}</p>}
      {/* Hover shimmer line */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-px h-px opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        }}
      />
    </article>
  )
}
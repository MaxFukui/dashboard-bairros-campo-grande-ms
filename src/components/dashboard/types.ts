import { type LucideIcon } from "lucide-react"
import type { IndicatorCategory } from "@/lib/data"

export type ActiveSection = "overview" | "compare" | "multi" | IndicatorCategory

/** Shared icon map for indicator categories — sourced once in the shell. */
export type CategoryIconMap = Record<IndicatorCategory, LucideIcon>
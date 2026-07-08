import { useEffect, useRef, useState } from "react"
import { type IndicatorDef, formatValue } from "@/lib/data"

const reduceMotion =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

/**
 * Formatted number that rolls up to its value (ease-out) on mount and
 * whenever `value` changes. Cards that remount on selection (the
 * key={bairro} flash pattern) therefore count up in sync with the flash.
 */
export function AnimatedNumber({
  value,
  format,
  duration = 900,
}: {
  value: number
  format?: IndicatorDef["format"]
  duration?: number
}) {
  const [display, setDisplay] = useState(() => (reduceMotion ? value : 0))
  const displayRef = useRef(display)
  displayRef.current = display

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value)
      return
    }
    const from = displayRef.current
    if (from === value) return
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(from + (value - from) * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  // Integer formats must not show float noise mid-tween.
  const shown = format === "percent" || format === "km" ? display : Math.round(display)
  return <>{formatValue(shown, format)}</>
}

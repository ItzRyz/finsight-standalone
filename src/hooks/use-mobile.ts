import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    // fallback for Safari <14
    if (mql.addEventListener) mql.addEventListener("change", onChange)
    else mql.addListener(onChange as unknown as EventListener)
    onChange()
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange)
      else mql.removeListener(onChange as unknown as EventListener)
    }
  }, [])

  return !!isMobile
}

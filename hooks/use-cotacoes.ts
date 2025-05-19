import * as React from "react"

const COTACOES_BREAKPOINT = 768

export function useIsCotacoes() {
  const [isCotacoes, setIsCotacoes] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${COTACOES_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsCotacoes(window.innerWidth < COTACOES_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsCotacoes(window.innerWidth < COTACOES_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isCotacoes
}

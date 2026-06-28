import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

/**
 * Anunciador global para lectores de pantalla (WCAG 4.1.3 Status Messages).
 *
 * Monta dos regiones `aria-live` visualmente ocultas — una "polite" (no
 * interrumpe) y una "assertive" (interrumpe) — y expone `announce()` para que
 * cualquier parte de la app empuje mensajes que NVDA/VoiceOver leerán sin que
 * el foco se mueva. Se alterna entre dos celdas internas para garantizar que
 * incluso un mensaje repetido vuelva a anunciarse.
 */

type Politeness = 'polite' | 'assertive'

interface AnnouncerApi {
  announce: (message: string, politeness?: Politeness) => void
}

const AnnouncerContext = createContext<AnnouncerApi | null>(null)

export function LiveAnnouncerProvider({ children }: { children: ReactNode }) {
  const [politeA, setPoliteA] = useState('')
  const [politeB, setPoliteB] = useState('')
  const [assertiveA, setAssertiveA] = useState('')
  const [assertiveB, setAssertiveB] = useState('')
  const toggle = useRef({ polite: false, assertive: false })

  const announce = useCallback((message: string, politeness: Politeness = 'polite') => {
    const text = message.trim()
    if (!text) return
    if (politeness === 'assertive') {
      toggle.current.assertive = !toggle.current.assertive
      if (toggle.current.assertive) {
        setAssertiveA(text)
        setAssertiveB('')
      } else {
        setAssertiveB(text)
        setAssertiveA('')
      }
    } else {
      toggle.current.polite = !toggle.current.polite
      if (toggle.current.polite) {
        setPoliteA(text)
        setPoliteB('')
      } else {
        setPoliteB(text)
        setPoliteA('')
      }
    }
  }, [])

  const api = useMemo<AnnouncerApi>(() => ({ announce }), [announce])

  return (
    <AnnouncerContext.Provider value={api}>
      {children}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {politeA}
      </div>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {politeB}
      </div>
      <div className="sr-only" aria-live="assertive" aria-atomic="true" role="alert">
        {assertiveA}
      </div>
      <div className="sr-only" aria-live="assertive" aria-atomic="true" role="alert">
        {assertiveB}
      </div>
    </AnnouncerContext.Provider>
  )
}

/**
 * Devuelve `announce()`. Si no hay provider montado, es un no-op seguro para
 * no romper componentes renderizados en aislamiento (p. ej. pruebas).
 */
// eslint-disable-next-line react-refresh/only-export-components -- el hook acompaña al provider
export function useAnnounce(): (message: string, politeness?: Politeness) => void {
  const ctx = useContext(AnnouncerContext)
  return ctx?.announce ?? (() => {})
}

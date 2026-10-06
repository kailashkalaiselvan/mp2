import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { fetchCatalog, hasApiKey } from '../api/tmdb'
import { MOCK_CATALOG } from '../data/mock'
import type { Catalog } from '../types'
import { MoviesContext } from './moviesContext'
import type { MoviesState } from './moviesContext'

interface Loaded {
  attempt: number
  catalog: Catalog
  notice: string | null
}

const NO_KEY_NOTICE =
  'Showing sample films because no TMDB API key is set. Add VITE_TMDB_API_KEY to load live data.'
const FAILED_NOTICE =
  'TMDB could not be reached, so sample films are shown instead.'

export function MoviesProvider({ children }: { children: ReactNode }) {
  const [attempt, setAttempt] = useState(0)
  const [loaded, setLoaded] = useState<Loaded | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchCatalog()
      .then((catalog) => {
        if (!cancelled) setLoaded({ attempt, catalog, notice: null })
      })
      .catch(() => {
        if (!cancelled) {
          setLoaded({
            attempt,
            catalog: MOCK_CATALOG,
            notice: hasApiKey ? FAILED_NOTICE : NO_KEY_NOTICE,
          })
        }
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  const reload = useCallback(() => {
    setLoaded(null)
    setAttempt((n) => n + 1)
  }, [])

  const value = useMemo<MoviesState>(() => {
    const ready = loaded !== null && loaded.attempt === attempt
    return {
      status: ready ? 'ready' : 'loading',
      movies: ready ? loaded.catalog.movies : [],
      genres: ready ? loaded.catalog.genres : [],
      notice: ready ? loaded.notice : null,
      reload,
    }
  }, [loaded, attempt, reload])

  return <MoviesContext.Provider value={value}>{children}</MoviesContext.Provider>
}

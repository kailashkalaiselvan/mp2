import { createContext, useContext } from 'react'
import type { Genre, Movie } from '../types'

export interface MoviesState {
  status: 'loading' | 'ready'
  movies: Movie[]
  genres: Genre[]
  /** Set when sample data is shown instead of live TMDB data. */
  notice: string | null
  /** Re-attempts the live TMDB request. */
  reload: () => void
}

export const MoviesContext = createContext<MoviesState | null>(null)

export function useMovies(): MoviesState {
  const value = useContext(MoviesContext)
  if (!value) throw new Error('useMovies must be used inside <MoviesProvider>')
  return value
}

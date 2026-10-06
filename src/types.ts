export interface Genre {
  id: number
  name: string
}

export interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  popularity: number
  genre_ids: number[]
}

export interface MovieDetails {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  popularity: number
  genres: Genre[]
  runtime: number | null
  tagline: string
}

export type SortKey = 'popularity' | 'title' | 'release_date' | 'vote_average'
export type SortDir = 'asc' | 'desc'
export type GenreMatch = 'any' | 'all'
export type ViewName = 'list' | 'gallery'

export interface Catalog {
  movies: Movie[]
  genres: Genre[]
}

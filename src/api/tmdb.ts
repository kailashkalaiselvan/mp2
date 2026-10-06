import axios from 'axios'
import type { Catalog, Genre, Movie, MovieDetails } from '../types'

const API_KEY = import.meta.env.VITE_TMDB_API_KEY?.trim()

/** True when a TMDB key was provided at build time. */
export const hasApiKey = Boolean(API_KEY)

export const IMAGE_BASE = 'https://image.tmdb.org/t/p'

const client = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: { api_key: API_KEY, language: 'en-US' },
  timeout: 10000,
})

// ---- Caching ---------------------------------------------------------------
// TMDB rate-limits aggressive clients, so every response is cached in memory
// and in sessionStorage for an hour. Reloading the page doesn't re-fetch.

const CACHE_TTL_MS = 60 * 60 * 1000
const CACHE_PREFIX = 'backlot:'
const memoryCache = new Map<string, { savedAt: number; value: unknown }>()

function readCache<T>(key: string): T | null {
  const now = Date.now()
  const inMemory = memoryCache.get(key)
  if (inMemory && now - inMemory.savedAt < CACHE_TTL_MS) {
    return inMemory.value as T
  }
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { savedAt: number; value: T }
    if (now - parsed.savedAt >= CACHE_TTL_MS) return null
    memoryCache.set(key, parsed)
    return parsed.value
  } catch {
    return null
  }
}

function writeCache<T>(key: string, value: T): void {
  const entry = { savedAt: Date.now(), value }
  memoryCache.set(key, entry)
  try {
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry))
  } catch {
    // Storage may be full or unavailable; the in-memory copy is enough.
  }
}

// ---- Requests --------------------------------------------------------------

const POPULAR_PAGES = 5 // 5 pages x 20 = up to 100 movies

interface PagedResponse<T> {
  results: T[]
}

async function fetchGenres(): Promise<Genre[]> {
  const { data } = await client.get<{ genres: Genre[] }>('/genre/movie/list')
  return data.genres
}

async function fetchPopularPage(page: number): Promise<Movie[]> {
  const { data } = await client.get<PagedResponse<Movie>>('/movie/popular', {
    params: { page },
  })
  return data.results
}

/** Loads the genre list plus the first pages of popular movies. */
export async function fetchCatalog(): Promise<Catalog> {
  if (!API_KEY) {
    throw new Error('No TMDB API key configured (set VITE_TMDB_API_KEY).')
  }
  const cached = readCache<Catalog>('catalog')
  if (cached) return cached

  const pageNumbers = Array.from({ length: POPULAR_PAGES }, (_, i) => i + 1)
  const [genres, pages] = await Promise.all([
    fetchGenres(),
    Promise.all(pageNumbers.map(fetchPopularPage)),
  ])

  // Popular pages can overlap while rankings shift, so de-duplicate by id.
  const byId = new Map<number, Movie>()
  for (const movie of pages.flat()) {
    if (!byId.has(movie.id)) byId.set(movie.id, movie)
  }

  const catalog: Catalog = { movies: [...byId.values()], genres }
  writeCache('catalog', catalog)
  return catalog
}

/** Loads one movie with runtime, tagline and full genre objects. */
export async function fetchMovieDetails(id: number): Promise<MovieDetails> {
  if (!API_KEY) {
    throw new Error('No TMDB API key configured (set VITE_TMDB_API_KEY).')
  }
  const key = `movie:${id}`
  const cached = readCache<MovieDetails>(key)
  if (cached) return cached

  const { data } = await client.get<MovieDetails>(`/movie/${id}`)
  writeCache(key, data)
  return data
}

/** Builds an image URL, or null when the movie has no image. */
export function imageUrl(
  path: string | null,
  size: 'w185' | 'w342' | 'w500' | 'w780' | 'w1280',
): string | null {
  return path ? `${IMAGE_BASE}/${size}${path}` : null
}

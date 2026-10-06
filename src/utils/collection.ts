import type {
  GenreMatch,
  Movie,
  SortDir,
  SortKey,
  ViewName,
} from '../types'

export const DEFAULT_SORT: SortKey = 'popularity'
export const DEFAULT_DIR: SortDir = 'desc'

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'title', label: 'Title' },
  { value: 'release_date', label: 'Release date' },
  { value: 'vote_average', label: 'Rating' },
]

export interface ListParams {
  q: string
  sort: SortKey
  dir: SortDir
}

export interface GalleryParams {
  genres: number[]
  match: GenreMatch
}

const SORT_KEYS = SORT_OPTIONS.map((o) => o.value)

export function parseListParams(sp: URLSearchParams): ListParams {
  const sort = sp.get('sort') as SortKey | null
  const dir = sp.get('dir')
  return {
    q: sp.get('q') ?? '',
    sort: sort && SORT_KEYS.includes(sort) ? sort : DEFAULT_SORT,
    dir: dir === 'asc' || dir === 'desc' ? dir : DEFAULT_DIR,
  }
}

export function parseGalleryParams(sp: URLSearchParams): GalleryParams {
  const genres = (sp.get('genres') ?? '')
    .split(',')
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0)
  return { genres, match: sp.get('match') === 'all' ? 'all' : 'any' }
}

export function sortMovies(
  movies: Movie[],
  sort: SortKey,
  dir: SortDir,
): Movie[] {
  const factor = dir === 'asc' ? 1 : -1
  return [...movies].sort((a, b) => {
    let result: number
    switch (sort) {
      case 'title':
        result = a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
        break
      case 'release_date':
        result = a.release_date.localeCompare(b.release_date)
        break
      case 'vote_average':
        result = a.vote_average - b.vote_average
        break
      default:
        result = a.popularity - b.popularity
    }
    // Keep the order stable when two movies tie on the chosen property.
    return result !== 0 ? result * factor : a.title.localeCompare(b.title)
  })
}

/** Search-as-you-type filter plus sort, as used by the list view. */
export function applyListParams(movies: Movie[], params: ListParams): Movie[] {
  const needle = params.q.trim().toLowerCase()
  const matches = needle
    ? movies.filter((m) => m.title.toLowerCase().includes(needle))
    : movies
  return sortMovies(matches, params.sort, params.dir)
}

/** Genre filter used by the gallery view (most popular first). */
export function applyGalleryParams(
  movies: Movie[],
  params: GalleryParams,
): Movie[] {
  const { genres, match } = params
  const matches =
    genres.length === 0
      ? movies
      : movies.filter((m) =>
          match === 'all'
            ? genres.every((g) => m.genre_ids.includes(g))
            : genres.some((g) => m.genre_ids.includes(g)),
        )
  return sortMovies(matches, 'popularity', 'desc')
}

/** The ordered movie list that a detail page should cycle through. */
export function collectionFor(
  movies: Movie[],
  from: ViewName,
  sp: URLSearchParams,
): Movie[] {
  return from === 'gallery'
    ? applyGalleryParams(movies, parseGalleryParams(sp))
    : applyListParams(movies, parseListParams(sp))
}

export function parseFrom(sp: URLSearchParams): ViewName {
  return sp.get('from') === 'gallery' ? 'gallery' : 'list'
}

/** Detail URL that remembers which view (and which filters) led to it. */
export function detailLink(
  id: number,
  from: ViewName,
  viewParams: URLSearchParams,
): { pathname: string; search: string } {
  const next = new URLSearchParams(viewParams)
  next.set('from', from)
  return { pathname: `/movie/${id}`, search: `?${next.toString()}` }
}

/** Path of the list/gallery view with the filters it had before the detail. */
export function backLink(
  from: ViewName,
  sp: URLSearchParams,
): { pathname: string; search: string } {
  const next = new URLSearchParams(sp)
  next.delete('from')
  const search = next.toString()
  return {
    pathname: from === 'gallery' ? '/gallery' : '/',
    search: search ? `?${search}` : '',
  }
}

export function yearOf(date: string): string {
  return date ? date.slice(0, 4) : 'Unknown year'
}

export function formatRuntime(minutes: number | null): string | null {
  if (!minutes) return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h} h ${m} min` : `${m} min`
}

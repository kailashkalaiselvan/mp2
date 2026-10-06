import { Link, useSearchParams } from 'react-router-dom'
import CatalogGate from '../components/CatalogGate'
import Poster from '../components/Poster'
import SegmentedControl from '../components/SegmentedControl'
import { useMovies } from '../context/moviesContext'
import type { GenreMatch } from '../types'
import {
  applyGalleryParams,
  detailLink,
  parseGalleryParams,
  yearOf,
} from '../utils/collection'
import styles from './GalleryView.module.css'

export default function GalleryView() {
  const { movies, genres } = useMovies()
  const [searchParams, setSearchParams] = useSearchParams()
  const params = parseGalleryParams(searchParams)
  const results = applyGalleryParams(movies, params)

  // Only offer genres that at least one loaded film belongs to.
  const usedIds = new Set(movies.flatMap((m) => m.genre_ids))
  const genreOptions = genres.filter((g) => usedIds.has(g.id))

  const setGenres = (ids: number[]) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (ids.length === 0) next.delete('genres')
        else next.set('genres', ids.join(','))
        return next
      },
      { replace: true },
    )
  }

  const toggleGenre = (id: number) => {
    setGenres(
      params.genres.includes(id)
        ? params.genres.filter((g) => g !== id)
        : [...params.genres, id],
    )
  }

  const setMatch = (match: GenreMatch) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (match === 'any') next.delete('match')
        else next.set('match', match)
        return next
      },
      { replace: true },
    )
  }

  return (
    <section>
      <h1 className={styles.heading}>Gallery</h1>

      <CatalogGate>
        <div className={styles.filters}>
          <div role="group" aria-labelledby="genre-filter-label">
            <p id="genre-filter-label" className={styles.filterLabel}>
              Filter by genre
            </p>
            <ul className={styles.chips}>
              {genreOptions.map((genre) => {
                const selected = params.genres.includes(genre.id)
                return (
                  <li key={genre.id}>
                    <button
                      type="button"
                      className={selected ? `${styles.chip} ${styles.selected}` : styles.chip}
                      aria-pressed={selected}
                      onClick={() => toggleGenre(genre.id)}
                    >
                      {genre.name}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className={styles.actions}>
            {params.genres.length > 1 && (
              <SegmentedControl<GenreMatch>
                name="genre-match"
                legend="Show films that match"
                value={params.match}
                options={[
                  { value: 'any', label: 'Any genre' },
                  { value: 'all', label: 'All genres' },
                ]}
                onChange={setMatch}
              />
            )}
            {params.genres.length > 0 && (
              <button
                type="button"
                className={styles.clear}
                onClick={() => setGenres([])}
              >
                Clear genres
              </button>
            )}
          </div>
        </div>

        <p className={styles.count} aria-live="polite">
          {results.length === movies.length
            ? `${movies.length} films`
            : `${results.length} of ${movies.length} films`}
        </p>

        {results.length === 0 ? (
          <div className={styles.empty}>
            <p>No film belongs to every selected genre. Switch to “Any genre” or remove a genre.</p>
          </div>
        ) : (
          <ul className={styles.grid}>
            {results.map((movie) => (
              <li key={movie.id}>
                <Link
                  className={styles.mount}
                  to={detailLink(movie.id, 'gallery', searchParams)}
                >
                  <Poster
                    title={movie.title}
                    path={movie.poster_path}
                    size="w342"
                  />
                  <span className={styles.caption}>
                    <span className={styles.name}>{movie.title}</span>
                    <span className={styles.year}>
                      {yearOf(movie.release_date)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CatalogGate>
    </section>
  )
}

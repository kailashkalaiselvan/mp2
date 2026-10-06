import { Link, useSearchParams } from 'react-router-dom'
import CatalogGate from '../components/CatalogGate'
import Poster from '../components/Poster'
import SegmentedControl from '../components/SegmentedControl'
import { useMovies } from '../context/moviesContext'
import type { SortDir, SortKey } from '../types'
import {
  DEFAULT_DIR,
  DEFAULT_SORT,
  SORT_OPTIONS,
  applyListParams,
  detailLink,
  parseListParams,
  yearOf,
} from '../utils/collection'
import styles from './ListView.module.css'

export default function ListView() {
  const { movies, genres } = useMovies()
  const [searchParams, setSearchParams] = useSearchParams()
  const params = parseListParams(searchParams)
  const results = applyListParams(movies, params)
  const genreName = new Map(genres.map((g) => [g.id, g.name]))

  // Keeps the URL in sync so a search can be shared or returned to.
  const update = (key: string, value: string, fallback: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value === fallback) next.delete(key)
        else next.set(key, value)
        return next
      },
      { replace: true },
    )
  }

  return (
    <section>
      <h1 className={styles.heading}>Search films</h1>

      <form
        className={styles.toolbar}
        role="search"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className={styles.search}>
          <label className={styles.label} htmlFor="film-search">
            Title
          </label>
          <input
            id="film-search"
            className={styles.input}
            type="search"
            placeholder="Start typing a title"
            autoComplete="off"
            value={params.q}
            onChange={(e) => update('q', e.target.value, '')}
          />
        </div>

        <div className={styles.sort}>
          <label className={styles.label} htmlFor="film-sort">
            Sort by
          </label>
          <select
            id="film-sort"
            className={styles.select}
            value={params.sort}
            onChange={(e) =>
              update('sort', e.target.value as SortKey, DEFAULT_SORT)
            }
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <SegmentedControl<SortDir>
          name="sort-direction"
          legend="Order"
          value={params.dir}
          options={[
            { value: 'asc', label: 'Ascending' },
            { value: 'desc', label: 'Descending' },
          ]}
          onChange={(value) => update('dir', value, DEFAULT_DIR)}
        />
      </form>

      <CatalogGate>
        <p className={styles.count} aria-live="polite">
          {results.length === movies.length
            ? `${movies.length} films`
            : `${results.length} of ${movies.length} films`}
        </p>

        {results.length === 0 ? (
          <div className={styles.empty}>
            <p>No films match “{params.q.trim()}”. Check the spelling or clear the search.</p>
            <button
              type="button"
              className={styles.clear}
              onClick={() => update('q', '', '')}
            >
              Clear search
            </button>
          </div>
        ) : (
          <ul className={styles.results}>
            {results.map((movie) => {
              const names = movie.genre_ids
                .map((id) => genreName.get(id))
                .filter(Boolean)
                .slice(0, 3)
                .join(', ')
              return (
                <li key={movie.id}>
                  <Link
                    className={styles.row}
                    to={detailLink(movie.id, 'list', searchParams)}
                  >
                    <div className={styles.thumb}>
                      <Poster
                        title={movie.title}
                        path={movie.poster_path}
                        size="w185"
                        decorative
                      />
                    </div>
                    <div className={styles.info}>
                      <h2 className={styles.title}>{movie.title}</h2>
                      <p className={styles.meta}>
                        <span className={styles.year}>
                          {yearOf(movie.release_date)}
                        </span>
                        {names && <span>{names}</span>}
                      </p>
                      <p className={styles.overview}>{movie.overview}</p>
                    </div>
                    <div className={styles.rating}>
                      <span className={styles.score}>
                        {movie.vote_average.toFixed(1)}
                      </span>
                      <span className={styles.votes}>
                        {movie.vote_count.toLocaleString()} votes
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </CatalogGate>
    </section>
  )
}

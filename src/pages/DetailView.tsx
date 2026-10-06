import { useEffect, useState } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { fetchMovieDetails, imageUrl } from '../api/tmdb'
import CatalogGate from '../components/CatalogGate'
import Poster from '../components/Poster'
import { useMovies } from '../context/moviesContext'
import type { MovieDetails } from '../types'
import {
  backLink,
  collectionFor,
  formatRuntime,
  parseFrom,
  yearOf,
} from '../utils/collection'
import styles from './DetailView.module.css'

interface FetchResult {
  id: number
  data: MovieDetails | null
}

export default function DetailView() {
  const { movies, genres } = useMovies()
  const { id: idParam } = useParams()
  const { search } = useLocation()
  const [searchParams] = useSearchParams()
  const id = Number(idParam)

  const [fetched, setFetched] = useState<FetchResult | null>(null)

  // Fetch the full record (runtime, tagline) for this movie.
  useEffect(() => {
    if (!Number.isInteger(id)) return
    let cancelled = false
    fetchMovieDetails(id)
      .then((data) => {
        if (!cancelled) setFetched({ id, data })
      })
      .catch(() => {
        if (!cancelled) setFetched({ id, data: null })
      })
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  // Which list the user came from decides what "previous" and "next" mean.
  const from = parseFrom(searchParams)
  const collection = collectionFor(movies, from, searchParams)
  const index = collection.findIndex((m) => m.id === id)
  const canCycle = index !== -1 && collection.length > 1
  const prev = canCycle
    ? collection[(index - 1 + collection.length) % collection.length]
    : null
  const next = canCycle ? collection[(index + 1) % collection.length] : null

  const prevPath = prev && { pathname: `/movie/${prev.id}`, search }
  const nextPath = next && { pathname: `/movie/${next.id}`, search }

  // Left and right arrow keys move through the list as well.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) return
      if (e.altKey || e.ctrlKey || e.metaKey) return
      const link =
        e.key === 'ArrowLeft'
          ? document.getElementById('prev-film')
          : e.key === 'ArrowRight'
            ? document.getElementById('next-film')
            : null
      link?.click()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const base = movies.find((m) => m.id === id)
  const result = fetched?.id === id ? fetched : null
  const genreName = new Map(genres.map((g) => [g.id, g.name]))

  // Show what the list already knows right away; upgrade when the fetch lands.
  const info: MovieDetails | null =
    result?.data ??
    (base
      ? {
          ...base,
          genres: base.genre_ids.flatMap((gid) => {
            const name = genreName.get(gid)
            return name ? [{ id: gid, name }] : []
          }),
          runtime: null,
          tagline: '',
        }
      : null)

  const pageTitle = info?.title
  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} · KKALA5 MP2` : 'KKALA5 MP2'
  }, [pageTitle])

  const back = backLink(from, searchParams)
  const backLabel = from === 'gallery' ? 'Back to gallery' : 'Back to search'

  return (
    <CatalogGate>
      {info === null ? (
        result === null && Number.isInteger(id) ? (
          <p role="status">Loading film…</p>
        ) : (
          <div className={styles.missing}>
            <h1>Film not found</h1>
            <p>We couldn’t find a film with this address.</p>
            <Link className={styles.backLink} to={back}>
              {backLabel}
            </Link>
          </div>
        )
      ) : (
        <article>
          <nav className={styles.pager} aria-label="Browse films">
            <Link className={styles.backLink} to={back}>
              {backLabel}
            </Link>
            <div className={styles.cycle}>
              {canCycle && (
                <span className={styles.position}>
                  {index + 1} of {collection.length}
                </span>
              )}
              {prevPath ? (
                <Link
                  id="prev-film"
                  className={styles.step}
                  to={prevPath}
                  aria-label={`Previous film: ${prev?.title}`}
                >
                  Previous
                </Link>
              ) : (
                <span className={`${styles.step} ${styles.disabled}`} aria-disabled="true">
                  Previous
                </span>
              )}
              {nextPath ? (
                <Link
                  id="next-film"
                  className={styles.step}
                  to={nextPath}
                  aria-label={`Next film: ${next?.title}`}
                >
                  Next
                </Link>
              ) : (
                <span className={`${styles.step} ${styles.disabled}`} aria-disabled="true">
                  Next
                </span>
              )}
            </div>
          </nav>

          <div className={styles.hero}>
            {imageUrl(info.backdrop_path, 'w1280') && (
              <img
                className={styles.backdrop}
                src={imageUrl(info.backdrop_path, 'w1280') ?? undefined}
                alt=""
              />
            )}
            <div className={styles.heroInner}>
              <div className={styles.poster}>
                <Poster title={info.title} path={info.poster_path} size="w500" />
              </div>

              <div className={styles.body}>
                <h1 className={styles.title}>{info.title}</h1>
                {info.tagline && <p className={styles.tagline}>{info.tagline}</p>}

                {info.genres.length > 0 && (
                  <ul className={styles.genres}>
                    {info.genres.map((g) => (
                      <li key={g.id} className={styles.genre}>
                        {g.name}
                      </li>
                    ))}
                  </ul>
                )}

                <p className={styles.overview}>
                  {info.overview || 'No synopsis is available for this film.'}
                </p>

                <dl className={styles.facts}>
                  <div>
                    <dt>Rating</dt>
                    <dd>
                      {info.vote_average.toFixed(1)} / 10
                      <span className={styles.sub}>
                        {info.vote_count.toLocaleString()} votes
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt>Released</dt>
                    <dd>
                      {info.release_date
                        ? new Date(`${info.release_date}T00:00:00`).toLocaleDateString(
                            undefined,
                            { year: 'numeric', month: 'long', day: 'numeric' },
                          )
                        : yearOf(info.release_date)}
                    </dd>
                  </div>
                  <div>
                    <dt>Runtime</dt>
                    <dd>{formatRuntime(info.runtime) ?? 'Not listed'}</dd>
                  </div>
                  <div>
                    <dt>Popularity</dt>
                    <dd>{Math.round(info.popularity).toLocaleString()}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </article>
      )}
    </CatalogGate>
  )
}

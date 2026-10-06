import type { ReactNode } from 'react'
import { useMovies } from '../context/moviesContext'
import styles from './CatalogGate.module.css'

/** Renders its children once the movie catalog has loaded. */
export default function CatalogGate({ children }: { children: ReactNode }) {
  const { status } = useMovies()

  if (status === 'loading') {
    return (
      <p className={styles.loading} role="status">
        Loading films…
      </p>
    )
  }
  return <>{children}</>
}

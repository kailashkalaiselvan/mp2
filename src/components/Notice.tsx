import { useMovies } from '../context/moviesContext'
import styles from './Notice.module.css'

/** Banner shown when sample data stands in for the live API. */
export default function Notice() {
  const { notice, reload } = useMovies()
  if (!notice) return null

  return (
    <div className={styles.notice} role="status">
      <p className={styles.text}>{notice}</p>
      <button type="button" className={styles.retry} onClick={reload}>
        Try live data again
      </button>
    </div>
  )
}

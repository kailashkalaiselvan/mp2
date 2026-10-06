import { imageUrl } from '../api/tmdb'
import styles from './Poster.module.css'

interface PosterProps {
  title: string
  path: string | null
  size?: 'w185' | 'w342' | 'w500'
  /** Marks the image as decorative when the title is shown next to it. */
  decorative?: boolean
}

export default function Poster({
  title,
  path,
  size = 'w342',
  decorative = false,
}: PosterProps) {
  const src = imageUrl(path, size)

  if (!src) {
    return (
      <div className={styles.placeholder} aria-hidden={decorative || undefined}>
        <span className={styles.initial}>{title.charAt(0)}</span>
        <span className={styles.name}>{title}</span>
      </div>
    )
  }

  return (
    <img
      className={styles.image}
      src={src}
      alt={decorative ? '' : `Poster for ${title}`}
      loading="lazy"
    />
  )
}

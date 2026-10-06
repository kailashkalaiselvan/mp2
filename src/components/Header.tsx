import { NavLink } from 'react-router-dom'
import styles from './Header.module.css'

export default function Header() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? `${styles.link} ${styles.active}` : styles.link

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.brand}>
          KKALA5 MP2
        </NavLink>
        <nav aria-label="Main">
          <ul className={styles.nav}>
            <li>
              <NavLink to="/" end className={linkClass}>
                Search
              </NavLink>
            </li>
            <li>
              <NavLink to="/gallery" className={linkClass}>
                Gallery
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
      <div className={styles.sprockets} aria-hidden="true" />
    </header>
  )
}

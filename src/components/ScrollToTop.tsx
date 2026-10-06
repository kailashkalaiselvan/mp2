import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** React Router doesn't reset scroll position on navigation, so this does it manually. */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

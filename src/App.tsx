import { Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Notice from './components/Notice'
import ScrollToTop from './components/ScrollToTop'
import DetailView from './pages/DetailView'
import GalleryView from './pages/GalleryView'
import ListView from './pages/ListView'
import styles from './App.module.css'

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <Notice />
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<ListView />} />
          <Route path="/gallery" element={<GalleryView />} />
          <Route path="/movie/:id" element={<DetailView />} />
          <Route
            path="*"
            element={
              <section>
                <h1>Page not found</h1>
                <p>Use the Search or Gallery links above to find a film.</p>
              </section>
            }
          />
        </Routes>
      </main>
    </>
  )
}

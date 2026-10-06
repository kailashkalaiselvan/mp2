import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { MoviesProvider } from './context/MoviesProvider'

// These tests run without a TMDB key, so the app uses its sample data
// (24 films). They exercise the same code paths as live data.

window.scrollTo = () => {}

afterEach(cleanup)

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <MoviesProvider>
        <App />
      </MoviesProvider>
    </MemoryRouter>,
  )
}

function rowTitles(): string[] {
  return screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent ?? '')
}

describe('list view', () => {
  it('shows films and filters as you type', async () => {
    const user = userEvent.setup()
    renderAt('/')
    expect(await screen.findByText('24 films')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Title'), 'the ')
    expect(screen.getByText(/of 24 films/)).toBeInTheDocument()
    for (const title of rowTitles()) {
      expect(title.toLowerCase()).toContain('the ')
    }
  })

  it('shows an empty state when nothing matches', async () => {
    const user = userEvent.setup()
    renderAt('/')
    await screen.findByText('24 films')
    await user.type(screen.getByLabelText('Title'), 'zzzzzz')
    expect(screen.getByText(/No films match/)).toBeInTheDocument()
  })

  it('sorts by title ascending and descending', async () => {
    const user = userEvent.setup()
    renderAt('/')
    await screen.findByText('24 films')

    await user.selectOptions(screen.getByLabelText('Sort by'), 'title')
    await user.click(screen.getByLabelText('Ascending'))
    expect(rowTitles()[0]).toBe('Alien')

    await user.click(screen.getByLabelText('Descending'))
    expect(rowTitles()[0]).toBe('Whiplash')
  })

  it('sorts by rating and release date', async () => {
    const user = userEvent.setup()
    renderAt('/')
    await screen.findByText('24 films')

    await user.selectOptions(screen.getByLabelText('Sort by'), 'vote_average')
    expect(rowTitles()[0]).toBe('The Godfather') // 8.7, ties broken by title

    await user.selectOptions(screen.getByLabelText('Sort by'), 'release_date')
    await user.click(screen.getByLabelText('Ascending'))
    expect(rowTitles()[0]).toBe('The Godfather') // 1972
  })
})

describe('gallery view', () => {
  it('filters by one or many genres', async () => {
    const user = userEvent.setup()
    renderAt('/gallery')
    await screen.findByText('24 films')

    await user.click(screen.getByRole('button', { name: 'Animation' }))
    expect(screen.getByText('3 of 24 films')).toBeInTheDocument()

    // Any: Animation OR Music
    await user.click(screen.getByRole('button', { name: 'Music' }))
    expect(screen.getByText('5 of 24 films')).toBeInTheDocument()

    // All: Animation AND Music -> only Coco
    await user.click(screen.getByLabelText('All genres'))
    expect(screen.getByText('1 of 24 films')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear genres' }))
    expect(screen.getByText('24 films')).toBeInTheDocument()
  })
})

describe('detail view', () => {
  it('opens from the list and cycles in list order', async () => {
    const user = userEvent.setup()
    renderAt('/?sort=title&dir=asc')
    await screen.findByText('24 films')

    await user.click(screen.getByRole('link', { name: /^Alien/ }))
    expect(screen.getByRole('heading', { level: 1, name: 'Alien' })).toBeInTheDocument()
    expect(screen.getByText('1 of 24')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /^Next film/ }))
    expect(screen.getByRole('heading', { level: 1, name: 'Arrival' })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /^Previous film/ }))
    expect(screen.getByRole('heading', { level: 1, name: 'Alien' })).toBeInTheDocument()

    // Wraps around from the first film to the last.
    await user.click(screen.getByRole('link', { name: /^Previous film/ }))
    expect(screen.getByRole('heading', { level: 1, name: 'Whiplash' })).toBeInTheDocument()
  })

  it('opens from the gallery and only cycles through the filtered films', async () => {
    const user = userEvent.setup()
    renderAt('/gallery?genres=16')
    await screen.findByText('3 of 24 films')

    const grid = screen.getAllByRole('list').at(-1)!
    await user.click(within(grid).getAllByRole('link')[0])
    expect(screen.getByText('1 of 3')).toBeInTheDocument()

    const seen = new Set<string>()
    for (let i = 0; i < 3; i++) {
      seen.add(screen.getByRole('heading', { level: 1 }).textContent ?? '')
      await user.click(screen.getByRole('link', { name: /^Next film/ }))
    }
    expect(seen).toEqual(
      new Set(['Spirited Away', 'Spider-Man: Into the Spider-Verse', 'Coco']),
    )
  })

  it('works when opened directly by URL', async () => {
    renderAt('/movie/603?from=gallery&genres=878')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'The Matrix' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/ of 10$/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to gallery' })).toBeInTheDocument()
  })

  it('handles an unknown film id', async () => {
    renderAt('/movie/999999')
    expect(await screen.findByText('Film not found')).toBeInTheDocument()
  })

  it('supports arrow keys', async () => {
    const user = userEvent.setup()
    renderAt('/movie/155?sort=title&dir=asc')
    await screen.findByRole('heading', { level: 1, name: 'The Dark Knight' })
    await user.keyboard('{ArrowRight}')
    expect(
      screen.getByRole('heading', { level: 1, name: 'The Godfather' }),
    ).toBeInTheDocument()
  })
})

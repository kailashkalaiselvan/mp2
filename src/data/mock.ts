import type { Catalog, Genre, Movie } from '../types'

// Sample data used when TMDB is unreachable or no API key is set.
// Ratings and popularity are approximate; posters are omitted on purpose,
// so the UI shows its text placeholder instead.

const genres: Genre[] = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
]

type Row = [
  id: number,
  title: string,
  release: string,
  rating: number,
  votes: number,
  popularity: number,
  genreIds: number[],
  overview: string,
]

const rows: Row[] = [
  [27205, 'Inception', '2010-07-15', 8.4, 36000, 92, [28, 878, 12], 'A thief who steals secrets through dreams is offered a chance to erase his past by planting an idea in a target’s mind.'],
  [155, 'The Dark Knight', '2008-07-16', 8.5, 33000, 88, [18, 28, 80, 53], 'Batman faces a chaotic criminal mastermind who pushes Gotham City to its breaking point.'],
  [157336, 'Interstellar', '2014-11-05', 8.4, 35000, 85, [12, 18, 878], 'With Earth dying, a former pilot leads a crew through a wormhole in search of a new home for humanity.'],
  [496243, 'Parasite', '2019-05-30', 8.5, 18000, 70, [35, 53, 18], 'A poor family schemes its way into the lives of a wealthy household, with consequences nobody expects.'],
  [238, 'The Godfather', '1972-03-14', 8.7, 20000, 66, [18, 80], 'The aging head of a crime dynasty hands control of his empire to his reluctant youngest son.'],
  [680, 'Pulp Fiction', '1994-09-10', 8.5, 28000, 74, [53, 80], 'Hitmen, a boxer and a gangster’s wife cross paths in interlocking tales of crime in Los Angeles.'],
  [129, 'Spirited Away', '2001-07-20', 8.5, 16000, 69, [16, 10751, 14], 'A girl trapped in a spirit world must work in a bathhouse to free her parents and herself.'],
  [244786, 'Whiplash', '2014-10-10', 8.4, 15000, 60, [18, 10402], 'A young jazz drummer is pushed to extremes by an abusive conservatory instructor.'],
  [76341, 'Mad Max: Fury Road', '2015-05-13', 7.6, 22000, 77, [28, 12, 878], 'In a desert wasteland, a rebel driver and a drifter flee a warlord across a relentless chase.'],
  [335984, 'Blade Runner 2049', '2017-10-04', 7.6, 13000, 64, [878, 18], 'A new blade runner uncovers a secret that could plunge what remains of society into chaos.'],
  [603, 'The Matrix', '1999-03-30', 8.2, 25000, 83, [28, 878], 'A hacker learns that reality is a simulation and joins a rebellion against its machine rulers.'],
  [419430, 'Get Out', '2017-02-24', 7.6, 17000, 58, [9648, 53, 27], 'A visit to his girlfriend’s family estate reveals unsettling secrets for a young photographer.'],
  [313369, 'La La Land', '2016-11-29', 7.9, 17000, 62, [35, 18, 10749, 10402], 'A jazz pianist and an aspiring actress fall in love while chasing their dreams in Los Angeles.'],
  [324857, 'Spider-Man: Into the Spider-Verse', '2018-12-06', 8.4, 14000, 72, [28, 12, 16, 878], 'Miles Morales becomes Spider-Man and teams up with counterparts from other dimensions.'],
  [354912, 'Coco', '2017-10-27', 8.2, 19000, 61, [10751, 16, 35, 14, 10402], 'A boy who dreams of being a musician crosses into the Land of the Dead to uncover his family’s story.'],
  [329865, 'Arrival', '2016-11-10', 7.6, 18000, 59, [18, 878, 9648], 'A linguist is recruited to communicate with alien visitors before tensions between nations boil over.'],
  [438631, 'Dune', '2021-09-15', 7.8, 13000, 80, [878, 12], 'A noble heir is drawn into a war over the desert planet that produces the galaxy’s most valuable resource.'],
  [545611, 'Everything Everywhere All at Once', '2022-03-24', 7.8, 8000, 68, [28, 12, 878], 'A laundromat owner is pulled into a multiverse conflict where she is the only one who can stop a threat to all realities.'],
  [872585, 'Oppenheimer', '2023-07-19', 8.1, 9000, 90, [18, 36], 'The story of the physicist who led the Manhattan Project and the cost of what it created.'],
  [346698, 'Barbie', '2023-07-19', 7.0, 8000, 78, [35, 12, 14], 'A doll in a perfect pink world is cast out after questioning her place, and heads to the real one.'],
  [278, 'The Shawshank Redemption', '1994-09-23', 8.7, 27000, 65, [18, 80], 'A banker sentenced to life in prison finds hope and friendship over decades behind bars.'],
  [13, 'Forrest Gump', '1994-06-23', 8.5, 27000, 63, [35, 18, 10749], 'A kind-hearted man with a low IQ drifts through decades of American history.'],
  [98, 'Gladiator', '2000-05-01', 8.2, 17000, 67, [28, 18, 12], 'A betrayed Roman general returns as a gladiator to take revenge on the emperor who destroyed his family.'],
  [348, 'Alien', '1979-05-25', 8.1, 15000, 57, [27, 878], 'The crew of a deep-space tug is hunted by a lethal creature after answering a distress signal.'],
]

const movies: Movie[] = rows.map(
  ([id, title, release, rating, votes, popularity, genreIds, overview]) => ({
    id,
    title,
    overview,
    poster_path: null,
    backdrop_path: null,
    release_date: release,
    vote_average: rating,
    vote_count: votes,
    popularity,
    genre_ids: genreIds,
  }),
)

export const MOCK_CATALOG: Catalog = { movies, genres }

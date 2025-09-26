import { Bench } from "tinybench";
import { render } from "@testing-library/react";
import { MovieCard } from "../../components/MovieCard";
import { WatchedCard } from "../../components/WatchedCard";
import type { Movie, TVShow } from "../../lib/tmdb";
import type { Watched } from "../../state/store";

// Mock the stores to avoid API calls
jest.mock("../../state/store", () => ({
  useWatchedStore: () => ({
    addWatched: jest.fn(),
    loading: false,
  }),
  useWatchlistStore: () => ({
    addToWatchlist: jest.fn(),
    loading: false,
  }),
}));

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock Next.js Link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const bench = new Bench({
  name: "Component Rendering Benchmarks",
  time: 1000,
});

// Sample data
const sampleMovie: Movie = {
  id: 155,
  title: "The Dark Knight",
  overview: "Batman raises the stakes in his war on crime...",
  release_date: "2008-07-18",
  poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
  backdrop_path: "/hqkIcbrOHL86UncnHIsHVcVmzue.jpg",
  vote_average: 9.0,
  vote_count: 32000,
  genre_ids: [28, 80, 18],
  adult: false,
  original_language: "en",
  original_title: "The Dark Knight",
  popularity: 100.0,
  video: false,
};

const sampleWatched: Watched = {
  id: 1,
  userId: "test-user",
  tmdbId: 155,
  type: "movie",
  watchedDate: "2024-01-01",
  rating: 9,
  notes: "Excellent movie",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

// Generate data for different sizes
const generateMovies = (count: number): (Movie | TVShow)[] =>
  Array.from({ length: count }, (_, i) => ({
    ...sampleMovie,
    id: sampleMovie.id + i,
    title: `${sampleMovie.title} ${i}`,
  }));

const generateWatched = (count: number): Watched[] =>
  Array.from({ length: count }, (_, i) => ({
    ...sampleWatched,
    id: i + 1,
    tmdbId: sampleMovie.id + i,
  }));

// Component Rendering Benchmarks
// Thresholds: < 100ms for small lists, < 500ms for large lists

bench
  .add("MovieCard - render single", () => {
    render(<MovieCard item={sampleMovie} />);
  })
  .add("MovieCard - render list (small: 5)", () => {
    const movies = generateMovies(5);
    render(
      <div>
        {movies.map((movie) => (
          <MovieCard key={movie.id} item={movie} />
        ))}
      </div>
    );
  })
  .add("MovieCard - render list (medium: 20)", () => {
    const movies = generateMovies(20);
    render(
      <div>
        {movies.map((movie) => (
          <MovieCard key={movie.id} item={movie} />
        ))}
      </div>
    );
  })
  .add("MovieCard - render list (large: 50)", () => {
    const movies = generateMovies(50);
    render(
      <div>
        {movies.map((movie) => (
          <MovieCard key={movie.id} item={movie} />
        ))}
      </div>
    );
  })
  .add("WatchedCard - render single", () => {
    render(<WatchedCard item={sampleWatched} />);
  })
  .add("WatchedCard - render list (small: 5)", () => {
    const watched = generateWatched(5);
    render(
      <div>
        {watched.map((item) => (
          <WatchedCard key={item.id} item={item} />
        ))}
      </div>
    );
  })
  .add("WatchedCard - render list (medium: 20)", () => {
    const watched = generateWatched(20);
    render(
      <div>
        {watched.map((item) => (
          <WatchedCard key={item.id} item={item} />
        ))}
      </div>
    );
  })
  .add("WatchedCard - render list (large: 50)", () => {
    const watched = generateWatched(50);
    render(
      <div>
        {watched.map((item) => (
          <WatchedCard key={item.id} item={item} />
        ))}
      </div>
    );
  });

export default bench;

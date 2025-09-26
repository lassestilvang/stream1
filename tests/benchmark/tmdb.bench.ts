import { Bench } from "tinybench";
import {
  searchMovies,
  searchTVShows,
  getMovieDetails,
  getTVShowDetails,
} from "../../lib/tmdb";

const bench = new Bench({
  name: "TMDB API Benchmarks",
  time: 1000, // 1 second warmup
});

// TMDB API Benchmarks
// Note: These benchmarks include network latency and TMDB API response times
// Thresholds: < 500ms for details, < 1000ms for searches

bench
  .add("searchMovies - popular query", async () => {
    await searchMovies("batman");
  })
  .add("searchMovies - specific query", async () => {
    await searchMovies("the dark knight 2008");
  })
  .add("searchTVShows - popular query", async () => {
    await searchTVShows("breaking bad");
  })
  .add("searchTVShows - specific query", async () => {
    await searchTVShows("stranger things season 1");
  })
  .add("getMovieDetails - popular movie", async () => {
    await getMovieDetails(155); // The Dark Knight
  })
  .add("getMovieDetails - recent movie", async () => {
    await getMovieDetails(550988); // Free Guy
  })
  .add("getTVShowDetails - popular show", async () => {
    await getTVShowDetails(1399); // Game of Thrones
  })
  .add("getTVShowDetails - recent show", async () => {
    await getTVShowDetails(84958); // Loki
  });

export default bench;

// Run benchmarks if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  bench.run().then(() => {
    console.table(bench.table());
  });
}

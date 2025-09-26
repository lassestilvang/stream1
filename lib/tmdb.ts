const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const API_KEY = process.env.TMDB_API_KEY;

if (!API_KEY) {
  throw new Error("TMDB_API_KEY environment variable is not set");
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  original_title: string;
  popularity: number;
  video: boolean;
}

export interface TVShow {
  id: number;
  name: string;
  overview: string;
  first_air_date: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  original_name: string;
  popularity: number;
  origin_country: string[];
}

export interface SearchResult<T> {
  results: T[];
  page: number;
  total_pages: number;
  total_results: number;
}

export async function searchMovies(query: string): Promise<Movie[]> {
  const url = `${TMDB_BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
    query,
  )}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `TMDB API error: ${response.status} ${response.statusText}`,
    );
  }

  const data: SearchResult<Movie> = await response.json();
  return data.results;
}

export async function searchTVShows(query: string): Promise<TVShow[]> {
  const url = `${TMDB_BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(
    query,
  )}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `TMDB API error: ${response.status} ${response.statusText}`,
    );
  }

  const data: SearchResult<TVShow> = await response.json();
  return data.results;
}

export async function getMovieDetails(id: number): Promise<Movie> {
  const url = `${TMDB_BASE_URL}/movie/${id}?api_key=${API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `TMDB API error: ${response.status} ${response.statusText}`,
    );
  }

  const data: Movie = await response.json();
  return data;
}

export async function getTVShowDetails(id: number): Promise<TVShow> {
  const url = `${TMDB_BASE_URL}/tv/${id}?api_key=${API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `TMDB API error: ${response.status} ${response.statusText}`,
    );
  }

  const data: TVShow = await response.json();
  return data;
}

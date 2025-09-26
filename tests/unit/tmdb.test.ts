import {
  searchMovies,
  searchTVShows,
  getMovieDetails,
  getTVShowDetails,
} from "../../lib/tmdb";

// Mock fetch
global.fetch = jest.fn();

describe("tmdb", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.TMDB_API_KEY = "test-api-key";
  });

  afterEach(() => {
    delete process.env.TMDB_API_KEY;
  });

  describe("searchMovies", () => {
    it("returns movies on successful API call", async () => {
      const mockResponse = {
        results: [
          {
            id: 1,
            title: "Test Movie",
            overview: "A test movie",
            release_date: "2023-01-01",
            poster_path: "/poster.jpg",
            vote_average: 8.5,
            vote_count: 100,
            genre_ids: [1],
            adult: false,
            original_language: "en",
            original_title: "Test Movie",
            popularity: 10,
            video: false,
          },
        ],
        page: 1,
        total_pages: 1,
        total_results: 1,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await searchMovies("test query");

      expect(result).toEqual(mockResponse.results);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.themoviedb.org/3/search/movie?api_key=test-api-key&query=test%20query",
      );
    });

    it("throws error on API failure", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      await expect(searchMovies("test query")).rejects.toThrow(
        "TMDB API error: 404 Not Found",
      );
    });
  });

  describe("searchTVShows", () => {
    it("returns TV shows on successful API call", async () => {
      const mockResponse = {
        results: [
          {
            id: 2,
            name: "Test TV Show",
            overview: "A test TV show",
            first_air_date: "2023-01-01",
            poster_path: "/poster.jpg",
            vote_average: 8.0,
            vote_count: 50,
            genre_ids: [2],
            adult: false,
            original_language: "en",
            original_name: "Test TV Show",
            popularity: 5,
            origin_country: ["US"],
          },
        ],
        page: 1,
        total_pages: 1,
        total_results: 1,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await searchTVShows("test query");

      expect(result).toEqual(mockResponse.results);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.themoviedb.org/3/search/tv?api_key=test-api-key&query=test%20query",
      );
    });

    it("throws error on API failure", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      await expect(searchTVShows("test query")).rejects.toThrow(
        "TMDB API error: 500 Internal Server Error",
      );
    });
  });

  describe("getMovieDetails", () => {
    it("returns movie details on successful API call", async () => {
      const mockMovie = {
        id: 1,
        title: "Test Movie",
        overview: "A test movie",
        release_date: "2023-01-01",
        poster_path: "/poster.jpg",
        vote_average: 8.5,
        vote_count: 100,
        genre_ids: [1],
        adult: false,
        original_language: "en",
        original_title: "Test Movie",
        popularity: 10,
        video: false,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockMovie),
      });

      const result = await getMovieDetails(1);

      expect(result).toEqual(mockMovie);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.themoviedb.org/3/movie/1?api_key=test-api-key",
      );
    });

    it("throws error on API failure", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      await expect(getMovieDetails(1)).rejects.toThrow(
        "TMDB API error: 404 Not Found",
      );
    });
  });

  describe("getTVShowDetails", () => {
    it("returns TV show details on successful API call", async () => {
      const mockTVShow = {
        id: 2,
        name: "Test TV Show",
        overview: "A test TV show",
        first_air_date: "2023-01-01",
        poster_path: "/poster.jpg",
        vote_average: 8.0,
        vote_count: 50,
        genre_ids: [2],
        adult: false,
        original_language: "en",
        original_name: "Test TV Show",
        popularity: 5,
        origin_country: ["US"],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockTVShow),
      });

      const result = await getTVShowDetails(2);

      expect(result).toEqual(mockTVShow);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.themoviedb.org/3/tv/2?api_key=test-api-key",
      );
    });

    it("throws error on API failure", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      await expect(getTVShowDetails(2)).rejects.toThrow(
        "TMDB API error: 500 Internal Server Error",
      );
    });
  });

  it("throws error when TMDB_API_KEY is not set", () => {
    delete process.env.TMDB_API_KEY;

    expect(() => {
      // Import the module to trigger the check
      import("../../lib/tmdb");
    }).toThrow("TMDB_API_KEY environment variable is not set");
  });
});

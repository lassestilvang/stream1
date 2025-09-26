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
        "https://api.themoviedb.org/3/search/movie?api_key=test-api-key&query=test%20query"
      );
    });

    it("throws error on API failure", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      await expect(searchMovies("test query")).rejects.toThrow(
        "TMDB API error: 404 Not Found"
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
        "https://api.themoviedb.org/3/search/tv?api_key=test-api-key&query=test%20query"
      );
    });

    it("throws error on API failure", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      await expect(searchTVShows("test query")).rejects.toThrow(
        "TMDB API error: 500 Internal Server Error"
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
        "https://api.themoviedb.org/3/movie/1?api_key=test-api-key"
      );
    });

    it("throws error on API failure", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      await expect(getMovieDetails(1)).rejects.toThrow(
        "TMDB API error: 404 Not Found"
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
        "https://api.themoviedb.org/3/tv/2?api_key=test-api-key"
      );
    });

    it("throws error on API failure", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      await expect(getTVShowDetails(2)).rejects.toThrow(
        "TMDB API error: 500 Internal Server Error"
      );
    });
  });

  it("throws error when TMDB_API_KEY is not set", async () => {
    // Temporarily remove the API key
    const originalKey = process.env.TMDB_API_KEY;
    delete process.env.TMDB_API_KEY;

    // Try to call a function which should trigger the check
    await expect(searchMovies("test")).rejects.toThrow(
      "TMDB_API_KEY environment variable is not set"
    );

    // Restore the API key
    process.env.TMDB_API_KEY = originalKey;
  });

  // Edge case: Network failure during searchMovies
  it("searchMovies handles network failure", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error")
    );

    await expect(searchMovies("test")).rejects.toThrow("Network error");
  });

  // Edge case: Rate limiting (429)
  it("searchMovies handles rate limiting", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: "Too Many Requests",
    });

    await expect(searchMovies("test")).rejects.toThrow(
      "TMDB API error: 429 Too Many Requests"
    );
  });

  // Edge case: Malformed JSON response
  it("searchMovies handles malformed JSON response", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.reject(new SyntaxError("Unexpected token")),
    });

    await expect(searchMovies("test")).rejects.toThrow();
  });

  // Edge case: Empty query
  it("searchMovies handles empty query", async () => {
    const mockResponse = {
      results: [],
      page: 1,
      total_pages: 0,
      total_results: 0,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const result = await searchMovies("");
    expect(result).toEqual([]);
  });

  // Edge case: Query with special characters
  it("searchMovies handles special characters in query", async () => {
    const mockResponse = {
      results: [],
      page: 1,
      total_pages: 0,
      total_results: 0,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    await searchMovies("test & query < > \" '");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.themoviedb.org/3/search/movie?api_key=test-api-key&query=test%20%26%20query%20%3C%20%3E%20%22%20'"
    );
  });

  // Edge case: Large response data
  it("searchMovies handles large response data", async () => {
    const largeResults = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      title: `Movie ${i}`,
      overview: `Overview ${i}`.repeat(10), // Large overview
      release_date: "2023-01-01",
      poster_path: "/poster.jpg",
      vote_average: 8.5,
      vote_count: 100,
      genre_ids: [1],
      adult: false,
      original_language: "en",
      original_title: `Original Movie ${i}`,
      popularity: 10,
      video: false,
    }));

    const mockResponse = {
      results: largeResults,
      page: 1,
      total_pages: 1,
      total_results: 1000,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const result = await searchMovies("large query");
    expect(result).toHaveLength(1000);
  });

  // Edge case: Invalid API key
  it("searchMovies handles invalid API key", async () => {
    process.env.TMDB_API_KEY = "invalid-key";

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
    });

    await expect(searchMovies("test")).rejects.toThrow(
      "TMDB API error: 401 Unauthorized"
    );
  });

  // Edge case: Timeout
  it("searchMovies handles timeout", async () => {
    jest.setTimeout(10000);
    (global.fetch as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 5000)
        )
    );

    await expect(searchMovies("test")).rejects.toThrow("Timeout");
  });

  // Edge case: Boundary ID values for getMovieDetails
  it("getMovieDetails handles negative ID", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: "Bad Request",
    });

    await expect(getMovieDetails(-1)).rejects.toThrow(
      "TMDB API error: 400 Bad Request"
    );
  });

  // Edge case: Very large ID
  it("getMovieDetails handles very large ID", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });

    await expect(getMovieDetails(999999999)).rejects.toThrow(
      "TMDB API error: 404 Not Found"
    );
  });

  // Edge case: Non-integer ID
  it("getMovieDetails handles non-integer ID", async () => {
    // This would be caught by TypeScript, but testing runtime behavior
    await expect(getMovieDetails(1.5 as number)).rejects.toThrow();
  });

  // Similar edge cases for TV shows
  it("searchTVShows handles network failure", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error")
    );

    await expect(searchTVShows("test")).rejects.toThrow("Network error");
  });

  it("getTVShowDetails handles boundary conditions", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });

    await expect(getTVShowDetails(0)).rejects.toThrow(
      "TMDB API error: 404 Not Found"
    );
  });
});

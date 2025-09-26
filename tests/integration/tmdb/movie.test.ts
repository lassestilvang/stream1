import { createMocks } from "node-mocks-http";
import { GET } from "../../../app/api/tmdb/movie/[id]/route";

jest.mock("../../../lib/tmdb", () => ({
  getMovieDetails: jest.fn(),
}));

import { getMovieDetails } from "../../../lib/tmdb";

const mockGetMovieDetails = getMovieDetails as jest.MockedFunction<
  typeof getMovieDetails
>;

describe("/api/tmdb/movie/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("should return movie details successfully", async () => {
      const mockMovie = {
        id: 123,
        title: "Test Movie",
        overview: "A test movie",
        release_date: "2023-01-01",
        poster_path: undefined,
        backdrop_path: undefined,
        vote_average: 8.5,
        vote_count: 100,
        genre_ids: [1, 2],
        adult: false,
        original_language: "en",
        original_title: "Test Movie",
        popularity: 10.0,
        video: false,
      };

      mockGetMovieDetails.mockResolvedValue(mockMovie);

      const { req } = createMocks({
        method: "GET",
      });

      // Mock params
      const params = Promise.resolve({ id: "123" });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual(mockMovie);
      expect(mockGetMovieDetails).toHaveBeenCalledWith(123);
    });

    it("should return 400 for invalid movie ID", async () => {
      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: "invalid" });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: "Invalid movie ID" });
      expect(mockGetMovieDetails).not.toHaveBeenCalled();
    });

    it("should return 500 on TMDB API error", async () => {
      mockGetMovieDetails.mockRejectedValue(new Error("TMDB API error"));

      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: "123" });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result).toEqual({ error: "Failed to fetch movie details" });
      expect(mockGetMovieDetails).toHaveBeenCalledWith(123);
    });

    // Edge case: Very large movie ID
    it("should handle very large movie ID", async () => {
      const largeId = 999999999999;
      const mockMovie = {
        id: largeId,
        title: "Test Movie",
        overview: "A test movie",
        release_date: "2023-01-01",
        poster_path: undefined,
        backdrop_path: undefined,
        vote_average: 8.5,
        vote_count: 100,
        genre_ids: [1, 2],
        adult: false,
        original_language: "en",
        original_title: "Test Movie",
        popularity: 10,
        video: false,
      };

      mockGetMovieDetails.mockResolvedValue(mockMovie as any);

      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: largeId.toString() });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual(mockMovie);
      expect(mockGetMovieDetails).toHaveBeenCalledWith(largeId);
    });

    // Edge case: Negative movie ID
    it("should return 400 for negative movie ID", async () => {
      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: "-123" });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: "Invalid movie ID" });
      expect(mockGetMovieDetails).not.toHaveBeenCalled();
    });

    // Edge case: Zero movie ID
    it("should return 400 for zero movie ID", async () => {
      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: "0" });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: "Invalid movie ID" });
      expect(mockGetMovieDetails).not.toHaveBeenCalled();
    });

    // Edge case: Non-numeric movie ID
    it("should return 400 for non-numeric movie ID", async () => {
      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: "abc" });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: "Invalid movie ID" });
      expect(mockGetMovieDetails).not.toHaveBeenCalled();
    });

    // Edge case: Movie ID with decimal
    it("should return 400 for decimal movie ID", async () => {
      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: "123.45" });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: "Invalid movie ID" });
      expect(mockGetMovieDetails).not.toHaveBeenCalled();
    });

    // Edge case: TMDB API timeout
    it("should return 500 on TMDB API timeout", async () => {
      mockGetMovieDetails.mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 2000)
          )
      );

      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: "123" });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result).toEqual({ error: "Failed to fetch movie details" });
    }, 5000); // Increase timeout for this test

    // Edge case: Malformed TMDB response
    it("should return 500 on malformed TMDB response", async () => {
      mockGetMovieDetails.mockResolvedValue(null as any);

      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: "123" });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(200); // Still returns the null response
      expect(result).toBeNull();
    });

    // Edge case: TMDB API rate limiting
    it("should return 500 on TMDB API rate limit", async () => {
      mockGetMovieDetails.mockRejectedValue(new Error("Rate limit exceeded"));

      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: "123" });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result).toEqual({ error: "Failed to fetch movie details" });
    });

    // Edge case: Movie ID with leading/trailing spaces
    it("should handle movie ID with leading/trailing spaces", async () => {
      const mockMovie = {
        id: 123,
        title: "Test Movie",
        overview: "A test movie",
        release_date: "2023-01-01",
        poster_path: undefined,
        backdrop_path: undefined,
        vote_average: 8.5,
        vote_count: 100,
        genre_ids: [1, 2],
        adult: false,
        original_language: "en",
        original_title: "Test Movie",
        popularity: 10,
        video: false,
      };

      mockGetMovieDetails.mockResolvedValue(mockMovie as any);

      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: "  123  " });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual(mockMovie);
      expect(mockGetMovieDetails).toHaveBeenCalledWith(123);
    });

    // Edge case: Very long movie ID string
    it("should return 400 for very long movie ID string", async () => {
      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: "1".repeat(1000) });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: "Invalid movie ID" });
    });

    // Edge case: Movie ID with special characters
    it("should return 400 for movie ID with special characters", async () => {
      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: "123abc!@#" });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: "Invalid movie ID" });
    });
  });
});

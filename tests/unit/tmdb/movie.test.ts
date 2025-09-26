import { GET } from "../../../app/api/tmdb/movie/[id]/route";
import { createMocks } from "node-mocks-http";
import { Movie } from "../../../lib/tmdb";

// Mock Response constructor
global.Response = jest.fn().mockImplementation((data, options = {}) => ({
  status: options.status || 200,
  json: () => Promise.resolve(data),
})) as any;

// Also mock Response.json static method
(global.Response as any).json = jest
  .fn()
  .mockImplementation((data, options = {}) => ({
    status: options.status || 200,
    json: () => Promise.resolve(data),
  }));

// Mock the TMDB function
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
    it("should return movie details for valid ID", async () => {
      const movieId = 123;
      const mockMovie: Movie = {
        id: movieId,
        title: "Test Movie",
        overview: "A test movie",
        release_date: "2023-01-01",
        poster_path: "/poster.jpg",
        backdrop_path: "/backdrop.jpg",
        vote_average: 8.5,
        vote_count: 100,
        genre_ids: [1, 2],
        adult: false,
        original_language: "en",
        original_title: "Test Movie",
        popularity: 10,
        video: false,
      };

      mockGetMovieDetails.mockResolvedValue(mockMovie);

      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: movieId.toString() });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual(mockMovie);
      expect(mockGetMovieDetails).toHaveBeenCalledWith(movieId);
    });

    it("should return 400 for invalid movie ID (non-numeric)", async () => {
      const invalidId = "abc";

      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: invalidId });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: "Invalid movie ID" });
      expect(mockGetMovieDetails).not.toHaveBeenCalled();
    });

    it("should return 400 for invalid movie ID (NaN)", async () => {
      const invalidId = "NaN";

      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: invalidId });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: "Invalid movie ID" });
      expect(mockGetMovieDetails).not.toHaveBeenCalled();
    });

    it("should return 400 for negative movie ID", async () => {
      const negativeId = "-123";

      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: negativeId });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: "Invalid movie ID" });
      expect(mockGetMovieDetails).not.toHaveBeenCalled();
    });

    it("should return 400 for zero movie ID", async () => {
      const zeroId = "0";

      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: zeroId });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: "Invalid movie ID" });
      expect(mockGetMovieDetails).not.toHaveBeenCalled();
    });

    it("should return 500 on TMDB API error", async () => {
      const movieId = 123;

      mockGetMovieDetails.mockRejectedValue(new Error("TMDB API error"));

      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: movieId.toString() });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result).toEqual({
        error: "Failed to fetch movie details",
      });
    });

    it("should handle movie ID with leading zeros", async () => {
      const movieId = 123;
      const mockMovie: Movie = {
        id: movieId,
        title: "Test Movie",
        overview: "A test movie",
        release_date: "2023-01-01",
        poster_path: "/poster.jpg",
        backdrop_path: "/backdrop.jpg",
        vote_average: 8.5,
        vote_count: 100,
        genre_ids: [1, 2],
        adult: false,
        original_language: "en",
        original_title: "Test Movie",
        popularity: 10,
        video: false,
      };

      mockGetMovieDetails.mockResolvedValue(mockMovie);

      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: "00123" }); // Leading zeros

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual(mockMovie);
      expect(mockGetMovieDetails).toHaveBeenCalledWith(123);
    });

    it("should handle very large movie ID", async () => {
      const largeId = 999999999;
      const mockMovie: Movie = {
        id: largeId,
        title: "Test Movie",
        overview: "A test movie",
        release_date: "2023-01-01",
        poster_path: "/poster.jpg",
        backdrop_path: "/backdrop.jpg",
        vote_average: 8.5,
        vote_count: 100,
        genre_ids: [1, 2],
        adult: false,
        original_language: "en",
        original_title: "Test Movie",
        popularity: 10,
        video: false,
      };

      mockGetMovieDetails.mockResolvedValue(mockMovie);

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
  });
});

import { createMocks } from "node-mocks-http";
import { GET } from "../../../app/api/tmdb/search/route";

// Mock the tmdb functions
jest.mock("../../../lib/tmdb", () => ({
  searchMovies: jest.fn(),
  searchTVShows: jest.fn(),
}));

import { searchMovies, searchTVShows } from "../../../lib/tmdb";

const mockSearchMovies = searchMovies as jest.MockedFunction<
  typeof searchMovies
>;
const mockSearchTVShows = searchTVShows as jest.MockedFunction<
  typeof searchTVShows
>;

describe("/api/tmdb/search", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("should search movies successfully", async () => {
      const mockResults = [
        {
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
        },
      ];

      mockSearchMovies.mockResolvedValue(mockResults);

      const { req } = createMocks({
        method: "GET",
        url: "http://localhost:3000/api/tmdb/search?q=test&type=movie",
      });

      const response = await GET(req as any);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual({ results: mockResults });
      expect(mockSearchMovies).toHaveBeenCalledWith("test");
      expect(mockSearchTVShows).not.toHaveBeenCalled();
    });

    it("should search TV shows successfully", async () => {
      const mockResults = [
        {
          id: 456,
          name: "Test TV Show",
          overview: "A test TV show",
          first_air_date: "2023-01-01",
          poster_path: undefined,
          backdrop_path: undefined,
          vote_average: 8.5,
          vote_count: 100,
          genre_ids: [1, 2],
          adult: false,
          original_language: "en",
          original_name: "Test TV Show",
          popularity: 10.0,
          origin_country: ["US"],
        },
      ];

      mockSearchTVShows.mockResolvedValue(mockResults);

      const { req } = createMocks({
        method: "GET",
        url: "http://localhost:3000/api/tmdb/search?q=test&type=tv",
      });

      const response = await GET(req as any);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual({ results: mockResults });
      expect(mockSearchTVShows).toHaveBeenCalledWith("test");
      expect(mockSearchMovies).not.toHaveBeenCalled();
    });

    it("should return 400 if query parameter is missing", async () => {
      const { req } = createMocks({
        method: "GET",
        url: "http://localhost:3000/api/tmdb/search?type=movie",
      });

      const response = await GET(req as any);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({
        error:
          "Missing or invalid query parameters: q (search term) and type (movie or tv) are required",
      });
    });

    it("should return 400 if type parameter is missing", async () => {
      const { req } = createMocks({
        method: "GET",
        url: "http://localhost:3000/api/tmdb/search?q=test",
      });

      const response = await GET(req as any);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({
        error:
          "Missing or invalid query parameters: q (search term) and type (movie or tv) are required",
      });
    });

    it("should return 400 for invalid type", async () => {
      const { req } = createMocks({
        method: "GET",
        url: "http://localhost:3000/api/tmdb/search?q=test&type=invalid",
      });

      const response = await GET(req as any);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({
        error:
          "Missing or invalid query parameters: q (search term) and type (movie or tv) are required",
      });
    });

    it("should return 500 on TMDB API error", async () => {
      mockSearchMovies.mockRejectedValue(new Error("TMDB API error"));

      const { req } = createMocks({
        method: "GET",
        url: "http://localhost:3000/api/tmdb/search?q=test&type=movie",
      });

      const response = await GET(req as any);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result).toEqual({
        error: "Failed to perform search. Please try again later.",
      });
      expect(mockSearchMovies).toHaveBeenCalledWith("test");
    });
  });
});

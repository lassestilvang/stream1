import { GET } from "../../../app/api/tmdb/search/route";
import { createMocks } from "node-mocks-http";
import { Movie, TVShow } from "../../../lib/tmdb";

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

// Mock the TMDB functions
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
    it("should return movies when type is movie", async () => {
      const mockMovies: Movie[] = [
        {
          id: 1,
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
        },
      ];

      mockSearchMovies.mockResolvedValue(mockMovies);

      const { req } = createMocks({
        method: "GET",
        url: "http://localhost:3000/api/tmdb/search?q=test&type=movie",
      });

      // Mock URL and search params
      Object.defineProperty(req, "url", {
        value: "http://localhost:3000/api/tmdb/search?q=test&type=movie",
      });

      const response = await GET(req as any);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual({ results: mockMovies });
      expect(mockSearchMovies).toHaveBeenCalledWith("test");
      expect(mockSearchTVShows).not.toHaveBeenCalled();
    });

    it("should return TV shows when type is tv", async () => {
      const mockTVShows: TVShow[] = [
        {
          id: 2,
          name: "Test TV Show",
          overview: "A test TV show",
          first_air_date: "2023-01-01",
          poster_path: "/tvposter.jpg",
          backdrop_path: "/tvbackdrop.jpg",
          vote_average: 8.0,
          vote_count: 50,
          genre_ids: [3, 4],
          adult: false,
          original_language: "en",
          original_name: "Test TV Show",
          popularity: 15,
          origin_country: ["US"],
        },
      ];

      mockSearchTVShows.mockResolvedValue(mockTVShows);

      const { req } = createMocks({
        method: "GET",
        url: "http://localhost:3000/api/tmdb/search?q=test&type=tv",
      });

      Object.defineProperty(req, "url", {
        value: "http://localhost:3000/api/tmdb/search?q=test&type=tv",
      });

      const response = await GET(req as any);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual({ results: mockTVShows });
      expect(mockSearchTVShows).toHaveBeenCalledWith("test");
      expect(mockSearchMovies).not.toHaveBeenCalled();
    });

    it("should return 400 for missing query parameter", async () => {
      const { req } = createMocks({
        method: "GET",
        url: "http://localhost:3000/api/tmdb/search?type=movie",
      });

      Object.defineProperty(req, "url", {
        value: "http://localhost:3000/api/tmdb/search?type=movie",
      });

      const response = await GET(req as any);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({
        error:
          "Missing or invalid query parameters: q (search term) and type (movie or tv) are required",
      });
    });

    it("should return 400 for invalid type parameter", async () => {
      const { req } = createMocks({
        method: "GET",
        url: "http://localhost:3000/api/tmdb/search?q=test&type=invalid",
      });

      Object.defineProperty(req, "url", {
        value: "http://localhost:3000/api/tmdb/search?q=test&type=invalid",
      });

      const response = await GET(req as any);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: "Missing or invalid query parameters: q (search term) and type (movie or tv) are required" });
    });

    it("should return 500 on TMDB API error", async () => {
      mockSearchMovies.mockRejectedValue(new Error("TMDB API error"));

      const { req } = createMocks({
        method: "GET",
        url: "http://localhost:3000/api/tmdb/search?q=test&type=movie",
      });

      Object.defineProperty(req, "url", {
        value: "http://localhost:3000/api/tmdb/search?q=test&type=movie",
      });

      const response = await GET(req as any);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result).toEqual({
        error: "Failed to perform search. Please try again later.",
      });
    });

    it("should return 400 for empty query string", async () => {
      const { req } = createMocks({
        method: "GET",
        url: "http://localhost:3000/api/tmdb/search?q=&type=movie",
      });

      Object.defineProperty(req, "url", {
        value: "http://localhost:3000/api/tmdb/search?q=&type=movie",
      });

      const response = await GET(req as any);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: "Missing or invalid query parameters: q (search term) and type (movie or tv) are required" });
    });

    it("should handle special characters in query", async () => {
      const mockMovies: Movie[] = [];
      mockSearchMovies.mockResolvedValue(mockMovies);

      const { req } = createMocks({
        method: "GET",
        url: "http://localhost:3000/api/tmdb/search?q=test%20%26%20query&type=movie",
      });

      Object.defineProperty(req, "url", {
        value:
          "http://localhost:3000/api/tmdb/search?q=test%20%26%20query&type=movie",
      });

      const response = await GET(req as any);
      await response.json();

      expect(response.status).toBe(200);
      expect(mockSearchMovies).toHaveBeenCalledWith("test & query");
    });
  });
});

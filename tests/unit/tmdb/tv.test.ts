import { GET } from "../../../app/api/tmdb/tv/[id]/route";
import { createMocks } from "node-mocks-http";
import { TVShow } from "../../../lib/tmdb";

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
  getTVShowDetails: jest.fn(),
}));

import { getTVShowDetails } from "../../../lib/tmdb";

const mockGetTVShowDetails = getTVShowDetails as jest.MockedFunction<
  typeof getTVShowDetails
>;

describe("/api/tmdb/tv/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("should return TV show details for valid ID", async () => {
      const tvId = 456;
      const mockTVShow: TVShow = {
        id: tvId,
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
      };

      mockGetTVShowDetails.mockResolvedValue(mockTVShow);

      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: tvId.toString() });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual(mockTVShow);
      expect(mockGetTVShowDetails).toHaveBeenCalledWith(tvId);
    });

    it("should return 400 for invalid TV show ID (non-numeric)", async () => {
      const invalidId = "xyz";

      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: invalidId });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: "Invalid TV show ID" });
      expect(mockGetTVShowDetails).not.toHaveBeenCalled();
    });

    it("should return 400 for invalid TV show ID (NaN)", async () => {
      const invalidId = "NaN";

      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: invalidId });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: "Invalid TV show ID" });
      expect(mockGetTVShowDetails).not.toHaveBeenCalled();
    });

    it("should return 400 for negative TV show ID", async () => {
      const negativeId = "-456";

      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: negativeId });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: "Invalid TV show ID" });
      expect(mockGetTVShowDetails).not.toHaveBeenCalled();
    });

    it("should return 400 for zero TV show ID", async () => {
      const zeroId = "0";

      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: zeroId });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: "Invalid TV show ID" });
      expect(mockGetTVShowDetails).not.toHaveBeenCalled();
    });

    it("should return 500 on TMDB API error", async () => {
      const tvId = 456;

      mockGetTVShowDetails.mockRejectedValue(new Error("TMDB API error"));

      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: tvId.toString() });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result).toEqual({
        error: "Failed to fetch TV show details",
      });
    });

    it("should handle TV show ID with leading zeros", async () => {
      const tvId = 456;
      const mockTVShow: TVShow = {
        id: tvId,
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
      };

      mockGetTVShowDetails.mockResolvedValue(mockTVShow);

      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: "00456" }); // Leading zeros

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual(mockTVShow);
      expect(mockGetTVShowDetails).toHaveBeenCalledWith(456);
    });

    it("should handle very large TV show ID", async () => {
      const largeId = 999999999;
      const mockTVShow: TVShow = {
        id: largeId,
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
      };

      mockGetTVShowDetails.mockResolvedValue(mockTVShow);

      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: largeId.toString() });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual(mockTVShow);
      expect(mockGetTVShowDetails).toHaveBeenCalledWith(largeId);
    });
  });
});

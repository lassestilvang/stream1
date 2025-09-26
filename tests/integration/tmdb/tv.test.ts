import { createMocks } from "node-mocks-http";
import { GET } from "../../../app/api/tmdb/tv/[id]/route";

jest.mock("../../../lib/tmdb", () => ({
  getTVShowDetails: jest.fn(),
}));

import { getTVShowDetails } from "../../../lib/tmdb";

const mockGetTVShowDetails = getTVShowDetails as jest.MockedFunction<typeof getTVShowDetails>;

describe("/api/tmdb/tv/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("should return TV show details successfully", async () => {
      const mockTVShow = {
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
      };

      mockGetTVShowDetails.mockResolvedValue(mockTVShow);

      const { req } = createMocks({
        method: "GET",
      });

      // Mock params
      const params = Promise.resolve({ id: "456" });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual(mockTVShow);
      expect(mockGetTVShowDetails).toHaveBeenCalledWith(456);
    });

    it("should return 400 for invalid TV show ID", async () => {
      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: "invalid" });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: "Invalid TV show ID" });
      expect(mockGetTVShowDetails).not.toHaveBeenCalled();
    });

    it("should return 500 on TMDB API error", async () => {
      mockGetTVShowDetails.mockRejectedValue(new Error("TMDB API error"));

      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: "456" });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result).toEqual({ error: "Failed to fetch TV show details" });
      expect(mockGetTVShowDetails).toHaveBeenCalledWith(456);
    });
  });
});

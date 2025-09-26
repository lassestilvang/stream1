import { GET, POST } from "../../../app/api/watched/route";
import { createMocks } from "node-mocks-http";

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

// Mock auth
jest.mock("../../../auth", () => ({
  auth: jest.fn(),
}));

// Mock database
jest.mock("../../../lib/db", () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
  watched: {},
}));

import { auth } from "../../../auth";
import { db } from "../../../lib/db";

const mockAuth = auth as jest.MockedFunction<any>;
const mockDb = db as jest.Mocked<typeof db>;

describe("/api/watched", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("should return watched items for authenticated user", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const mockItems = [
        {
          id: 1,
          userId: mockUser.id,
          tmdbId: 123,
          type: "movie",
          watchedDate: "2023-01-01",
          rating: 8,
          notes: "Great movie",
        },
        {
          id: 2,
          userId: mockUser.id,
          tmdbId: 456,
          type: "tv",
          watchedDate: "2023-01-02",
          rating: 9,
          notes: null,
        },
      ];

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      // Mock the entire query chain - orderBy returns a promise directly
      const mockOrderBy = jest.fn().mockResolvedValue(mockItems);
      const mockWhere = jest.fn().mockReturnValue({ orderBy: mockOrderBy });
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      mockDb.select.mockReturnValue({ from: mockFrom } as any);

      const { req } = createMocks({
        method: "GET",
        url: "http://localhost:3000/api/watched",
      });

      Object.defineProperty(req, "url", {
        value: "http://localhost:3000/api/watched",
      });

      const response = await GET(req as any);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual({ items: mockItems });
    });

    it("should filter items by search query", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const mockItems = [
        {
          id: 1,
          userId: mockUser.id,
          tmdbId: 123,
          type: "movie",
          watchedDate: "2023-01-01",
          rating: 8,
          notes: "Great movie with action",
        },
      ];

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      const mockOrderBy = jest.fn().mockResolvedValue(mockItems);
      const mockWhere = jest.fn().mockReturnValue({ orderBy: mockOrderBy });
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      mockDb.select.mockReturnValue({ from: mockFrom } as any);

      const { req } = createMocks({
        method: "GET",
        url: "http://localhost:3000/api/watched?search=action",
      });

      Object.defineProperty(req, "url", {
        value: "http://localhost:3000/api/watched?search=action",
      });

      const response = await GET(req as any);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual({ items: mockItems });
    });

    it("should filter items by date range", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const mockItems = [
        {
          id: 1,
          userId: mockUser.id,
          tmdbId: 123,
          type: "movie",
          watchedDate: "2023-01-15",
          rating: 8,
          notes: "Great movie",
        },
      ];

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      const mockOrderBy = jest.fn().mockResolvedValue(mockItems);
      const mockWhere = jest.fn().mockReturnValue({ orderBy: mockOrderBy });
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      mockDb.select.mockReturnValue({ from: mockFrom } as any);

      const { req } = createMocks({
        method: "GET",
        url: "http://localhost:3000/api/watched?dateFrom=2023-01-01&dateTo=2023-01-31",
      });

      Object.defineProperty(req, "url", {
        value:
          "http://localhost:3000/api/watched?dateFrom=2023-01-01&dateTo=2023-01-31",
      });

      const response = await GET(req as any);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual({ items: mockItems });
    });

    it("should return 401 for unauthenticated user", async () => {
      mockAuth.mockResolvedValue(null);

      const { req } = createMocks({
        method: "GET",
        url: "http://localhost:3000/api/watched",
      });

      Object.defineProperty(req, "url", {
        value: "http://localhost:3000/api/watched",
      });

      const response = await GET(req as any);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result).toEqual({ error: "Unauthorized" });
    });

    it("should return 500 on database error", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      const mockOrderBy = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));
      const mockWhere = jest.fn().mockReturnValue({ orderBy: mockOrderBy });
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      mockDb.select.mockReturnValue({ from: mockFrom } as any);

      const { req } = createMocks({
        method: "GET",
        url: "http://localhost:3000/api/watched",
      });

      Object.defineProperty(req, "url", {
        value: "http://localhost:3000/api/watched",
      });

      const response = await GET(req as any);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result).toEqual({
        error: "Failed to fetch watched items",
      });
    });
  });

  describe("POST", () => {
    it("should create watched item successfully", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const itemData = {
        tmdbId: 123,
        type: "movie",
        watchedDate: "2023-01-01",
        rating: 8,
        notes: "Great movie",
      };
      const createdItem = {
        id: 1,
        userId: mockUser.id,
        ...itemData,
      };

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      mockDb.insert.mockReturnValue({
        values: jest.fn(() => ({
          returning: jest.fn().mockResolvedValue([createdItem]),
        })),
      } as any);

      const { req } = createMocks({
        method: "POST",
        json: () => Promise.resolve(itemData),
      });

      const response = await POST(req as any);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result).toEqual({ item: createdItem });
    });

    it("should create watched item without notes", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const itemData = {
        tmdbId: 456,
        type: "tv",
        watchedDate: "2023-01-02",
        rating: 9,
      };
      const createdItem = {
        id: 2,
        userId: mockUser.id,
        ...itemData,
        notes: null,
      };

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      mockDb.insert.mockReturnValue({
        values: jest.fn(() => ({
          returning: jest.fn().mockResolvedValue([createdItem]),
        })),
      } as any);

      const { req } = createMocks({
        method: "POST",
        json: () => Promise.resolve(itemData),
      });

      const response = await POST(req as any);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result).toEqual({ item: createdItem });
    });

    it("should return 401 for unauthenticated user", async () => {
      const itemData = {
        tmdbId: 123,
        type: "movie",
        watchedDate: "2023-01-01",
        rating: 8,
      };

      mockAuth.mockResolvedValue(null);

      const { req } = createMocks({
        method: "POST",
        json: () => Promise.resolve(itemData),
      });

      const response = await POST(req as any);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result).toEqual({ error: "Unauthorized" });
    });

    it("should return 400 for missing required fields", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const incompleteData = {
        tmdbId: 123,
        type: "movie",
        // missing watchedDate and rating
      };

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      const { req } = createMocks({
        method: "POST",
        json: () => Promise.resolve(incompleteData),
      });

      const response = await POST(req as any);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({
        error: "Missing required fields: tmdbId, type, watchedDate, rating",
      });
    });

    it("should return 400 for invalid type", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const invalidData = {
        tmdbId: 123,
        type: "invalid",
        watchedDate: "2023-01-01",
        rating: 8,
      };

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      const { req } = createMocks({
        method: "POST",
        json: () => Promise.resolve(invalidData),
      });

      const response = await POST(req as any);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({
        error: "Invalid type. Must be 'movie' or 'tv'",
      });
    });

    it("should return 400 for rating too low", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const invalidData = {
        tmdbId: 123,
        type: "movie",
        watchedDate: "2023-01-01",
        rating: 0,
      };

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      const { req } = createMocks({
        method: "POST",
        json: () => Promise.resolve(invalidData),
      });

      const response = await POST(req as any);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({
        error: "Rating must be between 1 and 10",
      });
    });

    it("should return 400 for rating too high", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const invalidData = {
        tmdbId: 123,
        type: "movie",
        watchedDate: "2023-01-01",
        rating: 11,
      };

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      const { req } = createMocks({
        method: "POST",
        json: () => Promise.resolve(invalidData),
      });

      const response = await POST(req as any);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({
        error: "Rating must be between 1 and 10",
      });
    });

    it("should return 500 on database error", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const itemData = {
        tmdbId: 123,
        type: "movie",
        watchedDate: "2023-01-01",
        rating: 8,
      };

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      mockDb.insert.mockReturnValue({
        values: jest.fn(() => ({
          returning: jest.fn().mockRejectedValue(new Error("Database error")),
        })),
      } as any);

      const { req } = createMocks({
        method: "POST",
        json: () => Promise.resolve(itemData),
      });

      const response = await POST(req as any);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result).toEqual({
        error: "Failed to add watched item",
      });
    });
  });
});

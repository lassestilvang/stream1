import { GET, POST } from "../../../app/api/watchlist/route";
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
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          orderBy: jest.fn(() => ({
            execute: jest.fn(),
          })),
        })),
      })),
    })),
    insert: jest.fn(() => ({
      values: jest.fn(() => ({
        returning: jest.fn(() => ({
          execute: jest.fn(),
        })),
      })),
    })),
  },
  watchlist: {},
}));

import { auth } from "../../../auth";
import { db } from "../../../lib/db";

const mockAuth = auth as jest.MockedFunction<any>;
const mockDb = db as jest.Mocked<typeof db>;

describe("/api/watchlist", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("should return watchlist items for authenticated user", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const mockItems = [
        {
          id: 1,
          userId: mockUser.id,
          tmdbId: 123,
          type: "movie",
          addedDate: "2023-01-01",
        },
        {
          id: 2,
          userId: mockUser.id,
          tmdbId: 456,
          type: "tv",
          addedDate: "2023-01-02",
        },
      ];

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      mockDb.select.mockReturnValue({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            orderBy: jest.fn().mockResolvedValue(mockItems),
          })),
        })),
      } as any);

      const response = await GET();
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual({ items: mockItems });
    });

    it("should return empty array when no items", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      mockDb.select.mockReturnValue({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            orderBy: jest.fn().mockResolvedValue([]),
          })),
        })),
      } as any);

      const response = await GET();
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual({ items: [] });
    });

    it("should return 401 for unauthenticated user", async () => {
      mockAuth.mockResolvedValue(null);

      const response = await GET();
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result).toEqual({ error: "Unauthorized" });
    });

    it("should return 500 on database error", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      mockDb.select.mockReturnValue({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            orderBy: jest.fn().mockRejectedValue(new Error("Database error")),
          })),
        })),
      } as any);

      const response = await GET();
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result).toEqual({
        error: "Failed to fetch watchlist items",
      });
    });
  });

  describe("POST", () => {
    it("should create watchlist item successfully", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const itemData = {
        tmdbId: 123,
        type: "movie",
        addedDate: "2023-01-01",
      };
      const createdItem = {
        id: 1,
        userId: mockUser.id,
        ...itemData,
      };

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      // Mock no existing item (for duplicate check)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn().mockResolvedValue([]),
          })),
        })),
      } as any);

      // Mock creation
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
        addedDate: "2023-01-01",
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
        // missing addedDate
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
        error: "Missing required fields: tmdbId, type, addedDate",
      });
    });

    it("should return 400 for invalid type", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const invalidData = {
        tmdbId: 123,
        type: "invalid",
        addedDate: "2023-01-01",
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

    it("should return 409 for duplicate item", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const itemData = {
        tmdbId: 123,
        type: "movie",
        addedDate: "2023-01-01",
      };
      const existingItem = {
        id: 1,
        userId: mockUser.id,
        ...itemData,
      };

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      // Mock existing item (duplicate check)
      mockDb.select.mockReturnValue({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn().mockResolvedValue([existingItem]),
          })),
        })),
      } as any);

      const { req } = createMocks({
        method: "POST",
        json: () => Promise.resolve(itemData),
      });

      const response = await POST(req as any);
      const result = await response.json();

      expect(response.status).toBe(409);
      expect(result).toEqual({
        error: "Item already in watchlist",
      });
    });

    it("should return 500 on database error during duplicate check", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const itemData = {
        tmdbId: 123,
        type: "movie",
        addedDate: "2023-01-01",
      };

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      // Mock database error during duplicate check
      mockDb.select.mockReturnValue({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn().mockRejectedValue(new Error("Database error")),
          })),
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
        error: "Failed to add watchlist item",
      });
    });

    it("should return 500 on database error during creation", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const itemData = {
        tmdbId: 123,
        type: "movie",
        addedDate: "2023-01-01",
      };

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      // Mock no existing item
      mockDb.select.mockReturnValueOnce({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn().mockResolvedValue([]),
          })),
        })),
      } as any);

      // Mock database error during insertion
      mockDb.insert.mockReturnValue({
        values: jest.fn(() => ({
          returning: jest.fn().mockRejectedValue(new Error("Insert error")),
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
        error: "Failed to add watchlist item",
      });
    });
  });
});

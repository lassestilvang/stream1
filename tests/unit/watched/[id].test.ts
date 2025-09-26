import { GET, PUT, DELETE } from "../../../app/api/watched/[id]/route";
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
          limit: jest.fn(() => ({
            execute: jest.fn(),
          })),
        })),
      })),
    })),
    update: jest.fn(() => ({
      set: jest.fn(() => ({
        where: jest.fn(() => ({
          returning: jest.fn(() => ({
            execute: jest.fn(),
          })),
        })),
      })),
    })),
    delete: jest.fn(() => ({
      where: jest.fn(() => ({
        returning: jest.fn(() => ({
          execute: jest.fn(),
        })),
      })),
    })),
  },
  watched: {},
}));

import { auth } from "../../../auth";
import { db } from "../../../lib/db";

const mockAuth = auth as jest.MockedFunction<any>;
const mockDb = db as jest.Mocked<typeof db>;

describe("/api/watched/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("should return watched item for authenticated user", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const itemId = 1;
      const mockItem = {
        id: itemId,
        userId: mockUser.id,
        tmdbId: 123,
        type: "movie",
        watchedDate: "2023-01-01",
        rating: 8,
        notes: "Great movie",
      };

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      mockDb.select.mockReturnValue({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn().mockResolvedValue([mockItem]),
          })),
        })),
      } as any);

      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: itemId.toString() });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual({ item: mockItem });
    });

    it("should return 401 for unauthenticated user", async () => {
      const itemId = 1;

      mockAuth.mockResolvedValue(null);

      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: itemId.toString() });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result).toEqual({ error: "Unauthorized" });
    });

    it("should return 400 for invalid ID", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const invalidId = "abc";

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: invalidId });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: "Invalid ID" });
    });

    it("should return 404 when item not found", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const itemId = 999;

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      mockDb.select.mockReturnValue({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn().mockResolvedValue([]),
          })),
        })),
      } as any);

      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: itemId.toString() });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result).toEqual({ error: "Item not found" });
    });

    it("should return 500 on database error", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const itemId = 1;

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      mockDb.select.mockReturnValue({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn().mockRejectedValue(new Error("Database error")),
          })),
        })),
      } as any);

      const { req } = createMocks({
        method: "GET",
      });

      const params = Promise.resolve({ id: itemId.toString() });

      const response = await GET(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result).toEqual({
        error: "Failed to fetch watched item",
      });
    });
  });

  describe("PUT", () => {
    it("should update watched item successfully", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const itemId = 1;
      const existingItem = {
        id: itemId,
        userId: mockUser.id,
        tmdbId: 123,
        type: "movie",
        watchedDate: "2023-01-01",
        rating: 8,
        notes: "Great movie",
      };
      const updateData = {
        rating: 9,
        notes: "Excellent movie",
      };
      const updatedItem = {
        ...existingItem,
        ...updateData,
        updatedAt: new Date(),
      };

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      // Mock finding existing item
      mockDb.select.mockReturnValue({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn().mockResolvedValue([existingItem]),
          })),
        })),
      } as any);

      // Mock update
      mockDb.update.mockReturnValue({
        set: jest.fn(() => ({
          where: jest.fn(() => ({
            returning: jest.fn().mockResolvedValue([updatedItem]),
          })),
        })),
      } as any);

      const { req } = createMocks({
        method: "PUT",
        json: () => Promise.resolve(updateData),
      });

      const params = Promise.resolve({ id: itemId.toString() });

      const response = await PUT(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual({ item: updatedItem });
    });

    it("should update with partial data", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const itemId = 1;
      const existingItem = {
        id: itemId,
        userId: mockUser.id,
        tmdbId: 123,
        type: "movie",
        watchedDate: "2023-01-01",
        rating: 8,
        notes: "Great movie",
      };
      const updateData = {
        rating: 7, // Only updating rating
      };
      const updatedItem = {
        ...existingItem,
        ...updateData,
        updatedAt: new Date(),
      };

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      mockDb.select.mockReturnValue({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn().mockResolvedValue([existingItem]),
          })),
        })),
      } as any);

      mockDb.update.mockReturnValue({
        set: jest.fn(() => ({
          where: jest.fn(() => ({
            returning: jest.fn().mockResolvedValue([updatedItem]),
          })),
        })),
      } as any);

      const { req } = createMocks({
        method: "PUT",
        json: () => Promise.resolve(updateData),
      });

      const params = Promise.resolve({ id: itemId.toString() });

      const response = await PUT(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual({ item: updatedItem });
    });

    it("should return 401 for unauthenticated user", async () => {
      const itemId = 1;
      const updateData = { rating: 9 };

      mockAuth.mockResolvedValue(null);

      const { req } = createMocks({
        method: "PUT",
        json: () => Promise.resolve(updateData),
      });

      const params = Promise.resolve({ id: itemId.toString() });

      const response = await PUT(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result).toEqual({ error: "Unauthorized" });
    });

    it("should return 400 for invalid ID", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const invalidId = "xyz";
      const updateData = { rating: 9 };

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      const { req } = createMocks({
        method: "PUT",
        json: () => Promise.resolve(updateData),
      });

      const params = Promise.resolve({ id: invalidId });

      const response = await PUT(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: "Invalid ID" });
    });

    it("should return 404 when item not found", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const itemId = 999;
      const updateData = { rating: 9 };

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      mockDb.select.mockReturnValue({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn().mockResolvedValue([]),
          })),
        })),
      } as any);

      const { req } = createMocks({
        method: "PUT",
        json: () => Promise.resolve(updateData),
      });

      const params = Promise.resolve({ id: itemId.toString() });

      const response = await PUT(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result).toEqual({ error: "Item not found" });
    });

    it("should return 400 for invalid type", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const itemId = 1;
      const existingItem = {
        id: itemId,
        userId: mockUser.id,
        tmdbId: 123,
        type: "movie",
        watchedDate: "2023-01-01",
        rating: 8,
        notes: "Great movie",
      };
      const updateData = {
        type: "invalid",
      };

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      mockDb.select.mockReturnValue({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn().mockResolvedValue([existingItem]),
          })),
        })),
      } as any);

      const { req } = createMocks({
        method: "PUT",
        json: () => Promise.resolve(updateData),
      });

      const params = Promise.resolve({ id: itemId.toString() });

      const response = await PUT(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({
        error: "Invalid type. Must be 'movie' or 'tv'",
      });
    });

    it("should return 400 for rating out of range", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const itemId = 1;
      const existingItem = {
        id: itemId,
        userId: mockUser.id,
        tmdbId: 123,
        type: "movie",
        watchedDate: "2023-01-01",
        rating: 8,
        notes: "Great movie",
      };
      const updateData = {
        rating: 15,
      };

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      mockDb.select.mockReturnValue({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn().mockResolvedValue([existingItem]),
          })),
        })),
      } as any);

      const { req } = createMocks({
        method: "PUT",
        json: () => Promise.resolve(updateData),
      });

      const params = Promise.resolve({ id: itemId.toString() });

      const response = await PUT(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({
        error: "Rating must be between 1 and 10",
      });
    });
  });

  describe("DELETE", () => {
    it("should delete watched item successfully", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const itemId = 1;
      const deletedItem = {
        id: itemId,
        userId: mockUser.id,
        tmdbId: 123,
        type: "movie",
        watchedDate: "2023-01-01",
        rating: 8,
        notes: "Great movie",
      };

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      mockDb.delete.mockReturnValue({
        where: jest.fn(() => ({
          returning: jest.fn().mockResolvedValue([deletedItem]),
        })),
      } as any);

      const { req } = createMocks({
        method: "DELETE",
      });

      const params = Promise.resolve({ id: itemId.toString() });

      const response = await DELETE(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual({ success: true });
    });

    it("should return 401 for unauthenticated user", async () => {
      const itemId = 1;

      mockAuth.mockResolvedValue(null);

      const { req } = createMocks({
        method: "DELETE",
      });

      const params = Promise.resolve({ id: itemId.toString() });

      const response = await DELETE(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result).toEqual({ error: "Unauthorized" });
    });

    it("should return 400 for invalid ID", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const invalidId = "invalid";

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      const { req } = createMocks({
        method: "DELETE",
      });

      const params = Promise.resolve({ id: invalidId });

      const response = await DELETE(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: "Invalid ID" });
    });

    it("should return 404 when item not found", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const itemId = 999;

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      mockDb.delete.mockReturnValue({
        where: jest.fn(() => ({
          returning: jest.fn().mockResolvedValue([]),
        })),
      } as any);

      const { req } = createMocks({
        method: "DELETE",
      });

      const params = Promise.resolve({ id: itemId.toString() });

      const response = await DELETE(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result).toEqual({ error: "Item not found" });
    });

    it("should return 500 on database error", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const itemId = 1;

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      mockDb.delete.mockReturnValue({
        where: jest.fn(() => ({
          returning: jest.fn().mockRejectedValue(new Error("Database error")),
        })),
      } as any);

      const { req } = createMocks({
        method: "DELETE",
      });

      const params = Promise.resolve({ id: itemId.toString() });

      const response = await DELETE(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result).toEqual({
        error: "Failed to delete watched item",
      });
    });
  });
});

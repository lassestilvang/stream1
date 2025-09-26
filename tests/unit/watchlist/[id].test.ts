import { DELETE } from "../../../app/api/watchlist/[id]/route";
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
    delete: jest.fn(() => ({
      where: jest.fn(() => ({
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

describe("/api/watchlist/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("DELETE", () => {
    it("should delete watchlist item successfully", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const itemId = 1;
      const deletedItem = {
        id: itemId,
        userId: mockUser.id,
        tmdbId: 123,
        type: "movie",
        addedDate: "2023-01-01",
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
        error: "Failed to delete watchlist item",
      });
    });

    it("should handle zero ID", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const zeroId = "0";

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      const { req } = createMocks({
        method: "DELETE",
      });

      const params = Promise.resolve({ id: zeroId });

      const response = await DELETE(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: "Invalid ID" });
    });

    it("should handle negative ID", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const negativeId = "-1";

      mockAuth.mockResolvedValue({ user: mockUser } as any);

      const { req } = createMocks({
        method: "DELETE",
      });

      const params = Promise.resolve({ id: negativeId });

      const response = await DELETE(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: "Invalid ID" });
    });

    it("should handle very large ID", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const largeId = "999999999";
      const deletedItem = {
        id: 999999999,
        userId: mockUser.id,
        tmdbId: 123,
        type: "movie",
        addedDate: "2023-01-01",
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

      const params = Promise.resolve({ id: largeId });

      const response = await DELETE(req as any, { params });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual({ success: true });
    });
  });
});

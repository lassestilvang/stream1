import { POST } from "../../../app/api/auth/signup/route";
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

// Mock database and bcrypt
jest.mock("../../../lib/db", () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve([])),
        })),
      })),
    })),
    insert: jest.fn(() => ({
      values: jest.fn(() => ({
        returning: jest.fn(() => Promise.resolve([])),
      })),
    })),
  },
  users: {},
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
}));

import { db } from "../../../lib/db";
import bcrypt from "bcryptjs";

const mockDb = db as jest.Mocked<typeof db>;
const mockBcryptHash = bcrypt.hash as jest.MockedFunction<any>;

describe("/api/auth/signup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST", () => {
    it("should create user successfully with valid data", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      const hashedPassword = "hashedPassword123";
      const newUser = {
        id: "user-123",
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
      };

      // Mock no existing user - the global mock already returns []

      // Mock password hashing
      mockBcryptHash.mockResolvedValue(hashedPassword);

      // Mock user creation
      mockDb.insert.mockReturnValue({
        values: jest.fn(() => ({
          returning: jest.fn(() => Promise.resolve([newUser])),
        })),
      } as any);

      const { req } = createMocks({
        method: "POST",
        json: () => Promise.resolve(userData),
      });

      const response = await POST(req as any);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result).toEqual({
        message: "User created successfully",
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        },
      });
      expect(mockBcryptHash).toHaveBeenCalledWith(userData.password, 12);
    });

    it("should create user without name field", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
      };

      const hashedPassword = "hashedPassword123";
      const newUser = {
        id: "user-123",
        email: userData.email,
        password: hashedPassword,
        name: null,
      };

      // Mock no existing user - the global mock already returns []

      mockBcryptHash.mockResolvedValue(hashedPassword);

      mockDb.insert.mockReturnValue({
        values: jest.fn(() => ({
          returning: jest.fn().mockResolvedValue([newUser]),
        })),
      } as any);

      const { req } = createMocks({
        method: "POST",
        json: () => Promise.resolve(userData),
      });

      const response = await POST(req as any);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result.user.name).toBeNull();
    });

    it("should return 400 when email is missing", async () => {
      const userData = {
        password: "password123",
        name: "Test User",
      };

      const { req } = createMocks({
        method: "POST",
        json: () => Promise.resolve(userData),
      });

      const response = await POST(req as any);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({
        error: "Email and password are required",
      });
    });

    it("should return 400 when password is missing", async () => {
      const userData = {
        email: "test@example.com",
        name: "Test User",
      };

      const { req } = createMocks({
        method: "POST",
        json: () => Promise.resolve(userData),
      });

      const response = await POST(req as any);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({
        error: "Email and password are required",
      });
    });

    it("should return 400 when user already exists", async () => {
      const userData = {
        email: "existing@example.com",
        password: "password123",
        name: "Test User",
      };

      const existingUser = {
        id: "existing-123",
        email: userData.email,
      };

      // Mock existing user
      mockDb.select.mockReturnValue({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve([existingUser])),
          })),
        })),
      } as any);

      const { req } = createMocks({
        method: "POST",
        json: () => Promise.resolve(userData),
      });

      const response = await POST(req as any);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({
        error: "User with this email already exists",
      });
    });

    it("should return 500 on database error during user lookup", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      // Mock database error
      mockDb.select.mockReturnValue({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn(() => Promise.reject(new Error("Database error"))),
          })),
        })),
      } as any);

      const { req } = createMocks({
        method: "POST",
        json: () => Promise.resolve(userData),
      });

      const response = await POST(req as any);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result).toEqual({
        error: "Failed to create user",
      });
    });

    it("should return 500 on password hashing error", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      // Mock password hashing error
      mockBcryptHash.mockRejectedValue(new Error("Hashing error"));

      const { req } = createMocks({
        method: "POST",
        json: () => Promise.resolve(userData),
      });

      const response = await POST(req as any);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result).toEqual({
        error: "Failed to create user",
      });
    });

    it("should return 500 on database error during user creation", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      // Mock no existing user
      mockDb.select.mockReturnValue({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn(() => ({
              execute: jest.fn().mockResolvedValue([]),
            })),
          })),
        })),
      } as any);

      mockBcryptHash.mockResolvedValue("hashedPassword");

      // Mock database error during insertion
      mockDb.insert.mockReturnValue({
        values: jest.fn(() => ({
          returning: jest.fn(() => Promise.reject(new Error("Insert error"))),
        })),
      } as any);

      const { req } = createMocks({
        method: "POST",
        json: () => Promise.resolve(userData),
      });

      const response = await POST(req as any);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result).toEqual({
        error: "Failed to create user",
      });
    });

    it("should handle malformed JSON request", async () => {
      const { req } = createMocks({
        method: "POST",
        json: () => Promise.reject(new Error("Invalid JSON")),
      });

      const response = await POST(req as any);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({
        error: "Invalid JSON",
      });
    });
  });
});

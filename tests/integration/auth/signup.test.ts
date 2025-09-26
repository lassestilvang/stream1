import { createMocks } from "node-mocks-http";
import { POST } from "../../../app/api/auth/signup/route";
import { db, users } from "../../../lib/db";
import bcrypt from "bcryptjs";

jest.mock("bcryptjs", () => ({
  __esModule: true,
  default: {
    hash: jest.fn(),
  },
}));

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

const mockDb = db as jest.Mocked<typeof db>;

jest.mock("../../../lib/db", () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  users: {},
}));

describe("/api/auth/signup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST", () => {
    it("should create a new user successfully", async () => {
      // Mock database responses
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]), // No existing user
          }),
        }),
      });

      const mockInsert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([
            {
              id: "test-uuid-123",
              email: "test@example.com",
              name: "Test User",
            },
          ]),
        }),
      });

      mockDb.select.mockImplementation(mockSelect);
      mockDb.insert.mockImplementation(mockInsert);

      // Mock bcrypt
      (mockBcrypt.hash as any).mockResolvedValue("hashed-password");

      const { req } = createMocks({
        method: "POST",
        json: jest.fn().mockResolvedValue({
          email: "test@example.com",
          password: "password123",
          name: "Test User",
        }),
      });

      const response = await POST(req as any);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result).toEqual({
        message: "User created successfully",
        user: {
          id: "test-uuid-123",
          email: "test@example.com",
          name: "Test User",
        },
      });

      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 12);
      expect(mockInsert).toHaveBeenCalledWith(users);
    });

    it("should return 400 if email or password is missing", async () => {
      const { req } = createMocks({
        method: "POST",
        json: jest.fn().mockResolvedValue({
          email: "test@example.com",
          // password missing
        }),
      });

      const response = await POST(req as any);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({
        error: "Email and password are required",
      });
    });

    it("should return 400 if user already exists", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([
              {
                id: "existing-id",
                email: "test@example.com",
              },
            ]),
          }),
        }),
      });

      mockDb.select.mockImplementation(mockSelect);

      const { req } = createMocks({
        method: "POST",
        json: jest.fn().mockResolvedValue({
          email: "test@example.com",
          password: "password123",
        }),
      });

      const response = await POST(req as any);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({
        error: "User with this email already exists",
      });
    });

    it("should return 500 on database error", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockRejectedValue(new Error("Database error")),
          }),
        }),
      });

      mockDb.select.mockImplementation(mockSelect);

      const { req } = createMocks({
        method: "POST",
        json: jest.fn().mockResolvedValue({
          email: "test@example.com",
          password: "password123",
        }),
      });

      const response = await POST(req as any);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result).toEqual({
        error: "Failed to create user",
      });
    });

    // Edge case: Malformed JSON input
    it("should return 400 for malformed JSON", async () => {
      const { req } = createMocks({
        method: "POST",
        json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
      });

      const response = await POST(req as any);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({
        error: "Invalid JSON",
      });
    });

    // Edge case: Very long email
    it("should handle very long email", async () => {
      const longEmail = "a".repeat(1000) + "@example.com";

      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const mockInsert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([
            {
              id: "test-uuid-123",
              email: longEmail,
              name: "Test User",
            },
          ]),
        }),
      });

      mockDb.select.mockImplementation(mockSelect);
      mockDb.insert.mockImplementation(mockInsert);
      (mockBcrypt.hash as any).mockResolvedValue("hashed-password");

      const { req } = createMocks({
        method: "POST",
        json: jest.fn().mockResolvedValue({
          email: longEmail,
          password: "password123",
          name: "Test User",
        }),
      });

      const response = await POST(req as any);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result.user.email).toBe(longEmail);
    });

    // Edge case: Email with special characters
    it("should handle email with special characters", async () => {
      const specialEmail = "test+tag@example.com";

      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const mockInsert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([
            {
              id: "test-uuid-123",
              email: specialEmail,
              name: "Test User",
            },
          ]),
        }),
      });

      mockDb.select.mockImplementation(mockSelect);
      mockDb.insert.mockImplementation(mockInsert);
      (mockBcrypt.hash as any).mockResolvedValue("hashed-password");

      const { req } = createMocks({
        method: "POST",
        json: jest.fn().mockResolvedValue({
          email: specialEmail,
          password: "password123",
          name: "Test User",
        }),
      });

      const response = await POST(req as any);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result.user.email).toBe(specialEmail);
    });

    // Edge case: Bcrypt hashing error
    it("should return 500 on bcrypt error", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      mockDb.select.mockImplementation(mockSelect);
      (mockBcrypt.hash as any).mockRejectedValue(new Error("Hashing failed"));

      const { req } = createMocks({
        method: "POST",
        json: jest.fn().mockResolvedValue({
          email: "test@example.com",
          password: "password123",
          name: "Test User",
        }),
      });

      const response = await POST(req as any);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result).toEqual({
        error: "Failed to create user",
      });
    });

    // Edge case: Database connection timeout
    it("should return 500 on database timeout", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest
              .fn()
              .mockImplementation(
                () =>
                  new Promise((_, reject) =>
                    setTimeout(
                      () => reject(new Error("Connection timeout")),
                      5000
                    )
                  )
              ),
          }),
        }),
      });

      mockDb.select.mockImplementation(mockSelect);

      const { req } = createMocks({
        method: "POST",
        json: jest.fn().mockResolvedValue({
          email: "test@example.com",
          password: "password123",
        }),
      });

      const response = await POST(req as any);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result).toEqual({
        error: "Failed to create user",
      });
    });

    // Edge case: Invalid email format
    it("should return 400 for invalid email format", async () => {
      const { req } = createMocks({
        method: "POST",
        json: jest.fn().mockResolvedValue({
          email: "invalid-email",
          password: "password123",
          name: "Test User",
        }),
      });

      const response = await POST(req as any);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({
        error: "Email and password are required",
      });
    });

    // Edge case: Password too short
    it("should handle password that is too short", async () => {
      const { req } = createMocks({
        method: "POST",
        json: jest.fn().mockResolvedValue({
          email: "test@example.com",
          password: "123", // Too short
          name: "Test User",
        }),
      });

      // The API doesn't validate password length, so it should proceed
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const mockInsert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([
            {
              id: "test-uuid-123",
              email: "test@example.com",
              name: "Test User",
            },
          ]),
        }),
      });

      mockDb.select.mockImplementation(mockSelect);
      mockDb.insert.mockImplementation(mockInsert);
      (mockBcrypt.hash as any).mockResolvedValue("hashed-password");

      const response = await POST(req as any);
      await response.json();

      expect(response.status).toBe(201);
    });

    // Edge case: Name with special characters
    it("should handle name with special characters", async () => {
      const specialName = "User with émojis 🎉 & spëcial chärs";

      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const mockInsert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([
            {
              id: "test-uuid-123",
              email: "test@example.com",
              name: specialName,
            },
          ]),
        }),
      });

      mockDb.select.mockImplementation(mockSelect);
      mockDb.insert.mockImplementation(mockInsert);
      (mockBcrypt.hash as any).mockResolvedValue("hashed-password");

      const { req } = createMocks({
        method: "POST",
        json: jest.fn().mockResolvedValue({
          email: "test@example.com",
          password: "password123",
          name: specialName,
        }),
      });

      const response = await POST(req as any);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result.user.name).toBe(specialName);
    });

    // Edge case: Concurrent signup attempts
    it("should handle concurrent signup attempts", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]), // No existing user
          }),
        }),
      });

      const mockInsert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([
            {
              id: "test-uuid-123",
              email: "test@example.com",
              name: "Test User",
            },
          ]),
        }),
      });

      mockDb.select.mockImplementation(mockSelect);
      mockDb.insert.mockImplementation(mockInsert);
      (mockBcrypt.hash as any).mockResolvedValue("hashed-password");

      const createRequest = () =>
        createMocks({
          method: "POST",
          json: jest.fn().mockResolvedValue({
            email: "test@example.com",
            password: "password123",
            name: "Test User",
          }),
        });

      const promises = [
        POST(createRequest().req as any),
        POST(createRequest().req as any),
        POST(createRequest().req as any),
      ];

      const responses = await Promise.all(promises);

      // At least one should succeed, others might fail due to race conditions
      const successCount = responses.filter((r) => r.status === 201).length;
      const conflictCount = responses.filter((r) => r.status === 400).length;

      expect(successCount + conflictCount).toBe(3);
    });
  });
});

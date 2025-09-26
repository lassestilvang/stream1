import { GET, POST } from "../../../app/api/auth/[...nextauth]/route";

// Mock NextAuth
jest.mock("../../../auth", () => ({
  handlers: {
    GET: jest.fn(),
    POST: jest.fn(),
  },
}));

describe("/api/auth/[...nextauth]", () => {
  it("should export GET handler from NextAuth", () => {
    expect(GET).toBeDefined();
    expect(typeof GET).toBe("function");
  });

  it("should export POST handler from NextAuth", () => {
    expect(POST).toBeDefined();
    expect(typeof POST).toBe("function");
  });

  it("should export handlers that are functions", () => {
    expect(typeof GET).toBe("function");
    expect(typeof POST).toBe("function");
  });
});

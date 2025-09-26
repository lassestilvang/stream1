// Mock environment variables
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/testdb";
process.env.TMDB_API_KEY = "test-api-key";
process.env.NEXTAUTH_SECRET = "test_secret";

// Mock fetch for TMDB API
global.fetch = jest.fn();

// Mock crypto.randomUUID
Object.defineProperty(global, "crypto", {
  value: {
    randomUUID: () => "test-uuid-123",
  },
});

// Mock Response for Next.js API routes
global.Response = class Response {
  body: BodyInit | null | undefined;
  status: number;
  statusText: string;
  headers: Headers;
  ok: boolean;
  redirected: boolean;
  type: ResponseType;
  url: string;
  bodyUsed: boolean;

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this.body = body;
    this.status = init?.status || 200;
    this.statusText = init?.statusText || "";
    this.headers = new Headers(init?.headers);
    this.ok = this.status >= 200 && this.status < 300;
    this.redirected = false;
    this.type = "default";
    this.url = "";
    this.bodyUsed = false;
  }

  static json(data: unknown, init?: ResponseInit) {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  }

  static error() {
    return new Response("Internal Server Error", { status: 500 });
  }

  static redirect(url: string | URL, status = 302) {
    return new Response(null, {
      status,
      headers: { Location: url.toString() },
    });
  }

  async json() {
    return JSON.parse(this.body as string);
  }

  async text() {
    return this.body as string;
  }

  async arrayBuffer() {
    return new ArrayBuffer(0);
  }

  async blob() {
    return new Blob([this.body as BlobPart]);
  }

  async bytes() {
    return new Uint8Array(0);
  }

  async formData() {
    return new FormData();
  }

  clone() {
    return new Response(this.body, {
      status: this.status,
      statusText: this.statusText,
      headers: this.headers,
    });
  }
} as unknown as typeof Response;

// Mock NextAuth completely
jest.mock("next-auth", () => ({
  default: jest.fn(),
  NextAuth: jest.fn(),
}));

jest.mock("@auth/drizzle-adapter", () => ({
  DrizzleAdapter: jest.fn(),
}));

jest.mock("next-auth/providers/credentials", () => ({
  default: jest.fn(),
}));

// Mock NextAuth auth function
const mockAuth = jest.fn();
jest.mock("./auth", () => ({
  auth: mockAuth,
}));

// Database mocking is handled in individual test files

// Mock TMDB functions
jest.mock("./lib/tmdb", () => ({
  getMovieDetails: jest.fn(),
  getTVShowDetails: jest.fn(),
  searchMovies: jest.fn(),
  searchTVShows: jest.fn(),
}));

// Mock bcrypt
jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

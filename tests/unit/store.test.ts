import {
  useSearchStore,
  useWatchedStore,
  useWatchlistStore,
  useUserStore,
} from "../../state/store";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
  },
}));

// Note: lib/auth doesn't exist, so no need to mock it

describe("Search Store", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSearchStore.setState({
      query: "",
      type: "movie",
      results: [],
      loading: false,
    });
  });

  it("initializes with correct default state", () => {
    const state = useSearchStore.getState();
    expect(state.query).toBe("");
    expect(state.type).toBe("movie");
    expect(state.results).toEqual([]);
    expect(state.loading).toBe(false);
  });

  it("setQuery updates query correctly", () => {
    useSearchStore.getState().setQuery("test query");
    expect(useSearchStore.getState().query).toBe("test query");
  });

  it("setType updates type correctly", () => {
    useSearchStore.getState().setType("tv");
    expect(useSearchStore.getState().type).toBe("tv");
  });

  it("setLoading updates loading state", () => {
    useSearchStore.getState().setLoading(true);
    expect(useSearchStore.getState().loading).toBe(true);
  });

  it("search fetches and updates results successfully", async () => {
    const mockResponse = {
      results: [{ id: 1, title: "Test Movie", overview: "Test overview" }],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    await useSearchStore.getState().search("test query");

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/tmdb/search?q=test%20query&type=movie"
    );
    expect(useSearchStore.getState().results).toEqual(mockResponse.results);
    expect(useSearchStore.getState().loading).toBe(false);
  });

  it("search handles API errors", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: "Internal Server Error",
    });

    await expect(useSearchStore.getState().search("test")).rejects.toThrow();

    expect(useSearchStore.getState().loading).toBe(false);
  });

  it("search handles network errors", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    await expect(useSearchStore.getState().search("test")).rejects.toThrow();

    expect(useSearchStore.getState().loading).toBe(false);
  });

  // Edge case: Malformed JSON response
  it("search handles malformed JSON response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.reject(new SyntaxError("Unexpected token")),
    });

    await expect(useSearchStore.getState().search("test")).rejects.toThrow();
    expect(useSearchStore.getState().loading).toBe(false);
  });

  // Edge case: Rate limiting (429 status)
  it("search handles rate limiting", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: "Too Many Requests",
    });

    await expect(useSearchStore.getState().search("test")).rejects.toThrow();
    expect(useSearchStore.getState().loading).toBe(false);
  });

  // Edge case: Large data sets
  it("search handles large result sets", async () => {
    const largeResults = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      title: `Movie ${i}`,
      overview: `Overview ${i}`.repeat(10), // Large overview
    }));

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ results: largeResults }),
    });

    await useSearchStore.getState().search("large query");
    expect(useSearchStore.getState().results).toHaveLength(1000);
    expect(useSearchStore.getState().loading).toBe(false);
  });

  // Edge case: Empty query
  it("search handles empty query", async () => {
    const mockResponse = { results: [] };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    await useSearchStore.getState().search("");
    expect(useSearchStore.getState().results).toEqual([]);
  });

  // Edge case: Query with special characters
  it("search handles special characters in query", async () => {
    const mockResponse = { results: [] };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    await useSearchStore.getState().search("test & query < > \" '");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/tmdb/search?q=test%20%26%20query%20%3C%20%3E%20%22%20'&type=movie"
    );
  });
});

describe("Watched Store", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useWatchedStore.setState({
      items: [],
      loading: false,
    });
  });

  it("initializes with correct default state", () => {
    const state = useWatchedStore.getState();
    expect(state.items).toEqual([]);
    expect(state.loading).toBe(false);
  });

  it("fetchWatched fetches and updates items", async () => {
    const mockResponse = {
      items: [
        {
          id: 1,
          tmdbId: 123,
          type: "movie",
          watchedDate: "2023-01-01",
          rating: 8,
          notes: "Great movie",
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    await useWatchedStore.getState().fetchWatched();

    expect(mockFetch).toHaveBeenCalledWith("/api/watched?");
    expect(useWatchedStore.getState().items).toEqual(mockResponse.items);
    expect(useWatchedStore.getState().loading).toBe(false);
  });

  it("fetchWatched handles filters correctly", async () => {
    const mockResponse = { items: [] };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    await useWatchedStore.getState().fetchWatched({
      search: "test",
      dateFrom: "2023-01-01",
      dateTo: "2023-12-31",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/watched?search=test&dateFrom=2023-01-01&dateTo=2023-12-31"
    );
  });

  it("addWatched adds item successfully", async () => {
    const newItem = {
      userId: "user-1",
      tmdbId: 123,
      type: "movie" as const,
      watchedDate: "2023-01-01",
      rating: 8,
      notes: "Great movie",
    };

    const mockResponse = { item: { ...newItem, id: 1 } };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    await useWatchedStore.getState().addWatched(newItem);

    expect(mockFetch).toHaveBeenCalledWith("/api/watched", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });
    expect(useWatchedStore.getState().items).toContain(mockResponse.item);
    expect(useWatchedStore.getState().loading).toBe(false);
  });

  it("updateWatched updates item successfully", async () => {
    useWatchedStore.setState({
      items: [
        {
          id: 1,
          userId: "user-1",
          tmdbId: 123,
          type: "movie" as const,
          watchedDate: "2023-01-01",
          rating: 8,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });

    const updates = { rating: 9, notes: "Updated notes" };
    const mockResponse = {
      item: {
        id: 1,
        tmdbId: 123,
        type: "movie",
        watchedDate: "2023-01-01",
        rating: 9,
        notes: "Updated notes",
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    await useWatchedStore.getState().updateWatched(1, updates);

    expect(mockFetch).toHaveBeenCalledWith("/api/watched/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    expect(useWatchedStore.getState().items[0]).toEqual(mockResponse.item);
  });

  it("deleteWatched removes item successfully", async () => {
    useWatchedStore.setState({
      items: [
        {
          id: 1,
          userId: "user-1",
          tmdbId: 123,
          type: "movie" as const,
          watchedDate: "2023-01-01",
          rating: 8,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
    });

    await useWatchedStore.getState().deleteWatched(1);

    expect(mockFetch).toHaveBeenCalledWith("/api/watched/1", {
      method: "DELETE",
    });
    expect(useWatchedStore.getState().items).toHaveLength(0);
  });

  it("handles API errors in watched operations", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: "Internal Server Error",
    });

    await expect(useWatchedStore.getState().fetchWatched()).rejects.toThrow();
    expect(useWatchedStore.getState().loading).toBe(false);
  });

  // Edge case: Malformed response data
  it("fetchWatched handles malformed response data", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ items: "not an array" }),
    });

    await expect(useWatchedStore.getState().fetchWatched()).rejects.toThrow();
    expect(useWatchedStore.getState().loading).toBe(false);
  });

  // Edge case: Network timeout
  it("fetchWatched handles network timeout", async () => {
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Network timeout")), 100)
        )
    );

    const promise = useWatchedStore.getState().fetchWatched();
    jest.advanceTimersByTime(100);
    await expect(promise).rejects.toThrow("Network timeout");
    expect(useWatchedStore.getState().loading).toBe(false);
  });

  // Edge case: Large dataset
  it("fetchWatched handles large datasets", async () => {
    const largeItems = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      tmdbId: i + 1000,
      type: "movie" as const,
      watchedDate: "2023-01-01",
      rating: 8,
      notes: `Note ${i}`.repeat(5), // Large notes
    }));

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ items: largeItems }),
    });

    await useWatchedStore.getState().fetchWatched();
    expect(useWatchedStore.getState().items).toHaveLength(10000);
  });

  // Edge case: Concurrent operations
  it("handles concurrent fetchWatched calls", async () => {
    const mockResponse1 = {
      items: [
        {
          id: 1,
          tmdbId: 123,
          type: "movie" as const,
          watchedDate: "2023-01-01",
          rating: 8,
        },
      ],
    };
    const mockResponse2 = {
      items: [
        {
          id: 2,
          tmdbId: 456,
          type: "tv" as const,
          watchedDate: "2023-01-02",
          rating: 9,
        },
      ],
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse1),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse2),
      });

    const promise1 = useWatchedStore.getState().fetchWatched();
    const promise2 = useWatchedStore.getState().fetchWatched();

    await Promise.all([promise1, promise2]);
    // Should handle concurrent calls without race conditions
    expect(useWatchedStore.getState().items).toHaveLength(1); // Last call wins
  });

  // Edge case: Boundary conditions - empty results
  it("fetchWatched handles empty results", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ items: [] }),
    });

    await useWatchedStore.getState().fetchWatched();
    expect(useWatchedStore.getState().items).toEqual([]);
  });

  // Edge case: Invalid filter parameters
  it("fetchWatched handles invalid filter parameters", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ items: [] }),
    });

    await useWatchedStore.getState().fetchWatched({
      search: "",
      dateFrom: "invalid-date",
      dateTo: "2023-12-31",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/watched?dateFrom=invalid-date&dateTo=2023-12-31"
    );
  });

  // Edge case: addWatched with malformed data
  it("addWatched handles malformed input data", async () => {
    const malformedItem = {
      userId: null, // Invalid
      tmdbId: "not-a-number", // Invalid
      type: "invalid-type", // Invalid
      watchedDate: "not-a-date", // Invalid
      rating: 15, // Out of range
      notes: null,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ item: { ...malformedItem, id: 1 } }),
    });

    await useWatchedStore.getState().addWatched(malformedItem as any);
    expect(useWatchedStore.getState().items).toContainEqual({
      ...malformedItem,
      id: 1,
    });
  });

  // Edge case: updateWatched with non-existent item
  it("updateWatched handles non-existent item", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });

    await expect(
      useWatchedStore.getState().updateWatched(999, { rating: 9 })
    ).rejects.toThrow();
  });

  // Edge case: deleteWatched with invalid ID
  it("deleteWatched handles invalid ID", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: "Bad Request",
    });

    await expect(
      useWatchedStore.getState().deleteWatched(-1)
    ).rejects.toThrow();
  });
});

describe("Watchlist Store", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useWatchlistStore.setState({
      items: [],
      loading: false,
    });
  });

  it("initializes with correct default state", () => {
    const state = useWatchlistStore.getState();
    expect(state.items).toEqual([]);
    expect(state.loading).toBe(false);
  });

  it("fetchWatchlist fetches and updates items", async () => {
    const mockResponse = {
      items: [
        {
          id: 1,
          tmdbId: 456,
          type: "tv",
          addedDate: "2023-01-01",
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    await useWatchlistStore.getState().fetchWatchlist();

    expect(mockFetch).toHaveBeenCalledWith("/api/watchlist");
    expect(useWatchlistStore.getState().items).toEqual(mockResponse.items);
  });

  it("addToWatchlist adds item successfully", async () => {
    const newItem = {
      userId: "user-1",
      tmdbId: 456,
      type: "tv" as const,
      addedDate: "2023-01-01",
    };

    const mockResponse = { item: { ...newItem, id: 1 } };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    await useWatchlistStore.getState().addToWatchlist(newItem);

    expect(mockFetch).toHaveBeenCalledWith("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });
    expect(useWatchlistStore.getState().items).toContain(mockResponse.item);
  });

  it("removeFromWatchlist removes item successfully", async () => {
    useWatchlistStore.setState({
      items: [
        {
          id: 1,
          userId: "user-1",
          tmdbId: 456,
          type: "tv" as const,
          addedDate: "2023-01-01",
        },
      ],
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
    });

    await useWatchlistStore.getState().removeFromWatchlist(1);

    expect(mockFetch).toHaveBeenCalledWith("/api/watchlist/1", {
      method: "DELETE",
    });
    expect(useWatchlistStore.getState().items).toHaveLength(0);
  });

  // Edge case: fetchWatchlist with network failure
  it("fetchWatchlist handles network failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    await expect(
      useWatchlistStore.getState().fetchWatchlist()
    ).rejects.toThrow();
    expect(useWatchlistStore.getState().loading).toBe(false);
  });

  // Edge case: fetchWatchlist with malformed response
  it("fetchWatchlist handles malformed response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ items: null }),
    });

    await expect(
      useWatchlistStore.getState().fetchWatchlist()
    ).rejects.toThrow();
  });

  // Edge case: Large watchlist dataset
  it("fetchWatchlist handles large datasets", async () => {
    const largeItems = Array.from({ length: 5000 }, (_, i) => ({
      id: i,
      tmdbId: i + 2000,
      type: i % 2 === 0 ? ("movie" as const) : ("tv" as const),
      addedDate: "2023-01-01",
    }));

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ items: largeItems }),
    });

    await useWatchlistStore.getState().fetchWatchlist();
    expect(useWatchlistStore.getState().items).toHaveLength(5000);
  });

  // Edge case: addToWatchlist with duplicate items
  it("addToWatchlist handles duplicate items", async () => {
    useWatchlistStore.setState({
      items: [
        {
          id: 1,
          userId: "user-1",
          tmdbId: 456,
          type: "tv" as const,
          addedDate: "2023-01-01",
        },
      ],
    });

    const duplicateItem = {
      userId: "user-1",
      tmdbId: 456, // Same tmdbId
      type: "tv" as const,
      addedDate: "2023-01-02",
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ item: { ...duplicateItem, id: 2 } }),
    });

    await useWatchlistStore.getState().addToWatchlist(duplicateItem);
    expect(useWatchlistStore.getState().items).toHaveLength(2); // Allows duplicates
  });

  // Edge case: removeFromWatchlist with non-existent item
  it("removeFromWatchlist handles non-existent item", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });

    await expect(
      useWatchlistStore.getState().removeFromWatchlist(999)
    ).rejects.toThrow();
  });

  // Edge case: Concurrent watchlist operations
  it("handles concurrent watchlist operations", async () => {
    const item1 = {
      userId: "user-1",
      tmdbId: 100,
      type: "movie" as const,
      addedDate: "2023-01-01",
    };
    const item2 = {
      userId: "user-1",
      tmdbId: 200,
      type: "tv" as const,
      addedDate: "2023-01-02",
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ item: { ...item1, id: 1 } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ item: { ...item2, id: 2 } }),
      });

    const promise1 = useWatchlistStore.getState().addToWatchlist(item1);
    const promise2 = useWatchlistStore.getState().addToWatchlist(item2);

    await Promise.all([promise1, promise2]);
    expect(useWatchlistStore.getState().items).toHaveLength(2);
  });
});

describe("User Store", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useUserStore.setState({
      user: null,
      loading: false,
    });
  });

  it("initializes with correct default state", () => {
    const state = useUserStore.getState();
    expect(state.user).toBeNull();
    expect(state.loading).toBe(false);
  });

  it("setUser updates user correctly", () => {
    const user = {
      id: "1",
      email: "test@example.com",
      emailVerified: null,
      name: "Test User",
      image: null,
      password: null,
      createdAt: new Date(),
    };
    useUserStore.getState().setUser(user);
    expect(useUserStore.getState().user).toEqual(user);
  });

  it("setLoading updates loading state", () => {
    useUserStore.getState().setLoading(true);
    expect(useUserStore.getState().loading).toBe(true);
  });

  it("handles null user", () => {
    useUserStore.getState().setUser(null);
    expect(useUserStore.getState().user).toBeNull();
  });

  // Edge case: User with malformed data
  it("setUser handles malformed user data", () => {
    const malformedUser = {
      id: "123", // Correct type
      email: "invalid-email", // Invalid email format
      emailVerified: new Date("invalid"), // Invalid date
      name: null, // Should be string
      image: undefined, // Should be string or null
      password: "plaintext", // Should not be exposed
      createdAt: new Date("invalid"), // Invalid date
    };

    useUserStore.getState().setUser(malformedUser as any);
    expect(useUserStore.getState().user).toEqual(malformedUser);
  });

  // Edge case: User with extremely long fields
  it("setUser handles user with large data fields", () => {
    const largeUser = {
      id: "user-1",
      email: "a".repeat(1000) + "@example.com", // Very long email
      emailVerified: null,
      name: "Name".repeat(1000), // Very long name
      image: "data:image/png;base64," + "A".repeat(100000), // Large base64 image
      password: null,
      createdAt: new Date(),
    };

    useUserStore.getState().setUser(largeUser);
    expect(useUserStore.getState().user).toEqual(largeUser);
  });

  // Edge case: User with special characters
  it("setUser handles user with special characters", () => {
    const specialUser = {
      id: "user-1",
      email: "test+tag@example.com",
      emailVerified: null,
      name: "User with émojis 🎉 and spëcial chärs",
      image: "https://example.com/image?param=value&other=123",
      password: null,
      createdAt: new Date(),
    };

    useUserStore.getState().setUser(specialUser);
    expect(useUserStore.getState().user).toEqual(specialUser);
  });

  // Edge case: Concurrent user updates
  it("handles concurrent user updates", () => {
    const user1 = {
      id: "1",
      email: "user1@example.com",
      emailVerified: null,
      name: "User 1",
      image: null,
      password: null,
      createdAt: new Date(),
    };
    const user2 = {
      id: "2",
      email: "user2@example.com",
      emailVerified: new Date(),
      name: "User 2",
      image: "image.jpg",
      password: null,
      createdAt: new Date(),
    };

    useUserStore.getState().setUser(user1);
    useUserStore.getState().setUser(user2);

    expect(useUserStore.getState().user).toEqual(user2); // Last update wins
  });

  // Edge case: User with missing required fields
  it("setUser handles user with missing fields", () => {
    const incompleteUser = {
      id: "user-1",
      // Missing email, name, etc.
    };

    useUserStore.getState().setUser(incompleteUser as any);
    expect(useUserStore.getState().user).toEqual(incompleteUser);
  });
});

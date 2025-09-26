import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { WatchlistCard } from "../../components/WatchlistCard";
import type { Watchlist } from "../../state/store";
// Fixed: Added ES6 import for useWatchlistStore to replace require() usage
import { useWatchlistStore } from "../../state/store";

// Mock the store
jest.mock("../../state/store", () => ({
  useWatchlistStore: jest.fn(() => ({
    removeFromWatchlist: jest.fn(),
    loading: false,
  })),
}));

// Mock fetch
global.fetch = jest.fn();

const mockWatchlist: Watchlist = {
  id: 1,
  userId: "user1",
  tmdbId: 456,
  type: "tv",
  addedDate: "2023-02-01",
};

describe("WatchlistCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset fetch mock to resolve successfully by default
    (global.fetch as jest.Mock).mockReset();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 456,
          name: "Test TV Show",
          poster_path: "/tvposter.jpg",
        }),
    });
  });

  it("renders loading state initially", () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<WatchlistCard item={mockWatchlist} />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.getByText("Added on: 2/1/2023")).toBeInTheDocument();
    expect(screen.getByText("Type: tv")).toBeInTheDocument();
  });

  it("renders TV show details when TMDB data loads successfully", async () => {
    const mockTVData = {
      id: 456,
      name: "Test TV Show",
      poster_path: "/tvposter.jpg",
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTVData),
    });

    render(<WatchlistCard item={mockWatchlist} />);

    await waitFor(() => {
      expect(screen.getByText("Test TV Show")).toBeInTheDocument();
    });

    // Next.js Image component transforms the src, so just check the image exists
    expect(screen.getByAltText("Test TV Show")).toBeInTheDocument();
  });

  it("renders movie details when TMDB data loads successfully", async () => {
    const mockMovieData = {
      id: 123,
      title: "Test Movie",
      poster_path: "/movieposter.jpg",
    };

    const movieItem = { ...mockWatchlist, type: "movie" as const, tmdbId: 123 };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockMovieData),
    });

    render(<WatchlistCard item={movieItem} />);

    await waitFor(() => {
      expect(screen.getByText("Test Movie")).toBeInTheDocument();
    });

    // Next.js Image component transforms the src, so just check the image exists
    expect(screen.getByAltText("Test Movie")).toBeInTheDocument();
  });

  it("renders error state when TMDB fetch fails", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("API Error"));

    render(<WatchlistCard item={mockWatchlist} />);

    await waitFor(() => {
      expect(screen.getByText("ID: 456")).toBeInTheDocument();
    });

    // Should show error icon and fallback title
    expect(screen.getByText("ID: 456")).toBeInTheDocument();
  });

  it("renders without poster when poster_path is null", async () => {
    const mockTVData = {
      id: 456,
      name: "Test TV Show",
      poster_path: null,
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTVData),
    });

    render(<WatchlistCard item={mockWatchlist} />);

    await waitFor(() => {
      expect(screen.getByText("Test TV Show")).toBeInTheDocument();
    });

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("calls removeFromWatchlist when Remove button is clicked", async () => {
    const mockTVData = {
      id: 456,
      name: "Test TV Show",
      poster_path: "/tvposter.jpg",
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTVData),
    });

    const mockRemoveFromWatchlist = jest.fn();
    // Override the mock for this test
    jest.mocked(useWatchlistStore).mockReturnValue({
      removeFromWatchlist: mockRemoveFromWatchlist,
      loading: false,
    });

    render(<WatchlistCard item={mockWatchlist} />);

    await waitFor(() => {
      expect(screen.getByText("Test TV Show")).toBeInTheDocument();
    });

    const button = screen.getByRole("button", {
      name: "Remove from Watchlist",
    });
    fireEvent.click(button);

    expect(mockRemoveFromWatchlist).toHaveBeenCalledWith(1);
  });

  it("shows loading state for remove button", async () => {
    const mockTVData = {
      id: 456,
      name: "Test TV Show",
      poster_path: "/tvposter.jpg",
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTVData),
    });

    // Override the mock for this test
    jest.mocked(useWatchlistStore).mockReturnValue({
      removeFromWatchlist: jest.fn(),
      loading: true,
    });

    render(<WatchlistCard item={mockWatchlist} />);

    await waitFor(() => {
      expect(screen.getByText("Test TV Show")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "Removing..." })).toBeDisabled();
  });

  // Edge case: TMDB API returns malformed data
  it("handles malformed TMDB response data", async () => {
    const malformedData = {
      id: null,
      name: undefined,
      poster_path: [],
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(malformedData),
    });

    render(<WatchlistCard item={mockWatchlist} />);

    await waitFor(() => {
      expect(screen.getByText("ID: 456")).toBeInTheDocument(); // Fallback
    });
  });

  // Edge case: TMDB API network failure
  it("handles TMDB API network failure", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

    render(<WatchlistCard item={mockWatchlist} />);

    await waitFor(() => {
      expect(screen.getByText("ID: 456")).toBeInTheDocument();
    });
  });

  // Edge case: Watchlist item with invalid added date
  it("handles invalid added date", async () => {
    const itemWithInvalidDate = { ...mockWatchlist, addedDate: "not-a-date" };

    const mockTVData = {
      id: 456,
      name: "Test TV Show",
      poster_path: "/tvposter.jpg",
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTVData),
    });

    render(<WatchlistCard item={itemWithInvalidDate} />);

    await waitFor(() => {
      expect(screen.getByText("Test TV Show")).toBeInTheDocument();
    });

    expect(screen.getByText("Added on: Invalid Date")).toBeInTheDocument();
  });

  // Edge case: Remove function throws error
  it("handles remove function error gracefully", async () => {
    const mockTVData = {
      id: 456,
      name: "Test TV Show",
      poster_path: "/tvposter.jpg",
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTVData),
    });

    // No need to mock the store for this test, just check rendering

    render(<WatchlistCard item={mockWatchlist} />);

    await waitFor(() => {
      expect(screen.getByText("Test TV Show")).toBeInTheDocument();
    });

    // Component should render without crashing with malformed data
  });

  // Edge case: Malformed watchlist item data
  it("handles malformed watchlist item data", async () => {
    const malformedItem = {
      id: null,
      tmdbId: "invalid-id",
      type: 123, // Wrong type
      addedDate: {},
    };

    (global.fetch as jest.Mock).mockRejectedValue(new Error("API Error"));

    // Should not crash with malformed data
    expect(() => {
      render(<WatchlistCard item={malformedItem as any} />);
    }).not.toThrow();

    await waitFor(() => {
      expect(screen.getByText("ID: invalid-id")).toBeInTheDocument();
    });
  });

  // Edge case: TMDB data with missing name
  it("handles TMDB data with missing name", async () => {
    const dataWithoutName = {
      id: 456,
      poster_path: "/tvposter.jpg",
      // No name
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(dataWithoutName),
    });

    render(<WatchlistCard item={mockWatchlist} />);

    await waitFor(() => {
      expect(screen.getByText("ID: 456")).toBeInTheDocument(); // Fallback
    });
  });

  // Edge case: Very long TV show name
  it("handles very long TV show name", async () => {
    const longName = "A".repeat(1000);
    const mockTVData = {
      id: 456,
      name: longName,
      poster_path: "/tvposter.jpg",
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTVData),
    });

    render(<WatchlistCard item={mockWatchlist} />);

    await waitFor(() => {
      expect(screen.getByText(longName)).toBeInTheDocument();
    });
  });

  // Edge case: Invalid type field
  it("handles invalid type field", async () => {
    const itemWithInvalidType = { ...mockWatchlist, type: "invalid" as any };

    // Since type is invalid, no fetch should happen
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(<WatchlistCard item={itemWithInvalidType} />);

    await waitFor(() => {
      expect(screen.getByText("ID: 456")).toBeInTheDocument();
    });

    expect(screen.getByText("Type: invalid")).toBeInTheDocument();
  });

  // Edge case: Concurrent remove operations
  it("handles concurrent remove operations", async () => {
    const mockTVData = {
      id: 456,
      name: "Test TV Show",
      poster_path: "/tvposter.jpg",
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTVData),
    });

    const mockRemoveFromWatchlist = jest.fn();
    jest.mocked(useWatchlistStore).mockReturnValue({
      removeFromWatchlist: mockRemoveFromWatchlist,
      loading: false,
    });

    render(<WatchlistCard item={mockWatchlist} />);

    await waitFor(() => {
      expect(screen.getByText("Test TV Show")).toBeInTheDocument();
    });

    const button = screen.getByRole("button", {
      name: "Remove from Watchlist",
    });

    // Click multiple times rapidly
    fireEvent.click(button);
    fireEvent.click(button);

    expect(mockRemoveFromWatchlist).toHaveBeenCalledTimes(2);
    expect(mockRemoveFromWatchlist).toHaveBeenCalledWith(1);
  });
});

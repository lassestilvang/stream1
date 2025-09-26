import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { WatchlistCard } from "../../components/WatchlistCard";
import type { Watchlist } from "../../state/store";
// Fixed: Added ES6 import for useWatchlistStore to replace require() usage
import { useWatchlistStore } from "../../state/store";
import { getMovieDetails, getTVShowDetails } from "../../lib/tmdb";

// Mock the store
jest.mock("../../state/store", () => ({
  useWatchlistStore: () => ({
    removeFromWatchlist: jest.fn(),
    loading: false,
  }),
}));

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
  });

  it("renders loading state initially", () => {
    (getTVShowDetails as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    ); // Never resolves

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

    (getTVShowDetails as jest.Mock).mockResolvedValue(mockTVData);

    render(<WatchlistCard item={mockWatchlist} />);

    await waitFor(() => {
      expect(screen.getByText("Test TV Show")).toBeInTheDocument();
    });

    expect(screen.getByAltText("Test TV Show")).toHaveAttribute(
      "src",
      "https://image.tmdb.org/t/p/w500/tvposter.jpg"
    );
  });

  it("renders movie details when TMDB data loads successfully", async () => {
    const mockMovieData = {
      id: 123,
      title: "Test Movie",
      poster_path: "/movieposter.jpg",
    };

    const movieItem = { ...mockWatchlist, type: "movie" as const, tmdbId: 123 };
    (getMovieDetails as jest.Mock).mockResolvedValue(mockMovieData);

    render(<WatchlistCard item={movieItem} />);

    await waitFor(() => {
      expect(screen.getByText("Test Movie")).toBeInTheDocument();
    });

    expect(screen.getByAltText("Test Movie")).toHaveAttribute(
      "src",
      "https://image.tmdb.org/t/p/w500/movieposter.jpg"
    );
  });

  it("renders error state when TMDB fetch fails", async () => {
    (getTVShowDetails as jest.Mock).mockRejectedValue(new Error("API Error"));

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

    (getTVShowDetails as jest.Mock).mockResolvedValue(mockTVData);

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

    (getTVShowDetails as jest.Mock).mockResolvedValue(mockTVData);

    const mockRemoveFromWatchlist = jest.fn();
    // Fixed: Replaced require() style import with ES6 import for consistency
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

    (getTVShowDetails as jest.Mock).mockResolvedValue(mockTVData);

    // Fixed: Replaced require() style import with ES6 import for consistency
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
});

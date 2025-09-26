import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { WatchedCard } from "../../components/WatchedCard";
import type { Watched } from "../../state/store";
// Fixed: Added ES6 import for useWatchedStore to replace require() usage
import { useWatchedStore } from "../../state/store";
import { getMovieDetails, getTVShowDetails } from "../../lib/tmdb";

// Mock Next.js Link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// Mock the store
jest.mock("../../state/store", () => ({
  useWatchedStore: () => ({
    deleteWatched: jest.fn(),
    loading: false,
  }),
}));

const mockWatched: Watched = {
  id: 1,
  createdAt: new Date(),
  userId: "user1",
  tmdbId: 123,
  type: "movie",
  watchedDate: "2023-01-01",
  rating: 8,
  notes: "Great movie",
  updatedAt: new Date(),
};

describe("WatchedCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state initially", () => {
    (getMovieDetails as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    ); // Never resolves

    render(<WatchedCard item={mockWatched} />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.getByText("Watched on: 1/1/2023")).toBeInTheDocument();
    expect(screen.getByText("Rating: 8/10")).toBeInTheDocument();
    expect(screen.getByText("Notes: Great movie")).toBeInTheDocument();
  });

  it("renders movie details when TMDB data loads successfully", async () => {
    const mockMovieData = {
      id: 123,
      title: "Test Movie",
      poster_path: "/poster.jpg",
    };

    (getMovieDetails as jest.Mock).mockResolvedValue(mockMovieData);

    render(<WatchedCard item={mockWatched} />);

    await waitFor(() => {
      expect(screen.getByText("Test Movie")).toBeInTheDocument();
    });

    expect(screen.getByAltText("Test Movie")).toHaveAttribute(
      "src",
      "https://image.tmdb.org/t/p/w500/poster.jpg"
    );
  });

  it("renders TV show details when TMDB data loads successfully", async () => {
    const mockTVData = {
      id: 456,
      name: "Test TV Show",
      poster_path: "/tvposter.jpg",
    };

    const tvItem = { ...mockWatched, type: "tv" as const, tmdbId: 456 };
    (getTVShowDetails as jest.Mock).mockResolvedValue(mockTVData);

    render(<WatchedCard item={tvItem} />);

    await waitFor(() => {
      expect(screen.getByText("Test TV Show")).toBeInTheDocument();
    });

    expect(screen.getByAltText("Test TV Show")).toHaveAttribute(
      "src",
      "https://image.tmdb.org/t/p/w500/tvposter.jpg"
    );
  });

  it("renders error state when TMDB fetch fails", async () => {
    (getMovieDetails as jest.Mock).mockRejectedValue(new Error("API Error"));

    render(<WatchedCard item={mockWatched} />);

    await waitFor(() => {
      expect(screen.getByText("ID: 123")).toBeInTheDocument();
    });

    // Should show error icon and fallback title
    expect(screen.getByText("ID: 123")).toBeInTheDocument();
  });

  it("renders without poster when poster_path is null", async () => {
    const mockMovieData = {
      id: 123,
      title: "Test Movie",
      poster_path: null,
    };

    (getMovieDetails as jest.Mock).mockResolvedValue(mockMovieData);

    render(<WatchedCard item={mockWatched} />);

    await waitFor(() => {
      expect(screen.getByText("Test Movie")).toBeInTheDocument();
    });

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders without notes when not provided", async () => {
    const mockMovieData = {
      id: 123,
      title: "Test Movie",
      poster_path: "/poster.jpg",
    };

    (getMovieDetails as jest.Mock).mockResolvedValue(mockMovieData);

    const itemWithoutNotes = { ...mockWatched, notes: "" };
    render(<WatchedCard item={itemWithoutNotes} />);

    await waitFor(() => {
      expect(screen.getByText("Test Movie")).toBeInTheDocument();
    });

    expect(screen.queryByText(/Notes:/)).not.toBeInTheDocument();
  });

  it("calls deleteWatched when Delete button is clicked", async () => {
    const mockMovieData = {
      id: 123,
      title: "Test Movie",
      poster_path: "/poster.jpg",
    };

    (getMovieDetails as jest.Mock).mockResolvedValue(mockMovieData);

    const mockDeleteWatched = jest.fn();
    // Fixed: Replaced require() style import with ES6 import for consistency
    jest.mocked(useWatchedStore).mockReturnValue({
      deleteWatched: mockDeleteWatched,
      loading: false,
    });

    render(<WatchedCard item={mockWatched} />);

    await waitFor(() => {
      expect(screen.getByText("Test Movie")).toBeInTheDocument();
    });

    const button = screen.getByRole("button", { name: "Delete" });
    fireEvent.click(button);

    expect(mockDeleteWatched).toHaveBeenCalledWith(1);
  });

  it("shows loading state for delete button", async () => {
    const mockMovieData = {
      id: 123,
      title: "Test Movie",
      poster_path: "/poster.jpg",
    };

    (getMovieDetails as jest.Mock).mockResolvedValue(mockMovieData);

    // Fixed: Replaced require() style import with ES6 import for consistency
    jest.mocked(useWatchedStore).mockReturnValue({
      deleteWatched: jest.fn(),
      loading: true,
    });

    render(<WatchedCard item={mockWatched} />);

    await waitFor(() => {
      expect(screen.getByText("Test Movie")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "Deleting..." })).toBeDisabled();
  });

  it("has correct link to edit page", async () => {
    const mockMovieData = {
      id: 123,
      title: "Test Movie",
      poster_path: "/poster.jpg",
    };

    (getMovieDetails as jest.Mock).mockResolvedValue(mockMovieData);

    render(<WatchedCard item={mockWatched} />);

    await waitFor(() => {
      expect(screen.getByText("Test Movie")).toBeInTheDocument();
    });

    const link = screen.getByRole("link", { name: "Edit" });
    expect(link).toHaveAttribute("href", "/watched/1");
  });
});

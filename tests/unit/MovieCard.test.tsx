import { render, screen, fireEvent } from "@testing-library/react";
import { MovieCard } from "../../components/MovieCard";
import type { Movie, TVShow } from "../../lib/tmdb";
import { useWatchedStore, useWatchlistStore } from "../../state/store";

// Mock the stores
jest.mock("../../state/store", () => ({
  useWatchedStore: jest.fn(),
  useWatchlistStore: jest.fn(),
}));

const mockMovie: Movie = {
  id: 1,
  title: "Test Movie",
  overview: "A test movie overview",
  release_date: "2023-01-01",
  poster_path: "/test-poster.jpg",
  backdrop_path: "/test-backdrop.jpg",
  vote_average: 8.5,
  vote_count: 100,
  genre_ids: [1, 2],
  adult: false,
  original_language: "en",
  original_title: "Test Movie",
  popularity: 10,
  video: false,
};

const mockTVShow: TVShow = {
  id: 2,
  name: "Test TV Show",
  overview: "A test TV show overview",
  first_air_date: "2023-01-01",
  poster_path: "/test-poster.jpg",
  backdrop_path: "/test-backdrop.jpg",
  vote_average: 8.0,
  vote_count: 50,
  genre_ids: [3, 4],
  adult: false,
  original_language: "en",
  original_name: "Test TV Show",
  popularity: 5,
  origin_country: ["US"],
};

describe("MovieCard", () => {
  it("renders movie correctly", () => {
    render(<MovieCard item={mockMovie} />);

    expect(screen.getByText("Test Movie")).toBeInTheDocument();
    expect(screen.getByText("2023")).toBeInTheDocument();
    expect(screen.getByText("A test movie overview")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add to Watched" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add to Watchlist" })
    ).toBeInTheDocument();
  });

  it("renders TV show correctly", () => {
    render(<MovieCard item={mockTVShow} />);

    expect(screen.getByText("Test TV Show")).toBeInTheDocument();
    expect(screen.getByText("2023")).toBeInTheDocument();
    expect(screen.getByText("A test TV show overview")).toBeInTheDocument();
  });

  it("displays placeholder poster when no poster_path", () => {
    const itemWithoutPoster = { ...mockMovie, poster_path: undefined };
    render(<MovieCard item={itemWithoutPoster} />);

    const img = screen.getByAltText("Test Movie");
    expect(img).toHaveAttribute("src", "/placeholder-poster.jpg");
  });

  it("calls addWatched when Add to Watched button is clicked", () => {
    const mockAddWatched = jest.fn();
    jest.mocked(useWatchedStore).mockReturnValue({
      addWatched: mockAddWatched,
      loading: false,
    });

    render(<MovieCard item={mockMovie} />);

    const button = screen.getByRole("button", { name: "Add to Watched" });
    fireEvent.click(button);

    expect(mockAddWatched).toHaveBeenCalledWith({
      userId: "current-user",
      tmdbId: 1,
      type: "movie",
      watchedDate: expect.any(String),
      rating: 0,
      notes: "",
    });
  });

  it("calls addToWatchlist when Add to Watchlist button is clicked", () => {
    const mockAddToWatchlist = jest.fn();
    jest.mocked(useWatchlistStore).mockReturnValue({
      addToWatchlist: mockAddToWatchlist,
      loading: false,
    });

    render(<MovieCard item={mockTVShow} />);

    const button = screen.getByRole("button", { name: "Add to Watchlist" });
    fireEvent.click(button);

    expect(mockAddToWatchlist).toHaveBeenCalledWith({
      userId: "current-user",
      tmdbId: 2,
      type: "tv",
      addedDate: expect.any(String),
    });
  });

  it("shows loading state for watched button", () => {
    jest.mocked(useWatchedStore).mockReturnValue({
      addWatched: jest.fn(),
      loading: true,
    });

    render(<MovieCard item={mockMovie} />);

    expect(screen.getByRole("button", { name: "Adding..." })).toBeDisabled();
  });

  it("shows loading state for watchlist button", () => {
    jest.mocked(useWatchlistStore).mockReturnValue({
      addToWatchlist: jest.fn(),
      loading: true,
    });

    render(<MovieCard item={mockMovie} />);

    expect(screen.getByRole("button", { name: "Adding..." })).toBeDisabled();
  });
});

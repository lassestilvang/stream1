import { render, screen, fireEvent } from "@testing-library/react";
import { SearchBar } from "../../components/SearchBar";
import { useSearchStore } from "../../state/store";

// Mock the store
jest.mock("../../state/store", () => ({
  useSearchStore: jest.fn(),
}));

describe("SearchBar", () => {
  it("renders input, select, and button", () => {
    render(<SearchBar />);

    expect(
      screen.getByPlaceholderText("Search for movies or TV shows...")
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
  });

  it("updates query on input change", () => {
    render(<SearchBar />);

    const input = screen.getByPlaceholderText(
      "Search for movies or TV shows..."
    );
    fireEvent.change(input, { target: { value: "test query" } });

    expect(input).toHaveValue("test query");
  });

  it("updates type on select change", () => {
    render(<SearchBar />);

    const select = screen.getByRole("combobox");
    fireEvent.click(select);
    fireEvent.click(screen.getByText("TV Show"));

    expect(select).toHaveTextContent("TV Show");
  });

  it("calls search when button is clicked with valid query", () => {
    const mockSearch = jest.fn();
    // Fixed: Replaced require() style import with ES6 import for consistency
    jest.mocked(useSearchStore).mockReturnValue({
      search: mockSearch,
      loading: false,
    });

    render(<SearchBar />);

    const input = screen.getByPlaceholderText(
      "Search for movies or TV shows..."
    );
    const button = screen.getByRole("button", { name: "Search" });

    fireEvent.change(input, { target: { value: "test query" } });
    fireEvent.click(button);

    expect(mockSearch).toHaveBeenCalledWith("test query");
  });

  it("does not call search when query is empty", () => {
    const mockSearch = jest.fn();
    // Fixed: Replaced require() style import with ES6 import for consistency
    jest.mocked(useSearchStore).mockReturnValue({
      search: mockSearch,
      loading: false,
    });

    render(<SearchBar />);

    const button = screen.getByRole("button", { name: "Search" });
    fireEvent.click(button);

    expect(mockSearch).not.toHaveBeenCalled();
  });

  it("shows loading state", () => {
    // Fixed: Replaced require() style import with ES6 import for consistency
    jest.mocked(useSearchStore).mockReturnValue({
      search: jest.fn(),
      loading: true,
    });

    render(<SearchBar />);

    expect(screen.getByRole("button", { name: "Searching..." })).toBeDisabled();
  });
});

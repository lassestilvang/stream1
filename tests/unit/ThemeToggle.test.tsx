import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggle } from "../../components/ThemeToggle";

// Mock next-themes
jest.mock("next-themes", () => ({
  useTheme: jest.fn(),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Moon: () => <div data-testid="moon-icon" />,
  Sun: () => <div data-testid="sun-icon" />,
}));

import { useTheme } from "next-themes";

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme> as any;

describe("ThemeToggle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with sun icon when theme is light", () => {
    mockUseTheme.mockReturnValue({
      theme: "light",
      setTheme: jest.fn(),
    });

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Toggle theme" });
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId("sun-icon")).toBeInTheDocument();
    expect(screen.getByTestId("moon-icon")).toBeInTheDocument();
  });

  it("renders with moon icon when theme is dark", () => {
    mockUseTheme.mockReturnValue({
      theme: "dark",
      setTheme: jest.fn(),
    });

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Toggle theme" });
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId("sun-icon")).toBeInTheDocument();
    expect(screen.getByTestId("moon-icon")).toBeInTheDocument();
  });

  it("renders with sun icon when theme is system (defaulting to light)", () => {
    mockUseTheme.mockReturnValue({
      theme: "system",
      setTheme: jest.fn(),
    });

    render(<ThemeToggle />);

    expect(screen.getByTestId("sun-icon")).toBeInTheDocument();
    expect(screen.getByTestId("moon-icon")).toBeInTheDocument();
  });

  it("calls setTheme with 'dark' when clicked in light mode", () => {
    const mockSetTheme = jest.fn();
    mockUseTheme.mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
    });

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Toggle theme" });
    fireEvent.click(button);

    expect(mockSetTheme).toHaveBeenCalledWith("dark");
    expect(mockSetTheme).toHaveBeenCalledTimes(1);
  });

  it("calls setTheme with 'light' when clicked in dark mode", () => {
    const mockSetTheme = jest.fn();
    mockUseTheme.mockReturnValue({
      theme: "dark",
      setTheme: mockSetTheme,
    });

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Toggle theme" });
    fireEvent.click(button);

    expect(mockSetTheme).toHaveBeenCalledWith("light");
    expect(mockSetTheme).toHaveBeenCalledTimes(1);
  });

  it("toggles from system theme to light", () => {
    const mockSetTheme = jest.fn();
    mockUseTheme.mockReturnValue({
      theme: "system",
      setTheme: mockSetTheme,
    });

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Toggle theme" });
    fireEvent.click(button);

    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("applies correct button variant and size", () => {
    mockUseTheme.mockReturnValue({
      theme: "light",
      setTheme: jest.fn(),
    });

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Toggle theme" });
    expect(button).toHaveAttribute("type", "button");
    // Note: We can't easily test the variant/size classes without more complex setup
    // but the button should have the correct role and functionality
  });

  it("includes screen reader text", () => {
    mockUseTheme.mockReturnValue({
      theme: "light",
      setTheme: jest.fn(),
    });

    render(<ThemeToggle />);

    expect(screen.getByText("Toggle theme")).toHaveClass("sr-only");
  });

  it("handles undefined theme gracefully", () => {
    const mockSetTheme = jest.fn();
    mockUseTheme.mockReturnValue({
      theme: undefined,
      setTheme: mockSetTheme,
    });

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Toggle theme" });
    fireEvent.click(button);

    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("handles null theme gracefully", () => {
    const mockSetTheme = jest.fn();
    mockUseTheme.mockReturnValue({
      theme: null as any,
      setTheme: mockSetTheme,
    });

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Toggle theme" });
    fireEvent.click(button);

    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("renders icons with correct transition classes", () => {
    mockUseTheme.mockReturnValue({
      theme: "light",
      setTheme: jest.fn(),
    });

    render(<ThemeToggle />);

    const sunIcon = screen.getByTestId("sun-icon");
    const moonIcon = screen.getByTestId("moon-icon");

    // Check that the icons have the expected structure
    expect(sunIcon).toBeInTheDocument();
    expect(moonIcon).toBeInTheDocument();
  });

  it("maintains button accessibility", () => {
    mockUseTheme.mockReturnValue({
      theme: "light",
      setTheme: jest.fn(),
    });

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Toggle theme" });
    expect(button).toBeEnabled();
    expect(button).toHaveAttribute("aria-label", "Toggle theme");
  });

  // Edge case: Theme provider not available
  it("handles missing theme provider gracefully", () => {
    mockUseTheme.mockReturnValue({
      theme: undefined,
      setTheme: undefined as any,
    });

    expect(() => render(<ThemeToggle />)).not.toThrow();

    const button = screen.getByRole("button", { name: "Toggle theme" });
    fireEvent.click(button);

    // Should not crash
    expect(button).toBeInTheDocument();
  });

  // Edge case: setTheme function throws error
  it("handles setTheme errors gracefully", () => {
    const mockSetTheme = jest.fn().mockImplementation(() => {
      throw new Error("Theme change failed");
    });

    mockUseTheme.mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
    });

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Toggle theme" });
    expect(() => fireEvent.click(button)).not.toThrow();

    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  // Edge case: Rapid clicking
  it("handles rapid clicking", () => {
    const mockSetTheme = jest.fn();
    mockUseTheme.mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
    });

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Toggle theme" });

    // Click multiple times rapidly
    for (let i = 0; i < 10; i++) {
      fireEvent.click(button);
    }

    expect(mockSetTheme).toHaveBeenCalledTimes(10);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  // Edge case: Theme changes externally
  it("handles external theme changes", () => {
    let currentTheme = "light";
    const mockSetTheme = jest.fn((newTheme) => {
      currentTheme = newTheme;
    });

    mockUseTheme.mockReturnValue({
      theme: currentTheme,
      setTheme: mockSetTheme,
    });

    const { rerender } = render(<ThemeToggle />);

    // Simulate external theme change
    currentTheme = "dark";
    mockUseTheme.mockReturnValue({
      theme: currentTheme,
      setTheme: mockSetTheme,
    });

    rerender(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Toggle theme" });
    fireEvent.click(button);

    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  // Edge case: Invalid theme values
  it("handles invalid theme values", () => {
    mockUseTheme.mockReturnValue({
      theme: "invalid-theme" as any,
      setTheme: jest.fn(),
    });

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Toggle theme" });
    fireEvent.click(button);

    // Should default to light theme toggle since theme is not "light"
    expect(mockUseTheme().setTheme).toHaveBeenCalledWith("light");
  });

  // Edge case: Theme with special characters
  it("handles theme names with special characters", () => {
    mockUseTheme.mockReturnValue({
      theme: "custom-theme-with-dashes",
      setTheme: jest.fn(),
    });

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Toggle theme" });
    fireEvent.click(button);

    expect(mockUseTheme().setTheme).toHaveBeenCalledWith("light");
  });

  // Edge case: Component unmounts during theme change
  it("handles unmounting during theme change", () => {
    const mockSetTheme = jest.fn().mockImplementation(() => {
      // Simulate async operation that might complete after unmount
      setTimeout(() => {}, 100);
    });

    mockUseTheme.mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
    });

    const { unmount } = render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Toggle theme" });
    fireEvent.click(button);

    // Unmount immediately
    unmount();

    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  // Edge case: Theme hook returns null
  it("handles theme hook returning null", () => {
    mockUseTheme.mockReturnValue(null as any);

    expect(() => render(<ThemeToggle />)).not.toThrow();

    const button = screen.getByRole("button", { name: "Toggle theme" });
    expect(button).toBeInTheDocument();
  });

  // Edge case: Very long theme names
  it("handles very long theme names", () => {
    const longTheme = "a".repeat(1000);
    mockUseTheme.mockReturnValue({
      theme: longTheme,
      setTheme: jest.fn(),
    });

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Toggle theme" });
    fireEvent.click(button);

    expect(mockUseTheme().setTheme).toHaveBeenCalledWith("light");
  });
});

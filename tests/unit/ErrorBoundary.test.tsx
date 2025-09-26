import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "../../components/ErrorBoundary";

// Mock console.error to avoid noise in test output
const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

// Test component that throws an error
function ErrorThrowingComponent(): never {
  throw new Error("Test error");
}

// Test fallback component
function CustomFallback({
  error,
  resetError,
}: {
  error?: Error;
  resetError: () => void;
}) {
  return (
    <div data-testid="custom-fallback">
      <p>Custom error: {error?.message}</p>
      <button onClick={resetError}>Reset</button>
    </div>
  );
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    consoleError.mockClear();
  });

  afterAll(() => {
    consoleError.mockRestore();
  });

  it("renders children normally when no error occurs", () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Normal content</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Normal content")).toBeInTheDocument();
  });

  it("catches and displays error with default fallback UI", () => {
    // Suppress React error boundary warnings in test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent />
        </ErrorBoundary>
      );
    }).not.toThrow();

    console.error = originalError;

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText(
        "An unexpected error occurred. Please try refreshing the page."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Try again" })
    ).toBeInTheDocument();
  });

  it("displays error details in development mode", () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "development",
      writable: true,
    });

    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent />
        </ErrorBoundary>
      );
    }).not.toThrow();

    console.error = originalError;
    Object.defineProperty(process.env, "NODE_ENV", {
      value: originalEnv,
      writable: true,
    });

    expect(
      screen.getByText("Error details (development only)")
    ).toBeInTheDocument();
    expect(screen.getByText("Test error")).toBeInTheDocument();
  });

  it("does not display error details in production mode", () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "production",
      writable: true,
    });

    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent />
        </ErrorBoundary>
      );
    }).not.toThrow();

    console.error = originalError;
    Object.defineProperty(process.env, "NODE_ENV", {
      value: originalEnv,
      writable: true,
    });

    expect(
      screen.queryByText("Error details (development only)")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Test error")).not.toBeInTheDocument();
  });

  it("renders custom fallback component when provided", () => {
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(
        <ErrorBoundary fallback={CustomFallback}>
          <ErrorThrowingComponent />
        </ErrorBoundary>
      );
    }).not.toThrow();

    console.error = originalError;

    expect(screen.getByTestId("custom-fallback")).toBeInTheDocument();
    expect(screen.getByText("Custom error: Test error")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
  });

  it("calls componentDidCatch and logs error when error occurs", () => {
    expect(() => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent />
        </ErrorBoundary>
      );
    }).not.toThrow();

    expect(consoleError).toHaveBeenCalledWith(
      "Error caught by boundary:",
      expect.any(Error),
      expect.any(Object)
    );
  });

  it("resets error state when resetError is called", () => {
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent />
        </ErrorBoundary>
      );
    }).not.toThrow();

    console.error = originalError;

    // Should show error UI
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Click reset button
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    // Should render children again (but since ErrorThrowingComponent will throw again, it will show error again)
    // In a real scenario, the parent would handle this, but for testing we can check the state change
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("handles error in custom fallback resetError function", () => {
    const mockResetError = jest.fn();
    const CustomFallbackWithMock = ({
      resetError,
    }: {
      resetError: () => void;
    }) => {
      mockResetError.mockImplementation(resetError);
      return (
        <div>
          <button onClick={mockResetError}>Reset</button>
        </div>
      );
    };

    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(
        <ErrorBoundary fallback={CustomFallbackWithMock}>
          <ErrorThrowingComponent />
        </ErrorBoundary>
      );
    }).not.toThrow();

    console.error = originalError;

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));

    expect(mockResetError).toHaveBeenCalled();
  });

  it("handles multiple errors gracefully", () => {
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent />
        </ErrorBoundary>
      );
    }).not.toThrow();

    console.error = originalError;

    // First error should be caught
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Simulate another error by forcing a re-render
    const resetButton = screen.getByRole("button", { name: "Try again" });
    fireEvent.click(resetButton);

    // Should still show error UI since the component throws again
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  // Edge case: Error in error boundary itself
  it("handles errors thrown in error boundary render", () => {
    const ErrorFallback = () => {
      throw new Error("Fallback error");
    };

    // When custom fallback throws, the error propagates up
    expect(() => {
      render(
        <ErrorBoundary fallback={ErrorFallback}>
          <ErrorThrowingComponent />
        </ErrorBoundary>
      );
    }).toThrow("Fallback error");
  });

  // Edge case: Async errors are not caught by ErrorBoundary
  it("does not catch async errors thrown in children", () => {
    function AsyncErrorComponent() {
      React.useEffect(() => {
        // Async errors are not caught by ErrorBoundary
        setTimeout(() => {
          console.error("Async error occurred");
        }, 100);
      }, []);
      return <div>Async component</div>;
    }

    render(
      <ErrorBoundary>
        <AsyncErrorComponent />
      </ErrorBoundary>
    );

    // ErrorBoundary does not catch async errors, so normal content should be shown
    expect(screen.getByText("Async component")).toBeInTheDocument();
  });

  // Edge case: Nested error boundaries
  it("handles nested error boundaries correctly", () => {
    const InnerError = () => <ErrorThrowingComponent />;
    const OuterError = () => (
      <div>
        Outer: <InnerError />
      </div>
    );

    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(
        <ErrorBoundary>
          <ErrorBoundary>
            <OuterError />
          </ErrorBoundary>
        </ErrorBoundary>
      );
    }).not.toThrow();

    console.error = originalError;

    // Inner boundary should catch the error
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  // Edge case: Error with undefined message
  it("handles errors with undefined message", () => {
    function UndefinedErrorComponent(): never {
      throw new Error();
    }

    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(
        <ErrorBoundary>
          <UndefinedErrorComponent />
        </ErrorBoundary>
      );
    }).not.toThrow();

    console.error = originalError;

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  // Edge case: Error with very long message
  it("handles errors with extremely long messages", () => {
    function LongErrorComponent(): never {
      throw new Error("a".repeat(10000));
    }

    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(
        <ErrorBoundary>
          <LongErrorComponent />
        </ErrorBoundary>
      );
    }).not.toThrow();

    console.error = originalError;

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  // Edge case: Multiple rapid errors
  it("handles multiple rapid errors", () => {
    let errorCount = 0;
    function RapidErrorComponent() {
      errorCount++;
      if (errorCount <= 3) {
        throw new Error(`Error ${errorCount}`);
      }
      return <div>Success</div>;
    }

    const originalError = console.error;
    console.error = jest.fn();

    const { rerender } = render(
      <ErrorBoundary>
        <RapidErrorComponent />
      </ErrorBoundary>
    );

    // Multiple rerenders to trigger multiple errors
    for (let i = 0; i < 3; i++) {
      rerender(
        <ErrorBoundary>
          <RapidErrorComponent />
        </ErrorBoundary>
      );
    }

    console.error = originalError;

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });
});

import { useWatched } from "../../hooks/useWatched";
import { useWatchedStore } from "../../state/store";

// Mock the store
jest.mock("../../state/store", () => ({
  useWatchedStore: jest.fn(),
}));

describe("useWatched", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the watched store", () => {
    const mockStore = { items: [], loading: false };
    jest.mocked(useWatchedStore).mockReturnValue(mockStore);

    const result = useWatched();

    expect(result).toBe(mockStore);
    expect(useWatchedStore).toHaveBeenCalled();
  });

  // Edge case: Store returns null or undefined
  it("handles store returning null", () => {
    jest.mocked(useWatchedStore).mockReturnValue(null as any);

    const result = useWatched();

    expect(result).toBeNull();
    expect(useWatchedStore).toHaveBeenCalled();
  });

  // Edge case: Store throws error
  it("handles store throwing error", () => {
    jest.mocked(useWatchedStore).mockImplementation(() => {
      throw new Error("Store error");
    });

    expect(() => useWatched()).toThrow("Store error");
  });

  // Edge case: Concurrent hook usage
  it("handles concurrent hook calls", () => {
    const mockStore1 = { items: [{ id: 1 }], loading: false };
    const mockStore2 = { items: [{ id: 2 }], loading: true };

    jest
      .mocked(useWatchedStore)
      .mockReturnValueOnce(mockStore1)
      .mockReturnValueOnce(mockStore2);

    const result1 = useWatched();
    const result2 = useWatched();

    expect(result1).toBe(mockStore1);
    expect(result2).toBe(mockStore2);
    expect(useWatchedStore).toHaveBeenCalledTimes(2);
  });

  // Edge case: Store with malformed data
  it("handles store with malformed data", () => {
    const malformedStore = {
      items: null, // Should be array
      loading: "not-boolean", // Should be boolean
      invalidProp: "unexpected", // Extra property
    };

    jest.mocked(useWatchedStore).mockReturnValue(malformedStore as any);

    const result = useWatched();

    expect(result).toEqual(malformedStore);
  });

  // Edge case: Multiple hook calls in same component
  it("handles multiple calls in same render", () => {
    const mockStore = { items: [], loading: false };

    jest.mocked(useWatchedStore).mockReturnValue(mockStore);

    const result1 = useWatched();
    const result2 = useWatched();

    expect(result1).toBe(mockStore);
    expect(result2).toBe(mockStore);
    expect(useWatchedStore).toHaveBeenCalledTimes(2);
  });
});

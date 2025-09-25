import { useWatched } from "../../hooks/useWatched";
import { useWatchedStore } from "../../state/store";

// Mock the store
jest.mock("../../state/store", () => ({
  useWatchedStore: jest.fn(),
}));

describe("useWatched", () => {
  it("returns the watched store", () => {
    const mockStore = { items: [], loading: false };
    jest.mocked(useWatchedStore).mockReturnValue(mockStore);

    const result = useWatched();

    expect(result).toBe(mockStore);
    expect(useWatchedStore).toHaveBeenCalled();
  });
});

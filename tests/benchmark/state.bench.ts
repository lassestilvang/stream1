import { Bench } from "tinybench";
import { create } from "zustand";
import type { Watched } from "../../state/store";

// Mock fetch for state operations
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock successful responses
const mockWatchedResponse = {
  ok: true,
  json: async () => ({ items: [] }),
};

const mockAddResponse = {
  ok: true,
  json: async () => ({ item: { id: 1 } }),
};

const mockUpdateResponse = {
  ok: true,
  json: async () => ({ item: { id: 1, rating: 9 } }),
};

const mockDeleteResponse = {
  ok: true,
};

const bench = new Bench({
  name: "State Management Benchmarks",
  time: 1000,
});

// Create a test store similar to the actual stores
interface TestWatchedState {
  items: Watched[];
  loading: boolean;
  fetchWatched: () => Promise<void>;
  addWatched: (
    item: Omit<Watched, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateWatched: (
    id: number,
    updates: Partial<Pick<Watched, "rating" | "notes" | "watchedDate">>
  ) => Promise<void>;
  deleteWatched: (id: number) => Promise<void>;
}

const useTestWatchedStore = create<TestWatchedState>((set) => ({
  items: [],
  loading: false,
  fetchWatched: async () => {
    set({ loading: true });
    mockFetch.mockResolvedValueOnce(mockWatchedResponse);
    const response = await fetch("/api/watched");
    const data = await response.json();
    set({ items: data.items, loading: false });
  },
  addWatched: async (item) => {
    set({ loading: true });
    mockFetch.mockResolvedValueOnce(mockAddResponse);
    const response = await fetch("/api/watched", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    const data = await response.json();
    set((state) => ({
      items: [...state.items, data.item],
      loading: false,
    }));
  },
  updateWatched: async (id, updates) => {
    set({ loading: true });
    mockFetch.mockResolvedValueOnce(mockUpdateResponse);
    const response = await fetch(`/api/watched/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? data.item : item)),
      loading: false,
    }));
  },
  deleteWatched: async (id) => {
    set({ loading: true });
    mockFetch.mockResolvedValueOnce(mockDeleteResponse);
    await fetch(`/api/watched/${id}`, {
      method: "DELETE",
    });
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
      loading: false,
    }));
  },
}));

// State Management Benchmarks
// Thresholds: < 10ms for state updates, < 50ms for operations with mocked network

bench
  .add("watched store - fetchWatched (mocked)", async () => {
    await useTestWatchedStore.getState().fetchWatched();
  })
  .add("watched store - addWatched (mocked)", async () => {
    await useTestWatchedStore.getState().addWatched({
      userId: "test-user",
      tmdbId: 155,
      type: "movie",
      watchedDate: "2024-01-01",
      rating: 8,
      notes: "Test",
    });
  })
  .add("watched store - updateWatched (mocked)", async () => {
    // Assume item exists
    useTestWatchedStore.setState({
      items: [
        {
          id: 1,
          userId: "test-user",
          tmdbId: 155,
          type: "movie",
          watchedDate: "2024-01-01",
          rating: 7,
          notes: "Test",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });
    await useTestWatchedStore.getState().updateWatched(1, { rating: 9 });
  })
  .add("watched store - deleteWatched (mocked)", async () => {
    // Assume item exists
    useTestWatchedStore.setState({
      items: [
        {
          id: 1,
          userId: "test-user",
          tmdbId: 155,
          type: "movie",
          watchedDate: "2024-01-01",
          rating: 8,
          notes: "Test",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });
    await useTestWatchedStore.getState().deleteWatched(1);
  })
  .add("state update - large list (100 items)", () => {
    const largeList = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      userId: "test-user",
      tmdbId: 100 + i,
      type: "movie" as const,
      watchedDate: "2024-01-01",
      rating: 8,
      notes: `Note ${i}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    useTestWatchedStore.setState({ items: largeList });
  })
  .add("state update - large list (500 items)", () => {
    const largeList = Array.from({ length: 500 }, (_, i) => ({
      id: i,
      userId: "test-user",
      tmdbId: 100 + i,
      type: "movie" as const,
      watchedDate: "2024-01-01",
      rating: 8,
      notes: `Note ${i}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    useTestWatchedStore.setState({ items: largeList });
  });

export default bench;
// Run benchmarks if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  bench.run().then(() => {
    console.table(bench.table());
  });
}

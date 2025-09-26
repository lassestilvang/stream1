import { create } from "zustand";
import { toast } from "sonner";
import type { Movie, TVShow } from "../lib/tmdb";
import { users, watched, watchlist } from "../lib/db";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

export type User = InferSelectModel<typeof users>;
export type Watched = InferSelectModel<typeof watched>;
export type Watchlist = InferSelectModel<typeof watchlist>;
type WatchedInsert = InferInsertModel<typeof watched>;
type WatchlistInsert = InferInsertModel<typeof watchlist>;

// Search Store
interface SearchState {
  query: string;
  type: "movie" | "tv";
  results: (Movie | TVShow)[];
  loading: boolean;
  setQuery: (query: string) => void;
  setType: (type: "movie" | "tv") => void;
  search: (query: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: "",
  type: "movie",
  results: [],
  loading: false,
  setQuery: (query) => set({ query }),
  setType: (type) => set({ type }),
  search: async (query) => {
    set({ loading: true });
    try {
      const { type } = get();
      const response = await fetch(
        `/api/tmdb/search?q=${encodeURIComponent(query)}&type=${type}`
      );
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }
      const data = await response.json();
      set({ results: data.results, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to search for movies and TV shows");
      throw error;
    }
  },
  setLoading: (loading) => set({ loading }),
}));

// Watched Store
interface WatchedState {
  items: Watched[];
  loading: boolean;
  fetchWatched: (filters?: {
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => Promise<void>;
  addWatched: (
    item: Omit<WatchedInsert, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateWatched: (id: number, updates: Partial<Watched>) => Promise<void>;
  deleteWatched: (id: number) => Promise<void>;
}

export const useWatchedStore = create<WatchedState>((set) => ({
  // Fixed: Removed unused _get parameter to eliminate ESLint warning
  items: [],
  loading: false,
  fetchWatched: async (filters = {}) => {
    set({ loading: true });
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.append("dateTo", filters.dateTo);

      const response = await fetch(`/api/watched?${params.toString()}`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch watched items: ${response.statusText}`
        );
      }
      const data = await response.json();
      set({ items: data.items, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to load watched items");
      throw error;
    }
  },
  addWatched: async (item) => {
    set({ loading: true });
    try {
      const response = await fetch("/api/watched", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!response.ok) {
        throw new Error(`Failed to add watched item: ${response.statusText}`);
      }
      const data = await response.json();
      set((state) => ({
        items: [...state.items, data.item],
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to add item to watched list");
      throw error;
    }
  },
  updateWatched: async (id, updates) => {
    set({ loading: true });
    try {
      const response = await fetch(`/api/watched/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error(
          `Failed to update watched item: ${response.statusText}`
        );
      }
      const data = await response.json();
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? data.item : item)),
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to update watched item");
      throw error;
    }
  },
  deleteWatched: async (id) => {
    set({ loading: true });
    try {
      const response = await fetch(`/api/watched/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(
          `Failed to delete watched item: ${response.statusText}`
        );
      }
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to remove item from watched list");
      throw error;
    }
  },
}));

// Watchlist Store
interface WatchlistState {
  items: Watchlist[];
  loading: boolean;
  fetchWatchlist: () => Promise<void>;
  addToWatchlist: (item: Omit<WatchlistInsert, "id">) => Promise<void>;
  removeFromWatchlist: (id: number) => Promise<void>;
}

export const useWatchlistStore = create<WatchlistState>((set) => ({
  // Fixed: Removed unused _get parameter to eliminate ESLint warning
  items: [],
  loading: false,
  fetchWatchlist: async () => {
    set({ loading: true });
    try {
      const response = await fetch("/api/watchlist");
      if (!response.ok) {
        throw new Error(
          `Failed to fetch watchlist items: ${response.statusText}`
        );
      }
      const data = await response.json();
      set({ items: data.items, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to load watchlist items");
      throw error;
    }
  },
  addToWatchlist: async (item) => {
    set({ loading: true });
    try {
      const response = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!response.ok) {
        throw new Error(`Failed to add watchlist item: ${response.statusText}`);
      }
      const data = await response.json();
      set((state) => ({
        items: [...state.items, data.item],
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to add item to watchlist");
      throw error;
    }
  },
  removeFromWatchlist: async (id) => {
    set({ loading: true });
    try {
      const response = await fetch(`/api/watchlist/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(
          `Failed to remove watchlist item: ${response.statusText}`
        );
      }
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to remove item from watchlist");
      throw error;
    }
  },
}));

// User Store
interface UserState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: false,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
}));

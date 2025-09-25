"use client";

import { useEffect } from "react";
import { WatchlistCard } from "../../components/WatchlistCard";
import { useWatchlistStore } from "../../state/store";

export default function WatchlistPage() {
  const { items, loading, fetchWatchlist } = useWatchlistStore();

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">My Watchlist</h1>
        <p className="text-muted-foreground">
          Movies and TV shows you want to watch
        </p>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading watchlist...</p>
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <WatchlistCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground">
          <p>Your watchlist is empty.</p>
          <p className="mt-2">
            Start by searching for movies and TV shows on the home page.
          </p>
        </div>
      )}
    </div>
  );
}

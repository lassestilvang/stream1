"use client";

import { useEffect, useState } from "react";
import { WatchedCard } from "../../components/WatchedCard";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { useWatchedStore } from "../../state/store";

export default function WatchedPage() {
  const { items, loading, fetchWatched } = useWatchedStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    fetchWatched();
  }, [fetchWatched]);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || item.watchedDate === dateFilter;
    return matchesSearch && matchesDate;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setDateFilter("");
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Watched Movies & TV Shows</h1>
        <p className="text-muted-foreground">
          View and manage your watched content
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        <Input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={clearFilters} variant="outline">
          Clear Filters
        </Button>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading watched items...</p>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <WatchedCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground">
          <p>No watched items found.</p>
          {items.length === 0 && (
            <p className="mt-2">
              Start by searching for movies and TV shows on the home page.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

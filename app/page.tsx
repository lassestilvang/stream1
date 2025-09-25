"use client";

import { SearchBar } from "../components/SearchBar";
import { MovieCard } from "../components/MovieCard";
import { useSearchStore } from "../state/store";

export default function Home() {
  const { results, loading } = useSearchStore();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Movie & TV Show Search</h1>
        <p className="text-muted-foreground mb-8">
          Search for movies and TV shows to add to your watched list or
          watchlist
        </p>
        <SearchBar />
      </div>

      {loading && (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Searching...</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Search Results</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {results.map((item) => (
              <MovieCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {!loading && results.length === 0 && (
        <div className="text-center text-muted-foreground">
          <p>No results found. Try searching for a movie or TV show.</p>
        </div>
      )}
    </div>
  );
}

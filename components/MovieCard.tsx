"use client";

import Image from "next/image";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Loader2 } from "lucide-react";
import { useWatchedStore, useWatchlistStore } from "../state/store";
import type { Movie, TVShow } from "../lib/tmdb";

interface MovieCardProps {
  item: Movie | TVShow;
}

export const MovieCard = ({ item }: MovieCardProps) => {
  const { addWatched, loading: watchedLoading } = useWatchedStore();
  const { addToWatchlist, loading: watchlistLoading } = useWatchlistStore();

  const isMovie = "title" in item;
  const title = isMovie ? item.title : item.name;
  const releaseDate = isMovie ? item.release_date : item.first_air_date;
  const posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : "/placeholder-poster.jpg";

  const handleAddToWatched = async () => {
    await addWatched({
      userId: "current-user", // TODO: Get from user store
      tmdbId: item.id,
      type: isMovie ? "movie" : "tv",
      watchedDate: new Date().toISOString().split("T")[0],
      rating: 5, // Default rating
      notes: "",
    });
  };

  const handleAddToWatchlist = async () => {
    await addToWatchlist({
      userId: "current-user", // TODO: Get from user store
      tmdbId: item.id,
      type: isMovie ? "movie" : "tv",
      addedDate: new Date().toISOString().split("T")[0],
    });
  };

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader>
        <div className="aspect-[2/3] relative overflow-hidden rounded-md">
          <Image src={posterUrl} alt={title} fill className="object-cover" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">
          {releaseDate ? new Date(releaseDate).getFullYear() : "N/A"}
        </p>
        <p className="text-sm line-clamp-3">{item.overview}</p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          onClick={handleAddToWatched}
          variant="outline"
          size="sm"
          className="flex-1"
          disabled={watchedLoading}
        >
          {watchedLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            "Add to Watched"
          )}
        </Button>
        <Button
          onClick={handleAddToWatchlist}
          size="sm"
          className="flex-1"
          disabled={watchlistLoading}
        >
          {watchlistLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            "Add to Watchlist"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

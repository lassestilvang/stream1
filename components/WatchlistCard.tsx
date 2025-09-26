"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { useWatchlistStore } from "../state/store";
import type { Watchlist } from "../state/store";
import type { Movie, TVShow } from "../lib/tmdb";

interface WatchlistCardProps {
  item: Watchlist;
}

export const WatchlistCard = ({ item }: WatchlistCardProps) => {
  const { removeFromWatchlist, loading } = useWatchlistStore();
  const [tmdbData, setTmdbData] = useState<Movie | TVShow | null>(null);
  const [tmdbLoading, setTmdbLoading] = useState(true);
  const [tmdbError, setTmdbError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTMDBData = async () => {
      try {
        setTmdbLoading(true);
        setTmdbError(null);

        if (item.type === "movie") {
          const response = await fetch(`/api/tmdb/movie/${item.tmdbId}`);
          if (!response.ok) {
            throw new Error(
              `Failed to fetch movie details: ${response.statusText}`
            );
          }
          const data = await response.json();
          setTmdbData(data);
        } else if (item.type === "tv") {
          const response = await fetch(`/api/tmdb/tv/${item.tmdbId}`);
          if (!response.ok) {
            throw new Error(
              `Failed to fetch TV show details: ${response.statusText}`
            );
          }
          const data = await response.json();
          setTmdbData(data);
        }
      } catch (error) {
        setTmdbError("Failed to load movie/TV show details");
        console.error("Error fetching TMDB data:", error);
      } finally {
        setTmdbLoading(false);
      }
    };

    fetchTMDBData();
  }, [item.tmdbId, item.type]);

  const title = tmdbData
    ? (tmdbData as Movie).title ||
      (tmdbData as TVShow).name ||
      `ID: ${item.tmdbId}`
    : `ID: ${item.tmdbId}`;
  const posterPath = tmdbData?.poster_path;
  const posterUrl = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : null;

  const handleRemove = async () => {
    await removeFromWatchlist(item.id);
  };

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader>
        <div className="flex gap-4">
          {posterUrl && (
            <div className="w-16 h-24 relative rounded overflow-hidden">
              <Image
                src={posterUrl}
                alt={title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <CardTitle className="text-lg">
              {tmdbLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : tmdbError ? (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {title}
                </div>
              ) : (
                title
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Added on: {new Date(item.addedDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Type: {item.type}</p>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleRemove}
          variant="destructive"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Removing...
            </>
          ) : (
            "Remove from Watchlist"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

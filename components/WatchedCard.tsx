"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { useWatchedStore } from "../state/store";
import { getMovieDetails, getTVShowDetails } from "../lib/tmdb";
import type { Watched } from "../state/store";
import type { Movie, TVShow } from "../lib/tmdb";

interface WatchedCardProps {
  item: Watched;
}

export const WatchedCard = ({ item }: WatchedCardProps) => {
  const { deleteWatched, loading } = useWatchedStore();
  const [tmdbData, setTmdbData] = useState<Movie | TVShow | null>(null);
  const [tmdbLoading, setTmdbLoading] = useState(true);
  const [tmdbError, setTmdbError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTMDBData = async () => {
      try {
        setTmdbLoading(true);
        setTmdbError(null);

        if (item.type === "movie") {
          const data = await getMovieDetails(item.tmdbId);
          setTmdbData(data);
        } else if (item.type === "tv") {
          const data = await getTVShowDetails(item.tmdbId);
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
    ? (tmdbData as Movie).title || (tmdbData as TVShow).name
    : `ID: ${item.tmdbId}`;
  const posterPath = tmdbData?.poster_path;
  const posterUrl = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : null;

  const handleDelete = async () => {
    await deleteWatched(item.id);
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
              Watched on: {new Date(item.watchedDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <p className="text-sm">Rating: {item.rating}/10</p>
          {item.notes && <p className="text-sm mt-2">Notes: {item.notes}</p>}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Link href={`/watched/${item.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            Edit
          </Button>
        </Link>
        <Button
          onClick={handleDelete}
          variant="destructive"
          size="sm"
          className="flex-1"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            "Delete"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

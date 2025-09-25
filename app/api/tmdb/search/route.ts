import { searchMovies, searchTVShows } from "../../../../lib/tmdb";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const type = searchParams.get("type");

  if (!query || !type || !["movie", "tv"].includes(type)) {
    return Response.json(
      {
        error:
          "Missing or invalid query parameters: q (search term) and type (movie or tv) are required",
      },
      { status: 400 }
    );
  }

  try {
    const results =
      type === "movie" ? await searchMovies(query) : await searchTVShows(query);

    return Response.json({ results });
  } catch (error) {
    console.error("TMDB search error:", error);
    return Response.json(
      { error: "Failed to perform search. Please try again later." },
      { status: 500 }
    );
  }
}

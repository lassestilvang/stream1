import { getMovieDetails } from "../../../../../lib/tmdb";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return Response.json({ error: "Invalid movie ID" }, { status: 400 });
    }

    const movie = await getMovieDetails(id);
    return Response.json(movie);
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return Response.json(
      { error: "Failed to fetch movie details" },
      { status: 500 },
    );
  }
}

import { getMovieDetails } from "../../../../../lib/tmdb";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const trimmedId = idParam.trim();

    // Validate ID: must be a positive integer string with no extra characters and reasonable length
    if (!/^\d+$/.test(trimmedId) || trimmedId.length > 20) {
      return Response.json({ error: "Invalid movie ID" }, { status: 400 });
    }

    const id = parseInt(trimmedId, 10);
    if (id <= 0) {
      return Response.json({ error: "Invalid movie ID" }, { status: 400 });
    }

    const movie = await getMovieDetails(id);
    return Response.json(movie);
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return Response.json(
      { error: "Failed to fetch movie details" },
      { status: 500 }
    );
  }
}

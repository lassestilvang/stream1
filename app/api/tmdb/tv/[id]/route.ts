import { getTVShowDetails } from "../../../../../lib/tmdb";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return Response.json({ error: "Invalid TV show ID" }, { status: 400 });
    }

    const tvShow = await getTVShowDetails(id);
    return Response.json(tvShow);
  } catch (error) {
    console.error("Error fetching TV show details:", error);
    return Response.json(
      { error: "Failed to fetch TV show details" },
      { status: 500 },
    );
  }
}

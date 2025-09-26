import { NextRequest } from "next/server";
import { auth } from "../../../auth";
import { db, watchlist } from "../../../lib/db";
import { eq, and } from "drizzle-orm";

export async function GET() {
  // Fixed: Removed unused _request parameter to eliminate ESLint warning
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await db
      .select()
      .from(watchlist)
      .where(eq(watchlist.userId, session.user.id))
      .orderBy(watchlist.addedDate);

    return Response.json({ items });
  } catch (error) {
    console.error("Error fetching watchlist items:", error);
    return Response.json(
      { error: "Failed to fetch watchlist items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tmdbId, type, addedDate } = body;

    if (!tmdbId || !type || !addedDate) {
      return Response.json(
        { error: "Missing required fields: tmdbId, type, addedDate" },
        { status: 400 }
      );
    }

    if (!["movie", "tv"].includes(type)) {
      return Response.json(
        { error: "Invalid type. Must be 'movie' or 'tv'" },
        { status: 400 }
      );
    }

    // Check for duplicate
    const existing = await db
      .select()
      .from(watchlist)
      .where(
        and(
          eq(watchlist.userId, session.user.id),
          eq(watchlist.tmdbId, tmdbId),
          eq(watchlist.type, type)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return Response.json(
        { error: "Item already in watchlist" },
        { status: 409 }
      );
    }

    const newItem = await db
      .insert(watchlist)
      .values({
        userId: session.user.id,
        tmdbId,
        type,
        addedDate,
      })
      .returning();

    return Response.json({ item: newItem[0] }, { status: 201 });
  } catch (error) {
    console.error("Error adding watchlist item:", error);
    return Response.json(
      { error: "Failed to add watchlist item" },
      { status: 500 }
    );
  }
}

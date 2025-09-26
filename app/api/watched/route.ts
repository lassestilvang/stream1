import { NextRequest } from "next/server";
import { auth } from "../../../auth";
import { db, watched } from "../../../lib/db";
import { eq, and, like, gte, lte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const conditions = [eq(watched.userId, session.user.id)];

    if (search) {
      conditions.push(like(watched.notes, `%${search}%`));
    }

    if (dateFrom) {
      conditions.push(gte(watched.watchedDate, dateFrom));
    }

    if (dateTo) {
      conditions.push(lte(watched.watchedDate, dateTo));
    }

    const items = await db
      .select()
      .from(watched)
      .where(and(...conditions))
      .orderBy(watched.watchedDate);

    return Response.json({ items });
  } catch (error) {
    console.error("Error fetching watched items:", error);
    return Response.json(
      { error: "Failed to fetch watched items" },
      { status: 500 },
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
    const { tmdbId, type, watchedDate, rating, notes } = body;

    if (!tmdbId || !type || !watchedDate || !rating) {
      return Response.json(
        { error: "Missing required fields: tmdbId, type, watchedDate, rating" },
        { status: 400 },
      );
    }

    if (!["movie", "tv"].includes(type)) {
      return Response.json(
        { error: "Invalid type. Must be 'movie' or 'tv'" },
        { status: 400 },
      );
    }

    if (rating < 1 || rating > 10) {
      return Response.json(
        { error: "Rating must be between 1 and 10" },
        { status: 400 },
      );
    }

    const newItem = await db
      .insert(watched)
      .values({
        userId: session.user.id,
        tmdbId,
        type,
        watchedDate,
        rating,
        notes: notes || null,
      })
      .returning();

    return Response.json({ item: newItem[0] }, { status: 201 });
  } catch (error) {
    console.error("Error adding watched item:", error);
    return Response.json(
      { error: "Failed to add watched item" },
      { status: 500 },
    );
  }
}

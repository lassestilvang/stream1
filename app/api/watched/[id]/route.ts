import { NextRequest } from "next/server";
import { auth } from "../../../../auth";
import { db, watched } from "../../../../lib/db";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return Response.json({ error: "Invalid ID" }, { status: 400 });
    }

    const [item] = await db
      .select()
      .from(watched)
      .where(and(eq(watched.id, id), eq(watched.userId, session.user.id)))
      .limit(1);

    if (!item) {
      return Response.json({ error: "Item not found" }, { status: 404 });
    }

    return Response.json({ item });
  } catch (error) {
    console.error("Error fetching watched item:", error);
    return Response.json(
      { error: "Failed to fetch watched item" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return Response.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const { tmdbId, type, watchedDate, rating, notes } = body;

    if (!tmdbId || !type || !watchedDate || !rating) {
      return Response.json(
        { error: "Missing required fields: tmdbId, type, watchedDate, rating" },
        { status: 400 }
      );
    }

    if (!["movie", "tv"].includes(type)) {
      return Response.json(
        { error: "Invalid type. Must be 'movie' or 'tv'" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 10) {
      return Response.json(
        { error: "Rating must be between 1 and 10" },
        { status: 400 }
      );
    }

    const updatedItem = await db
      .update(watched)
      .set({
        tmdbId,
        type,
        watchedDate,
        rating,
        notes: notes || null,
        updatedAt: new Date(),
      })
      .where(and(eq(watched.id, id), eq(watched.userId, session.user.id)))
      .returning();

    if (updatedItem.length === 0) {
      return Response.json({ error: "Item not found" }, { status: 404 });
    }

    return Response.json({ item: updatedItem[0] });
  } catch (error) {
    console.error("Error updating watched item:", error);
    return Response.json(
      { error: "Failed to update watched item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return Response.json({ error: "Invalid ID" }, { status: 400 });
    }

    const deletedItem = await db
      .delete(watched)
      .where(and(eq(watched.id, id), eq(watched.userId, session.user.id)))
      .returning();

    if (deletedItem.length === 0) {
      return Response.json({ error: "Item not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting watched item:", error);
    return Response.json(
      { error: "Failed to delete watched item" },
      { status: 500 }
    );
  }
}

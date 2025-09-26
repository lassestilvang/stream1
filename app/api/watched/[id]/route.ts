import { NextRequest } from "next/server";
import { auth } from "../../../../auth";
import { db, watched } from "../../../../lib/db";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);
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
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id) || id <= 0) {
      return Response.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Fetch existing item
    const [existingItem] = await db
      .select()
      .from(watched)
      .where(and(eq(watched.id, id), eq(watched.userId, session.user.id)))
      .limit(1);

    if (!existingItem) {
      return Response.json({ error: "Item not found" }, { status: 404 });
    }

    const body = await request.json();
    const { tmdbId, type, watchedDate, rating, notes } = body;

    // Merge updates with existing data
    const updatedData = {
      tmdbId: tmdbId ?? existingItem.tmdbId,
      type: type ?? existingItem.type,
      watchedDate: watchedDate ?? existingItem.watchedDate,
      rating: rating ?? existingItem.rating,
      notes: notes !== undefined ? notes : existingItem.notes,
    };

    // Validate merged data
    if (
      !updatedData.tmdbId ||
      !updatedData.type ||
      !updatedData.watchedDate ||
      updatedData.rating === undefined
    ) {
      return Response.json(
        { error: "Missing required fields: tmdbId, type, watchedDate, rating" },
        { status: 400 },
      );
    }

    if (!["movie", "tv"].includes(updatedData.type)) {
      return Response.json(
        { error: "Invalid type. Must be 'movie' or 'tv'" },
        { status: 400 },
      );
    }

    if (updatedData.rating < 1 || updatedData.rating > 10) {
      return Response.json(
        { error: "Rating must be between 1 and 10" },
        { status: 400 },
      );
    }

    const updatedItem = await db
      .update(watched)
      .set({
        ...updatedData,
        notes: updatedData.notes || null,
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
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);
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
      { status: 500 },
    );
  }
}

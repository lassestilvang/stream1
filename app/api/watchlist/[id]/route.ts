import { NextRequest } from "next/server";
import { auth } from "../../../../auth";
import { db, watchlist } from "../../../../lib/db";
import { eq, and } from "drizzle-orm";

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
      .delete(watchlist)
      .where(and(eq(watchlist.id, id), eq(watchlist.userId, session.user.id)))
      .returning();

    if (deletedItem.length === 0) {
      return Response.json({ error: "Item not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting watchlist item:", error);
    return Response.json(
      { error: "Failed to delete watchlist item" },
      { status: 500 }
    );
  }
}

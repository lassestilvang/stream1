import { Bench } from "tinybench";
import { db } from "../../lib/db";
import { watched, watchlist } from "../../lib/db";
import { eq } from "drizzle-orm";

const bench = new Bench({
  name: "Database Operations Benchmarks",
  time: 1000,
});

// Database CRUD Benchmarks for watched and watchlist tables
// Thresholds: < 50ms for simple operations, < 200ms for complex queries
// Note: Uses test data - assumes test user exists

const testUserId = "test-user-id";
const testMovieId = 155; // The Dark Knight
const testTVId = 1399; // Game of Thrones

bench
  .add("watched - insert single record", async () => {
    const result = await db
      .insert(watched)
      .values({
        userId: testUserId,
        tmdbId: testMovieId,
        type: "movie",
        watchedDate: "2024-01-01",
        rating: 9,
        notes: "Great movie",
      })
      .returning();
    // Cleanup
    if (result[0]) {
      await db.delete(watched).where(eq(watched.id, result[0].id));
    }
  })
  .add("watched - select single record", async () => {
    await db
      .select()
      .from(watched)
      .where(eq(watched.userId, testUserId))
      .limit(1);
  })
  .add("watched - select multiple records (small)", async () => {
    await db
      .select()
      .from(watched)
      .where(eq(watched.userId, testUserId))
      .limit(10);
  })
  .add("watched - select multiple records (medium)", async () => {
    await db
      .select()
      .from(watched)
      .where(eq(watched.userId, testUserId))
      .limit(100);
  })
  .add("watched - update single record", async () => {
    // First insert
    const inserted = await db
      .insert(watched)
      .values({
        userId: testUserId,
        tmdbId: testMovieId,
        type: "movie",
        watchedDate: "2024-01-01",
        rating: 8,
        notes: "Good movie",
      })
      .returning();

    if (inserted[0]) {
      // Update
      await db
        .update(watched)
        .set({ rating: 9, notes: "Updated notes" })
        .where(eq(watched.id, inserted[0].id));

      // Cleanup
      await db.delete(watched).where(eq(watched.id, inserted[0].id));
    }
  })
  .add("watched - delete single record", async () => {
    // First insert
    const inserted = await db
      .insert(watched)
      .values({
        userId: testUserId,
        tmdbId: testMovieId,
        type: "movie",
        watchedDate: "2024-01-01",
        rating: 7,
        notes: "Test delete",
      })
      .returning();

    if (inserted[0]) {
      // Delete
      await db.delete(watched).where(eq(watched.id, inserted[0].id));
    }
  })
  .add("watchlist - insert single record", async () => {
    const result = await db
      .insert(watchlist)
      .values({
        userId: testUserId,
        tmdbId: testTVId,
        type: "tv",
        addedDate: "2024-01-01",
      })
      .returning();
    // Cleanup
    if (result[0]) {
      await db.delete(watchlist).where(eq(watchlist.id, result[0].id));
    }
  })
  .add("watchlist - select single record", async () => {
    await db
      .select()
      .from(watchlist)
      .where(eq(watchlist.userId, testUserId))
      .limit(1);
  })
  .add("watchlist - select multiple records (small)", async () => {
    await db
      .select()
      .from(watchlist)
      .where(eq(watchlist.userId, testUserId))
      .limit(10);
  })
  .add("watchlist - select multiple records (medium)", async () => {
    await db
      .select()
      .from(watchlist)
      .where(eq(watchlist.userId, testUserId))
      .limit(100);
  })
  .add("watchlist - delete single record", async () => {
    // First insert
    const inserted = await db
      .insert(watchlist)
      .values({
        userId: testUserId,
        tmdbId: testTVId,
        type: "tv",
        addedDate: "2024-01-01",
      })
      .returning();

    if (inserted[0]) {
      // Delete
      await db.delete(watchlist).where(eq(watchlist.id, inserted[0].id));
    }
  });

export default bench;

// Run benchmarks if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  bench.run().then(() => {
    console.table(bench.table());
  });
}

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  pgTable,
  serial,
  varchar,
  integer,
  date,
  timestamp,
  text,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Define enums
export const mediaTypeEnum = pgEnum("media_type", ["movie", "tv"]);

// Users table
export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  emailVerified: timestamp("email_verified"),
  name: varchar("name", { length: 255 }),
  image: varchar("image", { length: 255 }),
  password: varchar("password", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Accounts table
export const accounts = pgTable("accounts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  type: varchar("type", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 255 }).notNull(),
  providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: varchar("token_type", { length: 255 }),
  scope: varchar("scope", { length: 255 }),
  id_token: text("id_token"),
  session_state: varchar("session_state", { length: 255 }),
});

// Sessions table
export const sessions = pgTable("sessions", {
  sessionToken: varchar("session_token", { length: 255 }).primaryKey(),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  expires: timestamp("expires").notNull(),
});

// Verification tokens table
export const verificationTokens = pgTable("verification_tokens", {
  identifier: varchar("identifier", { length: 255 }).primaryKey(),
  token: varchar("token", { length: 255 }).unique().notNull(),
  expires: timestamp("expires").notNull(),
});

// Watched table
export const watched = pgTable("watched", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  tmdbId: integer("tmdb_id").notNull(),
  type: mediaTypeEnum("type").notNull(),
  watchedDate: date("watched_date").notNull(),
  rating: integer("rating").notNull(), // Assuming validation 1-10 is handled in app
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Watchlist table
export const watchlist = pgTable("watchlist", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  tmdbId: integer("tmdb_id").notNull(),
  type: mediaTypeEnum("type").notNull(),
  addedDate: date("added_date").notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  watched: many(watched),
  watchlist: many(watchlist),
}));

export const watchedRelations = relations(watched, ({ one }) => ({
  user: one(users, {
    fields: [watched.userId],
    references: [users.id],
  }),
}));

export const watchlistRelations = relations(watchlist, ({ one }) => ({
  user: one(users, {
    fields: [watchlist.userId],
    references: [users.id],
  }),
}));

// Database client
const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, {
  schema: { users, watched, watchlist, accounts, sessions, verificationTokens },
});

import { pgTable, text, serial, integer, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  language: text("language").notNull().default("it"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const watchProgress = pgTable("watch_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  tmdbId: integer("tmdb_id").notNull(),
  type: text("type").notNull(), // 'movie' or 'tv'
  title: text("title").notNull(),
  posterPath: text("poster_path"),
  currentTime: integer("current_time").notNull().default(0),
  duration: integer("duration").notNull().default(0),
  season: integer("season"),
  episode: integer("episode"),
  lastWatched: timestamp("last_watched").defaultNow(),
});

export const myList = pgTable("my_list", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  tmdbId: integer("tmdb_id").notNull(),
  type: text("type").notNull(), // 'movie' or 'tv'
  title: text("title").notNull(),
  posterPath: text("poster_path"),
  addedAt: timestamp("added_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertWatchProgressSchema = createInsertSchema(watchProgress).omit({
  id: true,
  lastWatched: true,
});

export const insertMyListSchema = createInsertSchema(myList).omit({
  id: true,
  addedAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type WatchProgress = typeof watchProgress.$inferSelect;
export type InsertWatchProgress = z.infer<typeof insertWatchProgressSchema>;
export type MyListItem = typeof myList.$inferSelect;
export type InsertMyListItem = z.infer<typeof insertMyListSchema>;

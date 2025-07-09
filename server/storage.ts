import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { users, watchProgress, myList, insertUserSchema, insertWatchProgressSchema, insertMyListSchema } from "../shared/schema";
import { eq, and, desc } from "drizzle-orm";

// Use SQLite as fallback when PostgreSQL is not available
const sqlite = new Database(':memory:');
const db = drizzle(sqlite);

// Create tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    language TEXT DEFAULT 'it',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS watch_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    tmdb_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    poster_path TEXT,
    season INTEGER,
    episode INTEGER,
    progress_seconds INTEGER DEFAULT 0,
    duration_seconds INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    last_watched DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS my_list (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    tmdb_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    poster_path TEXT,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, tmdb_id, type)
  );
`);

export class Storage {
  // User operations
  async createUser(userData: any) {
    try {
      const validatedData = insertUserSchema.parse(userData);
      const [user] = await db.insert(users).values(validatedData).returning();
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUserById(id: number) {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string) {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  async updateUser(id: number, userData: any) {
    try {
      const [user] = await db.update(users).set(userData).where(eq(users.id, id)).returning();
      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Watch progress operations
  async getWatchProgress(userId: number) {
    try {
      return await db.select().from(watchProgress)
        .where(eq(watchProgress.userId, userId))
        .orderBy(desc(watchProgress.lastWatched));
    } catch (error) {
      console.error('Error getting watch progress:', error);
      return [];
    }
  }

  async saveWatchProgress(progressData: any) {
    try {
      const validatedData = insertWatchProgressSchema.parse(progressData);

      // Check if progress already exists
      const existing = await db.select().from(watchProgress).where(
        and(
          eq(watchProgress.userId, validatedData.userId),
          eq(watchProgress.tmdbId, validatedData.tmdbId),
          eq(watchProgress.type, validatedData.type),
          validatedData.season ? eq(watchProgress.season, validatedData.season) : eq(watchProgress.season, null),
          validatedData.episode ? eq(watchProgress.episode, validatedData.episode) : eq(watchProgress.episode, null)
        )
      );

      if (existing.length > 0) {
        // Update existing progress
        const [updated] = await db.update(watchProgress)
          .set({
            ...validatedData,
            lastWatched: new Date()
          })
          .where(eq(watchProgress.id, existing[0].id))
          .returning();
        return updated;
      } else {
        // Create new progress
        const [created] = await db.insert(watchProgress).values(validatedData).returning();
        return created;
      }
    } catch (error) {
      console.error('Error saving watch progress:', error);
      throw error;
    }
  }

  async deleteWatchProgress(id: number) {
    try {
      const result = await db.delete(watchProgress).where(eq(watchProgress.id, id));
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting watch progress:', error);
      return false;
    }
  }

  // My List operations
  async getMyList(userId: number) {
    try {
      return await db.select().from(myList)
        .where(eq(myList.userId, userId))
        .orderBy(desc(myList.addedAt));
    } catch (error) {
      console.error('Error getting my list:', error);
      return [];
    }
  }

  async addToMyList(listData: any) {
    try {
      const validatedData = insertMyListSchema.parse(listData);

      // Check if item already exists
      const existing = await db.select().from(myList).where(
        and(
          eq(myList.userId, validatedData.userId),
          eq(myList.tmdbId, validatedData.tmdbId),
          eq(myList.type, validatedData.type)
        )
      );

      if (existing.length > 0) {
        return existing[0];
      }

      const [created] = await db.insert(myList).values(validatedData).returning();
      return created;
    } catch (error) {
      console.error('Error adding to my list:', error);
      throw error;
    }
  }

  async removeFromMyList(userId: number, tmdbId: number, type: string) {
    try {
      const result = await db.delete(myList).where(
        and(
          eq(myList.userId, userId),
          eq(myList.tmdbId, tmdbId),
          eq(myList.type, type)
        )
      );
      return result.changes > 0;
    } catch (error) {
      console.error('Error removing from my list:', error);
      return false;
    }
  }

  async isInMyList(userId: number, tmdbId: number, type: string) {
    try {
      const existing = await db.select().from(myList).where(
        and(
          eq(myList.userId, userId),
          eq(myList.tmdbId, tmdbId),
          eq(myList.type, type)
        )
      );
      return existing.length > 0;
    } catch (error) {
      console.error('Error checking my list:', error);
      return false;
    }
  }

  // Initialize database tables
  async initializeTables() {
    try {
      // Create default user if not exists
      const existingUser = await this.getUserById(1);
      if (!existingUser) {
        await this.createUser({
          email: 'default@soaggtv.com',
          name: 'Default User',
          language: 'it'
        });
        console.log('Default user created successfully');
      }
    } catch (error) {
      console.error('Error initializing tables:', error);
    }
  }
}

export const storage = new Storage();
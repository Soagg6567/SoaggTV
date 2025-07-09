import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, watchProgress, myList, insertUserSchema, insertWatchProgressSchema, insertMyListSchema } from "../shared/schema";
import { eq, and, desc } from "drizzle-orm";

// Database connection
const connectionString = process.env.DATABASE_URL || "postgres://user:password@localhost/db";
const client = postgres(connectionString);
const db = drizzle(client);

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
      return result.rowCount > 0;
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
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error removing from my list:', error);
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
      }
    } catch (error) {
      console.error('Error initializing tables:', error);
    }
  }
}

export const storage = new Storage();
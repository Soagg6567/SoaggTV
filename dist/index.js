// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

// shared/schema.ts
import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  language: text("language").notNull().default("it"),
  createdAt: timestamp("created_at").defaultNow()
});
var watchProgress = pgTable("watch_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  tmdbId: integer("tmdb_id").notNull(),
  type: text("type").notNull(),
  // 'movie' or 'tv'
  title: text("title").notNull(),
  posterPath: text("poster_path"),
  currentTime: integer("current_time").notNull().default(0),
  duration: integer("duration").notNull().default(0),
  season: integer("season"),
  episode: integer("episode"),
  lastWatched: timestamp("last_watched").defaultNow()
});
var myList = pgTable("my_list", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  tmdbId: integer("tmdb_id").notNull(),
  type: text("type").notNull(),
  // 'movie' or 'tv'
  title: text("title").notNull(),
  posterPath: text("poster_path"),
  addedAt: timestamp("added_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var insertWatchProgressSchema = createInsertSchema(watchProgress).omit({
  id: true,
  lastWatched: true
});
var insertMyListSchema = createInsertSchema(myList).omit({
  id: true,
  addedAt: true
});

// server/storage.ts
import { eq, and, desc } from "drizzle-orm";
var client = createClient({
  url: ":memory:"
});
var db = drizzle(client);
await client.execute(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    language TEXT DEFAULT 'it',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);
await client.execute(`
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
`);
await client.execute(`
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
var Storage = class {
  // User operations
  async createUser(userData) {
    try {
      const validatedData = insertUserSchema.parse(userData);
      const [user] = await db.insert(users).values(validatedData).returning();
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }
  async getUserById(id) {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("Error getting user by ID:", error);
      throw error;
    }
  }
  async getUserByEmail(email) {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    } catch (error) {
      console.error("Error getting user by email:", error);
      throw error;
    }
  }
  async updateUser(id, userData) {
    try {
      const [user] = await db.update(users).set(userData).where(eq(users.id, id)).returning();
      return user;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }
  // Watch progress operations
  async getWatchProgress(userId) {
    try {
      return await db.select().from(watchProgress).where(eq(watchProgress.userId, userId)).orderBy(desc(watchProgress.lastWatched));
    } catch (error) {
      console.error("Error getting watch progress:", error);
      return [];
    }
  }
  async saveWatchProgress(progressData) {
    try {
      const validatedData = insertWatchProgressSchema.parse(progressData);
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
        const [updated] = await db.update(watchProgress).set({
          ...validatedData,
          lastWatched: /* @__PURE__ */ new Date()
        }).where(eq(watchProgress.id, existing[0].id)).returning();
        return updated;
      } else {
        const [created] = await db.insert(watchProgress).values(validatedData).returning();
        return created;
      }
    } catch (error) {
      console.error("Error saving watch progress:", error);
      throw error;
    }
  }
  async deleteWatchProgress(id) {
    try {
      const result = await db.delete(watchProgress).where(eq(watchProgress.id, id));
      return result.changes > 0;
    } catch (error) {
      console.error("Error deleting watch progress:", error);
      return false;
    }
  }
  // My List operations
  async getMyList(userId) {
    try {
      return await db.select().from(myList).where(eq(myList.userId, userId)).orderBy(desc(myList.addedAt));
    } catch (error) {
      console.error("Error getting my list:", error);
      return [];
    }
  }
  async addToMyList(listData) {
    try {
      const validatedData = insertMyListSchema.parse(listData);
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
      console.error("Error adding to my list:", error);
      throw error;
    }
  }
  async removeFromMyList(userId, tmdbId, type) {
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
      console.error("Error removing from my list:", error);
      return false;
    }
  }
  async isInMyList(userId, tmdbId, type) {
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
      console.error("Error checking my list:", error);
      return false;
    }
  }
  // Initialize database tables
  async initializeTables() {
    try {
      const existingUser = await this.getUserById(1);
      if (!existingUser) {
        await this.createUser({
          email: "default@soaggtv.com",
          name: "Default User",
          language: "it"
        });
        console.log("Default user created successfully");
      }
    } catch (error) {
      console.error("Error initializing tables:", error);
    }
  }
};
var storage = new Storage();

// server/routes.ts
var TMDB_API_KEY = process.env.TMDB_API_KEY || "cc1ec3c5f60161adb639e0c6b609b715";
var TMDB_BASE_URL = "https://api.themoviedb.org/3";
async function registerRoutes(app2) {
  storage.initializeTables();
  app2.get("/api/tmdb/movie/popular", async (req, res) => {
    try {
      const { page = 1, language = "it" } = req.query;
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}&language=${language}`
      );
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching popular movies:", error);
      res.status(500).json({ error: "Failed to fetch popular movies" });
    }
  });
  app2.get("/api/tmdb/tv/popular", async (req, res) => {
    try {
      const { page = 1, language = "it" } = req.query;
      const response = await fetch(
        `${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&page=${page}&language=${language}`
      );
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching popular TV shows:", error);
      res.status(500).json({ error: "Failed to fetch popular TV shows" });
    }
  });
  app2.get("/api/tmdb/movie/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { language = "it" } = req.query;
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=${language}`
      );
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching movie details:", error);
      res.status(500).json({ error: "Failed to fetch movie details" });
    }
  });
  app2.get("/api/tmdb/tv/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { language = "it" } = req.query;
      const response = await fetch(
        `${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&language=${language}`
      );
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching TV show details:", error);
      res.status(500).json({ error: "Failed to fetch TV show details" });
    }
  });
  app2.get("/api/tmdb/tv/:id/season/:season", async (req, res) => {
    try {
      const { id, season } = req.params;
      const { language = "it" } = req.query;
      const response = await fetch(
        `${TMDB_BASE_URL}/tv/${id}/season/${season}?api_key=${TMDB_API_KEY}&language=${language}`
      );
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching season details:", error);
      res.status(500).json({ error: "Failed to fetch season details" });
    }
  });
  app2.get("/api/tmdb/genre/movie/list", async (req, res) => {
    try {
      const { language = "it" } = req.query;
      const response = await fetch(
        `${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=${language}`
      );
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching movie genres:", error);
      res.status(500).json({ error: "Failed to fetch movie genres" });
    }
  });
  app2.get("/api/tmdb/genre/tv/list", async (req, res) => {
    try {
      const { language = "it" } = req.query;
      const response = await fetch(
        `${TMDB_BASE_URL}/genre/tv/list?api_key=${TMDB_API_KEY}&language=${language}`
      );
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching TV genres:", error);
      res.status(500).json({ error: "Failed to fetch TV genres" });
    }
  });
  app2.get("/api/tmdb/discover/movie", async (req, res) => {
    try {
      const { with_genres, page = 1, language = "it" } = req.query;
      const response = await fetch(
        `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${with_genres}&page=${page}&language=${language}&sort_by=popularity.desc`
      );
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching movies by genre:", error);
      res.status(500).json({ error: "Failed to fetch movies by genre" });
    }
  });
  app2.get("/api/tmdb/discover/tv", async (req, res) => {
    try {
      const { with_genres, page = 1, language = "it" } = req.query;
      const response = await fetch(
        `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=${with_genres}&page=${page}&language=${language}&sort_by=popularity.desc`
      );
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching TV shows by genre:", error);
      res.status(500).json({ error: "Failed to fetch TV shows by genre" });
    }
  });
  app2.get("/api/tmdb/trending/movie/:timeWindow", async (req, res) => {
    try {
      const { timeWindow } = req.params;
      const { language = "it" } = req.query;
      const response = await fetch(
        `${TMDB_BASE_URL}/trending/movie/${timeWindow}?api_key=${TMDB_API_KEY}&language=${language}`
      );
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching trending movies:", error);
      res.status(500).json({ error: "Failed to fetch trending movies" });
    }
  });
  app2.get("/api/tmdb/trending/tv/:timeWindow", async (req, res) => {
    try {
      const { timeWindow } = req.params;
      const { language = "it" } = req.query;
      const response = await fetch(
        `${TMDB_BASE_URL}/trending/tv/${timeWindow}?api_key=${TMDB_API_KEY}&language=${language}`
      );
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching trending TV shows:", error);
      res.status(500).json({ error: "Failed to fetch trending TV shows" });
    }
  });
  app2.get("/api/tmdb/search/multi", async (req, res) => {
    try {
      const { query, page = 1, language = "it" } = req.query;
      const response = await fetch(
        `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}&language=${language}`
      );
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error searching content:", error);
      res.status(500).json({ error: "Failed to search content" });
    }
  });
  app2.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(400).json({ error: "Invalid user data" });
    }
  });
  app2.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUserById(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });
  app2.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.updateUser(id, req.body);
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(400).json({ error: "Invalid user data" });
    }
  });
  app2.get("/api/users/:userId/watch-progress", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const progress = await storage.getWatchProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching watch progress:", error);
      res.status(500).json({ error: "Failed to fetch watch progress" });
    }
  });
  app2.post("/api/users/:userId/watch-progress", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const progressData = insertWatchProgressSchema.parse({
        ...req.body,
        userId
      });
      const progress = await storage.saveWatchProgress(progressData);
      res.json(progress);
    } catch (error) {
      console.error("Error saving watch progress:", error);
      res.status(400).json({ error: "Invalid progress data" });
    }
  });
  app2.delete("/api/watch-progress/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteWatchProgress(id);
      if (!success) {
        return res.status(404).json({ error: "Progress not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting watch progress:", error);
      res.status(500).json({ error: "Failed to delete progress" });
    }
  });
  app2.get("/api/users/:userId/my-list", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const myList2 = await storage.getMyList(userId);
      res.json(myList2);
    } catch (error) {
      console.error("Error fetching my list:", error);
      res.status(500).json({ error: "Failed to fetch my list" });
    }
  });
  app2.post("/api/users/:userId/my-list", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const itemData = insertMyListSchema.parse({
        ...req.body,
        userId
      });
      const item = await storage.addToMyList(itemData);
      res.json(item);
    } catch (error) {
      console.error("Error adding to my list:", error);
      res.status(400).json({ error: "Invalid item data" });
    }
  });
  app2.delete("/api/users/:userId/my-list/:tmdbId/:type", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const tmdbId = parseInt(req.params.tmdbId);
      const type = req.params.type;
      const success = await storage.removeFromMyList(userId, tmdbId, type);
      if (!success) {
        return res.status(404).json({ error: "Item not found in list" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from my list:", error);
      res.status(500).json({ error: "Failed to remove from list" });
    }
  });
  app2.get("/api/users/:userId/my-list/:tmdbId/:type", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const tmdbId = parseInt(req.params.tmdbId);
      const type = req.params.type;
      const isInList = await storage.isInMyList(userId, tmdbId, type);
      res.json({ isInList });
    } catch (error) {
      console.error("Error checking my list:", error);
      res.status(500).json({ error: "Failed to check list" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();

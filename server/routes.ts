import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertWatchProgressSchema, insertMyListSchema } from "@shared/schema";
import { z } from "zod";

const TMDB_API_KEY = process.env.TMDB_API_KEY || "cc1ec3c5f60161adb639e0c6b609b715";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database tables
  storage.initializeTables();

  // TMDB API proxy routes
  app.get("/api/tmdb/movie/popular", async (req, res) => {
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

  app.get("/api/tmdb/tv/popular", async (req, res) => {
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

  app.get("/api/tmdb/movie/:id", async (req, res) => {
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

  app.get("/api/tmdb/tv/:id", async (req, res) => {
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

  app.get("/api/tmdb/tv/:id/season/:season", async (req, res) => {
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

  // Genres
  app.get("/api/tmdb/genre/movie/list", async (req, res) => {
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

  app.get("/api/tmdb/genre/tv/list", async (req, res) => {
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

  // Discover by genre
  app.get("/api/tmdb/discover/movie", async (req, res) => {
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

  app.get("/api/tmdb/discover/tv", async (req, res) => {
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

  // Trending
  app.get("/api/tmdb/trending/movie/:timeWindow", async (req, res) => {
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

  app.get("/api/tmdb/trending/tv/:timeWindow", async (req, res) => {
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

  app.get("/api/tmdb/search/multi", async (req, res) => {
    try {
      const { query, page = 1, language = "it" } = req.query;
      const response = await fetch(
        `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query as string)}&page=${page}&language=${language}`
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

  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
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

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.updateUser(id, req.body);
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  // Watch progress routes
  app.get("/api/users/:userId/watch-progress", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const progress = await storage.getWatchProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching watch progress:", error);
      res.status(500).json({ error: "Failed to fetch watch progress" });
    }
  });

  app.post("/api/users/:userId/watch-progress", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const progressData = insertWatchProgressSchema.parse({
        ...req.body,
        userId,
      });
      const progress = await storage.saveWatchProgress(progressData);
      res.json(progress);
    } catch (error) {
      console.error("Error saving watch progress:", error);
      res.status(400).json({ error: "Invalid progress data" });
    }
  });

  app.delete("/api/watch-progress/:id", async (req, res) => {
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

  // My list routes
  app.get("/api/users/:userId/my-list", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const myList = await storage.getMyList(userId);
      res.json(myList);
    } catch (error) {
      console.error("Error fetching my list:", error);
      res.status(500).json({ error: "Failed to fetch my list" });
    }
  });

  app.post("/api/users/:userId/my-list", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const itemData = insertMyListSchema.parse({
        ...req.body,
        userId,
      });
      const item = await storage.addToMyList(itemData);
      res.json(item);
    } catch (error) {
      console.error("Error adding to my list:", error);
      res.status(400).json({ error: "Invalid item data" });
    }
  });

  app.delete("/api/users/:userId/my-list/:tmdbId/:type", async (req, res) => {
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

  app.get("/api/users/:userId/my-list/:tmdbId/:type", async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
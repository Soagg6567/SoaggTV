# SoaggTV - Streaming Platform

## Overview

SoaggTV is a modern streaming platform built with React, Express, and TypeScript. It provides a Netflix-like experience for users to browse, search, and watch movies and TV shows. The application integrates with TMDB (The Movie Database) API for content metadata and uses external video streaming services for media playback.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: Wouter for client-side routing
- **State Management**: React Context API with useReducer
- **Build Tool**: Vite for development and production builds
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: PostgreSQL-backed sessions
- **API Integration**: TMDB API proxy endpoints

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Shared between client and server
- **Tables**: Users, watch progress, and user's personal lists
- **Migrations**: Managed through Drizzle Kit

## Key Components

### Frontend Components
1. **Core Pages**
   - Home: Hero section with trending content
   - Movies: Paginated movie browsing
   - TV Shows: Paginated TV show browsing
   - My List: User's saved content
   - Watch History: User's viewing history

2. **UI Components**
   - Header: Navigation and user controls
   - MediaCard: Reusable content display component
   - VideoPlayer: External video streaming integration
   - Search/Profile Modals: User interaction interfaces

3. **Context Management**
   - AppContext: Global state for user, language, watch progress, and lists
   - Persistent storage using localStorage for offline capabilities

### Backend Services
1. **TMDB API Integration**
   - Movie/TV show metadata fetching
   - Search functionality
   - Trending content aggregation
   - Genre-based content filtering

2. **User Management**
   - User authentication (simplified)
   - Personal list management
   - Watch progress tracking

3. **Media Streaming**
   - External video source integration
   - Progress tracking and resumption

## Data Flow

1. **Content Discovery**
   - Client requests content from backend
   - Backend proxies requests to TMDB API
   - Content metadata returned to frontend
   - UI renders content cards and details

2. **User Interactions**
   - User actions (add to list, watch progress) stored in context
   - Backend APIs handle persistent storage
   - Real-time updates through context state changes

3. **Video Playback**
   - External video streaming service integration
   - Progress tracking through postMessage API
   - Automatic progress saving and restoration

## External Dependencies

### Third-Party Services
- **TMDB API**: Content metadata and search
- **Video Streaming**: External video sources for content playback
- **Neon Database**: PostgreSQL hosting (configured for production)

### Key NPM Packages
- **Frontend**: React, Vite, Tailwind CSS, Radix UI, Wouter
- **Backend**: Express, Drizzle ORM, PostgreSQL drivers
- **Shared**: Zod for validation, TypeScript for type safety

## Deployment Strategy

### Development
- Vite dev server for frontend hot reloading
- Express server with TypeScript compilation
- Environment variables for API keys and database connection
- Shared types and schema between client and server

### Production
- Vite build process generates static frontend assets
- Express server serves both API and static files
- PostgreSQL database with connection pooling
- Environment-based configuration management

### Database Management
- Drizzle migrations for schema changes
- Shared schema definition between client and server
- Type-safe database operations with Drizzle ORM

## Changelog

- July 07, 2025: Initial setup
- July 07, 2025: Fixed video player URLs to use vidsrc.to embed format
- July 07, 2025: Removed "Continue watching" section and all simulated/fake data
- July 07, 2025: Implemented proper handling of missing images without placeholders

## User Preferences

Preferred communication style: Simple, everyday language.
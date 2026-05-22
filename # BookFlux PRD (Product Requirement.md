# BookFlux PRD (Product Requirements Document)

## Product Name

**BookFlux**
AI-powered cinematic book discovery platform

---

# 1. Vision

BookFlux is a visually immersive AI-powered web application that helps users discover books based on:

* mood
* personality
* emotional state
* current trends
* aesthetics
* reading history
* thematic preferences

Unlike traditional recommendation systems, BookFlux focuses on:

* emotional resonance
* cinematic UI
* aesthetic-driven discovery
* lightweight AI orchestration
* low-token-cost intelligent personalization

The platform should feel like:

* Spotify for books
* Letterboxd for readers
* Pinterest + Netflix recommendation UX
* Dark academia aesthetic with modern glassmorphism

---

# 2. Product Goals

## Primary Goals

1. Deliver highly personalized book recommendations
2. Build an extremely visually appealing UI
3. Minimize AI token usage
4. Create a portfolio-quality AI application
5. Use lightweight scalable architecture

---

# 3. Non-Goals

The initial product SHOULD NOT include:

* full chatbot systems
* long-context RAG pipelines
* PDF ingestion
* OCR scanning
* multi-agent systems
* expensive vector retrieval at scale
* live crawling on every request

---

# 4. Core User Personas

## Persona 1 — Casual Reader

Wants:

* quick recommendations
* visually engaging browsing
* trending books

## Persona 2 — Emotional Explorer

Wants:

* books matching current mood
* emotionally intelligent recommendations

## Persona 3 — Aesthetic Reader

Wants:

* “vibe-based” discovery
* dark academia / cozy fantasy / rainy day reads

## Persona 4 — Power Reader

Wants:

* deep personalization
* analytics
* reading DNA profile

---

# 5. Product Principles

## 5.1 AI Should Enhance — Not Dominate

AI is used sparingly:

* interpretation
* explanation
* personalization

Most computation should be:

* cached
* deterministic
* embedding-based
* database-driven

---

## 5.2 UI Is a Core Feature

The interface should feel premium and cinematic.

Heavy emphasis on:

* motion
* transitions
* gradients
* typography
* immersive browsing

---

## 5.3 Token Efficiency Is Critical

The app must remain affordable using:

* Gemini Flash
* standard AI models
* short prompts
* caching

---

# 6. Recommended Tech Stack

## Frontend

* Next.js 15
* TypeScript
* TailwindCSS
* shadcn/ui
* Framer Motion

## Backend

* Supabase
  OR
* Firebase

## Database

PostgreSQL (via Supabase preferred)

## AI

* Google Gemini Flash
* Google AI Studio APIs

## Hosting

* Vercel

## Optional

* Upstash Redis for caching

---

# 7. High-Level Architecture

```txt
Frontend (Next.js)
    |
API Layer
    |
Recommendation Engine
    |
Database + Cached Embeddings
    |
Gemini Flash (small prompts only)
```

---

# 8. Design Language

## Visual Style

* Dark academia
* Cinematic gradients
* Glassmorphism
* Floating UI cards
* Smooth transitions

## Inspirations

* Spotify
* Letterboxd
* Netflix
* Pinterest
* Apple Music

## Color Palette

Background:

* #0F1115
* #151821

Accent:

* #C8A96B
* #8B5CF6

Text:

* #F5F5F5
* #B8B8B8

---

# 9. Typography

## Fonts

Headings:

* Playfair Display

Body:

* Inter

---

# 10. Core Features

---

# FEATURE 1 — Cinematic Landing Page

## Description

Animated landing page introducing the product.

## Requirements

* Hero section
* Floating book covers
* Gradient lighting effects
* Smooth scroll transitions
* CTA buttons
* Responsive design

## Animations

* parallax movement
* hover glow effects
* soft blur transitions

---

# FEATURE 2 — AI Recommendation Search

## Description

Users describe what they want to read.

Example:

> “Something like Harry Potter but darker and philosophical.”

## Input Types

* free text
* mood selection
* genre tags
* pacing slider
* emotional tone

## AI Responsibilities

Gemini converts input into:

* themes
* tags
* recommendation intent

## Backend Responsibilities

Backend performs:

* embedding similarity
* trend weighting
* filtering
* ranking

---

# FEATURE 3 — Trending Books Engine

## Description

Shows trending books from:

* Reddit
* Goodreads
* BookTok
* NYT Best Sellers

## Important

NO live crawling per request.

## Implementation

Run scheduled jobs every few hours:

1. fetch trends
2. normalize metadata
3. cache results
4. store rankings

---

# FEATURE 4 — Mood Discovery

## Description

Users browse emotional/aesthetic categories.

## Example Categories

* Cozy Fantasy
* Rainy Day Reads
* Dark Academia
* Existential Fiction
* Found Family
* Emotional Damage

## UI

Grid of animated cards.

---

# FEATURE 5 — “Why You’ll Love This”

## Description

AI-generated explanation for recommendations.

## Constraints

Response length:

* max 2–4 sentences

## Important

Must use:

* extremely short prompts
* low temperature
* cached outputs

---

# FEATURE 6 — Reading DNA Profile

## Description

Persistent reader taste profile.

## Attributes

* emotional depth
* pacing tolerance
* darkness level
* prose density
* optimism
* complexity

## UI

Radar chart or animated metrics.

---

# FEATURE 7 — Book Universe Map

## Description

Interactive graph visualization of books.

## Relationships

Books connected by:

* themes
* genres
* tone
* audience overlap

## Tech

* react-force-graph
  OR
* three.js

---

# FEATURE 8 — Reading Dashboard

## Metrics

* books explored
* favorite genres
* reading streaks
* emotional patterns
* monthly activity

---

# FEATURE 9 — Anti-Doomscroll Mode

## Description

Intentional recommendation limitation.

## Example

Only:

* 3 recommendations/day
  OR
* timed discovery sessions

---

# 11. Recommendation System Architecture

## Step 1 — User Query

User enters preferences.

## Step 2 — AI Interpretation

Gemini extracts:

* themes
* emotional tone
* pacing
* genre

## Step 3 — Embedding Search

Search vectorized metadata.

## Step 4 — Ranking

Weighted scoring:

* similarity
* popularity
* trend score
* diversity score

## Step 5 — AI Explanation

Generate concise recommendation explanation.

---

# 12. AI Usage Rules

## MUST DO

* keep prompts short
* cache outputs
* use Gemini Flash
* precompute embeddings
* limit generations

## MUST NOT DO

* send large contexts
* use full book summaries
* run AI continuously
* generate long outputs

---

# 13. Database Schema

## users

```sql
id
email
username
created_at
```

## books

```sql
id
title
author
genres
themes
description
cover_url
embedding
trend_score
popularity_score
```

## user_preferences

```sql
user_id
favorite_genres
favorite_books
mood_profile
reading_dna
```

## recommendations

```sql
id
user_id
book_id
reason
created_at
```

## trending_books

```sql
book_id
source
trend_score
updated_at
```

---

# 14. API Routes

## Recommendations

```txt
POST /api/recommend
```

## Trending

```txt
GET /api/trending
```

## User Profile

```txt
GET /api/profile
```

## Save Preferences

```txt
POST /api/preferences
```

---

# 15. Performance Requirements

## Page Load

Target:
< 2.5 seconds

## Recommendation Response

Target:
< 3 seconds

## Lighthouse Score

Target:
90+

---

# 16. Accessibility Requirements

Must support:

* keyboard navigation
* contrast compliance
* screen responsiveness
* reduced motion mode

---

# 17. Mobile Requirements

Responsive support for:

* phones
* tablets
* desktop

Mobile-first layout preferred.

---

# 18. Authentication

Preferred:

* Google OAuth
* Email/password

Optional:

* guest mode

---

# 19. Analytics

Track:

* searches
* recommendation clicks
* saved books
* mood selections
* session duration

---

# 20. Caching Strategy

## Cache:

* explanations
* embeddings
* trend data
* recommendation sets

## Avoid repeated AI calls.

---

# 21. Security Requirements

* Rate limiting
* Input sanitization
* Environment variable protection
* Secure API routes

---

# 22. Error States

Must include:

* skeleton loaders
* empty states
* retry buttons
* graceful AI failures

---

# 23. Success Metrics

## MVP Success

* recommendation latency < 3s
* visually impressive UI
* stable deployment
* low API cost

## Long-Term Success

* returning users
* saved libraries
* recommendation engagement

---

# 24. PHASED DEVELOPMENT PLAN

---

# PHASE 1 — Foundation MVP

## Goal

Build functional recommendation platform.

## Features

* Landing page
* Authentication
* Recommendation input
* Basic recommendation engine
* Trending books
* AI explanations
* Responsive UI

## Deliverables

* deployed MVP
* Supabase integration
* Gemini integration

## Estimated Complexity

Medium

---

# PHASE 2 — Personalization

## Goal

Make recommendations smarter.

## Features

* Reading DNA
* Saved preferences
* User profiles
* Recommendation history
* Mood engine

## Deliverables

* persistent personalization
* user dashboards

## Estimated Complexity

Medium-High

---

# PHASE 3 — Visual Experience Upgrade

## Goal

Create premium UI experience.

## Features

* animated transitions
* parallax effects
* floating shelves
* cinematic gradients
* interactive cards

## Deliverables

* highly polished UI

## Estimated Complexity

Medium

---

# PHASE 4 — Advanced Discovery

## Goal

Introduce immersive exploration.

## Features

* Book universe graph
* emotional clustering
* advanced filters
* aesthetic browsing

## Deliverables

* exploratory recommendation UX

## Estimated Complexity

High

---

# PHASE 5 — Optimization

## Goal

Reduce cost and improve scale.

## Features

* caching layer
* optimized prompts
* embedding compression
* recommendation batching

## Deliverables

* low operational cost
* faster response times

---

# 25. Prompt Engineering Guidelines

## Recommendation Extraction Prompt

```txt
Extract:
- genres
- emotional tone
- pacing
- themes

Return JSON only.
```

## Explanation Prompt

```txt
Explain why this book matches the user in 2 sentences.
```

---

# 26. Suggested Folder Structure

```txt
/app
/components
/features
/lib
/hooks
/services
/api
/styles
/utils
/types
```

---

# 27. Deployment Checklist

## Before Launch

* environment variables configured
* caching enabled
* image optimization enabled
* API rate limits configured
* loading states implemented

---

# 28. Future Features

## Potential Additions

* AI reading coach
* social features
* book clubs
* Spotify-style yearly recap
* audio ambience
* adaptive themes
* collaborative recommendations

---

# 29. Final Product Vision

BookFlux should feel:

* emotional
* cinematic
* intelligent
* premium
* immersive

The experience should feel less like:

> searching a database

And more like:

> wandering through a magical personalized library.

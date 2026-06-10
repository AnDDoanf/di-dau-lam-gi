# Food Tour Map Web – Phase 1 Product Specification

## 1. Overview

Food Tour Map is a static Next.js web application that helps travelers discover restaurants, street food vendors, coffee shops, dessert locations, bars, and attractions on an interactive map.

Users can:

* Browse curated places on a map
* Generate food tours automatically
* Build custom tours manually
* Mark places as visited
* Share tours via URL
* View optimized travel routes

Phase 1 is fully static and does not require authentication or a backend database.

The architecture must be designed to support a future Phase 2 migration to APIs, databases, user accounts, saved tours, and community contributions.

---

# 2. Objectives

### Business Goals

* Create a simple food-tour planning experience
* Allow easy sharing of tours
* Showcase curated food locations
* Support future crowdsourced content

### Technical Goals

* Static deployment
* SEO-friendly
* Mobile-friendly
* Database-ready architecture
* Fast loading performance

---

# 3. Technology Stack

## Frontend

* Next.js 16+
* TypeScript
* TailwindCSS
* React

## Mapping

* Google Maps JavaScript API

## State Management

* React Context
* URL State

## Data Source

Static TypeScript files

```txt
src/data/places.ts
src/data/cities.ts
src/data/categories.ts
```

---

# 4. Application Pages

## Home Page

Route

```txt
/
```

Purpose

```txt
Browse map
Generate tours
Filter places
Share tours
```

Components

```txt
Map
Sidebar
Filters
Tour Generator
Place Detail Drawer
```

---

## Tour Page

Route

```txt
/tour
```

Example

```txt
/tour?stops=id:bun-cha|id:pho-thin|id:egg-coffee
```

Purpose

```txt
Render a tour from URL data
Display route
Display stops
Allow sharing
```

---

## Place Page

Route

```txt
/places/[slug]
```

Purpose

```txt
SEO landing page
Detailed information
Photos
Location
Recommendations
```

---

# 5. Place Model

```ts
type PlaceCategory =
  | "main_meal"
  | "street_food"
  | "fast_food"
  | "drink"
  | "dessert"
  | "coffee"
  | "bar"
  | "attraction";

type Place = {
  id: string;
  slug: string;
  name: string;

  category: PlaceCategory;

  description?: string;

  latitude: number;
  longitude: number;

  address?: string;

  imageUrl?: string;

  tags: string[];

  openingHours?: string;

  recommendedItems?: string[];

  priceLevel?: 1 | 2 | 3 | 4;

  city: string;
};
```

---

# 6. Tour Stop Model

```ts
type TourStop =
  | {
      type: "place";
      placeId: string;
    }
  | {
      type: "custom";
      latitude: number;
      longitude: number;
      label?: string;
      category?: string;
    };
```

---

# 7. Visited Place System

Users can mark places as visited.

Visited places are:

```txt
✓ Displayed on map
✓ Shown with different marker style
✓ Excluded from auto-generated routes
✓ Excluded from generated polylines
✓ Still visible in place list
✓ Included in share URLs
```

Status

```ts
type VisitStatus =
  | "visited"
  | "unvisited";
```

Storage

```txt
localStorage
```

Key

```txt
food-tour.visited-places
```

---

# 8. Tour Generation System

The system automatically builds tours using predefined travel rules.

---

## Generation Flow

```txt
1. Select city
2. Filter out visited places
3. Apply generation rule
4. Select matching places
5. Build route
6. Draw polyline
7. Generate share URL
```

---

# 9. Tour Generation Rules

## Mode A – By Number of Places

User selects

```txt
3 places
5 places
7 places
10 places
```

Composition rules

| Places | Main Meal | Street Food | Drink/Coffee | Dessert | Attraction |
| ------ | --------- | ----------- | ------------ | ------- | ---------- |
| 3      | 1         | 1           | 1            | 0       | 0          |
| 5      | 1         | 2           | 1            | 1       | 0          |
| 7      | 2         | 2           | 1            | 1       | 1          |
| 10     | 2         | 3           | 2            | 1       | 2          |

---

## Mode B – By Travel Days

User selects

```txt
1 day
2 days
3 days
```

Default daily schedule

```txt
Morning:
Coffee / Drink

Lunch:
Main Meal

Afternoon:
Street Food

Evening:
Main Meal

Night:
Dessert / Drink
```

---

### One-Day Tour

```txt
5 places

1 Coffee
2 Main Meals
1 Street Food
1 Dessert
```

---

### Two-Day Tour

```txt
10 places

2 Coffee
3 Main Meals
2 Street Foods
2 Desserts
1 Attraction
```

---

### Three-Day Tour

```txt
15 places

3 Coffee
4 Main Meals
3 Street Foods
3 Desserts
2 Attractions
```

---

# 10. Route Optimization

Phase 1 uses a simple nearest-neighbor algorithm.

Process

```txt
Select starting place
Find nearest unvisited place
Append to route
Repeat
```

Advantages

```txt
Fast
Simple
No external services
Works offline
```

Future Phase 2

```txt
Google Directions API
Travel time optimization
Walking mode
Motorbike mode
Public transportation mode
```

---

# 11. Google Map Features

Map must support

```txt
Show markers
Show polylines
Center on tour
Zoom to fit route
Marker clustering
Place info windows
```

---

## Marker Types

### Unvisited

```txt
Normal marker
```

### Visited

```txt
Grey marker
Checkmark icon
```

---

## Marker Info Window

Display

```txt
Place name
Category
Address
Recommended foods
Open Google Maps
Add to Tour
Mark Visited
```

---

# 12. Sidebar

Contains

```txt
Search
Category filters
Place list
Visited toggle
Tour generator
Tour summary
Share button
```

---

# 13. Search & Filters

Search

```txt
Name
Tags
Food type
```

Filters

```txt
Main Meal
Street Food
Fast Food
Coffee
Drink
Dessert
Bar
Attraction
```

Additional Filters

```txt
Visited
Unvisited
Price Level
```

---

# 14. Shareable URL System

Tours must be fully reconstructable from URL.

---

## Route Format

```txt
/tour?stops=id:bun-cha|id:egg-coffee|id:pho-thin
```

---

## Mixed Format

```txt
/tour?stops=id:bun-cha|custom:21.0285,105.8542
```

---

## With Visited Places

```txt
/tour?stops=id:bun-cha|id:egg-coffee|id:pho-thin
&visited=egg-coffee
```

When opened

```txt
bun-cha → active
pho-thin → active
egg-coffee → visited
```

---

# 15. URL Parser Requirements

Create

```ts
parseTourFromUrl()
```

Responsibilities

```txt
Read stops
Validate coordinates
Resolve place IDs
Apply visited state
Preserve order
Ignore invalid data
```

---

# 16. Project Structure

```txt
src
├── app
│   ├── page.tsx
│   ├── tour
│   │   └── page.tsx
│   └── places
│       └── [slug]
│           └── page.tsx
│
├── components
│   ├── map
│   │   ├── TravelMap.tsx
│   │   ├── PlaceMarker.tsx
│   │   └── TourPolyline.tsx
│   │
│   ├── sidebar
│   │   ├── FilterPanel.tsx
│   │   ├── SearchBar.tsx
│   │   └── TourGenerator.tsx
│   │
│   └── places
│       ├── PlaceCard.tsx
│       └── PlaceDetail.tsx
│
├── data
│   ├── places.ts
│   ├── categories.ts
│   └── cities.ts
│
├── hooks
│   ├── useVisitedPlaces.ts
│   └── useTourGenerator.ts
│
├── lib
│   ├── route-generator.ts
│   ├── url-parser.ts
│   └── map-utils.ts
│
└── types
    ├── place.ts
    └── tour.ts
```

---

# 17. Phase 1 Limitations

Not included

```txt
Authentication
User profiles
Database
Admin dashboard
Saved tours
Reviews
Ratings
Photo uploads
Comments
Real-time updates
```

---

# 18. Phase 2 Expansion Plan

Static → Dynamic Mapping

```txt
places.ts
→ places table

visited localStorage
→ user_place_visits table

generated route
→ tours table

route stops
→ tour_stops table

share URL
→ short links

local data
→ CMS + Admin Dashboard
```

Additional Features

```txt
Accounts
Bookmarks
Saved Tours
Tour History
Community Tours
Review System
Photo Uploads
AI Tour Generator
Google Directions Integration
```

---

# 19. Success Criteria

Phase 1 is complete when:

```txt
✓ User can browse places on map

✓ User can search and filter places

✓ User can mark places as visited

✓ Visited places are excluded from generated routes

✓ User can generate tours by place count

✓ User can generate tours by travel days

✓ User can view optimized route polyline

✓ User can share tour URLs

✓ Shared URLs recreate the same tour

✓ New places can be added through data files

✓ Architecture supports future database migration

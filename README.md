# Đi Đâu Làm Gì? — Vietnamese Food Tour Planner & Experience Mapper

**Đi Đâu Làm Gì?** (Go somewhere, do something) is a static Next.js web application designed to help travelers discover restaurants, street food vendors, coffee shops, desserts, bars, and attractions in Vietnam on an interactive map.

---

## 🌟 Key Features

- **Interactive Maps**: Browse curated culinary hotspots and attractions in Vietnam (Hanoi, HCMC, Da Nang) plotted dynamically on a map.
- **Dynamic Tour Generator**: Generate optimized travel routes instantly.
  - **By Count**: Generate routes containing 3, 5, 7, or 10 locations matching specific type-composition rules.
  - **By Days**: Choose a 1-day, 2-day, or 3-day itinerary scheduled logically by time-of-day.
- **Route Optimization**: Uses a client-side nearest-neighbor algorithm to trace an optimized path with custom polylines, working offline and without external API costs.
- **Visited Place Tracking**: Mark places as visited to track your journey. Visited places are greyed out on the map, excluded from auto-generation, but preserved in the sidebar list. State is persisted in `localStorage`.
- **Shareable URL System**: Fully reconstruct and share customized tours via query parameters (e.g. `/tour?stops=id:bun-cha|id:pho-thin&visited=pho-thin`).
- **Markdown-Driven Content Catalog**: Add, edit, or delete locations in a simple Markdown file ([PLACES.md](file:///c:/code/di-dau/PLACES.md)). A compiler automatically translates it into typescript code on build and on the fly during local development.
- **Automated Deployment**: Ready-to-go GitHub Pages integration via GitHub Actions.

---

## 📁 Repository Structure

```txt
di-dau/
├── .github/workflows/
│   └── deploy.yml              # GitHub Actions deployment workflow
├── PLACES.md                   # Source database file for catalog locations
├── SPEC.md                     # Application specifications and details
├── README.md                   # Root documentation (this file)
└── frontend/                   # Next.js web application
    ├── next.config.ts          # Static HTML export config
    ├── package.json            # React/Next.js script definitions
    ├── scripts/
    │   └── parse-places.js     # Catalog compiler script (PLACES.md -> places.ts)
    └── src/
        ├── app/                # Next.js App Router (pages, layout, routing)
        │   ├── page.tsx        # Dashboard / Main Map Explorer
        │   ├── tour/           # Shared Tour Page
        │   └── places/[slug]/  # SEO-friendly Place Detail Pages
        ├── components/         # Map rendering & sidebar layout components
        ├── context/            # Multi-language & global application context
        ├── data/               # Compiled places catalog data
        ├── hooks/              # Custom React hooks (visited lists, generator)
        └── types/              # TypeScript models for Places & Tours
```

---

## 🛠️ Development Quickstart

### Prerequisites
- Node.js (v20+ recommended)
- npm

### Running Locally

1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   > [!NOTE]
   > The dev server runs on `http://localhost:3000`. Running `npm run dev` automatically triggers `scripts/parse-places.js` to parse [PLACES.md](file:///c:/code/di-dau/PLACES.md) and regenerate the static database in `frontend/src/data/places.ts`.

---

## ⚙️ Data Compiler (PLACES.md)

Adding new food spots is as simple as adding an entry to [PLACES.md](file:///c:/code/di-dau/PLACES.md) at the root of the project. Entries follow this format:

```markdown
### 1. Bun Cha Huong Lien (Obama Bun Cha)
- **id**: bun-cha
- **slug**: bun-cha-huong-lien
- **category**: main_meal
- **city**: hanoi
- **latitude**: 21.0192
- **longitude**: 105.8566
- **address**: 24 Le Van Huu, Hai Ba Trung, Hanoi
- **imageUrl**: https://images.unsplash.com/...
- **tags**: Bun Cha, Pork, Hanoi Classic
- **openingHours**: 08:00 AM - 08:30 PM
- **recommendedItems**: Bún Chả Đặc Biệt, Nem Cua Bể
- **priceLevel**: 2
- **description**: Famous for hosting President Obama.
```

The node script `parse-places.js` runs automatically on dev/build. It parses the properties, maps numeric and list types, validates required fields (`id`, `category`, `latitude`, `longitude`), and writes `frontend/src/data/places.ts`.

---

## 🚀 GitHub Pages Deployment

The application is configured to deploy as a static website to **GitHub Pages**.

1. **Configuration**:
   - `next.config.ts` exports static HTML to the `frontend/out/` folder via `output: 'export'`.
   - In production builds, the app prepends `/di-dau-lam-gi` to links and asset URLs to support the GitHub Pages project subpath.

2. **Actions Workflow**:
   - The [.github/workflows/deploy.yml](file:///c:/code/di-dau/.github/workflows/deploy.yml) workflow runs automatically on pushes to the `main` branch.
   - It checks out the codebase, builds the Next.js frontend, compiles the places catalog, and publishes the output static files.

3. **Activation**:
   - Navigate to your repository settings page: `Settings` -> `Pages`.
   - Set **Build and deployment** -> **Source** to **GitHub Actions**.
   - Your site will deploy automatically to `https://AnDDoanf.github.io/di-dau-lam-gi/`.

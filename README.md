# Hotel List Page – CRUD with Responsive UI

**Frontend:** React 18 + Redux Toolkit + React Router + React Helmet (Vite)
**Backend:** Node.js + Express + PostgreSQL (native SQL with `pg`, images stored with Multer)

## 1. Prerequisites
- Node.js 18+
- PostgreSQL 13+ running locally

## 2. Set up the database
Create an empty database (any name):

```bash
psql -U postgres -c "CREATE DATABASE hotels_db;"
```

## 3. Run the backend (port 5000)
```bash
cd backend
npm install
cp .env.example .env        # Windows: copy .env.example .env
# edit .env -> set DATABASE_URL with your PostgreSQL user/password
npm run db:init             # creates the "hotels" table (schema.sql)
npm run dev                 # or: npm start
```
Check: http://localhost:5000/api/health -> `{"status":"ok"}`

## 4. Run the frontend (port 5173)
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173. Vite proxies `/api` and `/uploads` to the backend, so no extra config is needed.

## 5. How to use it
| Action | How |
|---|---|
| Add a hotel | **Add hotel** button -> fill the form (image, title, description, latitude, longitude, price) -> **Add hotel** |
| Edit | **Edit** on a card (or on the detail page). Same form, pre-filled. Choose a new image only to replace it |
| Delete | **Delete** on a card -> confirm -> success popup |
| Search / filter | Sidebar: title search + min/max price -> **Apply**. **Reset** clears |
| Pagination | Buttons under the list (6 per page). Filters and page are kept in the URL |
| Detail page | Click a card. Shows full info, OpenStreetMap map for the lat/long, and a "Distance from my location" button (browser Geolocation API) |

The form also has **Use my current location** (Geolocation API) to fill latitude/longitude.

## 6. REST API
| Method | Endpoint | Notes |
|---|---|---|
| POST | `/api/hotels` | `multipart/form-data`: image, title, description, latitude, longitude, price. Image saved in `backend/uploads`, path saved in DB |
| PUT | `/api/hotels/:id` | Same fields; `image` optional. Old image file deleted when replaced |
| DELETE | `/api/hotels/:id` | Deletes row and the image file |
| GET | `/api/hotels` | Query: `search`, `minPrice`, `maxPrice`, `limit` (default 6), `offset` (default 0). Returns `{ data, total, limit, offset }` |
| GET | `/api/hotels/:id` | Single hotel (used by detail and edit pages) |

Validation errors return `400 { message, errors: { field: "message" } }`.

## 7. Project structure
```
backend/
  schema.sql                 table definition
  src/server.js              Express app, static /uploads, error handler
  src/db.js                  pg Pool
  src/initDb.js              runs schema.sql
  src/routes/hotels.js       CRUD + filters, native SQL
  src/middleware/upload.js   Multer (disk storage, 5 MB, images only)
  src/middleware/validate.js request validation
frontend/src/
  store/                     Redux Toolkit store + hotelsSlice (async thunks)
  api.js                     fetch wrapper
  components/                HotelForm (add+edit), HotelCard, Pagination, Filters, Popup, MapView
  pages/                     HotelListPage, HotelFormPage, HotelDetailPage
```

## 8. Requirement checklist
- Single reusable form for add and edit, with validation and image preview: `HotelForm.jsx`
- Card list (not a table) with image, title, price, short description: `HotelCard.jsx`
- Search by title, price-range filter, pagination: `Filters.jsx`, `Pagination.jsx`, `GET /api/hotels`
- Edit and delete buttons; success popup after delete: `HotelListPage.jsx`, `Popup.jsx`
- Detail page with map and Geolocation API: `HotelDetailPage.jsx`
- SEO: React Helmet meta tags per page (`react-helmet-async`, the maintained Helmet fork) and `alt` text on every image
- SPA with React Router
- Native SQL (no ORM), images stored on the Node server

## 9. Production build
```bash
cd frontend && npm run build   # output in frontend/dist
```
Serve `dist` with any static host and route `/api` and `/uploads` to the backend.

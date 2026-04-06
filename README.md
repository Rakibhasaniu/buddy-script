
BuddyScript is a small full-stack social feed: users sign up, post text or images, comment and reply, and like posts and threads. Private posts are visible only to the author; everything else in the feed is public.

---

## What we built

**Backend (`buddyscript-backend`)**  
Express + TypeScript API on MongoDB. Features include JWT auth (short-lived access token + httpOnly refresh cookie), a cursor-based feed, posts with optional images (multipart upload to disk, then Cloudinary), nested comments and replies, and likes. Routes live under `/api/v1` (e.g. `/auth`, `/posts`, `/comments`, `/replies`). Security basics: Helmet, rate limits on auth/feed, CORS tied to `CLIENT_URL`, and sanitization for NoSQL injection.

**Frontend (`buddyscript-nextjs`)**  
Next.js (App Router) with Redux for auth and feed state. Axios clients call the API with `credentials: true` so refresh cookies work; the access token is stored in `localStorage` and attached as `Authorization`, with automatic refresh on 401. The UI reuses the existing HTML/CSS shell from the template and wires it to live data.

---

## Decisions (why it’s built this way)

| Topic | Choice | Reason |
|--------|--------|--------|
| **Likes** | Dedicated `Like` collection (`targetType` + `targetId` + `userId`) | One place to toggle likes for posts, comments, and replies; unique index prevents duplicates; denormalized `likesCount` on parent docs keeps reads fast for lists. |
| **Feed** | Cursor pagination (`_id` + limit) | Stable paging for infinite scroll without skip/offset drift on changing data. |
| **Images** | Multer → `uploads/` → Cloudinary → unlink temp file | Cloudinary holds public URLs; local folder is only a staging area (documented so clones create `uploads`). |
| **Auth** | Access JWT in header + refresh in httpOnly cookie | Common split: JS can read access for API calls; refresh stays out of `localStorage`. |
|

---


# BuddyScript frontend (Next.js)

Overview of the project and design choices: see the **README in the repository root** (one level above this folder).

---

## 1. Create `.env.local`

Add a file named **`.env.local`** in this folder (next to `package.json` and `src`):

```
buddyscript-nextjs/
  package.json
  src/
  .env.local       ← create this file
```

Put your API base URL in it (include `/api/v1`):

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

If you skip this, the app still defaults to that URL in code—but it’s better to set it so you can point to another machine or port later.


---



---

## Run

```bash
npm install
npm run dev
```

Then open the URL Next prints (often `http://localhost:3000`).


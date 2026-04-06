# BuddyScript backend

Overview of the project and design choices: see the **README in the repository root** (one level above this folder).

---

## 1. Add the `uploads` folder

Create a folder named **`uploads`** here (inside the backend project, next to `package.json` and `src`):

```
buddyscript-backend/
  package.json
  src/
  uploads/          ← create this folder (can be empty)
```

Image uploads are saved here briefly before they go to Cloudinary. If `uploads` is missing, posting with a photo can fail.

---

## 2. Create `.env`

Create a file named **`.env`** 

.env.example copy everything inside it, paste into .env



## Run

```bash
npm install
npm run start:dev
```

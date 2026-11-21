# UniSphere — Community Arena Upgrade (staging-ready code)

This is an **additive copy** of the uploaded `student-project-main` codebase. The original features, routes, authentication and MongoDB collections were preserved. **No changes were pushed to GitHub or deployed to Render.**

## Added features

| Feature | UI route | Backend API |
|---|---|---|
| Skill stats from completed quizzes, activity, streak and PvP record | `/skill-stats` | `GET /api/community/stats` |
| Leaderboards by period and global/college/friends | `/leaderboard` | `GET /api/community/leaderboard` |
| Search, request, accept and remove friends | `/friends` | `/api/community/friends`, `/api/community/students` |
| 1v1 timed friend-vs-friend MCQ battles | `/battles`, `/battles/:id` | `/api/battles` |
| Private study rooms with shared code scratchpad and live chat | `/study-rooms`, `/study-rooms/:id` | `/api/rooms`, Socket.IO |
| Grok-only AI for chat, quizzes and resume generation | existing pages | `/api/ai`, `/api/quiz`, `/api/resume` |

## IMPORTANT: Your old AI setup was **Groq**, not Grok

The uploaded project used `groq-sdk`, `GROQ_API_KEY` and `openai/gpt-oss-120b` in the AI assistant, quiz generator and resume endpoints. These controllers now use the **official Grok API** at `https://api.x.ai/v1/chat/completions` with `GROK_API_KEY`. The former `backend/config/groq.js` and `backend/config/omniRoute.js` files are retained as unused legacy files, so the original archive structure is easy to compare; the active controllers no longer import either. Grok API usage may incur billing.

The new PvP generator requests JSON from Grok, validates the question structure and stores correct answers only on the backend. Both players receive the same questions. AI-generated content may still contain factual errors: a curated, human-reviewed bank is recommended before introducing rated or prize-bearing competitions.

## Run locally (Windows)

Install Node.js LTS and MongoDB. In the project folder:

**Backend:**

```powershell
cd backend
npm install
Copy-Item .env.example .env
# Edit the new .env file with your credentials
npm run dev
```

**Frontend (new terminal):**

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Frontend: http://localhost:5173. Backend: http://localhost:5000.

**Why `npm install` instead of `npm ci`?** The new `socket.io` and `socket.io-client` dependencies could not be fetched in the environment where this upgrade was prepared (npm registry unavailable). The existing lockfiles are retained unchanged. Run `npm install` with internet access on both folders to update each `package-lock.json` before committing or using `npm ci`.

## Render staging first — do NOT deploy directly to your live project

1. Create a new GitHub branch, for example `feature/community-arena`. Import the upgraded files **into that branch**. Do not overwrite `main`.
2. Configure a **separate staging MongoDB database**. Do not run untested changes against your production database.
3. Create a new Render backend web service pointed at `backend/` on the staging branch. Build command: `npm install`; start command: `npm start`.
4. Backend environment: set `MONGO_URI`, `JWT_SECRET`, `GROK_API_KEY`, `GROK_CHAT_MODEL=grok-4.7`, `FRONTEND_URL=https://<your-staging-frontend>.onrender.com`, and any existing mail/OAuth variables your project needs. Keep keys exclusively on the server.
5. Create a staging frontend Static Site rooted at `frontend/`; build command: `npm install && npm run build`; publish directory: `dist`. Set `VITE_API_URL=https://<your-staging-backend>.onrender.com/api` **before** the frontend build.
6. Ensure SPA rewrites send unknown paths to `/index.html` (existing frontend uses React Router). Verify `/battles/:id` and `/study-rooms/:id` on page refresh.
7. Test with two separate student accounts in different browsers. Only consider merging into `main` after you confirm functionality and a production rollback plan.

Render web services support WebSockets. On free plans, idle services can sleep; reconnecting clients should refresh state from MongoDB. The implementation supports one backend instance; scaling Socket.IO across multiple instances requires a Redis adapter and appropriate affinity/shared state.

## Test with two accounts

1. Log into both accounts, confirm original Dashboard, Classroom, Quiz, AI assistant, and Resume pages still work.
2. Complete a regular quiz and check Skill Stats and leaderboard update.
3. Search the second student, send a friend request, accept it on the other account.
4. Create a 5-question PvP match. Friend accepts, both receive the **same questions** and timer.
5. Submit separately. Check that a submission cannot be changed; correct answers are hidden until the match ends.
6. Confirm result and win/loss record. Test disconnect/reconnect and an elapsed match timer.
7. Create a study room, share its 10-character invite code, join with the other account, exchange messages and sync editor changes.
8. Reopen the room; code and chat messages should still be stored in MongoDB. Check mobile sidebar navigation.

## Scoring and protections

- The existing quiz history is used for topic accuracy, attempts, daily activity and streaks. Streaks use UTC calendar days.
- Ranking XP uses the best completed result per normalized topic, difficulty and UTC day, with a **500 XP daily cap**. Practice attempts remain unlimited; repeat attempts do not add XP for the same topic/difficulty/day. Topic text is user-defined, so this is **not yet an anti-cheat-grade ranking**.
- PvP winners are decided on the server: more correct answers wins; equal nonzero scores are resolved by earlier valid submission; otherwise it is a draw.
- PvP correct answers remain in MongoDB and are omitted from in-progress API responses.
- Room membership checks are performed before reading messages or joining socket channels. Live chat persists to MongoDB. Code changes use revision checks and explicit Save, rather than unprotected last-write-wins.
- A lightweight server-side AI rate limiter restricts each signed-in user to 30 AI requests per hour **per server instance**. A Redis-backed limiter is recommended at scale.
- Friend requests are limited to 20 per day. Room size is limited to 8 students.
- Neither shared-room code nor PvP quiz answers are executed as programs. A sandboxed code runner, rich collaborative CRDT editor, public rooms, abuse reporting and tournaments are *future work*.

## Verification status

- All backend JavaScript files passed `node --check`.
- Added JSX pages and modified React files passed a TypeScript JSX syntax check.
- Unit-level checks passed for XP anti-farming and match-answer redaction.
- **Not verified here:** `npm install`, actual React/Vite build, live MongoDB/Socket.IO integration, a valid Grok API response, browser-based end-to-end tests, or Render deployment. These must be completed on staging before production use.

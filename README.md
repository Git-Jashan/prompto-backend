# Prompto — Backend API

Node.js + Express backend for [Prompto](https://prompto-app.vercel.app) — the AI prompt generation tool.

Handles all AI interactions, conversation state, Firebase auth verification, and daily usage limits. The frontend communicates with this service to run the guided prompt-building flow.

**Frontend repo:** [github.com/Git-Jashan/prompto-frontend](https://github.com/Git-Jashan/prompto-frontend)
**Live app:** [prompto-app.vercel.app](https://prompto-app.vercel.app)

---

## What This Does

- Verifies Firebase ID tokens on every request (auth middleware)
- Manages multi-round conversation state per user (in-memory)
- Sends structured prompts to Groq API (Llama 3.3 70B) based on conversation round
- Enforces a daily limit of 5 prompt generations per user via Firestore
- Resets conversation state after a prompt is generated or on manual reset

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Runtime   | Node.js                           |
| Framework | Express.js                        |
| Auth      | Firebase Admin SDK (token verify) |
| Database  | Firebase Firestore (usage limits) |
| AI        | Groq API — Llama 3.3 70B Versatile|
| Hosting   | Render                            |

---

## API Endpoints

### `POST /api/prompt-chat`
**Auth required:** Yes (Firebase Bearer token)

The core endpoint. Manages conversation rounds and triggers prompt generation.

**Request body:**
```json
{
  "message": "I want to create a cinematic landscape photo prompt",
  "promptType": "imagePrompt"
}
```

**`promptType` options:** `generalPrompt`, `imagePrompt`, `videoPrompt`, `codePrompt`, `researchPrompt`

**How rounds work:**
- **Round 1:** User sends their initial goal → backend returns clarifying questions
- **Round 2:** User answers Round 1 questions → backend returns deeper questions OR generates prompt if user says "generate" / "make it"
- **Round 3:** User answers Round 2 questions → same choice
- **Round 4:** Final round — prompt is always generated

**Response:**
```json
{
  "reply": "Your generated prompt or next round of questions...",
  "isFinalGeneration": false,
  "currentRound": 2,
  "remainingPrompts": 4
}
```

When `isFinalGeneration` is `true`, the conversation is cleared and usage count is incremented.

---

### `POST /api/reset-conversation`
**Auth required:** Yes

Clears the current conversation state for the user. Call this when starting a new prompt from scratch.

**Response:**
```json
{ "message": "Conversation reset successfully" }
```

---

### `GET /api/remaining-prompts`
**Auth required:** Yes

Returns how many prompt generations the user has left today.

**Response:**
```json
{ "remaining": 3 }
```

---

## Running Locally

```bash
git clone https://github.com/Git-Jashan/prompto-backend
cd prompto-backend
npm install
```

Create a `.env` file:

```
GROQ_API_KEY=your_groq_api_key
FIREBASE_SERVICE_ACCOUNT={"type":"service_account", ...}
PORT=5000
```

> `FIREBASE_SERVICE_ACCOUNT` is the full JSON from your Firebase service account key file — stringified into one line.

Start the server:

```bash
node index.js
```

Server runs at `http://localhost:5000`.

---

## Notes

- Conversation state is stored in-memory (a `Map` keyed by Firebase UID). State resets if the server restarts — this is intentional for a lightweight MVP.
- Daily usage limits are tracked in Firestore under the `usage_limits` collection, reset each day based on UTC date.
- Prompt templates for each category (`image`, `video`, `code`, etc.) live in a separate `prompts.js` file.

---

## Project Status

Stable and serving [prompto-app.vercel.app](https://prompto-app.vercel.app). Active development sunset — see frontend repo for full context.

---

## Author

**Jashanjeet Singh**
[github.com/Git-Jashan](https://github.com/Git-Jashan) · [linkedin.com/in/jashanjeet-singh-9834bb35a](https://linkedin.com/in/jashanjeet-singh-9834bb35a)

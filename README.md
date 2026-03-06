# Prompt Evaluator

A full-stack application for testing and evaluating LLM prompts. Users sign up, submit prompts to Groq-hosted open-source models, and receive streamed responses token by token. Every prompt and response is saved to a history that can be browsed, reviewed, and deleted. A Compare page lets you run the same prompt against multiple models side by side.

## Architecture

```
frontend/          Next.js 16 (App Router) + Tailwind CSS
backend/           FastAPI + MongoDB (PyMongo) + LangChain
```

### Backend

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Routes | `routes/auth.py` | Signup and login (JWT) |
| Routes | `routes/prompt.py` | Run prompt (sync + SSE streaming) |
| Routes | `routes/history.py` | List, get, delete history entries |
| Services | `services/llm.py` | LangChain wrappers for Groq (invoke + stream) |
| Core | `core/auth.py` | Password hashing (bcrypt), JWT creation/validation |
| Core | `core/userUtils.py` | User CRUD against MongoDB |
| Core | `core/historyUtils.py` | History CRUD against MongoDB |
| Core | `core/db.py` | MongoDB connection + index creation |
| Schema | `schema/user.py` | Pydantic models for signup, login, user |
| Schema | `schema/prompt.py` | Pydantic models for prompt request/response, history |

### Frontend

| File | Purpose |
|------|---------|
| `app/page.js` | Landing page |
| `app/login/page.js` | Login form |
| `app/signup/page.js` | Signup form |
| `app/playground/page.js` | Main prompt interface with streaming output and history sidebar |
| `app/history/page.js` | Full history browser with detail panel |
| `app/compare/page.js` | Side-by-side model comparison with parallel streaming |
| `components/Navbar.js` | Shared navigation bar |
| `components/PromptForm.js` | Prompt input form (API key, prompt, temperature, max tokens) |
| `components/ResultCard.js` | Streamed/static LLM response display |
| `components/Spinner.js` | Loading indicator |
| `components/HistorySidebar.js` | Compact history list for playground |
| `components/HistoryDetailPanel.js` | Full history entry detail view |
| `lib/api.js` | Fetch wrapper (auto-attaches JWT, handles 401 redirect) |
| `lib/useAuth.js` | Auth guard hook (redirects to login if no token) |

## API Endpoints

All endpoints except auth require a Bearer token in the `Authorization` header.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/signup` | No | Create account. Body: `{ name, email, password }` |
| POST | `/auth/login` | No | Get JWT. Body: `{ email, password }` |
| POST | `/api/prompt` | Yes | Run prompt (sync). Body: `{ api_key, prompt, temp, max_token, model? }` |
| POST | `/api/prompt/stream` | Yes | Run prompt (SSE stream). Same body as above |
| GET | `/api/getEntries` | Yes | List all history entries for the current user |
| GET | `/api/getHistory/{id}` | Yes | Get a single history entry |
| DELETE | `/api/deleteHistory/{id}` | Yes | Delete a history entry |
| GET | `/api/health` | No | Health check |

### Streaming Protocol

`POST /api/prompt/stream` returns `text/event-stream`. Each event is a JSON line:

```
data: {"token": "Hello"}      // one or more content chunks
data: {"token": " world"}
data: {"done": true, "model": "llama-3.3-70b-versatile", "token_used": 42}
```

On error mid-stream: `data: {"error": "message"}`.

### Supported Models

All models are accessed via a single Groq API key. Pass the model ID in the `model` field of the request body (defaults to `llama-3.3-70b-versatile` if omitted).

| Model | ID |
|-------|----|
| Llama 3.3 70B | `llama-3.3-70b-versatile` |
| Llama 3.1 8B | `llama-3.1-8b-instant` |
| Llama 3 8B | `llama3-8b-8192` |

## Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB running locally on port 27017 (or a remote URI)
- A Groq API key (get one at https://console.groq.com)

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGOURI` | MongoDB connection string | `mongodb://localhost:27017/` |
| `DBNAME` | Database name (optional, defaults to `Prompt_Playground`) | `Prompt_Playground` |
| `SECRET_KEY` | Secret for signing JWTs (random 256-bit hex string) | `9f3cce62b346702d...` |

Generate a secret key:

```
python -c "import secrets; print(secrets.token_hex(32))"
```

### Frontend (`frontend/.env.local`)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend base URL | `http://localhost:8000` |

## Setup and Run

### 1. Clone the repository

```
git clone https://github.com/biswaisop/prompt_evaluator.git
cd prompt_evaluator
```

### 2. Start MongoDB

Make sure MongoDB is running. On Windows with the default install:

```
mongod
```

Or if using a remote instance, set the `MONGOURI` variable accordingly.

### 3. Backend

```
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
```

Create `backend/.env`:

```
MONGOURI=mongodb://localhost:27017/
SECRET_KEY=<your-generated-secret>
```

Start the server:

```
uvicorn main:app --reload --port 8000
```

The API is now available at `http://localhost:8000`. Docs at `http://localhost:8000/docs`.

### 4. Frontend

```
cd frontend
npm install
```

Create `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the dev server:

```
npm run dev
```

Open `http://localhost:3000` in your browser.

## Usage

1. Sign up with your name, email, and password.
2. Log in to get redirected to the Playground.
3. Enter your Groq API key, write a prompt, adjust temperature and max tokens.
4. Click "Run Prompt" -- the response streams in token by token.
5. Every prompt/response pair is saved automatically. Browse them in the History page or the sidebar.
6. Open the Compare page to select multiple models, submit the same prompt, and see results stream in side by side.

## Project Structure

```
prompt_evaluator/
  backend/
    main.py                  # FastAPI app, CORS, router registration
    routes/
      auth.py                # POST /auth/signup, /auth/login
      prompt.py              # POST /api/prompt, /api/prompt/stream
      history.py             # GET/DELETE /api/getEntries, getHistory, deleteHistory
    services/
      llm.py                 # groq_response(), groq_stream()
    core/
      auth.py                # JWT + bcrypt utilities
      db.py                  # MongoDB connection
      userUtils.py           # User CRUD
      historyUtils.py        # History CRUD
    schema/
      user.py                # SignUp, loginRequest, tokenResponse, userInDB
      prompt.py              # promptRequest, promptResponse, historyEntry
  frontend/
    src/
      app/                   # Next.js pages (landing, login, signup, playground, history, compare)
      components/            # Reusable UI components
      lib/                   # API helper, auth hook
```

## Tech Stack

- **Backend**: FastAPI, PyMongo, LangChain, Groq (Llama 3.3 70B, Llama 3.1 8B, Mixtral 8x7B, Gemma 2 9B, and more), python-jose (JWT), passlib (bcrypt)
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4
- **Database**: MongoDB
- **Auth**: JWT Bearer tokens, bcrypt password hashing
- **Streaming**: Server-Sent Events (SSE) via FastAPI StreamingResponse + LangChain `.stream()`

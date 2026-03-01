# FinTech-Hackathon-2026

Quick start — integrate frontend and backend

- Install Python deps:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

- Build frontend (from project root):

```bash
cd ui
npm install   # or pnpm install / yarn
npm run build
cd ..
```

- Run backend (serves built frontend if `ui/dist` exists):

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

Development options

- Run frontend dev server and backend API separately (CORS enabled for localhost):

```bash
# terminal 1
cd ui
npm run dev

# terminal 2
uvicorn main:app --reload
```

API endpoints are available under the `/api` prefix (for example `/api/cards/total-balance`).

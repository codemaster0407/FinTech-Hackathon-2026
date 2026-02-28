"""
OptiFin — FastAPI Application
Run: uvicorn api.main:app --reload --port 8000
Docs: http://localhost:8000/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from api.routers import users, optimise, db

app = FastAPI(
    title="OptiFin API",
    description="""
## 💳 OptiFin — Payment Optimisation Engine

Automatically selects the best card (or split allocation) for any transaction to **maximise end-of-month cash in hand**.

### How it works
For each transaction the engine:
1. Loads the user's cards across 3 tiers (credit → debit → international backup)
2. Computes **effective available balance/credit** per card, reserving upcoming auto-debits
3. Calculates a **net benefit rate** per card:
   - **Credit cards:** cashback earned + savings interest preserved during grace period − FX fee
   - **Debit accounts:** opportunity cost = savings interest lost from drained balance − FX fee
   - **Backup international:** FX spread + flat transfer fee (always last resort)
4. Solves a **Linear Programme** to allocate spend across cards maximising net EOM cash
5. Returns a full breakdown with cashback, opportunity costs, and net benefit

### Fake Users
| User ID  | Name            | Profile |
|----------|-----------------|---------|
| usr_001  | Emma Clarke     | Amex Platinum (5% hotel) + Chase Freedom (3% grocery) + Marcus 5% savings |
| usr_002  | Raj Patel       | Barclaycard Avios (3% travel) + Chase Freedom + Monzo 4.1% savings |
| usr_003  | Sam Taylor      | Debit-only (Nationwide 5% AER) — guaranteed pass_through |

### DB Management
- `GET /db/status` — view current live balances
- `POST /db/reset` — restore all balances to original seed data
    """,
    version="1.0.0",
    contact={"name": "OptiFin", "email": "team@optifin.io"},
)

# ── CORS (open for all origins during PoC — restrict in production) ────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(users.router)
app.include_router(optimise.router)
app.include_router(db.router)


# ── Root ───────────────────────────────────────────────────────────────────────
@app.get("/", include_in_schema=False, response_class=HTMLResponse)
def root():
    return """
    <html><head><title>OptiFin API</title>
    <style>body{font-family:system-ui;background:#090c14;color:#e8ecf4;display:flex;
    align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;gap:16px;}
    a{color:#10b981;text-decoration:none;font-weight:600;font-size:18px;}
    h1{font-size:28px;margin:0;}p{color:#94a3b8;margin:0;}</style></head>
    <body>
      <h1>⚡ OptiFin API</h1>
      <p>Payment Optimisation Engine — v1.0</p>
      <a href="/docs">Open Interactive Docs →</a>
    </body></html>
    """


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "OptiFin API", "version": "1.0.0"}

from fastapi import FastAPI, HTTPException, APIRouter
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

from api.models import TransactionRequest, TransactionResponse, UpdateLimitRequest, UserPreferences, Sector, TotalBalanceResponse
from api.data_seeding import seed_data
from api.optimizer import CardOptimizer

app = FastAPI(title="Card Optimization POC")

# Allow simple CORS for local development (adjust in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for POC
debit_cards, credit_cards, international_cards, user_preferences = seed_data()

# API router mounted at /api to keep SPA routes separate
router = APIRouter(prefix="/api")


@router.get("/")
async def api_root():
    return {"message": "Card Optimization POC API is running"}


@router.get("/cards/total-balance", response_model=TotalBalanceResponse)
async def get_total_balance():
    total_debit = sum(card.current_balance for card in debit_cards)
    total_credit = sum(card.current_balance for card in credit_cards)
    return {
        "total_debit_balance": total_debit,
        "total_credit_balance": total_credit,
        "total_gbp_balance": total_debit + total_credit,
    }


@router.post("/cards/update-limit")
async def update_limit(request: UpdateLimitRequest):
    for card in debit_cards + credit_cards + international_cards:
        if card.id == request.card_id:
            card.monthly_spend_limit = request.new_limit
            return {"status": "success", "message": f"Limit for {card.name} updated to {request.new_limit}"}

    raise HTTPException(status_code=404, detail="Card not found")


@router.post("/user/update-preferences")
async def update_preferences(prefs: UserPreferences):
    global user_preferences
    user_preferences = prefs
    return {"status": "success", "message": "User priorities updated"}


@router.post("/optimize-transaction", response_model=TransactionResponse)
async def optimize_transaction(request: TransactionRequest):
    optimizer = CardOptimizer(
        debit_cards, credit_cards, international_cards, user_preferences)
    result = optimizer.optimize(request)

    if result.status == "insufficient_funds":
        allocated = sum(a.amount_utilised for a in result.allocations)
        shortfall = request.amount - allocated
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient total liquidity. Shortfall: £{shortfall:.2f}. Total available across all sources: £{allocated:.2f}",
        )

    return result


app.include_router(router)

# Serve frontend build (if present) from ui/dist
dist_dir = Path(__file__).resolve().parent / "ui" / "dist"
if dist_dir.exists():
    app.mount("/", StaticFiles(directory=str(dist_dir),
              html=True), name="frontend")


@app.get("/", response_class=HTMLResponse)
async def root():
    index_path = dist_dir / "index.html"
    if index_path.exists():
        return HTMLResponse(index_path.read_text(encoding="utf-8"))
    return {"message": "Card Optimization POC API is running. Build the frontend in `ui/` and place it in `ui/dist` to serve."}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

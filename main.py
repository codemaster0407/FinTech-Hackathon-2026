from fastapi import FastAPI, HTTPException
from api.models import TransactionRequest, TransactionResponse, UpdateLimitRequest, UserPreferences, Sector, TotalBalanceResponse
from api.data_seeding import seed_data
from api.optimizer import CardOptimizer

app = FastAPI(title="Card Optimization POC")

# In-memory storage for POC
debit_cards, credit_cards, international_cards, user_preferences = seed_data()

@app.get("/")
async def root():
    return {"message": "Card Optimization POC API is running"}

@app.get("/cards/total-balance", response_model=TotalBalanceResponse)
async def get_total_balance():
    total_debit = sum(card.current_balance for card in debit_cards)
    total_credit = sum(card.current_balance for card in credit_cards)
    return {
        "total_debit_balance": total_debit,
        "total_credit_balance": total_credit,
        "total_gbp_balance": total_debit + total_credit
    }

@app.post("/cards/update-limit")
async def update_limit(request: UpdateLimitRequest):
    for card in debit_cards + credit_cards + international_cards:
        if card.id == request.card_id:
            card.monthly_spend_limit = request.new_limit
            return {"status": "success", "message": f"Limit for {card.name} updated to {request.new_limit}"}
    
    raise HTTPException(status_code=404, detail="Card not found")

@app.post("/user/update-preferences")
async def update_preferences(prefs: UserPreferences):
    global user_preferences
    user_preferences = prefs
    return {"status": "success", "message": "User priorities updated"}

@app.post("/optimize-transaction", response_model=TransactionResponse)
async def optimize_transaction(request: TransactionRequest):
    optimizer = CardOptimizer(debit_cards, credit_cards, international_cards, user_preferences)
    result = optimizer.optimize(request)
    
    if result.status == "insufficient_funds":
        allocated = sum(a.amount_utilised for a in result.allocations)
        shortfall = request.amount - allocated
        raise HTTPException(
            status_code=400, 
            detail=f"Insufficient total liquidity. Shortfall: £{shortfall:.2f}. Total available across all sources: £{allocated:.2f}"
        )
    
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

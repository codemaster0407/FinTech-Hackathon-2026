from api.data_seeding import seed_data
from api.models import TransactionRequest, Sector
from api.optimizer import CardOptimizer

if __name__ == '__main__':
    debit_cards, credit_cards, international_cards, prefs = seed_data()
    opt = CardOptimizer(debit_cards, credit_cards, international_cards, prefs)
    req = TransactionRequest(amount=120.5, category=Sector.TRAVEL)
    res = opt.optimize(req)
    print('STATUS:', res.status)
    print('EXPLANATION:', res.explanation)
    for a in res.allocations:
        print(
            f" - {a.card_name}: £{a.amount_utilised} pts:{a.cashback_points} int:{a.interest_saved}")

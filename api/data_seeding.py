from api.models import DebitCard, CreditCard, InternationalCard, UserPreferences, Sector, CardType

def seed_data():
    debit_cards = [
        DebitCard(
            id="dc_1",
            name="Santander Current Account",
            type=CardType.DEBIT,
            monthly_spend_limit=1800,
            current_balance=1800.0,
            annual_interest_rate=0.05
        ),
        DebitCard(
            id="dc_2",
            name="Monzo Current Account",
            type=CardType.DEBIT,
            monthly_spend_limit=150.0,
            current_balance=200.0,
            annual_interest_rate=0.02
        ),
        DebitCard(
            id="dc_3",
            name="Lloyds Saver Account",
            type=CardType.DEBIT,
            monthly_spend_limit=100.0,
            current_balance=60.0,
            annual_interest_rate=0.035
        ), 
        DebitCard(
            id="dc_4",
            name="Barclays ISA Account",
            type=CardType.DEBIT,
            monthly_spend_limit=100.0,
            current_balance=10.0,
            annual_interest_rate=0.035
        )
    ]

    credit_cards = [
        CreditCard(
            id="cc_1",
            name="Amex Gold Card",
            type=CardType.CREDIT,
            monthly_spend_limit=1500.0,
            current_balance=2000.0,
            cashback_rates={
                Sector.TRAVEL: 0.05,
                Sector.HOTEL: 0.03,
                Sector.GROCERY: 0.01,
                Sector.SHOPPING: 0.01,
                Sector.GENERAL: 0.0
            }
        ),
        CreditCard(
            id="cc_2",
            name="Chase UK Credit",
            type=CardType.CREDIT,
            monthly_spend_limit=500.0,
            current_balance=500.0,
            cashback_rates={
                Sector.SHOPPING: 0.04,
                Sector.HOTEL: 0.02,
                Sector.FUEL: 0.02,
                Sector.GROCERY: 0.01,
                Sector.GENERAL: 0.01
            }
        ), 
        CreditCard(
            id="cc_3",
            name="Capital One Credit",
            type=CardType.CREDIT,
            monthly_spend_limit=500.0,
            current_balance=500.0,
            cashback_rates={
                Sector.SHOPPING: 0.15,
                Sector.HOTEL: 0.08,
                Sector.FUEL: 0.1,
                Sector.GROCERY: 0.02,
                Sector.GENERAL: 0.01
            }
        ), 
        
    ]

    international_cards = [
        InternationalCard(
            id="ic_1",
            name="State Bank of India",
            type=CardType.INTERNATIONAL,
            monthly_spend_limit=500000.0,
            current_balance=100000.0,
            markup_rate=0.06, 
            gbp_conversion=122.5
        )
    ]

    user_preferences = UserPreferences(
        point_priority=[Sector.HOTEL, Sector.TRAVEL, Sector.SHOPPING, Sector.FUEL]
    )

    return debit_cards, credit_cards, international_cards, user_preferences

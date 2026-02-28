// Mock data for OptiVault - Payment Optimization Engine

export const userProfile = {
  id: "USR-001",
  name: "Amanda",
  phone: "+44 7700 900123",
  email: "amanda@example.com"
};

export const totalLiquidity = {
  total: 23832,
  ukCurrent: 5741,
  ukSavings: 12700,
  creditAvailable: 9400,
  wise: 2838,
  india: 322000 // INR
};

export const connectedBanks = [
  {
    id: "monzo",
    name: "Monzo",
    color: "#FF5A5F",
    logo: "M",
    accounts: [
      {
        type: "Current Account",
        balance: 1240.50,
        vrpLimits: { perTransaction: 500, perMonth: 2000, used: 0 }
      }
    ]
  },
  {
    id: "santander",
    name: "Santander",
    color: "#EC0000",
    logo: "S",
    accounts: [
      {
        type: "Current Account",
        balance: 3820.15,
        isPrimary: true
      },
      {
        type: "Easy Access Savings",
        balance: 4200.00,
        aer: 4.0,
        vrpLimits: { perTransaction: 1000, perMonth: 3000, used: 780 }
      }
    ]
  },
  {
    id: "lloyds",
    name: "Lloyds",
    color: "#006A4D",
    logo: "L",
    accounts: [
      {
        type: "Current Account",
        balance: 680.30,
        vrpLimits: { perTransaction: 300, perMonth: 1000, used: 0 }
      },
      {
        type: "Cash ISA",
        balance: 8500.00,
        aer: 3.8,
        vrpEnabled: false
      }
    ]
  }
];

export const creditCards = [
  {
    id: "amex",
    name: "Amex Gold",
    color: "#006FCF",
    logo: "A",
    limit: 8000,
    used: 2400,
    cashback: "1% groceries, 1% travel",
    linkedCard: true,
    last4: "7234"
  },
  {
    id: "capital-one",
    name: "Capital One",
    color: "#D03027",
    logo: "C",
    limit: 5000,
    used: 1200,
    fxMarkup: "0%",
    linkedCard: true,
    last4: "9812"
  }
];

export const internationalAccounts = [
  {
    country: "India",
    flag: "🇮🇳",
    accounts: [
      { bank: "SBI", type: "Savings", balance: 185000, currency: "INR" },
      { bank: "HDFC", type: "Current", balance: 92000, currency: "INR" }
    ]
  }
];

export const wiseBalances = [
  { currency: "GBP", flag: "🇬🇧", balance: 420.80 },
  { currency: "USD", flag: "🇺🇸", balance: 1850.00 },
  { currency: "EUR", flag: "🇪🇺", balance: 620.00 },
  { currency: "INR", flag: "🇮🇳", balance: 45000 }
];

export const recentTransactions = [
  {
    id: "1",
    merchant: "Pret A Manger",
    emoji: "☕",
    amount: -4.50,
    currency: "GBP",
    date: new Date(),
    category: "Dining",
    source: "Santander",
    sourceColor: "#EC0000",
    optimizationType: null,
    engineStep: 1 // Pass-through
  },
  {
    id: "2",
    merchant: "Sainsbury's",
    emoji: "🛒",
    amount: -112.40,
    currency: "GBP",
    date: new Date(),
    category: "Groceries",
    source: "Amex Gold",
    sourceColor: "#006FCF",
    optimizationType: "cashback",
    cashbackEarned: 1.12,
    engineStep: 2 // Rewards arbitrage
  },
  {
    id: "3",
    merchant: "Amazon US",
    emoji: "🛍️",
    amount: -89.99,
    currency: "USD",
    date: new Date(Date.now() - 86400000), // Yesterday
    category: "Shopping",
    source: "Capital One",
    sourceColor: "#D03027",
    optimizationType: "fx",
    fxSaved: 2.84,
    engineStep: 3 // FX optimization
  },
  {
    id: "4",
    merchant: "Rent",
    emoji: "🏠",
    amount: -1850.00,
    currency: "GBP",
    date: new Date(Date.now() - 172800000), // 2 days ago
    category: "Housing",
    source: "Santander + Saver",
    sourceColor: "#EC0000",
    optimizationType: "vrp",
    vrpAmount: 780,
    engineStep: 4 // Overdraft avoidance
  },
  {
    id: "5",
    merchant: "Netflix",
    emoji: "📱",
    amount: -15.99,
    currency: "GBP",
    date: new Date(Date.now() - 259200000), // 3 days ago
    category: "Subscriptions",
    source: "Santander",
    sourceColor: "#EC0000",
    optimizationType: null,
    engineStep: 1
  },
  {
    id: "6",
    merchant: "Family Transfer",
    emoji: "🇮🇳",
    amount: -200.00,
    currency: "GBP",
    date: new Date(Date.now() - 432000000), // 5 days ago
    category: "Transfers",
    source: "Wise INR",
    sourceColor: "#9FE870",
    optimizationType: "fx",
    fxSaved: 0.86,
    engineStep: 3
  }
];

export const upcomingDirectDebits = [
  {
    name: "Council Tax",
    amount: 189.00,
    date: new Date(Date.now() + 21600000), // Tomorrow 6am
    account: "Santander"
  },
  {
    name: "Gym Membership",
    amount: 39.99,
    date: new Date(Date.now() + 32400000), // Tomorrow 9am
    account: "Santander"
  }
];

export const monthlyStats = {
  totalSavings: 47.20,
  totalTransactions: 34,
  optimizedTransactions: 12,
  breakdown: {
    fxSavings: 18.40,
    fxTransactions: 7,
    cashbackEarned: 22.30,
    cashbackTransactions: 4,
    overdraftAvoided: 6.50,
    overdraftIncidents: 1,
    optimalRouting: 0,
    routingTransactions: 0
  },
  annualProjection: 566,
  projectionBreakdown: {
    fx: 220,
    cashback: 268,
    overdraft: 78
  }
};

export const virtualCard = {
  id: "optivault-001",
  cardNumber: "**** **** **** 9421",
  cardholderName: "AMANDA",
  issuer: "Modulr · EMI Partner",
  monthlyLimit: 10000,
  spentThisMonth: 2847
};

export const spendingByCategory = {
  Groceries: 32,
  Travel: 28,
  Dining: 15,
  Shopping: 12,
  Other: 13
};

// Optimization Engine Constants
export const engineSteps = {
  1: "PASS-THROUGH",
  2: "REWARDS ARBITRAGE",
  3: "FX OPTIMISATION",
  4: "OVERDRAFT AVOIDANCE",
  5: "COMPLEX ALLOCATION"
};

export const costPerPound = {
  ukCurrentDomestic: 0,
  ukCurrentFX: 0.0399, // Santander 3.99%
  savings: 0.003, // Lost interest ~0.3%
  creditCashback: -0.01, // Amex 1% = negative cost
  creditInterest: 0.015, // APR/12 if carrying balance
  wise: 0.0043, // 0.43%
  capitalOneFX: 0, // 0% FX markup
  sbiIndia: 0.029 // Estimated international card charge cost
};

# OptiVault — Payment Optimisation Engine

A complete UK-based mobile fintech application that automatically routes every payment through the cheapest funding source using a real-time cost-minimisation model.

## 🎯 Overview

OptiVault is a premium dark-mode fintech app designed for UK-based users managing money across multiple UK and international accounts. The app treats all connected accounts as one optimisable liquidity pool and uses a sophisticated 5-step decision tree to minimize payment costs.

### Key Features

- **Open Banking Integration**: Connect UK bank accounts via AISP for read-only access
- **Variable Recurring Payments (VRPs)**: Automated transfers between accounts with user-set limits
- **Multi-Source Payment Routing**: Credit cards, international accounts, Wise multi-currency wallets
- **Real-Time Optimization Engine**: 5-step decision tree for every transaction
- **Virtual Visa Card**: Single card for all payments with intelligent backend routing
- **Cashback Optimization**: Automatic routing to maximize rewards
- **FX Cost Minimization**: 0% markup cards vs 3-4% bank rates
- **Overdraft Prevention**: Proactive transfers from savings to avoid fees
- **Complete Dashboard**: Insights, projections, and detailed transaction analytics

## 🏗️ Architecture

### The Optimization Engine (5-Step Decision Tree)

**Step 1 — PASS-THROUGH**: 
- Primary account has sufficient funds AND domestic GBP AND no rewards applicable
- Route silently through primary account

**Step 2 — REWARDS ARBITRAGE**: 
- Credit card earns cashback on merchant category AND user pays in full
- Route to rewards card for net benefit

**Step 3 — FX OPTIMISATION**: 
- Payment currency ≠ GBP
- Compare FX markup across all sources, route to cheapest

**Step 4 — OVERDRAFT AVOIDANCE**: 
- Primary balance - upcoming DDs < payment amount
- Auto-transfer from savings via VRP within limits

**Step 5 — COMPLEX ALLOCATION**: 
- Multiple funding sources needed OR international funds required
- Present 2-3 strategies with cost/speed trade-offs for user approval

### Cost-Per-Pound Formula

The engine calculates cost for each funding source:
- UK current account (domestic): £0 per pound
- UK current account (FX): fx_markup × amount (e.g., 3.99%)
- Savings account: lost interest = AER × (days_to_replenish / 365)
- Credit card (pays in full): NEGATIVE cost = -cashback_rate (benefit!)
- Credit card (carries balance): (APR / 12) - cashback_rate
- Wise same currency: £0 per pound
- Wise cross-currency: 0.43% per pound
- International via card: fx_spread + (fixed_fee / amount)

Engine sorts sources by cost ascending and allocates greedily.

## 📱 Application Screens

### Onboarding Flow (9 screens)
1. **Splash Screen** - Brand introduction with lightning bolt logo
2. **Sign Up / Sign In** - Account creation with email, phone, password strength
3. **Terms & Conditions** - 4 consent cards (FCA-compliant language)
4. **Connect UK Banks** - Open Banking integration with TrueLayer
5. **Set VRP Limits** - Critical control screen for transfer limits per account
6. **Connect Credit Cards** - Open Banking + card details entry
7. **Connect International Accounts** - India Account Aggregator, Wise API
8. **Set Preferences** - Payment rules, overdraft protection, cashback routing
9. **Completion** - Launch to main dashboard

### Main Application (5 screens)
10. **Home Dashboard** - Total liquidity hero card, virtual card, recent transactions, upcoming DDs, VRP usage
11. **Transaction Detail** - Detailed optimization breakdown showing engine decision path
12. **Virtual Card** - Card controls, CVV reveal, spending analytics
13. **Insights** - Monthly savings, breakdown by type, cumulative chart, annual projection
14. **Accounts Overview** - All connected accounts grouped by type with status
15. **Payment Options** - Strategy selector with 3 allocation options and engine transparency

## 🎨 Design System

### Brand Identity
- **Name**: OptiVault
- **Tagline**: "Your money, optimised"
- **Logo**: Lightning bolt ⚡ in rounded emerald square
- **Primary Color**: Emerald Green (#10B981)
- **Secondary**: Deep Navy (#090C14)
- **Accents**: Amber (#F59E0B) warnings, Cyan (#06B6D4) info, Purple (#A78BFA) cashback

### Color Tokens
```css
--optivault-emerald: #10B981
--optivault-navy: #090C14
--optivault-amber: #F59E0B
--optivault-cyan: #06B6D4
--bg-surface: #0F1420
--text-secondary: #94A3B8
```

### Typography
- **UI Text**: Inter (system fallback)
- **Financial Figures**: SF Mono / Cascadia Code (monospace with tabular nums)
- **Corner Radius**: 16px cards, 12px buttons, 8px small elements

### Components
- **Atoms**: Button (5 variants), InputField, Toggle, Checkbox, ProgressBar
- **Molecules**: Account Cards, Transaction Rows, VRP Limit Cards, Credit Utilisation Sliders
- **Organisms**: Bottom Navigation, Virtual Card, Liquidity Summary, Bank Selection Grid

## 🔐 Security & Compliance

- **FCA Regulated**: Open Banking via authorised AISP/PISP (TrueLayer)
- **VRP Limits**: Bank-enforced at infrastructure level, cannot be exceeded
- **EMI Partner**: Modulr for virtual card issuance and card charging
- **Data Encryption**: Bank-level 256-bit encryption
- **No PII Storage**: Figma Make is not designed for sensitive data collection

## 🚀 Technology Stack

- **Framework**: React 18 with TypeScript
- **Routing**: React Router 7 (data mode pattern)
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **State Management**: React hooks (local state)
- **Build Tool**: Vite

## 📂 Project Structure

```
/src
  /app
    /components
      OptiVaultLogo.tsx
      Button.tsx
      InputField.tsx
      ProgressBar.tsx
      /ui (Radix UI components)
    /screens
      Splash.tsx
      SignUp.tsx / SignIn.tsx
      TermsConditions.tsx
      ConnectBanks.tsx
      SetVRPLimits.tsx
      ConnectCreditCards.tsx
      ConnectInternational.tsx
      SetPreferences.tsx
      Home.tsx
      TransactionDetail.tsx
      VirtualCard.tsx
      Insights.tsx
      Accounts.tsx
      PaymentOptions.tsx
    /data
      mockData.ts
    routes.tsx
    App.tsx
  /styles
    optivault-theme.css
    theme.css
    index.css
```

## 🎯 Target User

UK-based immigrants managing money across UK and international accounts who lose £300-600/year on:
- Suboptimal FX fees (3-4% bank markups vs 0-0.43% optimal)
- Overdraft charges (£35-75 per incident)
- Missed cashback rewards (1-3% on eligible spending)

OptiVault automates these optimizations, saving £500+ annually.

## 🔧 Mock Data

The app uses comprehensive mock data for:
- User profile (Priya Sharma)
- Connected accounts (Monzo, Santander, Lloyds, SBI India, HDFC, Wise)
- Credit cards (Amex Gold 1% cashback, Capital One 0% FX)
- Recent transactions with optimization results
- Monthly savings breakdown (£47.20 saved)
- Annual projection (£566)
- VRP usage tracking
- Upcoming direct debits

## 📊 Key Metrics Displayed

- Total Liquidity: £23,832 across 10 accounts
- Monthly Savings: £47.20
- Annual Projection: £566
- Optimized Transactions: 12 of 34 (35%)
- VRP Capacity: £6,000/month across 3 accounts
- Credit Utilisation: Maintained below 90% threshold

## 🎮 Interactive Features

- **Bottom Navigation**: 4 tabs (Home, Card, Insights, Account)
- **Collapsible Sections**: Engine details, spending categories
- **Toggle Controls**: Card freeze, payment types, preferences
- **Slider Controls**: Credit utilisation limits
- **Input Steppers**: VRP limit adjustment
- **Radio/Checkbox Groups**: Payment strategy selection
- **Real-time Progress Bars**: VRP usage, savings accumulation

## 🌍 International Support

- **India**: Account Aggregator via Setu (RBI regulated)
- **EU/EEA**: PSD2 Open Banking
- **Australia**: Consumer Data Right (CDR)
- **Brazil**: Open Finance Brasil
- **Wise**: Multi-currency API (GBP, USD, EUR, INR)
- **Other Countries**: Debit card linking (Curve model)

## 📱 Responsive Design

Designed for iPhone 15 Pro (393 x 852px) with mobile-first approach. The `.mobile-container` class ensures max-width constraint and proper centering.

## 🔄 Navigation Flow

**Onboarding**: Splash → Sign Up → Terms → Banks → VRP Limits → Credit Cards → International → Preferences → Home

**Main App**: Home ⇄ Card ⇄ Insights ⇄ Accounts (bottom nav) + Transaction Detail (drill-down) + Payment Options (modal overlay)

## 💡 Innovation Highlights

1. **VRP Limit Control**: First consumer app to expose Variable Recurring Payment limits with full transparency
2. **5-Step Engine**: Novel classification of payment optimization strategies
3. **Negative Cost Sources**: Credit card cashback treated as benefit (negative cost per pound)
4. **28-Hour Look-Ahead**: Proactive overdraft prevention using DD forecasting
5. **Cost Transparency**: Every optimization shows exact £ saved with engine reasoning
6. **Multi-Currency Intelligence**: Unified liquidity pool across currencies and countries

## 🎨 Visual Design Principles

- **Premium Dark Mode**: Sophisticated, professional aesthetic for money management
- **Monospace Figures**: All currency amounts in tabular-nums monospace for scannability
- **Color-Coded Sources**: Each bank/card has consistent brand color throughout app
- **Progress Indicators**: Visual feedback for VRP usage, credit utilisation, savings
- **Gradient Accents**: Subtle emerald glows for premium feel
- **Card-Based Layout**: Every element in rounded cards with proper hierarchy

## 📈 Business Model Implications

- **Revenue**: Interchange fees from virtual card transactions (not implemented in prototype)
- **Savings Sharing**: Potential 20-30% of saved amount as subscription
- **Premium Features**: Higher VRP limits, priority support, investment integration
- **B2B**: White-label for banks wanting to offer optimization layer

## 🏆 Competitive Advantages

vs. Curve: OptiVault includes savings/current accounts + VRP transfers + overdraft prevention
vs. Revolut: Better FX rates (0% Capital One), cashback optimization, UK-first approach
vs. Banks: Unified liquidity pool, real-time optimization, transparent cost modeling

## 📄 License & Usage

This is a demonstration prototype built with Figma Make. All bank logos and brand names are used for illustrative purposes only. Production implementation would require:
- FCA authorization as AISP/PISP
- EMI partner agreement (Modulr or similar)
- Open Banking provider contract (TrueLayer, Plaid)
- Legal review of VRP consent language
- PCI DSS compliance for card storage
- GDPR-compliant data handling

---

**Built with Figma Make** | **Design by Figma AI** | **React + Tailwind CSS**

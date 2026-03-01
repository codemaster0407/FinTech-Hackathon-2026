import { createBrowserRouter } from "react-router";
import { lazy } from "react";

const Splash = lazy(() => import("./screens/Splash"));
const SignUp = lazy(() => import("./screens/SignUp"));
const SignIn = lazy(() => import("./screens/SignIn"));
const TermsConditions = lazy(() => import("./screens/TermsConditions"));
const ConnectBanks = lazy(() => import("./screens/ConnectBanks"));
const SetVRPLimits = lazy(() => import("./screens/SetVRPLimits"));
const ConnectCreditCards = lazy(() => import("./screens/ConnectCreditCards"));
const ConnectInternational = lazy(() => import("./screens/ConnectInternational"));
const SetPreferences = lazy(() => import("./screens/SetPreferences"));
const Home = lazy(() => import("./screens/Home"));
const Accounts = lazy(() => import("./screens/Accounts"));
const TransactionDetail = lazy(() => import("./screens/TransactionDetail"));
const Insights = lazy(() => import("./screens/Insights"));
const PaymentOptions = lazy(() => import("./screens/PaymentOptions"));
const Simulator = lazy(() => import("./screens/Simulator"));

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Splash,
  },
  {
    path: "/signup",
    Component: SignUp,
  },
  {
    path: "/signin",
    Component: SignIn,
  },
  {
    path: "/terms",
    Component: TermsConditions,
  },
  {
    path: "/onboarding/banks",
    Component: ConnectBanks,
  },
  {
    path: "/onboarding/vrp-limits",
    Component: SetVRPLimits,
  },
  {
    path: "/onboarding/credit-cards",
    Component: ConnectCreditCards,
  },
  {
    path: "/onboarding/international",
    Component: ConnectInternational,
  },
  {
    path: "/onboarding/preferences",
    Component: SetPreferences,
  },
  {
    path: "/home",
    Component: Home,
  },
  {
    path: "/accounts",
    Component: Accounts,
  },
  {
    path: "/transaction/:id",
    Component: TransactionDetail,
  },
  // Card route removed
  {
    path: "/insights",
    Component: Insights,
  },
  {
    path: "/payment-options",
    Component: PaymentOptions,
  },
  {
    path: "/simulator",
    Component: Simulator,
  },
]);
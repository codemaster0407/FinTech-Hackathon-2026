import { useState } from "react";
import { OptiVaultLogoSmall } from "../components/OptiVaultLogo";
import { Button } from "../components/Button";
import { InputField } from "../components/InputField";
import { Link } from "react-router";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="mobile-container min-h-screen bg-optivault-navy relative overflow-hidden flex flex-col px-6 py-8">
      {/* Decorative Background Effects */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-optivault-emerald opacity-[0.10] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 -left-32 w-80 h-80 bg-[#0080FF] opacity-[0.10] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col flex-1">
        <div className="flex justify-center mb-8">
          <OptiVaultLogoSmall size={120} />
        </div>

        <div className="bg-surface border border-optivault rounded-3xl p-6 shadow-xl relative overflow-hidden flex-1 mb-6 flex flex-col">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0080FF] via-optivault-cyan to-optivault-emerald" />

          <div className="mb-6 text-center mt-2">
            <h1 className="text-2xl font-bold text-primary">Welcome back</h1>
            <p className="mt-2 text-sm text-secondary">Sign in to continue optimising<br />your payments</p>
          </div>

          <form className="space-y-4 flex-1">
            <InputField
              type="email"
              placeholder="Email address"
              value={email}
              onChange={setEmail}
            />

            <InputField
              placeholder="Password"
              value={password}
              onChange={setPassword}
              showPasswordToggle
            />

            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-optivault-emerald font-semibold hover:underline">
                Forgot password?
              </Link>
            </div>

            <div className="pt-6">
              <Button to="/home" variant="primary" size="lg" fullWidth className="font-semibold text-base py-4 rounded-xl shadow-md bg-[#0080FF] hover:bg-[#0066CC] !text-white border-0">
                Sign In
              </Button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-secondary pb-4">
          Don't have an account?{" "}
          <Link to="/signup" className="text-optivault-emerald font-semibold hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
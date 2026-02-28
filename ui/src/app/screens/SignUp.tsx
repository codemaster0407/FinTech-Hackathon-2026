import { useState } from "react";
import { OptiVaultLogoSmall } from "../components/OptiVaultLogo";
import { Button } from "../components/Button";
import { InputField } from "../components/InputField";
import { Link } from "react-router";
import { Apple, Flag } from "lucide-react";

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });

  const passwordStrength = formData.password.length > 8 ? "strong" : formData.password.length > 5 ? "medium" : "weak";
  const strengthColors = { weak: "bg-[#EF4444]", medium: "bg-optivault-amber", strong: "bg-optivault-emerald" };
  const strengthLabels = { weak: "Weak", medium: "Medium", strong: "Strong" };

  return (
    <div className="mobile-container min-h-screen bg-optivault-navy relative overflow-hidden flex flex-col px-6 py-8">
      {/* Decorative Background Effects */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-optivault-emerald opacity-[0.10] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-80 h-80 bg-[#0080FF] opacity-[0.10] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col">
        <div className="flex justify-center mb-4">
          <OptiVaultLogoSmall size={120} />
        </div>

        <div className="bg-surface border border-optivault rounded-3xl p-6 shadow-xl relative overflow-hidden mb-6 flex flex-col">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-optivault-emerald via-[#0080FF] to-optivault-cyan" />

          <div className="mb-6 text-center mt-2">
            <h1 className="text-2xl font-bold text-primary">Create your account</h1>
            <p className="mt-2 text-sm text-secondary">Join OptiVault to start optimising<br />every payment automatically</p>
          </div>

          <form className="space-y-4 flex-1">
            <InputField
              placeholder="Full name"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
            />

            <InputField
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(value) => setFormData({ ...formData, email: value })}
            />

            <InputField
              type="tel"
              placeholder="7XXX XXX XXX"
              value={formData.phone}
              onChange={(value) => setFormData({ ...formData, phone: value })}
              prefix={
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="16" height="12">
                    <clipPath id="s">
                      <path d="M0,0 v30 h60 v-30 z" />
                    </clipPath>
                    <clipPath id="t">
                      <path d="M30,15 h30 v15 z v-15 h-30 z h-30 v-15 z v15 h30 z" />
                    </clipPath>
                    <g clipPath="url(#s)">
                      <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
                      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
                      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4" />
                      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
                      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
                    </g>
                  </svg>
                  <span>+44</span>
                </div>
              }
            />

            <div className="pt-2">
              <InputField
                placeholder="Create password"
                value={formData.password}
                onChange={(value) => setFormData({ ...formData, password: value })}
                showPasswordToggle
              />
              {formData.password && (
                <div className="mt-3 bg-surface-alt p-3 rounded-xl animate-fadeIn">
                  <div className="flex gap-1 h-1.5 mb-2">
                    <div className={`flex-1 rounded-full ${strengthColors[passwordStrength]} transition-colors duration-300`} />
                    <div className={`flex-1 rounded-full ${passwordStrength !== "weak" ? strengthColors[passwordStrength] : 'bg-[#CBD5E1]'} transition-colors duration-300`} />
                    <div className={`flex-1 rounded-full ${passwordStrength === "strong" ? 'bg-optivault-emerald' : 'bg-[#CBD5E1]'} transition-colors duration-300`} />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-semibold ${passwordStrength === "strong" ? "text-optivault-emerald" : passwordStrength === "medium" ? "text-optivault-amber" : "text-[#EF4444]"}`}>
                      {strengthLabels[passwordStrength]}
                    </p>
                    <p className="text-[10px] text-muted">Use 8+ characters, mixed case</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6">
              <Button to="/terms" variant="primary" size="lg" fullWidth className="font-semibold text-base py-4 rounded-xl shadow-md bg-[#0080FF] hover:bg-[#0066CC] !text-white border-0">
                Create Account
              </Button>
            </div>
          </form>

        </div>

        <p className="text-center text-sm text-secondary pb-4">
          Already have an account?{" "}
          <Link to="/signin" className="text-optivault-emerald font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
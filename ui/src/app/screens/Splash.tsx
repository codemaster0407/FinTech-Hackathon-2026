import { OptiVaultLogo } from "../components/OptiVaultLogo";
import { Button } from "../components/Button";

export default function Splash() {
  return (
    <div className="mobile-container min-h-screen bg-optivault-navy flex flex-col items-center justify-between px-6 py-12">
      {/* Radial glow effect */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-optivault-emerald opacity-[0.08] rounded-full blur-[120px] pointer-events-none" />
      
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        <OptiVaultLogo size={200} />
        <p className="mt-6 text-base text-secondary">Your money, optimised</p>
      </div>
      
      <div className="w-full space-y-3 relative z-10">
        <Button to="/signup" variant="primary" size="lg" fullWidth>
          Create Account
        </Button>
        <Button to="/signin" variant="outlined" size="lg" fullWidth>
          Sign In
        </Button>
      </div>
    </div>
  );
}
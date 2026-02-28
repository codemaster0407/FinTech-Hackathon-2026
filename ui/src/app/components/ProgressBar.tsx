import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

interface ProgressBarProps {
  current: number;
  total: number;
  showBack?: boolean;
}

export function ProgressBar({ current, total, showBack = true }: ProgressBarProps) {
  const navigate = useNavigate();
  const percentage = (current / total) * 100;
  
  return (
    <div className="mb-6">
      <div className="flex items-center gap-4 mb-3">
        {showBack && (
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-surface rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-secondary" />
          </button>
        )}
        <div className="flex-1 h-1 bg-surface rounded-full overflow-hidden">
          <div 
            className="h-full bg-optivault-emerald transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <p className="text-xs text-muted ml-14">Step {current} of {total}</p>
    </div>
  );
}

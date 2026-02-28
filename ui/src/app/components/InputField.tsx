import { Eye, EyeOff, Camera } from "lucide-react";
import { useState } from "react";

interface InputFieldProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  prefix?: React.ReactNode;
  showPasswordToggle?: boolean;
  showScanButton?: boolean;
}

export function InputField({ 
  type = "text", 
  placeholder, 
  value, 
  onChange,
  error,
  prefix,
  showPasswordToggle,
  showScanButton
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  
  const inputType = showPasswordToggle ? (showPassword ? "text" : "password") : type;
  
  return (
    <div className="w-full">
      <div className={`
        flex items-center gap-2 h-[52px] px-4 rounded-xl bg-surface border transition-colors
        ${error ? 'border-[#EF4444]' : focused ? 'border-optivault-emerald' : 'border-optivault'}
      `}>
        {prefix && <div className="flex-shrink-0">{prefix}</div>}
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent outline-none text-primary placeholder:text-muted"
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="flex-shrink-0 p-1 text-muted hover:text-secondary transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
        {showScanButton && (
          <button
            type="button"
            className="flex-shrink-0 p-1 text-muted hover:text-secondary transition-colors"
          >
            <Camera className="w-5 h-5" />
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-[#EF4444]">{error}</p>
      )}
    </div>
  );
}
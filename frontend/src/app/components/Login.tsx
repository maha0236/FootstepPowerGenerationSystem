import React, { useState } from "react";
import { Zap, Eye, EyeOff } from "lucide-react";

interface LoginProps {
  onLoginSuccess: (token: string, user: { id: string; name: string; email: string }) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    setApiError("");

    if (isRegisterMode && !name.trim()) {
      setValidationError("Full name is required");
      return;
    }
    if (!email.trim()) {
      setValidationError("Email address is required");
      return;
    }
    if (!password) {
      setValidationError("Password is required");
      return;
    }
    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
    const endpoint = isRegisterMode 
      ? `${backendUrl}/api/auth/register` 
      : `${backendUrl}/api/auth/login`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          ...(isRegisterMode ? { name: name.trim() } : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      if (data.token && data.user) {
        onLoginSuccess(data.token, data.user);
      }
    } catch (err: any) {
      setApiError(err.message || "Failed to connect to authentication server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle 500px at 50% 50%, rgba(163,255,71,0.06) 0%, transparent 100%)",
        }}
      />

      <div className="w-full max-w-md bg-card border border-border rounded-lg p-8 relative z-10 shadow-2xl hover:border-primary/20 transition-all duration-300">
        
        {/* Header Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/5 animate-pulse">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">Renewable Energy Telemetry</p>
            <h2 className="text-2xl font-bold leading-tight tracking-wide mt-1" style={{ fontFamily: "Rajdhani, sans-serif" }}>
              {isRegisterMode ? "Create Operator Profile" : "Authorized Login"}
            </h2>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {isRegisterMode && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Operator Name"
                className="bg-secondary/40 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded px-4 py-2.5 text-sm outline-none transition-colors"
                disabled={isLoading}
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@telemetry.io"
              className="bg-secondary/40 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded px-4 py-2.5 text-sm outline-none transition-colors"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-1.5 relative">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Security Password</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-secondary/40 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded pl-4 pr-10 py-2.5 text-sm outline-none transition-colors"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Validation or API Errors */}
          {(validationError || apiError) && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive text-xs font-mono rounded p-3 flex items-start gap-2 animate-shake">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 flex-shrink-0" />
              <span>{validationError || apiError}</span>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground font-mono text-xs tracking-widest uppercase font-bold py-3.5 rounded hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 shadow-md shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </>
            ) : (
              isRegisterMode ? "Create Access Profile" : "Verify Credentials"
            )}
          </button>

          {/* Switch Mode link */}
          <div className="text-center mt-3">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setValidationError("");
                setApiError("");
              }}
              className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              {isRegisterMode ? "Already registered? Sign In" : "Need access? Request Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// src/features/auth/pages/LoginPage.jsx
import { useState } from "react";
import { useAuth } from "../../../shared/hooks/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import ClickTooltip from "../../../shared/hooks/ClickTooltip.jsx";

function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      alert("Please enter both identifier and password");
      return;
    }
    await login({ identifier, password });
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-app px-4">
      <div className="w-full max-w-sm bg-surface rounded-3xl shadow-soft p-6">
        {/* Logo / Branding */}
        <div className="text-center mb-6">
          <img
            src="/serveflow.svg"
            alt="ServeFlow Logo"
            className="mx-auto mb-4 w-44 h-44"
          />
          <h1 className="text-2xl font-bold text-primary">ServeFlow</h1>
          <p className="text-sm text-muted">Welcome back, ready to serve?</p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Identifier */}
          <div>
            <label className="text-sm text-muted">Username or Email</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your identifier"
              className="w-full mt-1 p-3 rounded-xl border border-default bg-surface text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-secondary)"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-muted">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full mt-1 p-3 rounded-xl border border-default bg-surface text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-secondary)"
            />
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted">
              <input type="checkbox" className="accent-(--color-accent)" />
              Remember me
            </label>

            <button type="button" className="text-primary font-medium">
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-(--color-primary) text-white p-3 rounded-xl font-semibold active:scale-95 transition"
          >
            {isLoading ? "Logging in..." : "Login to ServeFlow"}
          </button>
          {error && <p className="text-red-500">{error}</p>}
        </form>
        {/* Footer */}
        <p className="text-center text-sm text-muted mt-6">
          New here?{" "}
          <span className="relative group text-primary font-medium cursor-pointer">
            <ClickTooltip content="Only admins can create accounts. Please contact your administrator.">
              Create account
            </ClickTooltip>
          </span>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;

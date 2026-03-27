// src/features/auth/pages/RegisterPage.jsx
import { Link } from "react-router-dom";

function RegisterPage() {
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
          <p className="text-sm text-muted">
            Create your account to get started
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4">
          {/* Identifier */}
          <div>
            <label className="text-sm text-muted">Username or Email</label>
            <input
              type="text"
              placeholder="Enter your identifier"
              className="w-full mt-1 p-3 rounded-xl border border-default bg-surface text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-secondary)"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-muted">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full mt-1 p-3 rounded-xl border border-default bg-surface text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-secondary)"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm text-muted">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              className="w-full mt-1 p-3 rounded-xl border border-default bg-surface text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-secondary)"
            />
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="w-full bg-(--color-primary) text-white p-3 rounded-xl font-semibold active:scale-95 transition"
          >
            Register
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium cursor-pointer">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;

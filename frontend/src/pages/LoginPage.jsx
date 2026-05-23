import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export default function LoginPage() {
  const cardRef = useRef(null);
  const [showPass, setShowPass] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });

  useEffect(() => {
    // Smooth entry animation for the login card when page loads
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power4.out" },
    );
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting credentials: ", credentials);
  };

  return (
    <div className="min-h-screen bg-[#0D0D1A] flex items-center justify-center p-4 relative overflow-hidden selection:bg-purple-500 selection:text-white">
      {/* Subtle Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-violet-900/10 blur-[100px] pointer-events-none" />

      {/* Login Card */}
      <div
        ref={cardRef}
        className="w-full max-w-md bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl shadow-2xl flex flex-col gap-6"
      >
        {/* Brand Header */}
        <div>
          <span className="text-purple-400 font-sans font-bold text-lg tracking-wider uppercase">
            AI-interviewer
          </span>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-2">
            Welcome back
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Sign in to access your dashboard
          </p>
        </div>

        <div className="h-[1px] bg-white/[0.08]" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email Address */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-slate-400">
              Email address
            </label>
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-slate-400">
                Password
              </label>
              <a
                href="#"
                className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative flex items-center">
              <input
                type={showPass ? "text" : "password"}
                name="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl pl-4 pr-12 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-3 text-xs font-semibold text-slate-500 hover:text-slate-400 transition-colors px-2 py-1"
              >
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id="remember"
              className="rounded bg-white/[0.04] border-white/[0.1] text-purple-600 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer accent-purple-500"
            />
            <label
              htmlFor="remember"
              className="text-xs text-slate-400 cursor-pointer select-none"
            >
              Remember me for 30 days
            </label>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white text-sm font-semibold py-3 rounded-xl shadow-lg shadow-purple-600/20 active:scale-[0.99] transition-transform duration-100 mt-2"
          >
            Sign in
          </button>
        </form>

        {/* Footer Signup Link */}
        <p className="text-center text-xs text-slate-500 mt-2">
          Don't have an account?{" "}
          <a
            href="/signup"
            className="text-purple-400 font-semibold hover:underline"
          >
            Create one free
          </a>
        </p>
      </div>
    </div>
  );
}

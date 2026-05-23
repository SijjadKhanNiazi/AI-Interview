import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import axios from "axios";

export default function SignupPage() {
  const cardRef = useRef(null);

  const [showPass, setShowPass] = useState(false);

  // Simple States
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power4.out" },
    );
  }, []);

  // Signup Function
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          username,
          email,
          password,
        },
        {
          withCredentials: true,
        },
      );

      console.log(response.data);

      alert("Account Created Successfully!");

      // Optional
      // navigate("/login");
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D1A] flex items-center justify-center p-4 relative overflow-hidden selection:bg-purple-500 selection:text-white">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />

      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-violet-900/10 blur-[100px] pointer-events-none" />

      {/* Signup Card */}
      <div
        ref={cardRef}
        className="w-full max-w-md bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl shadow-2xl flex flex-col gap-6"
      >
        {/* Header */}
        <div>
          <span className="text-purple-400 font-bold text-lg tracking-wider uppercase">
            AI-Interviewer
          </span>

          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-2">
            Create account
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Start preparing for your upcoming interviews
          </p>
        </div>

        <div className="h-[1px] bg-white/[0.08]" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Username */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-slate-400">
              Username
            </label>

            <input
              type="text"
              placeholder="sijjad_khan"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-slate-400">
              Email address
            </label>

            <input
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-slate-400">
              Password
            </label>

            <div className="relative flex items-center">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Minimum 8 characters"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl pl-4 pr-12 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
              />

              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 text-xs font-semibold text-slate-500 hover:text-slate-400 transition-colors px-2 py-1"
              >
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white text-sm font-semibold py-3 rounded-xl shadow-lg shadow-purple-600/20 active:scale-[0.99] transition-transform duration-100 mt-3"
          >
            Create account
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-2">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-purple-400 font-semibold hover:underline"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

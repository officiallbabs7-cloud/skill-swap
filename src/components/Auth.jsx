import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { RiEyeLine, RiEyeOffLine } from "@remixicon/react";
import { supabase } from "../lib/supabase";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    if (error) {
      setErrorMsg(error.message);
    } else {
      navigate("/dashboard");
    }

    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setResetSent(true);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-sm p-8 border border-neutral-700 rounded-3xl bg-black text-white">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold">
            {resetMode
              ? "Reset your password"
              : isSignUp
                ? "Create an account"
                : "Welcome back"}
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            {resetMode
              ? "We'll email you a link to reset it"
              : isSignUp
                ? "Start swapping skills today"
                : "Log in to your Skill Swap account"}
          </p>
        </div>

        {!resetMode ? (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs uppercase tracking-wide text-neutral-500 mb-1 block">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full p-3 bg-neutral-950 border border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-white transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wide text-neutral-500 mb-1 block">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    className="w-full p-3 pr-11 bg-neutral-950 border border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-white transition"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition"
                  >
                    {showPassword ? (
                      <RiEyeOffLine size={20} />
                    ) : (
                      <RiEyeLine size={20} />
                    )}
                  </button>
                </div>
              </div>

              {!isSignUp && (
                <div className="text-right -mt-1">
                  <button
                    type="button"
                    onClick={() => setResetMode(true)}
                    className="text-sm text-neutral-500 hover:text-white underline cursor-pointer transition"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {errorMsg && (
                <p className="text-red-500 text-sm text-center">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black py-3 rounded-xl text-base font-bold hover:bg-neutral-200 transition cursor-pointer mt-1"
              >
                {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Log In"}
              </button>
            </form>

            <p className="text-center text-sm text-neutral-500 mt-6">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-white underline cursor-pointer"
              >
                {isSignUp ? "Log In" : "Sign Up"}
              </button>
            </p>
          </>
        ) : (
          <div>
            {resetSent ? (
              <p className="text-center text-sm text-neutral-400">
                Check your email for a reset link.
              </p>
            ) : (
              <form onSubmit={handleReset} className="flex flex-col gap-3">
                <div>
                  <label className="text-base uppercase tracking-wide text-neutral-500 mb-1 block">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 bg-neutral-950 border border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-white transition"
                    required
                  />
                </div>

                {errorMsg && (
                  <p className="text-red-500 text-xs text-center">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black py-3 rounded-xl text-sm font-bold hover:bg-neutral-200 transition cursor-pointer mt-1"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            )}

            <p className="text-center text-sm mt-6">
              <button
                type="button"
                onClick={() => {
                  setResetMode(false);
                  setResetSent(false);
                  setErrorMsg("");
                }}
                className="text-neutral-500 hover:text-white underline cursor-pointer transition"
              >
                Back to Log In
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;

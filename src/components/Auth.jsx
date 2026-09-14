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
    <div className="min-h-screen flex items-center justify-center bg-white text-white">
      <div className="w-full max-w-sm p-8 border border-neutral-700 rounded-3xl bg-black">
        <h1 className="text-3xl font-extrabold text-center mb-6">
          {resetMode
            ? "Reset Password"
            : isSignUp
            ? "Create an account"
            : "Welcome back"}
        </h1>

        {!resetMode ? (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="Email"
                className="p-3 bg-black border border-white rounded-xl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full p-3 pr-11 bg-black border border-white rounded-xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showPassword ? (
                    <RiEyeOffLine size={20} />
                  ) : (
                    <RiEyeLine size={20} />
                  )}
                </button>
              </div>

              {errorMsg && (
                <p className="text-red-500 text-sm text-center">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="bg-white text-black py-3 rounded-xl font-extrabold hover:bg-neutral-500 transition cursor-pointer"
              >
                {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Log In"}
              </button>
            </form>

            {!isSignUp && (
              <p className="text-right text-sm mt-3">
                <button
                  type="button"
                  onClick={() => setResetMode(true)}
                  className="underline text-white hover:text-neutral-500 cursor-pointer"
                >
                  Forgot password?
                </button>
              </p>
            )}

            <p className="text-center text-sm text-neutral-500 mt-6 cursor-pointer">
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
              <p className="text-center text-neutral-300">
                Check your email for a reset link.
              </p>
            ) : (
              <form onSubmit={handleReset} className="flex flex-col gap-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="p-3 bg-black border border-white rounded-xl"
                  required
                />

                {errorMsg && (
                  <p className="text-red-500 text-sm text-center">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-white text-black py-3 rounded-xl font-extrabold hover:bg-neutral-500 transition cursor-pointer"
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
                className="underline text-white hover:text-neutral-500 cursor-pointer"
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
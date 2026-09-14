import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { RiEyeLine, RiEyeOffLine } from "@remixicon/react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password updated! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1500);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-500 text-white">
      <div className="w-full max-w-sm p-8 border border-neutral-700 rounded-3xl bg-black">
        <h1 className="text-2xl font-extrabold text-center mb-6">
          Set New Password
        </h1>
        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 pr-11 bg-black border border-white rounded-xl"
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

          {message && (
            <p className="text-sm text-center text-neutral-300">{message}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-white text-black py-3 rounded-xl font-extrabold hover:bg-gray-300 transition cursor-pointer"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
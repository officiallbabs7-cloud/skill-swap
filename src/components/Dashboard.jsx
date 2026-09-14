import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, bio")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setUsername(data.username || "");
        setBio(data.bio || "");
      }
      setLoading(false);
    };

    if (user) fetchProfile();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({ username, bio })
      .eq("id", user.id);

    setMessage(error ? `❌ ${error.message}` : "✅ Profile updated!");
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-500 text-white flex items-center justify-center">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-white p-6">
      <div className="w-full max-w-sm p-8 border border-neutral-700 rounded-3xl bg-black">

        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-2xl font-bold mb-3">
            {username ? username[0].toUpperCase() : "?"}
          </div>
          <p className="text-neutral-400 text-sm">{user?.email}</p>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-neutral-400 mb-1 block">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 bg-black border border-white rounded-xl"
              required
            />
          </div>

          <div>
            <label className="text-sm text-neutral-400 mb-1 block">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Tell others a bit about yourself..."
              className="w-full p-3 bg-black border border-white rounded-xl resize-none"
            />
          </div>

          {message && (
            <p className="text-sm text-center text-neutral-300">{message}</p>
          )}

          <button
            type="submit"
            disabled={saving}
          className="w-full mt-4 border border-neutral-700 text-white py-3 rounded-xl font-extrabold hover:bg-neutral-900 transition cursor-pointer"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>

        <button
          onClick={() => navigate("/skills")}
          className="w-full mt-4 bg-white text-black py-3 rounded-xl font-extrabold hover:bg-gray-300 transition cursor-pointer"
        >
          Manage My Skills
        </button>

        <button
          onClick={() => navigate("/browse")}
          className="w-full mt-3 border border-neutral-700 text-white py-3 rounded-xl font-extrabold hover:bg-neutral-900 transition cursor-pointer"
        >
          Browse Skills
        </button>

        <button
          onClick={() => navigate("/requests")}
          className="w-full mt-4 bg-white text-black py-3 rounded-xl font-extrabold hover:bg-gray-300 transition cursor-pointer"
        >
          My Requests
        </button>

        <button
          onClick={handleSignOut}
          className="w-full mt-4 border border-neutral-700 text-white py-3 rounded-xl font-extrabold hover:bg-neutral-900 transition cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
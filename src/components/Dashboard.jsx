import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, bio, avatar_url")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setUsername(data.username || "");
        setBio(data.bio || "");
        setAvatarUrl(data.avatar_url || "");
      }
      setLoading(false);
    };

    if (user) fetchProfile();
  }, [user]);

  const handleAvatarUpload = async (e) => {
    try {
      setUploading(true);
      setMessage("");

      if (!e.target.files || e.target.files.length === 0) {
        return;
      }

      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      // 1. Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // 3. Update profiles table
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      setMessage("✅ Avatar updated!");
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({ username, bio, avatar_url: avatarUrl })
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
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-white p-6">
      <div className="w-full max-w-sm p-8 border border-neutral-700 rounded-3xl bg-black">

        {/* Profile Avatar Section */}
        <div className="flex flex-col items-center mb-8">
          <label className="relative group cursor-pointer">
            <div className="w-24 h-24 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-3xl font-bold overflow-hidden shadow-lg">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{username ? username[0].toUpperCase() : "?"}</span>
              )}

              {/* Hover Dark Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                <span className="text-xs font-semibold text-white">
                  {uploading ? "Uploading..." : "Change"}
                </span>
              </div>
            </div>

            {/* Camera Icon Badge */}
            <div className="absolute bottom-0 right-0 p-2 bg-white text-black rounded-full border border-neutral-700 shadow-md group-hover:bg-neutral-200 transition">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <circle cx="12" cy="13" r="3" />
              </svg>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>

          <p className="text-neutral-400 text-sm mt-3">{user?.email}</p>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-neutral-400 mb-1 block">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 bg-black border border-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white"
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
              className="w-full p-3 bg-black border border-white rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-white"
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

        {/* Navigation Buttons */}
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
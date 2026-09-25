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

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

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

  const navItems = [
    { label: "Manage My Skills", path: "/skills" },
    { label: "Browse Skills", path: "/browse" },
    { label: "My Requests", path: "/requests" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-white p-6">
      <div className="w-full max-w-sm p-8 border border-neutral-700 rounded-3xl bg-black">

        
        <div className="flex flex-col items-center mb-6">
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

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                <span className="text-sm font-semibold text-white">
                  {uploading ? "Uploading..." : "Change"}
                </span>
              </div>
            </div>

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

          <p className="text-white font-bold text-base mt-3">
            {username || "Your name"}
          </p>
          <p className="text-neutral-500 text-sm">{user?.email}</p>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <div>
            <label className="text-xs uppercase tracking-wide text-neutral-500 mb-1 block">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 bg-neutral-950 border border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-white transition"
              required
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-neutral-500 mb-1 block">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell others a bit about yourself..."
              className="w-full p-3 bg-neutral-950 border border-neutral-700 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-white transition"
            />
          </div>

          {message && (
            <p className="text-xs text-center text-neutral-400">{message}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-white text-black py-2.5 rounded-xl text-base font-bold hover:bg-neutral-200 transition cursor-pointer"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>

        
        <div className="border-t border-neutral-800 my-7" />

        <div className="flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-white bg-neutral-950 border border-neutral-800 hover:bg-neutral-900 hover:border-neutral-900 transition cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleSignOut}
          className="w-full mt-6 text-center text-sm text-neutral-500 hover:text-red-500 transition cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
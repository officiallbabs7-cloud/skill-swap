import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

const Browse = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(null);
  const [connectedIds, setConnectedIds] = useState([]);

  useEffect(() => {
    const fetchOthers = async () => {
      const { data, error } = await supabase
        .from("skills")
        .select("id, type, title, description, user_id, profiles(username, bio)")
        .neq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const grouped = {};
        data.forEach((skill) => {
          const uid = skill.user_id;
          if (!grouped[uid]) {
            grouped[uid] = {
              userId: uid,
              username: skill.profiles?.username || "Unknown",
              bio: skill.profiles?.bio || "",
              offers: [],
              wants: [],
            };
          }
          if (skill.type === "offer") grouped[uid].offers.push(skill);
          else grouped[uid].wants.push(skill);
        });
        setUsers(Object.values(grouped));
      }
      setLoading(false);
    };

    if (user) fetchOthers();
  }, [user]);

  const handleConnect = async (skill, ownerId) => {
    setConnecting(skill.id);

    const { error } = await supabase.from("matches").insert({
      requester_id: user.id,
      recipient_id: ownerId,
      skill_id: skill.id,
      status: "pending",
    });

    if (!error) {
      setConnectedIds((prev) => [...prev, skill.id]);
    }

    setConnecting(null);
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-5xl font-extrabold">Browse</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm underline cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>

        {loading ? (
          <p className="text-center text-neutral-500">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-center text-neutral-500">
            No other users have added skills yet.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {users.map((u, idx) => (
              <div
                key={idx}
                className="p-6 border border-neutral-700 rounded-3xl bg-black text-white"
              >
                <div className="mb-4">
                  <p className="text-xl font-bold">{u.username}</p>
                  {u.bio && (
                    <p className="text-sm text-neutral-400 mt-1">{u.bio}</p>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-400 mb-2">
                      Can teach
                    </h3>
                    <div className="flex flex-col gap-2">
                      {u.offers.map((skill) => (
                        <div
                          key={skill.id}
                          className="p-3 bg-neutral-900 border border-neutral-700 rounded-xl"
                        >
                          <p className="font-bold">{skill.title}</p>
                          {skill.description && (
                            <p className="text-sm text-neutral-400 mt-1">
                              {skill.description}
                            </p>
                          )}
                          <button
                            onClick={() => handleConnect(skill, u.userId)}
                            disabled={
                              connecting === skill.id ||
                              connectedIds.includes(skill.id)
                            }
                            className="mt-2 text-xs bg-white text-black px-3 py-1 rounded-lg font-bold hover:bg-neutral-500 transition cursor-pointer disabled:opacity-50"
                          >
                            {connectedIds.includes(skill.id)
                              ? "Requested"
                              : connecting === skill.id
                              ? "Sending..."
                              : "Connect"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-neutral-400 mb-2">
                      Wants to learn
                    </h3>
                    <div className="flex flex-col gap-2">
                      {u.wants.map((skill) => (
                        <div
                          key={skill.id}
                          className="p-3 bg-neutral-900 border border-neutral-700 rounded-xl"
                        >
                          <p className="font-bold">{skill.title}</p>
                          {skill.description && (
                            <p className="text-sm text-neutral-400 mt-1">
                              {skill.description}
                            </p>
                          )}
                          <button
                            onClick={() => handleConnect(skill, u.userId)}
                            disabled={
                              connecting === skill.id ||
                              connectedIds.includes(skill.id)
                            }
                            className="mt-2 text-xs bg-white text-black px-3 py-1 rounded-lg font-bold hover:bg-neutral-500 transition cursor-pointer disabled:opacity-50"
                          >
                            {connectedIds.includes(skill.id)
                              ? "Requested"
                              : connecting === skill.id
                              ? "Sending..."
                              : "Connect"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;
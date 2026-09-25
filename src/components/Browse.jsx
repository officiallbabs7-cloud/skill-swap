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
        .select(
          "id, type, title, description, user_id, profiles(username, bio, avatar_url)"
        )
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
              avatarUrl: skill.profiles?.avatar_url || "",
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

  const SkillCard = ({ skill, ownerId }) => (
    <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
      <p className="font-bold text-sm">{skill.title}</p>
      {skill.description && (
        <p className="text-xs text-neutral-400 mt-1">{skill.description}</p>
      )}
      <button
        onClick={() => handleConnect(skill, ownerId)}
        disabled={
          connecting === skill.id || connectedIds.includes(skill.id)
        }
        className="mt-2 text-xs bg-white text-black px-3 py-1.5 rounded-lg font-bold hover:bg-neutral-200 transition cursor-pointer disabled:opacity-40"
      >
        {connectedIds.includes(skill.id)
          ? "Requested"
          : connecting === skill.id
          ? "Sending..."
          : "Connect"}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-black p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-5xl font-extrabold">Browse</h1>
            <p className="text-neutral-500 text-base mt-1">
              Find someone to swap skills with
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-base underline text-neutral-500 hover:text-black cursor-pointer transition"
          >
            Back to Dashboard
          </button>
        </div>

        {loading ? (
          <p className="text-center text-neutral-500 text-sm">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-center text-neutral-500 text-base">
            No other users have added skills yet.
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            {users.map((u) => (
              <div
                key={u.userId}
                className="p-6 border border-neutral-800 rounded-3xl bg-black text-white"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-sm font-bold overflow-hidden shrink-0">
                    {u.avatarUrl ? (
                      <img
                        src={u.avatarUrl}
                        alt={u.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{u.username[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold">{u.username}</p>
                    {u.bio && (
                      <p className="text-sm text-neutral-500 mt-0.5">
                        {u.bio}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-neutral-500 mb-2">
                      Can teach
                    </h3>
                    <div className="flex flex-col gap-2">
                      {u.offers.length === 0 ? (
                        <p className="text-xs text-neutral-500 italic">
                          Nothing listed
                        </p>
                      ) : (
                        u.offers.map((skill) => (
                          <SkillCard
                            key={skill.id}
                            skill={skill}
                            ownerId={u.userId}
                          />
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-neutral-500 mb-2">
                      Wants to learn
                    </h3>
                    <div className="flex flex-col gap-2">
                      {u.wants.length === 0 ? (
                        <p className="text-xs text-neutral-500 italic">
                          Nothing listed
                        </p>
                      ) : (
                        u.wants.map((skill) => (
                          <SkillCard
                            key={skill.id}
                            skill={skill}
                            ownerId={u.userId}
                          />
                        ))
                      )}
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
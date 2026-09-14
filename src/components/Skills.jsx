import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

const Skills = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("offer");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchSkills = async () => {
    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) setSkills(data);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchSkills();
  }, [user]);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");

    const { error } = await supabase.from("skills").insert({
      user_id: user.id,
      type,
      title,
      description,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setTitle("");
      setDescription("");
      fetchSkills();
    }

    setSaving(false);
  };

  const handleDelete = async (id) => {
    await supabase.from("skills").delete().eq("id", id);
    fetchSkills();
  };

  const offers = skills.filter((s) => s.type === "offer");
  const wants = skills.filter((s) => s.type === "want");

  return (
    <div className="min-h-screen bg-white text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-5xl font-extrabold text-black">Your Skills</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm underline text-black cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>

        <form
          onSubmit={handleAddSkill}
          className="p-6 border border-neutral-700 rounded-3xl bg-black mb-8 flex flex-col gap-4"
        >
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("offer")}
              className={`flex-1 py-2 rounded-xl font-bold cursor-pointer hover:bg-neutral-500 transition ${
                type === "offer"
                  ? "bg-white text-black"
                  : "bg-black border border-white text-white"
              }`}
            >
              I can teach
            </button>
            <button
              type="button"
              onClick={() => setType("want")}
              className={`flex-1 py-2 rounded-xl font-bold cursor-pointer hover:bg-neutral-500 transition ${
                type === "want"
                  ? "bg-white text-black"
                  : "bg-black border border-white text-white"
              }`}
            >
              I want to learn
            </button>
          </div>

          <input
            type="text"
            placeholder="Skill title (e.g. Programming, UI/UX Design)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-3 bg-black border border-white rounded-xl placeholder:text-neutral-500 text-left"
            required
          />

          <textarea
            placeholder="Add a short description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="p-3 bg-black border border-white rounded-xl resize-none placeholder:text-neutral-500"
          />

          {errorMsg && (
            <p className="text-red-500 text-sm text-center">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="bg-white text-black py-3 rounded-xl font-extrabold hover:bg-neutral-500 transition cursor-pointer"
          >
            {saving ? "Adding..." : "Add Skill"}
          </button>
        </form>

        
        {loading ? (
          <p className="text-center text-neutral-300">Loading skills...</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-bold mb-3">I can teach</h2>
              <div className="flex flex-col gap-3">
                {offers.map((skill) => (
                  <div
                    key={skill.id}
                    className="p-4 bg-black border border-neutral-700 rounded-2xl flex justify-between items-start gap-3"
                  >
                    <div>
                      <p className="font-bold">{skill.title}</p>
                      {skill.description && (
                        <p className="text-sm text-neutral-400 mt-1">
                          {skill.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(skill.id)}
                      className="text-red-400 text-sm hover:text-red-300 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold mb-3">I want to learn</h2>
              <div className="flex flex-col gap-3">
                {wants.map((skill) => (
                  <div
                    key={skill.id}
                    className="p-4 bg-black border border-neutral-700 rounded-2xl flex justify-between items-start gap-3"
                  >
                    <div>
                      <p className="font-bold">{skill.title}</p>
                      {skill.description && (
                        <p className="text-sm text-neutral-400 mt-1">
                          {skill.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(skill.id)}
                      className="text-red-400 text-sm hover:text-red-300 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Skills;
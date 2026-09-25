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

  const SkillCard = ({ skill }) => (
    <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex justify-between items-start gap-3">
      <div>
        <p className="font-bold text-base text-white">{skill.title}</p>
        {skill.description && (
          <p className="text-base text-neutral-500 mt-1">{skill.description}</p>
        )}
      </div>
      <button
        onClick={() => handleDelete(skill.id)}
        className="text-red-500 text-xs hover:text-red-400 cursor-pointer shrink-0"
      >
        Delete
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-5xl font-extrabold text-black">Your Skills</h1>
            <p className="text-neutral-500 text-base mt-1">
              What you can teach, and what you want to learn
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-base underline text-neutral-500 hover:text-black  cursor-pointer transition"
          >
            Back to Dashboard
          </button>
        </div>

        <form
          onSubmit={handleAddSkill}
          className="p-6 border border-neutral-700 rounded-3xl bg-black mb-8 flex flex-col gap-3"
        >
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("offer")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition ${
                type === "offer"
                  ? "bg-white text-black"
                  : "bg-neutral-950 border border-neutral-700 text-neutral-400 hover:text-white"
              }`}
            >
              I can teach
            </button>
            <button
              type="button"
              onClick={() => setType("want")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition ${
                type === "want"
                  ? "bg-white text-black"
                  : "bg-neutral-950 border border-neutral-700 text-neutral-400 hover:text-white"
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
            className="p-3 bg-neutral-950 border text-white border-neutral-700 rounded-xl text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white transition"
            required
          />

          <textarea
            placeholder="Add a short description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="p-3 bg-neutral-950 text-white border border-neutral-700 rounded-xl text-sm resize-none placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white transition"
          />

          {errorMsg && (
            <p className="text-red-500 text-xs text-center">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="bg-white text-black py-2.5 rounded-xl text-sm font-bold hover:bg-neutral-200 transition cursor-pointer"
          >
            {saving ? "Adding..." : "Add Skill"}
          </button>
        </form>

        {loading ? (
          <p className="text-center text-neutral-500 text-sm">
            Loading skills...
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <div className="flex flex-col gap-2">
                {offers.map((skill) => (
                  <SkillCard key={skill.id} skill={skill} />
                ))}
              </div>
            </div>

            <div>
              <div className="flex flex-col gap-2">
                {wants.map((skill) => (
                  <SkillCard key={skill.id} skill={skill} />
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

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

const Requests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    const { data: incomingData } = await supabase
      .from("matches")
      .select("id, status, skills(title), profiles!matches_requester_id_fkey(username)")
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false });

    const { data: outgoingData } = await supabase
      .from("matches")
      .select("id, status, skills(title), profiles!matches_recipient_id_fkey(username)")
      .eq("requester_id", user.id)
      .order("created_at", { ascending: false });

    setIncoming(incomingData || []);
    setOutgoing(outgoingData || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  const respond = async (id, status) => {
    await supabase.from("matches").update({ status }).eq("id", id);
    fetchRequests();
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-5xl font-extrabold">Requests</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm underline cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>

        {loading ? (
          <p className="text-center text-neutral-500">Loading...</p>
        ) : (
          <>
            <h2 className="text-lg font-bold mb-3">Incoming</h2>
            <div className="flex flex-col gap-3 mb-8">
              {incoming.map((req) => (
                <div
                  key={req.id}
                  className="p-4 bg-black text-white border border-neutral-700 rounded-2xl flex justify-between items-center"
                >
                  <p>
                    <span className="font-bold">
                      {req.profiles?.username}
                    </span>{" "}
                    wants to connect on{" "}
                    <span className="font-bold">{req.skills?.title}</span>
                  </p>
                  {req.status === "pending" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => respond(req.id, "confirmed")}
                        className="bg-white text-black px-3 py-1 rounded-lg text-sm font-bold cursor-pointer"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => respond(req.id, "declined")}
                        className="border border-white px-3 py-1 rounded-lg text-sm font-bold cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-neutral-400 capitalize">
                      {req.status}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <h2 className="text-lg font-bold mb-3">Sent</h2>
            <div className="flex flex-col gap-3">
              {outgoing.map((req) => (
                <div
                  key={req.id}
                  className="p-4 bg-black text-white border border-neutral-700 rounded-2xl flex justify-between items-center"
                >
                  <p>
                    Request to{" "}
                    <span className="font-bold">
                      {req.profiles?.username}
                    </span>{" "}
                    for <span className="font-bold">{req.skills?.title}</span>
                  </p>
                  <span className="text-sm text-neutral-400 capitalize">
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Requests;
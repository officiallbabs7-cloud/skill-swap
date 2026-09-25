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
      .select(
        "id, status, skills(title), profiles!matches_requester_id_fkey(username)"
      )
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false });

    const { data: outgoingData } = await supabase
      .from("matches")
      .select(
        "id, status, skills(title), profiles!matches_recipient_id_fkey(username)"
      )
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

  const StatusBadge = ({ status }) => {
    const styles = {
      confirmed: "bg-green-500/10 text-green-400 border-green-500/30",
      declined: "bg-red-500/10 text-red-400 border-red-500/30",
      pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    };
    const labels = {
      confirmed: "Accepted",
      declined: "Declined",
      pending: "Pending",
    };
    return (
      <span
        className={`text-xs px-2 py-1 rounded-full border capitalize ${styles[status]}`}
      >
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-5xl font-extrabold">Requests</h1>
            <p className="text-neutral-500 text-base mt-1">
              Connection requests you've sent and received
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
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold">Incoming</h2>
              <span className="text-xs text-neutral-400">
                {incoming.length}
              </span>
            </div>
            <div className="flex flex-col gap-2 mb-8">
              {incoming.length === 0 ? (
                <p className="text-sm text-neutral-400 italic">
                  No incoming requests
                </p>
              ) : (
                incoming.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 bg-black text-white border border-neutral-800 rounded-2xl flex justify-between items-center gap-3"
                  >
                    <p className="text-sm">
                      <span className="font-bold">
                        {req.profiles?.username}
                      </span>{" "}
                      wants to connect on{" "}
                      <span className="font-bold">{req.skills?.title}</span>
                    </p>
                    {req.status === "pending" ? (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => respond(req.id, "confirmed")}
                          className="bg-white text-black px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-neutral-200 transition cursor-pointer"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => respond(req.id, "declined")}
                          className="border border-neutral-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-neutral-900 transition cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <StatusBadge status={req.status} />
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold">Sent</h2>
              <span className="text-xs text-neutral-400">
                {outgoing.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {outgoing.length === 0 ? (
                <p className="text-sm text-neutral-400 italic">
                  No sent requests
                </p>
              ) : (
                outgoing.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 bg-black text-white border border-neutral-800 rounded-2xl flex justify-between items-center gap-3"
                  >
                    <p className="text-sm">
                      Request to{" "}
                      <span className="font-bold">
                        {req.profiles?.username}
                      </span>{" "}
                      for <span className="font-bold">{req.skills?.title}</span>
                    </p>
                    <StatusBadge status={req.status} />
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Requests;
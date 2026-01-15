"use client";

import { useState } from "react";

export default function CancelSubscriptionButton({
  userId,
}: {
  userId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleCancel = async () => {
    setLoading(true);
    setMsg("");

    const res = await fetch("http://localhost:8000/api/subscription/cancel", {
      method: "POST",
      headers: { "x-user-id": userId },
    });

    const data = await res.json();

    if (data.success) {
      setMsg("Subscription canceled and $1 refunded");
    } else {
      setMsg("Failed to cancel");
    }

    setLoading(false);
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleCancel}
        disabled={loading}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Processing..." : "Cancel Subscription"}
      </button>

      {msg && <p className="mt-2">{msg}</p>}
    </div>
  );
}

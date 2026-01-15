"use client";

import { useEffect, useState } from "react";

type StatusData = {
  status: string;
  plan: string;
  isActive: boolean;
  trialEndsAt?: string;
  currentPeriodEnd?: string;
};

export default function SubscriptionStatus({ userId }: { userId: string }) {
  const [data, setData] = useState<StatusData | null>(null);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/api/subscription/status", {
      headers: { "x-user-id": userId },
    })
      .then((r) => r.json())
      .then(setData);
  }, [userId]);

  const handleCancel = async () => {
    if (!confirm("Cancel subscription and refund $1?")) return;

    setCanceling(true);
    const res = await fetch("http://localhost:8000/api/subscription/cancel", {
      method: "POST",
      headers: { "x-user-id": userId },
    });

    if (res.ok) {
      alert("Subscription canceled and $1 refunded");
      window.location.reload();
    } else {
      alert("Failed to cancel");
    }
    setCanceling(false);
  };

  if (!data) return <div>Loading...</div>;

  if (data.status === "none") {
    return <div className="text-gray-500">No active subscription</div>;
  }

  return (
    <div className="p-6 border rounded-xl bg-gray-50">
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="font-medium">Plan:</span>
          <span className="uppercase">{data.plan}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Status:</span>
          <span className={data.isActive ? "text-green-600" : "text-gray-500"}>
            {data.status}
          </span>
        </div>
        {data.trialEndsAt && (
          <div className="flex justify-between">
            <span className="font-medium">Trial ends:</span>
            <span>{new Date(data.trialEndsAt).toLocaleDateString()}</span>
          </div>
        )}
        {data.currentPeriodEnd && (
          <div className="flex justify-between">
            <span className="font-medium">Next billing:</span>
            <span>{new Date(data.currentPeriodEnd).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {data.isActive && (
        <button
          onClick={handleCancel}
          disabled={canceling}
          className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-50"
        >
          {canceling ? "Canceling..." : "Cancel Subscription"}
        </button>
      )}
    </div>
  );
}

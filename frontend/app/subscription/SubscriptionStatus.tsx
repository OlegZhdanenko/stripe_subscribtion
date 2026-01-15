"use client";
import axios, { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

type TrialData = {
  plan: string;
  status: string;
  trialStart?: string;
  trialEnd?: string;
  reservedAmount?: number;
  currency?: string;
};
const defaultTrialData: TrialData = {
  plan: "Free",
  status: "none",
  trialStart: undefined,
  trialEnd: undefined,
  reservedAmount: 0,
  currency: "USD",
};
interface ISubscriptionStatus {
  userId: string;
  email: string;
  priceId: string;
}
export default function SubscriptionStatus({
  userId,
  email,
  priceId,
}: ISubscriptionStatus) {
  const stripe = useStripe();
  const elements = useElements();
  const [trialData, setTrialData] = useState<TrialData | null>(
    defaultTrialData
  );
  const [loading, setLoading] = useState(false);

  const fetchTrialData = async () => {
    try {
      console.log("current-plan");
      const response: AxiosResponse<TrialData> = await axios.get(
        `http://localhost:8000/api/stripe/current-plan`,
        { params: { userId } }
      );

      setTrialData(response.data);
    } catch (error) {
      console.error("Failed to fetch trial data:", error);
    }
  };

  useEffect(() => {
    fetchTrialData();
  }, []);

  const handleStartTrial = async () => {
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:8000/api/stripe/create-trial",
        { userId, email, priceId }
      );

      const result = await stripe.confirmCardPayment(
        data.paymentIntentClientSecret,
        {
          payment_method: { card: elements.getElement(CardElement)! },
        }
      );

      if (result.error) {
        alert(result.error.message);
      } else {
        alert("Trial started! $1 reserved.");
        await fetchTrialData();
      }
    } catch (error) {
      console.error("Failed to start trial:", error);
      alert("Failed to start trial");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTrial = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:8000/api/stripe/cancel-trial",
        null,
        {
          params: { userId },
        }
      );

      if (data.success) alert("Trial canceled, $1 released.");
      else alert("No active trial found.");

      await fetchTrialData();
    } catch (error) {
      console.error("Failed to cancel trial:", error);
      alert("Failed to cancel trial");
    } finally {
      setLoading(false);
    }
  };

  if (!trialData) return <p>Loading...</p>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded-xl">
      <h2 className="text-xl font-semibold text-blue-600 mb-4">
        Your Subscription
      </h2>
      <p className="text-xl font-semibold text-blue-600 mb-4">
        <strong>Plan:</strong> {trialData.plan}
      </p>
      <p className="text-xl font-semibold text-blue-600 mb-4">
        <strong>Status:</strong> {trialData.status}
      </p>
      {trialData.trialStart && trialData.trialEnd && (
        <p className="text-xl font-semibold text-blue-600 mb-4">
          <strong>Trial Period:</strong>{" "}
          {new Date(trialData.trialStart).toLocaleDateString()} -{" "}
          {new Date(trialData.trialEnd).toLocaleDateString()}
        </p>
      )}
      {trialData.reservedAmount && (
        <p className="text-xl font-semibold text-blue-600 mb-4">
          <strong>Reserved Amount:</strong> ${trialData.reservedAmount}{" "}
          {trialData.currency}
        </p>
      )}

      {(trialData.status === "none" || trialData.status === "canceled") && (
        <>
          <div className="border p-3 mt-4 mb-2 rounded">
            <CardElement />
          </div>
          <button
            onClick={handleStartTrial}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
          >
            {loading ? "Processing..." : "Start Trial"}
          </button>
        </>
      )}

      {(trialData.status === "reserved" ||
        trialData.status === "completed") && (
        <>
          <p className="mt-4 text-green-600 font-semibold">
            Your trial is active or subscription is paid.
          </p>
          <button
            onClick={handleCancelTrial}
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 rounded mt-3 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Cancel Trial"}
          </button>
        </>
      )}
    </div>
  );
}

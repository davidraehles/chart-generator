"use client";

import { useState, FormEvent } from "react";
import { submitEmail, APIError } from "@/services/api";
import { LABELS, ERROR_MESSAGES } from "@/utils/constants";

export default function EmailCaptureSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Simple email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(ERROR_MESSAGES.invalidEmail);
      setLoading(false);
      return;
    }

    try {
      const result = await submitEmail(email);
      setSuccess(true);
      setEmail("");
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        setError(ERROR_MESSAGES.unexpectedError);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 bg-accent bg-opacity-5 rounded-lg border border-accent">
        <p className="text-accent text-center">
          Vielen Dank für dein Interesse an einem Business Reading.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-primary mb-4">
        {LABELS.emailCapture}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={LABELS.emailPlaceholder}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              error
                ? "border-error focus:ring-error"
                : "border-secondary focus:ring-accent"
            }`}
            disabled={loading}
          />
          {error && <p className="mt-1 text-sm text-error">{error}</p>}
        </div>
        <button
          type="submit"
          disabled={loading || !email}
          className="w-full bg-accent text-white py-2 px-4 rounded-md font-medium hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Wird gesendet..." : LABELS.submitEmail}
        </button>
      </form>
    </div>
  );
}

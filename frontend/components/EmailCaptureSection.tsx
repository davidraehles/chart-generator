"use client";

import { useState, FormEvent } from "react";
import { submitEmail, APIError } from "@/services/api";
import { ERROR_MESSAGES } from "@/utils/constants";

const ACCENT  = "#5F7680";
const BORDER  = "#E8E3DC";
const MUTED   = "#6B7280";
const DARK    = "#1A2126";
const BODY    = "#374151";

// Map type code → label for personalised copy
const TYPE_LABELS: Record<string, string> = {
  "1": "Generator",
  "2": "Manifestierender Generator",
  "3": "Projektor",
  "4": "Manifestor",
  "5": "Reflektor",
};

interface EmailCaptureSectionProps {
  hdType?: string;      // type code: "1" | "2" | "3" | "4" | "5"
  firstName?: string;
}

export default function EmailCaptureSection({ hdType, firstName }: EmailCaptureSectionProps) {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");

  const typeLabel = hdType ? TYPE_LABELS[hdType] : null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(ERROR_MESSAGES.invalidEmail);
      setLoading(false);
      return;
    }

    try {
      await submitEmail(email, firstName, hdType);
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
      <div className="mt-6 px-5 py-5"
        style={{ borderLeft: `3px solid ${ACCENT}`, background: "#F0F4F5" }}>
        <p className="text-sm font-semibold mb-1" style={{ color: ACCENT }}>
          Du bist dabei.
        </p>
        <p className="text-sm leading-relaxed" style={{ color: BODY }}>
          Dein erster Trigger-Letter ist auf dem Weg zu dir.
          {typeLabel ? ` Speziell für deinen Typ als ${typeLabel}.` : ""}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6" style={{ borderTop: `0.5px solid ${BORDER}`, paddingTop: "24px" }}>
      {/* Headline */}
      <div className="mb-4" style={{ borderLeft: `3px solid ${ACCENT}`, paddingLeft: "14px" }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: ACCENT }}>
          Kostenlos · 6 Impulse über 12 Monate
        </p>
        <h3 className="text-base font-semibold mb-1" style={{ color: DARK }}>
          Deine persönlichen Trigger-Letters
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: BODY }}>
          {typeLabel
            ? `Speziell für deinen Energietyp als ${typeLabel}: 6 Impulse, die dir zeigen, wie du deine Energie konkret im Alltag nutzt.`
            : "6 Impulse zu deinem Energietyp — konkret, anwendbar, auf dich zugeschnitten."}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex gap-3 items-start">
        <div className="flex-1">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="deine@email.de"
            disabled={loading}
            className="w-full px-4 py-2.5 text-sm border focus:outline-none focus:ring-1 focus:ring-[#5F7680] transition-colors"
            style={{ borderColor: error ? "#C0392B" : BORDER }}
          />
          {error && <p className="mt-1 text-xs" style={{ color: "#C0392B" }}>{error}</p>}
        </div>
        <button
          type="submit"
          disabled={loading || !email}
          className="px-5 py-2.5 text-sm font-medium text-white whitespace-nowrap transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: ACCENT }}>
          {loading ? "…" : "Trigger-Letters erhalten"}
        </button>
      </form>

      <p className="mt-3 text-xs" style={{ color: MUTED }}>
        Kein Spam. Kein Newsletter. Nur 6 Mails, dann ist es vorbei.
      </p>
    </div>
  );
}

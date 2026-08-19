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
  const [email, setEmail]       = useState("");
  const [consent, setConsent]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState("");

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

    if (!consent) {
      setError("Bitte stimme der Einwilligung zu.");
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
          Dein erster Business Energy Trigger ist auf dem Weg zu dir.
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
          Kostenlos · 6 Impulse über 6 Monate
        </p>
        <h3 className="text-base font-semibold mb-1" style={{ color: DARK }}>
          Business Energy Trigger
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: BODY }}>
          6 Monate, 6 persönliche Business Energy Trigger, abgestimmt auf deinen Human Design Typ. Jeden Monat ein Impuls, der dich zum Reflektieren bringt, Aha-Momente auslöst und dir hilft, deine Business-Energie bewusster einzusetzen. Kein Newsletter. 6 Mails. Danach Schluss.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3 items-start mb-3">
          <div className="flex-1">
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="deine@email.de"
              disabled={loading}
              className="w-full px-4 py-2.5 text-sm border focus:outline-none focus:ring-1 focus:ring-[#5F7680] transition-colors"
              style={{ borderColor: error ? "#C0392B" : BORDER }}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !email || !consent}
            className="px-5 py-2.5 text-sm font-medium text-white whitespace-nowrap transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: ACCENT }}>
            {loading ? "…" : "Business Energy Trigger kostenlos anfordern"}
          </button>
        </div>

        {/* Einwilligung */}
        <label className="flex items-start gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => { setConsent(e.target.checked); setError(""); }}
            className="mt-0.5 w-4 h-4 shrink-0"
            style={{ accentColor: ACCENT }}
          />
          <span className="text-xs leading-relaxed" style={{ color: MUTED }}>
            Ja, ich möchte 6 Business Energy Trigger zu meiner Business-Energie erhalten — kostenlos, abgestimmt auf meinen Human Design Typ. Ich kann mich jederzeit abmelden.{" "}
            <a
              href="https://www.stupperich.de/datenschutz"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: ACCENT, textDecoration: "underline" }}>
              Datenschutz
            </a>
          </span>
        </label>

        {error && <p className="mt-2 text-xs" style={{ color: "#C0392B" }}>{error}</p>}
      </form>

      <p className="mt-3 text-xs" style={{ color: MUTED }}>
        Kein Spam. Kein Newsletter. Nur 6 Mails, dann ist es vorbei.
      </p>
    </div>
  );
}

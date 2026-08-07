"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { ChartRequest, ChartResponse } from "@/types/chart";
import { fetchChart, APIError } from "@/services/api";
import { LABELS, ERROR_MESSAGES, PLACEHOLDERS } from "@/utils/constants";

const ACCENT  = "#5F7680";
const BORDER  = "#E8E3DC";
const MUTED   = "#6B7280";
const DARK    = "#1A2126";
const BODY    = "#2D3748";

interface PhotonFeature {
  properties: {
    name: string;
    state?: string;
    country?: string;
    countrycode?: string;
    osm_key?: string;
  };
  geometry: {
    coordinates: [number, number]; // [lng, lat]
  };
}

interface ChartFormProps {
  onSuccess: (data: ChartResponse) => void;
  onError: (error: string) => void;
  onRequest?: (req: ChartRequest) => void;
}

function FormField({
  id, label, error, hint, children,
}: {
  id: string; label: string; error?: string; hint?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1.5" style={{ color: DARK }}>
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs leading-snug" style={{ color: MUTED }}>{hint}</p>}
      {error && <p className="mt-1 text-xs" style={{ color: "#C0392B" }}>{error}</p>}
    </div>
  );
}

const inputClass = (hasError: boolean) =>
  `w-full px-4 py-2.5 text-sm border focus:outline-none focus:ring-1 transition-colors ${
    hasError
      ? "border-red-400 focus:ring-red-300"
      : "focus:ring-[#5F7680]"
  }`;

export default function ChartForm({ onSuccess, onError, onRequest }: ChartFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ChartRequest>({
    firstName: "",
    lastName: "",
    birthDate: "",
    birthTime: "",
    birthTimeApproximate: false,
    birthPlace: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [suggestions, setSuggestions] = useState<PhotonFeature[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [placeCoords, setPlaceCoords] = useState<{ lat: number; lng: number } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (query: string) => {
    try {
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8&lang=de`
      );
      const data = await res.json();
      const places = (data.features as PhotonFeature[]).filter(
        (f) => f.properties.osm_key === "place"
      );
      setSuggestions(places.slice(0, 5));
      setShowSuggestions(places.length > 0);
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const handlePlaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, birthPlace: value }));
    setPlaceCoords(null);
    clearError("birthPlace");

    clearTimeout(debounceRef.current);
    if (value.length >= 2) {
      debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (feature: PhotonFeature) => {
    const { name, state, country } = feature.properties;
    const label = [name, state, country].filter(Boolean).join(", ");
    const [lng, lat] = feature.geometry.coordinates;
    setFormData((prev) => ({ ...prev, birthPlace: label }));
    setPlaceCoords({ lat, lng });
    setSuggestions([]);
    setShowSuggestions(false);
    clearError("birthPlace");
  };

  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case "firstName":
        if (!value || value.length < 2) return ERROR_MESSAGES.invalidName;
        break;
      case "birthDate":
        if (!/^\d{2}\.\d{2}\.\d{4}$/.test(value)) return ERROR_MESSAGES.invalidDate;
        break;
      case "birthTime":
        if (!formData.birthTimeApproximate && !/^\d{2}:\d{2}$/.test(value))
          return ERROR_MESSAGES.invalidTime;
        break;
      case "birthPlace":
        if (!value || value.length < 2) return ERROR_MESSAGES.required;
        break;
    }
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    if (errors[name]) clearError(name);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onError("");

    const newErrors: Record<string, string> = {};
    ["firstName", "birthDate", "birthTime", "birthPlace"].forEach((key) => {
      const error = validateField(key, formData[key as keyof ChartRequest] as string);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const requestData: ChartRequest = {
        ...formData,
        birthTime:
          formData.birthTimeApproximate && !formData.birthTime
            ? "12:00"
            : formData.birthTime,
        ...(placeCoords ? { latitude: placeCoords.lat, longitude: placeCoords.lng } : {}),
      };

      const result = await fetchChart(requestData);
      onRequest?.(requestData);
      onSuccess(result);
    } catch (error) {
      if (error instanceof APIError) {
        if (error.field) {
          setErrors({ [error.field]: error.message });
        } else {
          onError(error.message);
        }
      } else {
        onError(ERROR_MESSAGES.unexpectedError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* ── Intro ── */}
      <div className="mb-7" style={{ borderLeft: `3px solid ${ACCENT}`, paddingLeft: "16px" }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>
          Human Design · Business Energy Calculator
        </p>
        <h1 className="text-2xl font-semibold tracking-tight leading-snug mb-3" style={{ color: DARK }}>
          Entdecke, wie du arbeitest, Entscheidungen triffst, kommunizierst und auf andere wirkst.
        </h1>
        <p className="text-sm" style={{ color: MUTED }}>
          Mit deiner persönlichen Human Design Business-Energie.
        </p>
      </div>

      {/* ── Silke – Vertrauenssignal ── */}
      <div className="mb-7 pb-5" style={{ borderBottom: `0.5px solid ${BORDER}` }}>
        <p className="text-sm font-semibold" style={{ color: DARK }}>Entwickelt von Silke Stupperich</p>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: MUTED }}>
          20 Jahre Kommunikation, Change & Transformation auf Top-Management-Ebene
          {" · "}Human Design Readerin nach Codes of Life®
        </p>
      </div>

      {/* ── Formular ── */}
      <form onSubmit={handleSubmit} className="space-y-5"
        style={{ background: "#F9F7F4", border: `0.5px solid ${BORDER}`, padding: "28px" }}>

        {/* Vorname + Nachname nebeneinander */}
        <div className="grid grid-cols-2 gap-4">
          <FormField id="firstName" label={LABELS.firstName} error={errors.firstName}>
            <input
              type="text" id="firstName" name="firstName"
              value={formData.firstName} onChange={handleChange}
              placeholder={PLACEHOLDERS.firstName} autoComplete="given-name"
              className={inputClass(!!errors.firstName)}
              style={{ borderColor: errors.firstName ? undefined : BORDER }}
            />
          </FormField>
          <FormField id="lastName" label={LABELS.lastName}>
            <input
              type="text" id="lastName" name="lastName"
              value={formData.lastName ?? ""} onChange={handleChange}
              placeholder={PLACEHOLDERS.lastName} autoComplete="family-name"
              className={inputClass(false)}
              style={{ borderColor: BORDER }}
            />
          </FormField>
        </div>

        <FormField id="birthDate" label={LABELS.birthDate} error={errors.birthDate}>
          <input
            type="text" id="birthDate" name="birthDate"
            value={formData.birthDate} onChange={handleChange}
            placeholder={PLACEHOLDERS.birthDate} autoComplete="bday"
            className={inputClass(!!errors.birthDate)}
            style={{ borderColor: errors.birthDate ? undefined : BORDER }}
          />
        </FormField>

        <FormField
          id="birthTime" label={LABELS.birthTime} error={errors.birthTime}
          hint={!formData.birthTimeApproximate
            ? "Die genaue Geburtszeit ist wichtig für eine möglichst präzise Berechnung."
            : undefined}>
          <input
            type="text" id="birthTime" name="birthTime"
            value={formData.birthTime} onChange={handleChange}
            placeholder={PLACEHOLDERS.birthTime}
            disabled={formData.birthTimeApproximate}
            className={inputClass(!!errors.birthTime)}
            style={{
              borderColor: errors.birthTime ? undefined : BORDER,
              background: formData.birthTimeApproximate ? "#EFEFEF" : undefined,
              color: formData.birthTimeApproximate ? MUTED : undefined,
            }}
          />
          <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
            <input
              type="checkbox" name="birthTimeApproximate"
              checked={formData.birthTimeApproximate} onChange={handleChange}
              className="w-4 h-4 rounded"
              style={{ accentColor: ACCENT }}
            />
            <span className="text-xs" style={{ color: MUTED }}>{LABELS.birthTimeApproximate}</span>
          </label>
        </FormField>

        <FormField id="birthPlace" label={LABELS.birthPlace} error={errors.birthPlace}>
          <div className="relative" ref={containerRef}>
            <input
              type="text" id="birthPlace" name="birthPlace"
              value={formData.birthPlace} onChange={handlePlaceChange}
              placeholder={PLACEHOLDERS.birthPlace} autoComplete="off"
              className={inputClass(!!errors.birthPlace)}
              style={{ borderColor: errors.birthPlace ? undefined : BORDER }}
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-56 overflow-auto text-sm"
                style={{ border: `0.5px solid ${BORDER}` }}>
                {suggestions.map((feature, i) => {
                  const { name, state, country } = feature.properties;
                  const label = [name, state, country].filter(Boolean).join(", ");
                  return (
                    <li key={i} onMouseDown={() => handleSelectSuggestion(feature)}
                      className="px-4 py-2.5 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      style={{ color: DARK }}>
                      {label}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </FormField>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit" disabled={loading}
            className="w-full py-3 px-6 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: ACCENT }}>
            {loading ? "Wird berechnet…" : LABELS.generateChart}
          </button>
        </div>
      </form>

      {/* ── Datenschutz-Hinweis ── */}
      <p className="mt-4 text-center text-xs" style={{ color: "#C4BEB8" }}>
        Deine Angaben werden ausschließlich zur Berechnung deiner persönlichen Human Design Business-Energie verwendet.
      </p>

      {/* ── Rechtlicher Hinweis ── */}
      <p className="mt-2 text-center text-xs" style={{ color: "#C4BEB8" }}>
        Diese Auswertung basiert auf deinen Geburtsdaten und zeigt ausgewählte Human Design Elemente, ohne Bodygraph.
      </p>

    </div>
  );
}

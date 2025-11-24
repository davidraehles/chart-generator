"use client";

import { useState, FormEvent } from "react";
import { ChartRequest, ChartResponse } from "@/types/chart";
import { fetchChart, APIError } from "@/services/api";
import { LABELS, ERROR_MESSAGES, PLACEHOLDERS } from "@/utils/constants";

interface ChartFormProps {
  onSuccess: (data: ChartResponse) => void;
  onError: (error: string) => void;
}

export default function ChartForm({ onSuccess, onError }: ChartFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ChartRequest>({
    firstName: "",
    birthDate: "",
    birthTime: "",
    birthTimeApproximate: false,
    birthPlace: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case "firstName":
        if (!value || value.length < 2) {
          return ERROR_MESSAGES.invalidName;
        }
        break;
      case "birthDate":
        if (!/^\d{2}\.\d{2}\.\d{4}$/.test(value)) {
          return ERROR_MESSAGES.invalidDate;
        }
        break;
      case "birthTime":
        if (!formData.birthTimeApproximate && !/^\d{2}:\d{2}$/.test(value)) {
          return ERROR_MESSAGES.invalidTime;
        }
        break;
      case "birthPlace":
        if (!value || value.length < 2) {
          return ERROR_MESSAGES.required;
        }
        break;
    }
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onError("");

    // Validate all fields
    const newErrors: Record<string, string> = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "birthTimeApproximate") {
        const error = validateField(key, value as string);
        if (error) {
          newErrors[key] = error;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      // If birthTimeApproximate is true and no time provided, use 12:00
      const requestData = {
        ...formData,
        birthTime: formData.birthTimeApproximate && !formData.birthTime
          ? "12:00"
          : formData.birthTime,
      };

      const result = await fetchChart(requestData);
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
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-primary mb-2">
          {LABELS.firstName}
        </label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder={PLACEHOLDERS.firstName}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors.firstName
              ? "border-error focus:ring-error"
              : "border-secondary focus:ring-accent"
          }`}
          required
        />
        {errors.firstName && (
          <p className="mt-1 text-sm text-error">{errors.firstName}</p>
        )}
      </div>

      <div>
        <label htmlFor="birthDate" className="block text-sm font-medium text-primary mb-2">
          {LABELS.birthDate}
        </label>
        <input
          type="text"
          id="birthDate"
          name="birthDate"
          value={formData.birthDate}
          onChange={handleChange}
          placeholder={PLACEHOLDERS.birthDate}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors.birthDate
              ? "border-error focus:ring-error"
              : "border-secondary focus:ring-accent"
          }`}
          required
        />
        {errors.birthDate && (
          <p className="mt-1 text-sm text-error">{errors.birthDate}</p>
        )}
        <p className="mt-1 text-xs text-secondary">Format: TT.MM.JJJJ</p>
      </div>

      <div>
        <label htmlFor="birthTime" className="block text-sm font-medium text-primary mb-2">
          {LABELS.birthTime}
        </label>
        <input
          type="text"
          id="birthTime"
          name="birthTime"
          value={formData.birthTime}
          onChange={handleChange}
          placeholder={PLACEHOLDERS.birthTime}
          disabled={formData.birthTimeApproximate}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors.birthTime
              ? "border-error focus:ring-error"
              : "border-secondary focus:ring-accent"
          } ${formData.birthTimeApproximate ? "bg-gray-100" : ""}`}
          required={!formData.birthTimeApproximate}
        />
        {errors.birthTime && (
          <p className="mt-1 text-sm text-error">{errors.birthTime}</p>
        )}
        <p className="mt-1 text-xs text-secondary">Format: HH:MM</p>

        <div className="mt-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="birthTimeApproximate"
              checked={formData.birthTimeApproximate}
              onChange={handleChange}
              className="w-4 h-4 text-accent border-secondary rounded focus:ring-accent"
            />
            <span className="text-sm text-secondary">{LABELS.birthTimeApproximate}</span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="birthPlace" className="block text-sm font-medium text-primary mb-2">
          {LABELS.birthPlace}
        </label>
        <input
          type="text"
          id="birthPlace"
          name="birthPlace"
          value={formData.birthPlace}
          onChange={handleChange}
          placeholder={PLACEHOLDERS.birthPlace}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors.birthPlace
              ? "border-error focus:ring-error"
              : "border-secondary focus:ring-accent"
          }`}
          required
        />
        {errors.birthPlace && (
          <p className="mt-1 text-sm text-error">{errors.birthPlace}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white py-3 px-6 rounded-md font-medium hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Generiere..." : LABELS.generateChart}
      </button>
    </form>
  );
}

/**
 * API client service for backend communication
 */

import {
  ChartRequest,
  ChartResponse,
  EmailCaptureRequest,
  EmailCaptureResponse,
  EphemerisChartRequest,
  EphemerisChartResponse,
} from "@/types/chart";

// Use relative path to leverage Next.js rewrites in production
// In dev, rewrites proxy to localhost:5000
const API_BASE_URL = "/api";

export class APIError extends Error {
  field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.field = field;
    this.name = "APIError";
  }
}

/**
 * Fetch Human Design chart from backend
 */
export async function fetchChart(request: ChartRequest): Promise<ChartResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/hd-chart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new APIError(
        error.detail?.error || error.detail || "Fehler bei der Chart-Generierung",
        error.detail?.field
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      "Gerade kann dein Chart nicht berechnet werden. Bitte versuche es später noch einmal."
    );
  }
}

/**
 * Calculate Human Design chart with ephemeris data
 */
export async function calculateChart(
  request: EphemerisChartRequest
): Promise<EphemerisChartResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/calculate-chart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new APIError(
        error.detail?.message || error.detail || "Fehler bei der Chart-Berechnung",
        error.detail?.field
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      "Gerade kann dein Chart nicht berechnet werden. Bitte versuche es später noch einmal."
    );
  }
}

/**
 * Submit email for Business Reading interest
 */
export async function submitEmail(email: string): Promise<EmailCaptureResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/email-capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new APIError(
        error.detail?.error || error.detail || "Fehler beim Speichern der E-Mail",
        error.detail?.field
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError("Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal.");
  }
}

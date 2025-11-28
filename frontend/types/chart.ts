/**
 * TypeScript types matching backend Pydantic models
 */

export interface ChartRequest {
  firstName: string;
  birthDate: string; // Format: TT.MM.JJJJ
  birthTime: string; // Format: HH:MM
  birthTimeApproximate: boolean;
  birthPlace: string;
}

export interface TypeInfo {
  code: string;
  label: string;
  shortDescription: string;
}

export interface AuthorityInfo {
  code: string;
  label: string;
  decisionHint: string;
}

export interface ProfileInfo {
  code: string; // e.g., "4/1"
  shortDescription: string;
}

export interface Center {
  name: string;
  code: string;
  defined: boolean;
}

export interface Channel {
  code: string; // e.g., "34-20"
}

export interface IncarnationCross {
  code: string;
  name: string;
  gates: string[]; // e.g., ["15", "10", "5", "35"]
}

export interface ChartResponse {
  firstName: string;
  type: TypeInfo;
  authority: AuthorityInfo;
  profile: ProfileInfo;
  centers: Center[];
  channels: Channel[];
  gates: {
    conscious: string[];
    unconscious: string[];
  };
  incarnationCross: IncarnationCross;
  shortImpulse: string;
  calculationSource?: string;
}

export interface EmailCaptureRequest {
  email: string;
}

export interface EmailCaptureResponse {
  success: boolean;
  id: string;
  message: string;
}

export interface APIError {
  field?: string;
  error: string;
}

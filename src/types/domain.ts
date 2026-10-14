export type PublicationType =
  | "devotional"
  | "training"
  | "lesson"
  | "motivation"
  | "material"
  | "podcast"
  | "post";
export type Pillar = "body" | "mind" | "spirit";
export type PublicationStatus =
  | "draft"
  | "scheduled"
  | "published"
  | "archived";
export interface Publication {
  id: string;
  title: string;
  summary: string;
  body: string;
  type: PublicationType;
  pillar: Pillar;
  status: PublicationStatus;
  cover_path: string | null;
  media_url: string | null;
  details: Record<string, unknown>;
  reference_date: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
export type PublicationDraft = {
  cover_upload?: { base64: string; mimeType: "image/jpeg" };
} & Pick<
  Publication,
  "title" | "summary" | "body" | "type" | "pillar" | "status"
> &
  Partial<
    Pick<
      Publication,
      | "id"
      | "cover_path"
      | "media_url"
      | "details"
      | "reference_date"
      | "scheduled_at"
    >
  >;
export interface ElevaEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
  status: "draft" | "published" | "cancelled";
}
export interface Challenge {
  gymrats_url?: string | null;
  id: string;
  title: string;
  description: string;
  starts_on: string;
  ends_on: string;
  status: "draft" | "published" | "archived";
}
export type ChallengeDraft = Pick<
  Challenge,
  "title" | "description" | "starts_on" | "ends_on" | "status"
> &
  Partial<Pick<Challenge, "id" | "gymrats_url">>;
export interface ChallengeStep {
  id: string;
  challenge_id: string;
  title: string;
  position: number;
}
export interface Profile {
  id: string;
  full_name: string;
  avatar_path: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  city?: string | null;
}

export interface ProfileUpdate {
  full_name: string;
  phone?: string | null;
  city?: string | null;
  /** JPEG base64, null removes the photo, undefined keeps the existing photo. */
  avatar_base64?: string | null;
}

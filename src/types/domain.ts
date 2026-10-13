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
  "draft" | "scheduled" | "published" | "archived";
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
export type PublicationDraft = Pick<
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
  id: string;
  title: string;
  description: string;
  starts_on: string;
  ends_on: string;
  status: "draft" | "published" | "archived";
}
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
}

import type {
  Challenge,
  ChallengeDraft,
  ChallengeStep,
  ElevaEvent,
  Profile,
  ProfileUpdate,
  Publication,
  PublicationDraft,
} from "../types/domain";
export interface Activity {
  favoriteIds: string[];
  completionIds: string[];
  eventIds: string[];
  stepIds: string[];
}
export interface Access {
  role: "admin" | "member";
  active: boolean;
  plan?: "free" | "pro";
  banned?: boolean;
}
export interface ElevaRepository {
  listPublications(): Promise<Publication[]>;
  getPublication(id: string): Promise<Publication | null>;
  savePublication(draft: PublicationDraft): Promise<Publication>;
  archivePublication(id: string): Promise<void>;
  listEvents(): Promise<ElevaEvent[]>;
  listChallenges(): Promise<Challenge[]>;
  saveChallenge(draft: ChallengeDraft): Promise<Challenge>;
  listChallengeSteps(challengeId: string): Promise<ChallengeStep[]>;
  getActivity(): Promise<Activity>;
  setFavorite(id: string, enabled: boolean): Promise<void>;
  setCompletion(id: string, enabled: boolean): Promise<void>;
  registerEvent(id: string): Promise<void>;
  cancelRegistration(id: string): Promise<void>;
  setChallengeStep(id: string, enabled: boolean): Promise<void>;
  getProfile(): Promise<Profile | null>;
  updateProfile(update: ProfileUpdate): Promise<Profile>;
  getAccess(): Promise<Access | null>;
}

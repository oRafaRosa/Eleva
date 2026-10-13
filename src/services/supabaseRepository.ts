import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Challenge,
  ChallengeStep,
  ElevaEvent,
  Profile,
  Publication,
  PublicationDraft,
} from "../types/domain";
import type { Access, Activity, ElevaRepository } from "./repository";

export function createSupabaseRepository(
  client: SupabaseClient,
): ElevaRepository {
  const currentId = async () => {
    const { data, error } = await client.auth.getUser();
    if (error || !data.user)
      throw new Error("Entre na sua conta para continuar.");
    return data.user.id;
  };
  const list = async <T>(table: string, order: string): Promise<T[]> => {
    const { data, error } = await client.from(table).select("*").order(order);
    if (error) throw error;
    return (data ?? []) as T[];
  };
  const toggle = async (
    table: string,
    column: string,
    id: string,
    enabled: boolean,
  ) => {
    const user_id = await currentId();
    const result = enabled
      ? await client
          .from(table)
          .upsert({ user_id, [column]: id }, { ignoreDuplicates: true })
      : await client.from(table).delete().eq("user_id", user_id).eq(column, id);
    if (result.error) throw result.error;
  };
  return {
    listPublications: () => list<Publication>("publications", "created_at"),
    async getPublication(id) {
      const { data, error } = await client
        .from("publications")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as Publication | null;
    },
    async savePublication(draft: PublicationDraft) {
      if (!draft.title.trim()) throw new Error("Preencha o título.");
      const { id, ...fields } = draft;
      const query = id
        ? client.from("publications").update(fields).eq("id", id)
        : client.from("publications").insert(fields);
      const { data, error } = await query.select("*").single();
      if (error) throw error;
      return data as Publication;
    },
    async archivePublication(id) {
      const { error } = await client
        .from("publications")
        .update({ status: "archived" })
        .eq("id", id);
      if (error) throw error;
    },
    listEvents: () => list<ElevaEvent>("events", "starts_at"),
    listChallenges: () => list<Challenge>("challenges", "starts_on"),
    async listChallengeSteps(challengeId) {
      const { data, error } = await client
        .from("challenge_steps")
        .select("*")
        .eq("challenge_id", challengeId)
        .order("position");
      if (error) throw error;
      return (data ?? []) as ChallengeStep[];
    },
    async getActivity(): Promise<Activity> {
      const user = await currentId();
      const tables = [
        ["favorites", "publication_id"],
        ["completions", "publication_id"],
        ["event_registrations", "event_id"],
        ["challenge_progress", "step_id"],
      ] as const;
      const rows = await Promise.all(
        tables.map(async ([table, column]) => {
          const { data, error } = await client
            .from(table)
            .select(column)
            .eq("user_id", user);
          if (error) throw error;
          return (data ?? []).map(
            (row) => (row as unknown as Record<string, string>)[column],
          );
        }),
      );
      return {
        favoriteIds: rows[0],
        completionIds: rows[1],
        eventIds: rows[2],
        stepIds: rows[3],
      };
    },
    setFavorite: (id, enabled) =>
      toggle("favorites", "publication_id", id, enabled),
    setCompletion: (id, enabled) =>
      toggle("completions", "publication_id", id, enabled),
    async registerEvent(id) {
      const { error } = await client
        .from("event_registrations")
        .insert({ user_id: await currentId(), event_id: id });
      if (error) throw error;
    },
    cancelRegistration: (id) =>
      toggle("event_registrations", "event_id", id, false),
    setChallengeStep: (id, enabled) =>
      toggle("challenge_progress", "step_id", id, enabled),
    async getProfile() {
      const { data, error } = await client
        .from("profiles")
        .select("*")
        .eq("id", await currentId())
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
    async getAccess() {
      const { data, error } = await client
        .from("user_access")
        .select("role,active,expires_at")
        .eq("user_id", await currentId())
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        role: data.role,
        active:
          data.active &&
          (!data.expires_at || Date.parse(data.expires_at) > Date.now()),
      } as Access;
    },
  };
}

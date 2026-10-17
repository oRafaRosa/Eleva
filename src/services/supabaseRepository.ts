import { decodeCover } from "./coverValidation";
import { validateChallengeDraft } from "./challengeValidation";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Challenge,
  ChallengeStep,
  ElevaEvent,
  Profile,
  Publication,
  PublicationDraft,
} from "../types/domain";
import { validateProfileUpdate, decodeAvatar } from "./profileValidation";
import type { Access, Activity, ElevaRepository } from "./repository";

export function createSupabaseRepository(
  client: SupabaseClient,
  options: { randomUUID?: () => string } = {},
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
      const { id, cover_upload, ...fields } = draft;
      const bytes = cover_upload ? decodeCover(cover_upload) : null;
      let publicationId = id,
        uploadedPath: string | null = null,
        oldCover: string | null = null;
      const removingCover = id && !cover_upload && fields.cover_path === null;
      if (id && (bytes || removingCover)) {
        const { data, error } = await client
          .from("publications")
          .select("cover_path")
          .eq("id", id)
          .single();
        if (error) throw error;
        oldCover = data?.cover_path ?? null;
      }
      if (bytes) {
        await currentId();
        const randomUUID =
          options.randomUUID ?? (await import("expo-crypto")).randomUUID;
        publicationId = id ?? randomUUID();
        uploadedPath = `${publicationId}/cover-${randomUUID()}.jpg`;
        const { error } = await client.storage
          .from("eleva-content")
          .upload(uploadedPath, bytes!, {
            contentType: "image/jpeg",
            upsert: false,
          });
        if (error) throw error;
        fields.cover_path = uploadedPath;
      }
      try {
        const query = id
          ? client.from("publications").update(fields).eq("id", id)
          : client.from("publications").insert({
              ...fields,
              ...(publicationId ? { id: publicationId } : {}),
            });
        const { data, error } = await query.select("*").single();
        if (error) throw error;
        // Keep the previous cover until the new path has been committed.
        if (
          (uploadedPath || removingCover) &&
          oldCover?.startsWith(`${id}/cover-`)
        ) {
          try {
            await client.storage.from("eleva-content").remove([oldCover]);
          } catch {
            /* Retain orphan for later cleanup rather than undoing the saved publication. */
          }
        }
        return data as Publication;
      } catch (error) {
        if (uploadedPath) {
          try {
            await client.storage.from("eleva-content").remove([uploadedPath]);
          } catch {
            /* A cleanup failure does not hide the original save error. */
          }
        }
        throw error;
      }
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
    async saveChallenge(draft) {
      const { id, ...fields } = validateChallengeDraft(draft);
      const query = id
        ? client.from("challenges").update(fields).eq("id", id)
        : client.from("challenges").insert(fields);
      const { data, error } = await query.select("*").single();
      if (error) throw error;
      return data as Challenge;
    },
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
      if (!data) return null;
      let avatar_url: string | null = null;
      if (data.avatar_path) {
        const photo = await client.storage
          .from("eleva-avatars")
          .createSignedUrl(data.avatar_path, 300);
        if (!photo.error) avatar_url = photo.data.signedUrl;
      }
      return { ...data, avatar_url } as Profile;
    },
    async updateProfile(update) {
      const safe = validateProfileUpdate(update);
      const id = await currentId();
      const previous = await this.getProfile();
      let avatar_path = previous?.avatar_path ?? null;
      let uploaded: string | null = null;
      if (safe.avatar_base64 === null) avatar_path = null;
      if (safe.avatar_base64) {
        uploaded = `${id}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.jpg`;
        const upload = await client.storage
          .from("eleva-avatars")
          .upload(
            uploaded,
            decodeAvatar(safe.avatar_base64).buffer as ArrayBuffer,
            { contentType: "image/jpeg", cacheControl: "300", upsert: false },
          );
        if (upload.error)
          throw new Error("Não foi possível enviar a foto. Tente novamente.");
        avatar_path = uploaded;
      }
      const result = await client
        .from("profiles")
        .update({
          full_name: safe.full_name,
          phone: safe.phone,
          ...(safe.whatsapp_public !== undefined
            ? { whatsapp_public: safe.whatsapp_public }
            : {}),
          city: safe.city,
          avatar_path,
        })
        .eq("id", id)
        .select("*")
        .single();
      if (result.error) {
        if (uploaded)
          await client.storage.from("eleva-avatars").remove([uploaded]);
        throw new Error("Não foi possível salvar seu perfil. Tente novamente.");
      }
      if (previous?.avatar_path && previous.avatar_path !== avatar_path)
        await client.storage
          .from("eleva-avatars")
          .remove([previous.avatar_path]);
      let avatar_url: string | null = null;
      if (avatar_path) {
        try {
          const signed = await client.storage
            .from("eleva-avatars")
            .createSignedUrl(avatar_path, 300);
          avatar_url = signed.error ? null : signed.data.signedUrl;
        } catch {
          /* Saved profile remains valid if photo URL refresh fails. */
        }
      }
      return { ...result.data, avatar_url } as Profile;
    },
    async getAccess() {
      const { data, error } = await client
        .from("user_access")
        .select("role,active,expires_at,plan,banned")
        .eq("user_id", await currentId())
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        role: data.role,
        plan: data.plan,
        banned: data.banned,
        active:
          !data.banned &&
          data.active &&
          (data.role === "admin" || data.plan === "pro") &&
          (!data.expires_at || Date.parse(data.expires_at) > Date.now()),
      } as Access;
    },
  };
}

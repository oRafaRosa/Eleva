import type { DemoStorage } from "./demoRepository";
import type { ForumTopic, ForumReply } from "../types/forum";

export interface CommunityProfile {
  id: string;
  full_name: string;
  avatar_path: string | null;
  avatar_url?: string | null;
  joined_at: string;
  whatsapp: string | null;
}
export async function getCommunityProfiles(
  ids: string[],
  demo = false,
  demoStorage?: DemoStorage,
): Promise<CommunityProfile[]> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return [];
  if (demo) {
    const { createDemoRepository } = await import("./demoRepository");
    const profiles: CommunityProfile[] = [];
    for (const account of ["marina", "rebeca"] as const) {
      if (!unique.includes("demo-" + account)) continue;
      const p = await createDemoRepository(account, demoStorage).getProfile();
      if (p)
        profiles.push({
          id: p.id,
          full_name: p.full_name,
          avatar_path: p.avatar_path,
          avatar_url: p.avatar_url,
          joined_at: p.created_at ?? "",
          whatsapp: p.whatsapp_public ? (p.phone ?? null) : null,
        });
    }
    return profiles;
  }
  const { supabase } = await import("./supabase");
  if (!supabase) throw new Error("Não foi possível carregar os perfis.");
  const profiles: CommunityProfile[] = [];
  for (let i = 0; i < unique.length; i += 100) {
    const { data, error } = await supabase.rpc("community_profiles", {
      profile_ids: unique.slice(i, i + 100),
    });
    if (error) throw error;
    profiles.push(...(data ?? []));
  }
  const paths = [
    ...new Set(
      profiles.map((p) => p.avatar_path).filter((p): p is string => Boolean(p)),
    ),
  ];
  const urls = new Map<string, string>();
  if (paths.length) {
    // A broken image must never hide the posts or profile.
    try {
      const { data } = await supabase.storage
        .from("eleva-avatars")
        .createSignedUrls(paths, 300);
      for (const p of data ?? [])
        if (p.path && p.signedUrl) urls.set(p.path, p.signedUrl);
    } catch {
      /* Avatars can retry independently. */
    }
  }
  return profiles.map((p) => ({
    ...p,
    avatar_url: p.avatar_path ? (urls.get(p.avatar_path) ?? null) : null,
  }));
}
export function attachAuthors<T extends ForumTopic | ForumReply>(
  items: T[],
  profiles: CommunityProfile[],
): T[] {
  const byId = new Map(profiles.map((p) => [p.id, p]));
  return items.map((item) => {
    const p = byId.get(item.author_id);
    return {
      ...item,
      author_name: p?.full_name || item.author_name,
      author_avatar_path: p?.avatar_path ?? null,
      author_avatar_url: p?.avatar_url ?? null,
      author_profile_available: Boolean(p),
    };
  });
}
export async function hydrateForumAuthors<T extends ForumTopic | ForumReply>(
  items: T[],
): Promise<T[]> {
  return attachAuthors(
    items,
    await getCommunityProfiles(items.map((t) => t.author_id)),
  );
}
export async function getCommunityProfilePosts(
  id: string,
): Promise<ForumTopic[]> {
  const { supabase } = await import("./supabase");
  if (!supabase) throw new Error("Não foi possível carregar as publicações.");
  const { data, error } = await supabase.rpc("community_profile_posts", {
    profile_id: id,
  });
  if (error) throw error;
  return data ?? [];
}

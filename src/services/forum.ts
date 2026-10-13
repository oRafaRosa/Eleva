import type {
  ForumUser,
  ForumTopic,
  ForumReply,
  ForumRepository,
} from "../types/forum";
import type { DemoStorage } from "./demoRepository";
const KEY = "eleva:forum:v1";
const storage: DemoStorage = {
  async getItem(key) {
    return (
      await import("@react-native-async-storage/async-storage")
    ).default.getItem(key);
  },
  async setItem(key, value) {
    await (
      await import("@react-native-async-storage/async-storage")
    ).default.setItem(key, value);
  },
};
interface State {
  topics: ForumTopic[];
  replies: ForumReply[];
  reports: { user_id: string; kind: string; id: string }[];
}
export function forumText(value: string, max: number, label: string) {
  const text = value.trim();
  if (!text || text.length > max)
    throw new Error(`${label}: escreva entre 1 e ${max} caracteres.`);
  return text;
}
export function createDemoForum(
  user: ForumUser,
  store: DemoStorage = storage,
): ForumRepository {
  const load = async (): Promise<State> => {
    const raw = await store.getItem(KEY);
    return raw ? JSON.parse(raw) : { topics: [], replies: [], reports: [] };
  };
  const save = (s: State) => store.setItem(KEY, JSON.stringify(s));
  const identity = () => ({
    id: `forum-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    author_id: user.id,
    author_name: user.full_name,
    deleted: false,
    created_at: new Date().toISOString(),
  });
  return {
    async listTopics() {
      return (await load()).topics.sort((a, b) =>
        b.created_at.localeCompare(a.created_at),
      );
    },
    async listReplies(topicId) {
      return (await load()).replies.filter((r) => r.topic_id === topicId);
    },
    async createTopic(title, body) {
      const topic = {
        ...identity(),
        title: forumText(title, 120, "Título"),
        body: forumText(body, 3000, "Mensagem"),
      };
      const s = await load();
      s.topics.push(topic);
      await save(s);
      return topic;
    },
    async reply(topicId, body) {
      const s = await load();
      if (!s.topics.some((t) => t.id === topicId && !t.deleted))
        throw new Error("Esta conversa foi encerrada.");
      const r = {
        ...identity(),
        topic_id: topicId,
        body: forumText(body, 3000, "Resposta"),
      };
      s.replies.push(r);
      await save(s);
      return r;
    },
    async remove(kind, id) {
      const s = await load();
      const item = (kind === "topic" ? s.topics : s.replies).find(
        (p) => p.id === id,
      );
      if (!item) throw new Error("Mensagem não encontrada.");
      if (item.author_id !== user.id && user.role !== "admin")
        throw new Error("Você só pode remover suas próprias mensagens.");
      item.deleted = true;
      item.body = "";
      if ("title" in item) item.title = "Conversa removida";
      await save(s);
    },
    async report(kind, id) {
      const s = await load();
      if (
        !(kind === "topic" ? s.topics : s.replies).some(
          (p) => p.id === id && !p.deleted,
        )
      )
        throw new Error("Mensagem não encontrada.");
      if (
        !s.reports.some(
          (r) => r.user_id === user.id && r.kind === kind && r.id === id,
        )
      )
        s.reports.push({ user_id: user.id, kind, id });
      await save(s);
    },
  };
}
export function createForumRepository(options: {
  demo: boolean;
  user: ForumUser;
}): ForumRepository {
  if (options.demo) return createDemoForum(options.user);
  const client = async () => {
    const { supabase } = await import("./supabase");
    if (!supabase) throw new Error("A comunidade ainda não está conectada.");
    return supabase;
  };
  const uid = async () => {
    const c = await client();
    const { data, error } = await c.auth.getUser();
    if (error || !data.user)
      throw new Error("Entre na sua conta para participar.");
    return data.user.id;
  };
  const list = async <T>(table: string, topicId?: string) => {
    const c = await client();
    let query = c
      .from(table)
      .select("*")
      .order("created_at", { ascending: table === "forum_replies" });
    if (topicId) query = query.eq("topic_id", topicId);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as T[];
  };
  return {
    listTopics: () => list<ForumTopic>("forum_topics"),
    listReplies: (id) => list<ForumReply>("forum_replies", id),
    async createTopic(title, body) {
      const c = await client();
      const { data, error } = await c
        .from("forum_topics")
        .insert({
          author_id: await uid(),
          title: forumText(title, 120, "Título"),
          body: forumText(body, 3000, "Mensagem"),
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as ForumTopic;
    },
    async reply(topicId, body) {
      const c = await client();
      const { data, error } = await c
        .from("forum_replies")
        .insert({
          author_id: await uid(),
          topic_id: topicId,
          body: forumText(body, 3000, "Resposta"),
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as ForumReply;
    },
    async remove(kind, id) {
      const c = await client();
      const { data, error } = await c
        .from(kind === "topic" ? "forum_topics" : "forum_replies")
        .update({
          deleted: true,
          body: "",
          ...(kind === "topic" ? { title: "Conversa removida" } : {}),
        })
        .eq("id", id)
        .select("id");
      if (error) throw error;
      if (!data?.length)
        throw new Error("Você não pode remover esta mensagem.");
    },
    async report(kind, id) {
      const c = await client();
      const { error } = await c
        .from("forum_reports")
        .upsert(
          {
            reporter_id: await uid(),
            ...(kind === "topic" ? { topic_id: id } : { reply_id: id }),
          },
          { ignoreDuplicates: true },
        );
      if (error && error.code !== "23505") throw error;
    },
  };
}

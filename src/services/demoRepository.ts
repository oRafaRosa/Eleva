import { decodeCover } from "./coverValidation";
import { validateChallengeDraft } from "./challengeValidation";
export interface DemoStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}
const nativeStorage: DemoStorage = {
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
import type {
  Publication,
  PublicationDraft,
  ElevaEvent,
  Challenge,
  ChallengeStep,
  Profile,
} from "../types/domain";
import { validateProfileUpdate } from "./profileValidation";
import type { Activity, ElevaRepository } from "./repository";

const STORAGE_KEY = "eleva:demo:v1";
const today = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
const now = new Date().toISOString();
const base = {
  cover_path: null,
  media_url: null,
  scheduled_at: null,
  published_at: now,
  created_by: null,
  created_at: now,
  updated_at: now,
  status: "published" as const,
  details: {},
  reference_date: null,
};
const seed: Publication[] = [
  {
    ...base,
    id: "demo-devotional",
    type: "devotional",
    pillar: "spirit",
    title: "Um dia de cada vez",
    summary: "Uma pausa para lembrar que você não precisa resolver tudo hoje.",
    reference_date: today(),
    body: "“Não se preocupem com o amanhã.”\nMateus 6:34\n\nHá dias em que a cabeça já acorda no dia seguinte. A lista de tarefas cresce, as preocupações se misturam e o presente passa sem que a gente perceba.\n\nJesus nos convida a olhar para o dia que está diante de nós. Isso não dispensa planejamento, mas nos ajuda a reconhecer nossos limites.\n\nHoje, escolha uma coisa que está ao seu alcance. Faça com atenção. O que ainda não pode ser resolvido pode esperar.\n\nPara refletir\nQual preocupação você pode colocar em oração hoje?\n\nOração\nDeus, me ajuda a cuidar do que é possível hoje e a confiar em ti no que ainda não sei resolver. Amém.",
    details: { verse: "Mateus 6:34", duration_minutes: 4 },
  },
  {
    ...base,
    id: "demo-training",
    type: "training",
    pillar: "body",
    title: "Mobilidade para começar o dia",
    summary: "Uma sequência leve, sem equipamentos, para fazer em casa.",
    body: "Separe um espaço confortável e faça os movimentos sem pressa.\n\n1. Círculos de ombros: 30 segundos em cada sentido.\n2. Mobilidade de coluna em quatro apoios: 8 repetições.\n3. Rotação de tronco: 6 repetições por lado.\n4. Mobilidade de tornozelos: 8 repetições por lado.\n\nRespeite sua amplitude e interrompa se sentir dor.",
    details: {
      duration_minutes: 12,
      level: "Iniciante",
      equipment: "Sem equipamentos",
    },
  },
  {
    ...base,
    id: "demo-motivation",
    type: "motivation",
    pillar: "mind",
    title: "Cabe uma pausa",
    summary: "Você pode descansar antes de chegar ao seu limite.",
    body: "Talvez hoje não caiba tudo na sua agenda. Veja o que realmente precisa acontecer e reserve alguns minutos para você. Um café sem o celular, uma caminhada curta ou uma conversa podem fazer parte do dia.",
    details: { duration_minutes: 2 },
  },
  {
    ...base,
    id: "demo-lesson",
    type: "lesson",
    pillar: "mind",
    title: "Uma rotina que cabe na sua semana",
    summary:
      "Como escolher poucos compromissos e abrir espaço para o que importa.",
    body: "Comece olhando para a semana como ela é. Considere trabalho, deslocamento, cuidados com a casa e descanso. Depois escolha uma atividade de cuidado que você consegue repetir.\n\nAnote um horário possível e tenha uma alternativa para os dias mais corridos.",
    details: { duration_minutes: 18 },
  },
  {
    ...base,
    id: "demo-post",
    type: "post",
    pillar: "body",
    title: "O que levar para nosso encontro",
    summary: "Uma lista curta para aproveitar a manhã com conforto.",
    body: "Leve uma garrafa de água, uma toalha pequena e roupas confortáveis. Se quiser, coloque uma troca de camiseta na bolsa.\n\nOs detalhes de horário e endereço ficam na página do encontro. Se surgir alguma dúvida, fale com a equipe.",
    details: {},
  },
];
const events: ElevaEvent[] = [
  {
    id: "demo-event",
    title: "Uma manhã com a ELEVA",
    description: "Movimento, café da manhã e conversa entre as integrantes.",
    location: "São Paulo · endereço a confirmar",
    starts_at: "2026-11-07T12:00:00Z",
    ends_at: "2026-11-07T15:00:00Z",
    capacity: 24,
    status: "published",
  },
];
const challenges: Challenge[] = [
  {
    id: "demo-challenge",
    title: "Sete dias de cuidado",
    description: "Uma atividade simples por dia. Adapte ao seu ritmo.",
    starts_on: "2026-10-13",
    ends_on: "2026-11-30",
    status: "published",
  },
];
const steps: ChallengeStep[] = [
  "Separe cinco minutos para uma pausa",
  "Faça uma caminhada curta",
  "Leia o devocional do dia",
  "Experimente a sequência de mobilidade",
  "Converse com alguém querido",
  "Reserve um horário para descansar",
  "Veja o que você quer repetir na próxima semana",
].map((title, index) => ({
  id: `demo-step-${index + 1}`,
  challenge_id: "demo-challenge",
  position: index + 1,
  title,
}));
export type DemoAccount = "marina" | "rebeca";
export const DEMO_SESSION_KEY = "eleva:demo-session:v1";
export async function readDemoSession(
  storage: DemoStorage = nativeStorage,
): Promise<DemoAccount | null> {
  const value = await storage.getItem(DEMO_SESSION_KEY);
  return value === "marina" || value === "rebeca" ? value : null;
}
export async function saveDemoSession(
  account: DemoAccount | null,
  storage: DemoStorage = nativeStorage,
): Promise<void> {
  await storage.setItem(DEMO_SESSION_KEY, account ?? "");
}
interface DemoState {
  memberNameVersion?: number;
  challenges?: Challenge[];
  publications: Publication[];
  profiles?: Partial<Record<DemoAccount, Profile>>;
  activities: Partial<Record<DemoAccount, Activity>>;
  activity?: Activity;
}
const emptyActivity = (): Activity => ({
  favoriteIds: [],
  completionIds: [],
  eventIds: [],
  stepIds: [],
});
export function createDemoRepository(
  account: DemoAccount | "member" | "admin" | null = "member",
  storage: DemoStorage = nativeStorage,
): ElevaRepository {
  const selected =
    account === "admin" ? "rebeca" : account === "member" ? "marina" : account;
  const role = selected === "rebeca" ? "admin" : "member";
  const requireAccount = () => {
    if (!selected) throw new Error("Escolha um acesso para entrar.");
    return selected;
  };
  let state: DemoState | undefined;
  const load = async () => {
    {
      const raw = await storage.getItem(STORAGE_KEY);
      try {
        state = raw ? JSON.parse(raw) : undefined;
      } catch {
        state = undefined;
      }
      if (
        !state ||
        !Array.isArray(state.publications) ||
        (!state.activities && !state.activity)
      )
        state = {
          publications: JSON.parse(JSON.stringify(seed)),
          activities: {},
        };
    }
    // Limpa apenas notas antigas dos conteúdos de apresentação, sem reescrever publicações próprias.
    state!.publications = state!.publications.map((item) => {
      if (!["demo-training", "demo-lesson"].includes(item.id)) return item;
      return {
        ...item,
        body: item.body
          .replace(
            " Esta é uma sequência demonstrativa. Os treinos do clube serão revisados por uma profissional.",
            "",
          )
          .replace(
            "\n\nConteúdo de demonstração. A aula em vídeo será incluída pela equipe.",
            "",
          ),
      };
    });
    if (!Array.isArray(state!.challenges))
      state!.challenges = JSON.parse(JSON.stringify(challenges));
    if (!state!.memberNameVersion) {
      const profile = state!.profiles?.marina;
      if (profile?.full_name === "Marina") profile.full_name = "Jeice";
      state!.memberNameVersion = 2;
    }
    // A chave interna permanece estável para preservar as atividades da integrante.
    if (!state!.activities)
      state!.activities = { marina: state!.activity ?? emptyActivity() };
    delete state!.activity;
    if (selected && !state!.activities[selected])
      state!.activities[selected] = emptyActivity();
    return state!;
  };
  const persist = async () => {
    await storage.setItem(STORAGE_KEY, JSON.stringify(state));
  };
  const admin = () => {
    requireAccount();
    if (role !== "admin")
      throw new Error("Esta ação é exclusiva da administração.");
  };
  const toggle = async (key: keyof Activity, id: string, enabled: boolean) => {
    const s = await load();
    const activity = s.activities[requireAccount()]!;
    activity[key] = activity[key].filter((x) => x !== id);
    if (enabled) activity[key].push(id);
    await persist();
  };
  return {
    async listPublications() {
      requireAccount();
      return (await load()).publications
        .filter((p) => role === "admin" || p.status === "published")
        .map((p) => ({ ...p }));
    },
    async getPublication(id) {
      return (await this.listPublications()).find((p) => p.id === id) ?? null;
    },
    async savePublication(draft: PublicationDraft) {
      admin();
      if (!draft.title.trim()) throw new Error("Preencha o título.");
      if (draft.type === "devotional" && !draft.reference_date)
        throw new Error("Escolha a data do devocional.");
      if (draft.status === "scheduled" && !draft.scheduled_at)
        throw new Error("Escolha quando publicar.");
      const { cover_upload, ...fields } = draft;
      if (cover_upload) decodeCover(cover_upload);
      const s = await load();
      const existing = s.publications.find((p) => p.id === draft.id);
      const p: Publication = {
        ...base,
        ...existing,
        ...fields,
        ...(cover_upload
          ? { cover_path: `data:image/jpeg;base64,${cover_upload.base64}` }
          : {}),
        id:
          draft.id ??
          `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        updated_at: new Date().toISOString(),
        published_at:
          draft.status === "published"
            ? (existing?.published_at ?? new Date().toISOString())
            : null,
      };
      if (
        p.type === "devotional" &&
        ["scheduled", "published"].includes(p.status) &&
        s.publications.some(
          (x) =>
            x.id !== p.id &&
            x.type === "devotional" &&
            x.reference_date === p.reference_date &&
            ["scheduled", "published"].includes(x.status),
        )
      )
        throw new Error("Já há um devocional para essa data.");
      s.publications = s.publications.filter((x) => x.id !== p.id);
      s.publications.unshift(p);
      await persist();
      return p;
    },
    async archivePublication(id) {
      admin();
      const s = await load();
      const p = s.publications.find((x) => x.id === id);
      if (p) {
        p.status = "archived";
        p.published_at = null;
        p.updated_at = new Date().toISOString();
        await persist();
      }
    },
    async listEvents() {
      requireAccount();
      return events;
    },
    async listChallenges() {
      requireAccount();
      return (await load())
        .challenges!.filter(
          (challenge) => role === "admin" || challenge.status === "published",
        )
        .map((challenge) => ({ ...challenge }));
    },
    async saveChallenge(draft) {
      admin();
      const safe = validateChallengeDraft(draft),
        s = await load();
      if (
        safe.id &&
        !s.challenges!.some((challenge) => challenge.id === safe.id)
      )
        throw new Error("Desafio não encontrado.");
      const challenge: Challenge = {
        ...safe,
        id:
          safe.id ??
          `demo-challenge-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      };
      s.challenges = s.challenges!.filter((item) => item.id !== challenge.id);
      s.challenges.unshift(challenge);
      await persist();
      return challenge;
    },
    async listChallengeSteps(id) {
      requireAccount();
      return steps.filter((x) => x.challenge_id === id);
    },
    async getActivity() {
      return JSON.parse(
        JSON.stringify((await load()).activities[requireAccount()]),
      );
    },
    setFavorite: (id, value) => toggle("favoriteIds", id, value),
    setCompletion: (id, value) => toggle("completionIds", id, value),
    registerEvent: (id) => toggle("eventIds", id, true),
    cancelRegistration: (id) => toggle("eventIds", id, false),
    setChallengeStep: (id, value) => toggle("stepIds", id, value),
    async getProfile() {
      if (!selected) return null;
      const state = await load();
      return (
        state.profiles?.[selected] ?? {
          id: `demo-${selected}`,
          full_name: selected === "rebeca" ? "Rebeca" : "Jeice",
          avatar_path: null,
          phone: null,
          city: null,
        }
      );
    },
    async updateProfile(update) {
      const account = requireAccount();
      const safe = validateProfileUpdate(update);
      const profile = (await this.getProfile())!;
      const state = await load();
      const avatar =
        safe.avatar_base64 === undefined
          ? profile.avatar_path
          : safe.avatar_base64 === null
            ? null
            : `data:image/jpeg;base64,${safe.avatar_base64}`;
      const updated: Profile = {
        id: profile.id,
        full_name: safe.full_name,
        phone: safe.phone,
        whatsapp_public:
          safe.whatsapp_public ?? profile.whatsapp_public ?? false,
        created_at: profile.created_at,
        city: safe.city,
        avatar_path: avatar,
        avatar_url: avatar,
      };
      state.profiles = { ...state.profiles, [account]: updated };
      await persist();
      return updated;
    },
    async getAccess() {
      return selected ? { role, active: true } : null;
    },
  };
}

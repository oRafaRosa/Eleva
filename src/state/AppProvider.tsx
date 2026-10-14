import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { View, Text, Pressable } from "react-native";
import { getRepository, isBackendConfigured, supabase } from "../services";
import type { ElevaRepository } from "../services/repository";
import type {
  Profile,
  ProfileUpdate,
  Publication,
  ElevaEvent,
  Challenge,
  ChallengeStep,
} from "../types/domain";
import {
  createDemoRepository,
  readDemoSession,
  saveDemoSession,
  type DemoAccount,
} from "../services/demoRepository";
import { colors, fonts } from "../theme";
type User = Profile & { role: "member" | "admin" };
interface Context {
  repository: ElevaRepository;
  publications: Publication[];
  events: ElevaEvent[];
  challenges: Challenge[];
  challengeSteps: ChallengeStep[];
  favorites: string[];
  completions: string[];
  registrations: string[];
  stepCompletions: string[];
  user: User | null;
  isDemo: boolean;
  loading: boolean;
  error: string;
  notice: string;
  refresh: () => Promise<void>;
  enterDemo: (account: DemoAccount) => Promise<void>;
  sessionReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (update: ProfileUpdate) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  toggleCompletion: (id: string) => Promise<void>;
  registerEvent: (id: string) => Promise<void>;
  cancelRegistration: (id: string) => Promise<void>;
  toggleStep: (id: string) => Promise<void>;
}
const ElevaContext = createContext<Context | null>(null);
export function ElevaProvider({ children }: { children: React.ReactNode }) {
  const [isDemo, setDemo] = useState(!isBackendConfigured);
  const [demoAccount, setDemoAccount] = useState<DemoAccount | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const repository = useMemo(
    () => (isDemo ? createDemoRepository(demoAccount) : getRepository()),
    [isDemo, demoAccount],
  );
  const [publications, setPublications] = useState<Publication[]>([]);
  const [events, setEvents] = useState<ElevaEvent[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challengeSteps, setSteps] = useState<ChallengeStep[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [completions, setCompletions] = useState<string[]>([]);
  const [registrations, setRegistrations] = useState<string[]>([]);
  const [stepCompletions, setStepCompletions] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const refreshVersion = useRef(0);
  const actionPending = useRef(false);
  function clearPrivate() {
    setUser(null);
    setPublications([]);
    setEvents([]);
    setChallenges([]);
    setSteps([]);
    setFavorites([]);
    setCompletions([]);
    setRegistrations([]);
    setStepCompletions([]);
  }
  async function refresh() {
    const version = ++refreshVersion.current;
    setLoading(true);
    setError("");
    if (isDemo && !demoAccount) {
      clearPrivate();
      setLoading(false);
      return;
    }
    try {
      const [p, e, c, profile, access] = await Promise.all([
        repository.listPublications(),
        repository.listEvents(),
        repository.listChallenges(),
        repository.getProfile(),
        repository.getAccess(),
      ]);
      if (version !== refreshVersion.current) return;
      if (profile && (!access || !access.active)) {
        clearPrivate();
        throw new Error(
          "Seu acesso ainda não está ativo. Fale com a equipe ELEVA.",
        );
      }
      setPublications(p.filter((p) => p.status === "published"));
      setEvents(e.filter((e) => e.status === "published"));
      setChallenges(c.filter((c) => c.status === "published"));
      const steps = (
        await Promise.all(
          c
            .filter((c) => c.status === "published")
            .map((c) => repository.listChallengeSteps(c.id)),
        )
      ).flat();
      if (version !== refreshVersion.current) return;
      setSteps(steps);
      setUser(profile && access ? { ...profile, role: access.role } : null);
      if (profile) {
        const a = await repository.getActivity();
        if (version !== refreshVersion.current) return;
        setFavorites(a.favoriteIds);
        setCompletions(a.completionIds);
        setRegistrations(a.eventIds);
        setStepCompletions(a.stepIds);
      } else {
        setFavorites([]);
        setCompletions([]);
        setRegistrations([]);
        setStepCompletions([]);
      }
    } catch (e) {
      if (version === refreshVersion.current) {
        clearPrivate();
        setError(
          e instanceof Error
            ? e.message
            : "Não foi possível carregar. Tente novamente.",
        );
      }
    } finally {
      if (version === refreshVersion.current) setLoading(false);
    }
  }
  useEffect(() => {
    let alive = true;
    readDemoSession()
      .then((account) => {
        if (!alive) return;
        if (account) {
          setDemoAccount(account);
          setDemo(true);
        }
        setSessionReady(true);
      })
      .catch(() => {
        if (alive) setSessionReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    if (!sessionReady) return;
    clearPrivate();
    void refresh();
    return () => {
      refreshVersion.current++;
    };
  }, [repository, sessionReady]);
  useEffect(() => {
    if (!supabase || isDemo) return;
    let alive = true;
    const { data } = supabase.auth.onAuthStateChange(() => {
      if (!alive) return;
      refreshVersion.current++;
      clearPrivate();
      setTimeout(() => {
        if (alive) void refresh();
      }, 0);
    });
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, [repository, isDemo]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(timer);
  }, [notice]);
  async function action(work: () => Promise<void>, message: string) {
    if (!user) {
      setNotice("Entre na sua conta para continuar.");
      return;
    }
    if (actionPending.current) return;
    actionPending.current = true;
    try {
      await work();
      await refresh();
      setNotice(message);
    } catch (e) {
      setNotice(
        e instanceof Error
          ? e.message
          : "Não foi possível salvar. Tente novamente.",
      );
    } finally {
      actionPending.current = false;
    }
  }
  const value: Context = {
    repository,
    publications,
    events,
    challenges,
    challengeSteps,
    favorites,
    completions,
    registrations,
    stepCompletions,
    user,
    isDemo,
    loading,
    error,
    notice,
    refresh,
    sessionReady,
    async enterDemo(account) {
      await saveDemoSession(account);
      refreshVersion.current++;
      clearPrivate();
      setLoading(true);
      if (isDemo && demoAccount === account) {
        await refresh();
      } else {
        setDemoAccount(account);
        setDemo(true);
      }
    },
    async login(email, password) {
      if (!supabase)
        throw new Error(
          "Para esta apresentação, escolham um dos acessos abaixo.",
        );
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error)
        throw new Error("Confira o e-mail e a senha e tente novamente.");
      await saveDemoSession(null);
      setDemoAccount(null);
      setDemo(false);
    },
    async logout() {
      if (!isDemo && supabase) await supabase.auth.signOut();
      refreshVersion.current++;
      clearPrivate();
      await saveDemoSession(null);
      setDemoAccount(null);
      setNotice("");
      setLoading(false);
    },
    async updateProfile(update) {
      if (!user) throw new Error("Entre na sua conta para continuar.");
      const currentUser = user;
      const version = refreshVersion.current;
      const updated = await repository.updateProfile(update);
      if (version !== refreshVersion.current) return;
      setUser((existing) =>
        existing?.id === currentUser.id
          ? { ...updated, role: currentUser.role }
          : existing,
      );
      setNotice("Perfil salvo.");
    },
    toggleFavorite(id) {
      return action(
        () => repository.setFavorite(id, !favorites.includes(id)),
        favorites.includes(id) ? "Removido dos favoritos." : "Conteúdo salvo.",
      );
    },
    toggleCompletion(id) {
      return action(
        () => repository.setCompletion(id, !completions.includes(id)),
        completions.includes(id)
          ? "Marcação desfeita."
          : "Conteúdo marcado como concluído.",
      );
    },
    registerEvent(id) {
      return action(
        () => repository.registerEvent(id),
        isDemo ? "Participação marcada na prévia." : "Inscrição confirmada.",
      );
    },
    cancelRegistration(id) {
      return action(
        () => repository.cancelRegistration(id),
        "Inscrição cancelada.",
      );
    },
    toggleStep(id) {
      return action(
        () => repository.setChallengeStep(id, !stepCompletions.includes(id)),
        "Atividade atualizada.",
      );
    },
  };
  return (
    <ElevaContext.Provider value={value}>
      <View style={{ flex: 1 }}>
        {children}
        {notice && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar aviso"
            onPress={() => setNotice("")}
            style={{
              position: "absolute",
              bottom: 88,
              left: 24,
              right: 24,
              maxWidth: 640,
              alignSelf: "center",
              padding: 16,
              backgroundColor: colors.burgundy,
              borderRadius: 4,
            }}
          >
            <Text
              accessibilityLiveRegion="polite"
              style={{
                fontFamily: fonts.sans,
                color: colors.white,
                fontSize: 16,
              }}
            >
              {notice}
            </Text>
          </Pressable>
        )}
      </View>
    </ElevaContext.Provider>
  );
}
export const AppProvider = ElevaProvider;
export function useEleva() {
  const context = useContext(ElevaContext);
  if (!context) throw new Error("ElevaProvider ausente");
  return context;
}

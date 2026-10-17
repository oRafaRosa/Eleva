import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { View, Text, Pressable, AppState, Platform } from "react-native";
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
import { authError } from "../services/authValidation";
import { colors, fonts } from "../theme";
import {
  verifyMember,
  loadMemberContent,
  saveThenRefresh,
  refreshFailureDisposition,
  invalidAuthSession,
  authEventDecision,
  StaleSessionError,
  SessionGateError,
  type AuthStatus,
} from "../services/memberLoading";
type User = Profile & {
  role: "member" | "admin";
  plan?: "free" | "pro";
  banned?: boolean;
};
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
  actionBusy: boolean;
  authStatus: AuthStatus;
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
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const [actionBusy, setActionBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const refreshVersion = useRef(0);
  const actionPending = useRef(false);
  const sessionEpoch = useRef(0);
  const subjectRef = useRef<string | null>(null);
  const userRef = useRef<User | null>(null);
  function applyUser(next: User | null) {
    userRef.current = next;
    setUser(next);
  }
  function invalidateIdentity() {
    sessionEpoch.current++;
    subjectRef.current = null;
    clearPrivate();
  }
  function clearPrivate() {
    applyUser(null);
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
    let epoch = sessionEpoch.current;
    const assertCurrent = () => {
      if (version !== refreshVersion.current || epoch !== sessionEpoch.current)
        throw new StaleSessionError();
    };
    setLoading(true);
    setError("");
    if (!userRef.current) setAuthStatus("checking");
    if (isDemo && !demoAccount) {
      clearPrivate();
      setAuthStatus("signed_out");
      setLoading(false);
      return;
    }
    try {
      const verified = await verifyMember({
        readIdentity: async () => {
          if (isDemo) return demoAccount ? `demo-${demoAccount}` : null;
          if (!supabase) return null;
          const { data, error } = await supabase.auth.getUser();
          if (error) throw error;
          return data.user?.id ?? null;
        },
        getAccess: () => repository.getAccess(),
        getProfile: () => repository.getProfile(),
        assertCurrent,
        onSubject(id) {
          if (subjectRef.current && subjectRef.current !== id) {
            invalidateIdentity();
            epoch = sessionEpoch.current;
          }
          subjectRef.current = id;
          if (userRef.current && userRef.current.id !== id) clearPrivate();
        },
        onAccess(access, id) {
          if (userRef.current?.id === id)
            applyUser({
              ...userRef.current,
              role: access.role,
              plan: access.active ? "pro" : "free",
              banned: Boolean(access.banned),
            });
        },
      });
      assertCurrent();
      applyUser(verified);
      setAuthStatus("verified");
      if (verified.banned || verified.plan === "free") {
        setPublications([]);
        setEvents([]);
        setChallenges([]);
        setSteps([]);
        setFavorites([]);
        setCompletions([]);
        setRegistrations([]);
        setStepCompletions([]);
        return;
      }
      const loaded = await loadMemberContent(repository);
      assertCurrent();
      setPublications(loaded.publications);
      setEvents(loaded.events);
      setChallenges(loaded.challenges);
      setSteps(loaded.challengeSteps);
      setFavorites(loaded.activity.favoriteIds);
      setCompletions(loaded.activity.completionIds);
      setRegistrations(loaded.activity.eventIds);
      setStepCompletions(loaded.activity.stepIds);
    } catch (e) {
      if (e instanceof StaleSessionError) throw e;
      assertCurrent();
      const disposition = refreshFailureDisposition(
        e,
        userRef.current,
        subjectRef.current,
      );
      if (disposition.clear) clearPrivate();
      setAuthStatus(disposition.status);
      setError(
        e instanceof SessionGateError
          ? e.message
          : "Não foi possível atualizar os conteúdos. Tente novamente.",
      );
      throw e;
    } finally {
      if (version === refreshVersion.current && epoch === sessionEpoch.current)
        setLoading(false);
    }
  }
  useEffect(() => {
    let alive = true;
    readDemoSession()
      .then((account) => {
        if (!alive) return;
        if (account && !isBackendConfigured) {
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
    invalidateIdentity();
    void refresh().catch(() => {});
    return () => {
      refreshVersion.current++;
    };
  }, [repository, sessionReady]);
  useEffect(() => {
    if (!supabase || isDemo) return;
    let alive = true;
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!alive) return;
      const nextId = session?.user.id ?? null;
      const decision = authEventDecision(event, nextId, subjectRef.current);
      if (decision.signedOut) {
        refreshVersion.current++;
        invalidateIdentity();
        setAuthStatus("signed_out");
        setError("");
        setLoading(false);
        return;
      }
      if (decision.clear) {
        refreshVersion.current++;
        invalidateIdentity();
        subjectRef.current = nextId;
        setAuthStatus("checking");
        setLoading(true);
      }
      // TOKEN_REFRESHED for the same account keeps the screen while access is rechecked.
      setTimeout(() => {
        if (alive) void refresh().catch(() => {});
      }, 0);
    });
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, [repository, isDemo]);
  useEffect(() => {
    if (isDemo || !sessionReady) return;
    const recheck = () => {
      void refresh().catch(() => {});
    };
    const listener = AppState.addEventListener("change", (state) => {
      if (state === "active") recheck();
    });
    const timer = setInterval(() => {
      if (subjectRef.current && AppState.currentState === "active") recheck();
    }, 60000);
    if (Platform.OS === "web") window.addEventListener("focus", recheck);
    return () => {
      listener.remove();
      clearInterval(timer);
      if (Platform.OS === "web") window.removeEventListener("focus", recheck);
    };
  }, [repository, isDemo, sessionReady]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(timer);
  }, [notice]);
  async function action(work: () => Promise<void>, message: string) {
    if (!userRef.current) {
      const e = new Error("Entre na sua conta para continuar.");
      setNotice(e.message);
      throw e;
    }
    if (actionPending.current) {
      const e = new Error("Aguarde a ação em andamento terminar.");
      setNotice(e.message);
      throw e;
    }
    const epoch = sessionEpoch.current;
    actionPending.current = true;
    setActionBusy(true);
    const assertSame = () => {
      if (epoch !== sessionEpoch.current) throw new StaleSessionError();
    };
    try {
      await saveThenRefresh(
        async () => {
          await work();
          assertSame();
        },
        async () => {
          assertSame();
          await refresh();
          assertSame();
        },
      );
      setNotice(message);
    } catch (e) {
      if (epoch === sessionEpoch.current && invalidAuthSession(e)) {
        invalidateIdentity();
        setAuthStatus("signed_out");
      }
      if (epoch === sessionEpoch.current)
        setNotice(
          e instanceof Error
            ? e.message
            : "Não foi possível salvar. Tente novamente.",
        );
      throw e;
    } finally {
      actionPending.current = false;
      setActionBusy(false);
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
    actionBusy,
    authStatus,
    error,
    notice,
    refresh,
    sessionReady,
    async enterDemo(account) {
      if (isBackendConfigured)
        throw new Error("Use seu e-mail e senha para entrar.");
      await saveDemoSession(account);
      refreshVersion.current++;
      invalidateIdentity();
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
        throw new Error(
          error.code === "invalid_credentials"
            ? "Confira o e-mail e a senha e tente novamente."
            : authError(error),
        );
      await saveDemoSession(null);
      setDemoAccount(null);
      setDemo(false);
    },
    async logout() {
      if (!isDemo && supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      refreshVersion.current++;
      invalidateIdentity();
      setAuthStatus("signed_out");
      await saveDemoSession(null);
      setDemoAccount(null);
      setNotice("");
      setLoading(false);
    },
    async updateProfile(update) {
      if (!userRef.current)
        throw new Error("Entre na sua conta para continuar.");
      if (actionPending.current)
        throw new Error("Aguarde a ação em andamento terminar.");
      const currentUser = userRef.current,
        epoch = sessionEpoch.current;
      actionPending.current = true;
      setActionBusy(true);
      try {
        const updated = await repository.updateProfile(update);
        if (
          epoch !== sessionEpoch.current ||
          userRef.current?.id !== currentUser.id
        )
          throw new StaleSessionError();
        applyUser({ ...userRef.current, ...updated });
        setNotice("Perfil salvo.");
      } catch (e) {
        if (epoch === sessionEpoch.current && invalidAuthSession(e)) {
          invalidateIdentity();
          setAuthStatus("signed_out");
        }
        if (epoch === sessionEpoch.current)
          setNotice(
            e instanceof Error
              ? e.message
              : "Não foi possível salvar o perfil. Tente novamente.",
          );
        throw e;
      } finally {
        actionPending.current = false;
        setActionBusy(false);
      }
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

import { View } from "react-native";
import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, Redirect } from "expo-router";
import {
  Page,
  Body,
  Title,
  Button,
  Empty,
  Loading,
  s,
  ErrorState,
} from "../../src/components/ui";
import { useEleva } from "../../src/state/AppProvider";
import { SavedRefreshError } from "../../src/services/memberLoading";
export default function Event() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    user,
    sessionReady,
    events,
    registrations,
    registerEvent,
    cancelRegistration,
    isDemo,
    loading,
    actionBusy,
    authStatus,
    error,
    refresh,
  } = useEleva();
  const [pending, setPending] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [actionError, setActionError] = useState("");
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [committed, setCommitted] = useState<boolean | null>(null);
  const lock = useRef(false);
  const active = useRef(true);
  const subject = useRef(user?.id);
  subject.current = user?.id;
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const serverRegistered = registrations.includes(id);
  const registered = committed ?? serverRegistered;
  useEffect(() => {
    if (committed !== null && serverRegistered === committed) {
      setCommitted(null);
      setNeedsRefresh(false);
    }
  }, [serverRegistered, committed]);
  async function participate(next: boolean) {
    if (lock.current || actionBusy || !user) return;
    lock.current = true;
    setPending(true);
    setActionError("");
    const actor = user.id;
    try {
      await (next ? registerEvent(id) : cancelRegistration(id));
      if (active.current && subject.current === actor) setConfirm(false);
    } catch (e) {
      if (active.current && subject.current === actor) {
        if (e instanceof SavedRefreshError) {
          setCommitted(next);
          setNeedsRefresh(true);
          setConfirm(false);
        }
        setActionError(
          e instanceof Error
            ? e.message
            : "Não foi possível atualizar sua participação. Tente novamente.",
        );
      }
    } finally {
      lock.current = false;
      if (active.current && subject.current === actor) setPending(false);
    }
  }
  if (!sessionReady || (loading && !user))
    return (
      <Page layout="reading" back>
        <Loading />
      </Page>
    );
  if (!user && error && (authStatus === "unknown" || authStatus === "verified"))
    return (
      <Page back title="Encontro">
        <ErrorState text={error} onRetry={refresh} />
      </Page>
    );
  if (!user) return <Redirect href="/login" />;
  const e = events.find((e) => e.id === id);
  if (loading && !e)
    return (
      <Page back>
        <Loading />
      </Page>
    );
  if (!e)
    return (
      <Page back title="Encontro indisponível">
        {error ? (
          <ErrorState text={error} onRetry={refresh} />
        ) : (
          <Empty text="Este encontro não está disponível." />
        )}
      </Page>
    );
  return (
    <Page back kicker="Encontro ELEVA" title={e.title}>
      {!!error && !actionError && <ErrorState text={error} onRetry={refresh} />}
      {!!actionError && (
        <ErrorState
          text={actionError}
          onRetry={async () => {
            await refresh();
            setActionError("");
            setNeedsRefresh(false);
            setCommitted(null);
          }}
        />
      )}
      <View style={[s.panel, { marginBottom: 28 }]}>
        <Body>
          {new Date(e.starts_at).toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            timeZone: "America/Sao_Paulo",
          })}
        </Body>
        <Body>
          {new Date(e.starts_at).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "America/Sao_Paulo",
          })}{" "}
          • Horário de Brasília
        </Body>
        <Body>{e.location}</Body>
        <Body muted>Capacidade: {e.capacity} participantes</Body>
      </View>
      <Body style={{ marginBottom: 28 }}>{e.description}</Body>
      {registered && (
        <Empty
          text={
            isDemo
              ? "Participação marcada na prévia."
              : "Sua inscrição está confirmada."
          }
        />
      )}
      {confirm ? (
        <View style={{ gap: 12 }}>
          <Body>Cancelar sua participação?</Body>
          <Button
            label="Manter participação"
            disabled={pending || actionBusy}
            onPress={() => setConfirm(false)}
          />
          <Button
            secondary
            busy={pending}
            disabled={actionBusy || needsRefresh}
            label={pending ? "Cancelando…" : "Confirmar cancelamento"}
            onPress={() => void participate(false)}
          />
        </View>
      ) : (
        <Button
          label={
            pending
              ? "Salvando…"
              : registered
                ? "Cancelar inscrição"
                : isDemo
                  ? "Quero participar"
                  : "Quero participar"
          }
          secondary={registered}
          busy={pending}
          disabled={actionBusy || needsRefresh}
          onPress={() =>
            registered ? setConfirm(true) : void participate(true)
          }
        />
      )}
    </Page>
  );
}

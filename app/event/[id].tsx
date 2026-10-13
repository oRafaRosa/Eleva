import { View } from "react-native";
import { useLocalSearchParams, Redirect } from "expo-router";
import {
  Page,
  Body,
  Title,
  Button,
  Empty,
  Loading,
  s,
} from "../../src/components/ui";
import { useEleva } from "../../src/state/AppProvider";
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
  } = useEleva();
  if (!sessionReady || (loading && !user))
    return (
      <Page back>
        <Loading />
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
        <Empty text="Este encontro não está disponível." />
      </Page>
    );
  const registered = registrations.includes(id);
  return (
    <Page back kicker="Encontro ELEVA" title={e.title}>
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
      <Button
        label={
          registered
            ? "Cancelar inscrição"
            : isDemo
              ? "Quero participar"
              : "Quero participar"
        }
        secondary={registered}
        onPress={() =>
          void (registered ? cancelRegistration(id) : registerEvent(id))
        }
      />
      {isDemo && (
        <Body muted style={{ fontSize: 14, marginTop: 15 }}>
          Sugestão de encontro para esta apresentação.
        </Body>
      )}
    </Page>
  );
}

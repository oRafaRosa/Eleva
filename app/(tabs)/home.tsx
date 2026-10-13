import { View, Pressable } from "react-native";
import { router } from "expo-router";
import {
  Page,
  Body,
  Title,
  Section,
  PublicationCard,
  s,
  Empty,
  Loading,
} from "../../src/components/ui";
import { useEleva } from "../../src/state/AppProvider";
import { colors } from "../../src/theme";
import { dailyDevotional } from "../../src/utils/editorialDay";
export default function Home() {
  const { publications, events, user, loading, isDemo, error } = useEleva();
  const devotional = dailyDevotional(publications);
  return (
    <Page
      kicker={
        isDemo
          ? "Prévia da plataforma. Conteúdos e atividades de exemplo."
          : "Seu espaço na ELEVA"
      }
      title={
        user?.full_name
          ? `Olá, ${user.full_name.split(" ")[0]}.`
          : "Que bom ter você aqui."
      }
    >
      {error && <Empty text={error} />}
      <Body muted style={{ marginBottom: 24 }}>
        Veja o que preparamos para hoje.
      </Body>
      {loading ? (
        <Loading />
      ) : devotional ? (
        <PublicationCard item={devotional} feature />
      ) : (
        <Empty text="O devocional de hoje ainda não foi publicado. Os anteriores estão em Aprender." />
      )}
      <Section
        title="Para a sua semana"
        action="Ver todos"
        onPress={() => router.push("/(tabs)/learn")}
      />
      {publications
        .filter((p) => p.id !== devotional?.id)
        .slice(0, 2)
        .map((p) => (
          <PublicationCard key={p.id} item={p} />
        ))}
      <Section title="Vamos nos encontrar?" />
      {events.slice(0, 1).map((e) => (
        <Pressable
          key={e.id}
          accessibilityRole="button"
          onPress={() => router.push(`/event/${e.id}`)}
          style={[s.panel, { backgroundColor: colors.pink }]}
        >
          <Body style={{ fontSize: 14 }}>
            {new Date(e.starts_at).toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "long",
              timeZone: "America/Sao_Paulo",
            })}
          </Body>
          <Title small>{e.title}</Title>
          <Body>{e.location}</Body>
          <Body style={{ color: colors.burgundy }}>Ver o encontro ↗</Body>
        </Pressable>
      ))}
    </Page>
  );
}

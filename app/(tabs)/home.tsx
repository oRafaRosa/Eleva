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
  ErrorState,
} from "../../src/components/ui";
import { useEleva } from "../../src/state/AppProvider";
import { colors, fonts } from "../../src/theme";
import { Illustration } from "../../src/components/Illustration";
import { MotionBlock } from "../../src/components/MotionBlock";
import { dailyDevotional } from "../../src/utils/editorialDay";
export default function Home() {
  const { publications, events, user, loading, error, refresh } = useEleva();
  const devotional = dailyDevotional(publications);
  return (
    <Page
      titleStyle={{ fontFamily: fonts.bold, fontSize: 34, lineHeight: 40 }}
      kicker="Seu espaço na ELEVA"
      title={
        user?.full_name
          ? `Olá, ${user.full_name.split(" ")[0]}.`
          : "Que bom ter você aqui."
      }
    >
      {!!error && <ErrorState text={error} onRetry={refresh} />}
      {loading ? (
        <Loading />
      ) : devotional ? (
        <MotionBlock>
          <PublicationCard item={devotional} feature />
        </MotionBlock>
      ) : !error ? (
        <Empty text="O devocional de hoje ainda não foi publicado. Os anteriores estão em Aprender." />
      ) : null}
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
      {!!events.length && <Section title="Vamos nos encontrar?" />}
      {events.slice(0, 1).map((e) => (
        <Pressable
          key={e.id}
          accessibilityRole="button"
          onPress={() => router.push(`/event/${e.id}`)}
          style={[s.panel, { backgroundColor: colors.pink }]}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Body style={{ fontSize: 14 }}>
              {new Date(e.starts_at).toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "long",
                timeZone: "America/Sao_Paulo",
              })}
            </Body>
            <MotionBlock illustration>
              <Illustration kind="coffee" size={76} />
            </MotionBlock>
          </View>
          <Title small>{e.title}</Title>
          <Body>{e.location}</Body>
          <Body style={{ color: colors.burgundy }}>Ver o encontro ↗</Body>
        </Pressable>
      ))}
    </Page>
  );
}

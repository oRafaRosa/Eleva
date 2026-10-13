import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Page, Body, Title, Section, s, Empty } from "../../src/components/ui";
import { useEleva } from "../../src/state/AppProvider";
import { colors } from "../../src/theme";
export default function Live() {
  const { events, challenges, challengeSteps, stepCompletions, toggleStep } =
    useEleva();
  return (
    <Page kicker="Atividades e encontros" title="Viver">
      <Body muted>Escolha uma atividade e acompanhe o que já fez.</Body>
      <Section title="Desafios" />
      {!challenges.length && (
        <Empty text="Os próximos desafios vão aparecer aqui." />
      )}
      {challenges.map((c) => (
        <View key={c.id} style={[s.panel, { marginBottom: 16 }]}>
          <Title small>{c.title}</Title>
          <Body>{c.description}</Body>
          {challengeSteps
            .filter((t) => t.challenge_id === c.id)
            .map((t) => (
              <Pressable
                key={t.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: stepCompletions.includes(t.id) }}
                onPress={() => toggleStep(t.id)}
                style={{
                  flexDirection: "row",
                  gap: 12,
                  paddingVertical: 12,
                  borderTopWidth: 1,
                  borderTopColor: colors.line,
                }}
              >
                <Body style={{ color: colors.burgundy }}>
                  {stepCompletions.includes(t.id) ? "☑" : "□"}
                </Body>
                <Body style={{ flex: 1 }}>{t.title}</Body>
              </Pressable>
            ))}
        </View>
      ))}
      <Section title="Próximos encontros" />
      {!events.length && <Empty text="Ainda não há encontros publicados." />}
      {events.map((e) => (
        <Pressable
          key={e.id}
          accessibilityRole="button"
          onPress={() => router.push(`/event/${e.id}`)}
          style={[s.article, { gap: 8 }]}
        >
          <Body muted>
            {new Date(e.starts_at).toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "long",
              timeZone: "America/Sao_Paulo",
            })}
          </Body>
          <Title small>{e.title}</Title>
          <Body>{e.location}</Body>
          <Body style={{ color: colors.burgundy }}>Ver detalhes ↗</Body>
        </Pressable>
      ))}
    </Page>
  );
}

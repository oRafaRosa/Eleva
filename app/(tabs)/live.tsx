import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Page, Body, Title, Section, s, Empty } from "../../src/components/ui";
import { useEleva } from "../../src/state/AppProvider";
import { colors } from "../../src/theme";
import {
  ChallengeProgress,
  ChallengeStepControl,
} from "../../src/components/ChallengeProgress";
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
      {challenges.map((c) => {
        const steps = challengeSteps
          .filter((step) => step.challenge_id === c.id)
          .sort((a, b) => a.position - b.position);
        const completed = steps.filter((step) =>
          stepCompletions.includes(step.id),
        ).length;
        return (
          <View key={c.id} style={[s.panel, { marginBottom: 16, gap: 8 }]}>
            <Title small>{c.title}</Title>
            <Body>{c.description}</Body>
            <ChallengeProgress completed={completed} total={steps.length} />
            <View>
              {steps.map((step) => (
                <ChallengeStepControl
                  key={step.id}
                  title={step.title}
                  checked={stepCompletions.includes(step.id)}
                  onToggle={() => toggleStep(step.id)}
                />
              ))}
            </View>
          </View>
        );
      })}
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

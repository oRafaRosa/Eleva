import { Pressable, View, Linking } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import {
  Page,
  Body,
  Title,
  Section,
  s,
  Empty,
  Button,
  Loading,
  ErrorState,
} from "../../src/components/ui";
import { useEleva } from "../../src/state/AppProvider";
import { colors } from "../../src/theme";
import { gymratsUrl } from "../../src/services/challengeValidation";
import {
  ChallengeProgress,
  ChallengeStepControl,
} from "../../src/components/ChallengeProgress";
export default function Live() {
  const [linkError, setLinkError] = useState("");
  const [expanded, setExpanded] = useState<string[]>([]);
  const {
    events,
    challenges,
    challengeSteps,
    stepCompletions,
    toggleStep,
    error,
    refresh,
    loading,
  } = useEleva();
  return (
    <Page kicker="Atividades e encontros" title="Viver">
      {!!linkError && <Empty text={linkError} />}
      {!!error && <ErrorState text={error} onRetry={refresh} />}
      {loading && !challenges.length && !events.length && <Loading />}
      <Section title="Desafios" />
      {!loading && !error && !challenges.length && (
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
            <Body muted style={{ fontSize: 14 }}>
              {new Date(`${c.starts_on}T12:00:00Z`).toLocaleDateString(
                "pt-BR",
                { timeZone: "America/Sao_Paulo" },
              )}{" "}
              a{" "}
              {new Date(`${c.ends_on}T12:00:00Z`).toLocaleDateString("pt-BR", {
                timeZone: "America/Sao_Paulo",
              })}
            </Body>
            <Body>{c.description}</Body>
            {c.gymrats_url && (
              <Button
                label="Abrir no GymRats"
                onPress={() => {
                  setLinkError("");
                  try {
                    const url = gymratsUrl(c.gymrats_url);
                    if (url)
                      void Linking.openURL(url).catch(() =>
                        setLinkError(
                          "Não foi possível abrir o GymRats. Tente novamente.",
                        ),
                      );
                  } catch {
                    setLinkError("O link deste desafio não está disponível.");
                  }
                }}
              />
            )}
            {steps.length > 0 && (
              <ChallengeProgress completed={completed} total={steps.length} />
            )}
            {steps.length > 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: expanded.includes(c.id) }}
                onPress={() =>
                  setExpanded((ids) =>
                    ids.includes(c.id)
                      ? ids.filter((id) => id !== c.id)
                      : [...ids, c.id],
                  )
                }
                style={{ minHeight: 48, justifyContent: "center" }}
              >
                <Body style={{ color: colors.burgundy, fontSize: 16 }}>
                  {expanded.includes(c.id)
                    ? "Recolher atividades"
                    : "Ver atividades"}
                </Body>
              </Pressable>
            )}
            {expanded.includes(c.id) && (
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
            )}
          </View>
        );
      })}
      <Section title="Próximos encontros" />
      {!loading && !error && !events.length && (
        <Empty text="Ainda não há encontros publicados." />
      )}
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

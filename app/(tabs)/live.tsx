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
import { splitUpcomingEvents } from "../../src/utils/memberExperience";
import type { ElevaEvent } from "../../src/types/domain";
import { MotionBlock } from "../../src/components/MotionBlock";
export default function Live() {
  const [linkError, setLinkError] = useState("");
  const [expanded, setExpanded] = useState<string[]>([]);
  const {
    events,
    registrations,
    challenges,
    challengeSteps,
    stepCompletions,
    toggleStep,
    error,
    refresh,
    loading,
  } = useEleva();
  const agenda = splitUpcomingEvents(events, registrations, new Date());
  return (
    <Page kicker="Atividades e encontros" title="Viver" animateHeading>
      {!!linkError && <Empty text={linkError} />}
      {!!error && <ErrorState text={error} onRetry={refresh} />}
      {loading && !challenges.length && !events.length && <Loading />}
      <MotionBlock>
        <Section title="Desafios" />
      </MotionBlock>
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
          <View
            key={c.id}
            style={[s.panel, { marginBottom: 12, gap: 8, padding: 16 }]}
          >
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
      {!!agenda.registered.length && (
        <View>
          <Section title="Sua agenda" />
          {agenda.registered.map((event) => (
            <EventRow key={event.id} event={event} confirmed />
          ))}
        </View>
      )}
      {(!!agenda.others.length || !agenda.registered.length) && (
        <Section title="Próximos encontros" />
      )}
      {!loading &&
        !error &&
        !agenda.others.length &&
        !agenda.registered.length && (
          <Empty text="Ainda não há próximos encontros publicados." />
        )}
      {agenda.others.map((event) => (
        <EventRow key={event.id} event={event} />
      ))}
    </Page>
  );
}

function EventRow({
  event,
  confirmed = false,
}: {
  event: ElevaEvent;
  confirmed?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir encontro ${event.title}${confirmed ? ", inscrição confirmada" : ""}`}
      onPress={() => router.push(`/event/${event.id}`)}
      style={({ pressed }) => [
        s.article,
        {
          minHeight: 58,
          paddingVertical: 10,
          gap: 2,
          backgroundColor: pressed ? colors.pink : "transparent",
        },
      ]}
    >
      <Body muted style={{ fontSize: 13, lineHeight: 18 }}>
        {new Date(event.starts_at).toLocaleDateString("pt-BR", {
          day: "numeric",
          month: "long",
          timeZone: "America/Sao_Paulo",
        })}
        {confirmed ? " · Inscrição confirmada" : ""}
      </Body>
      <Title small style={{ fontSize: 22, lineHeight: 26 }}>
        {event.title}
      </Title>
      <Body muted style={{ fontSize: 14, lineHeight: 20 }}>
        {event.location}
      </Body>
    </Pressable>
  );
}

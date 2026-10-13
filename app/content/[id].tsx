import { View, Linking } from "react-native";
import { useLocalSearchParams } from "expo-router";
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
import { typeLabels, pillarLabels, colors } from "../../src/theme";
export default function Content() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    publications,
    favorites,
    completions,
    loading,
    toggleFavorite,
    toggleCompletion,
  } = useEleva();
  const p = publications.find((p) => p.id === id);
  if (loading && !p)
    return (
      <Page back>
        <Loading />
      </Page>
    );
  if (!p)
    return (
      <Page back title="Conteúdo indisponível">
        <Empty text="Este conteúdo ainda não está publicado ou foi removido." />
      </Page>
    );
  const verse = typeof p.details.verse === "string" ? p.details.verse : null;
  return (
    <Page
      back
      kicker={`${typeLabels[p.type]} / ${pillarLabels[p.pillar]}`}
      title={p.title}
    >
      <Body muted style={{ marginBottom: 28 }}>
        {p.summary}
      </Body>
      {verse && (
        <View
          style={[
            s.panel,
            { backgroundColor: colors.pink, marginBottom: 28, borderWidth: 0 },
          ]}
        >
          <Title small>{verse}</Title>
        </View>
      )}
      {p.body.split("\n\n").map((text, i) => (
        <Body
          key={i}
          style={{ fontSize: 19, lineHeight: 30, marginBottom: 20 }}
        >
          {text}
        </Body>
      ))}
      {Array.isArray(p.details.exercises) &&
        p.details.exercises.map((exercise: any, i: number) => (
          <View key={i} style={[s.panel, { marginVertical: 8 }]}>
            <Title small>
              {typeof exercise === "string" ? exercise : exercise.name}
            </Title>
            {typeof exercise === "object" && (
              <Body>{exercise.description || exercise.reps || ""}</Body>
            )}
          </View>
        ))}
      {p.media_url && (
        <View style={{ marginTop: 12 }}>
          <Button
            label="Abrir vídeo ou material"
            onPress={() => void Linking.openURL(p.media_url!)}
          />
        </View>
      )}
      <View
        style={{
          gap: 12,
          marginTop: 28,
          paddingTop: 25,
          borderTopWidth: 1,
          borderTopColor: colors.line,
        }}
      >
        <Button
          label={
            favorites.includes(id)
              ? "Salvo. Remover dos favoritos"
              : "Salvar para depois"
          }
          secondary
          onPress={() => void toggleFavorite(id)}
        />
        <Button
          label={
            completions.includes(id)
              ? "Concluído. Desfazer marcação"
              : "Marcar como concluído"
          }
          onPress={() => void toggleCompletion(id)}
        />
      </View>
    </Page>
  );
}

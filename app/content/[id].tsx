import { useState } from "react";
import { View, Linking, Pressable, Text } from "react-native";
import { useLocalSearchParams, Redirect } from "expo-router";
import {
  Page,
  Body,
  Button,
  Empty,
  Loading,
  ContentCover,
  ErrorState,
} from "../../src/components/ui";
import { PublicationBody } from "../../src/components/PublicationBody";
import { useEleva } from "../../src/state/AppProvider";
import { typeLabels, pillarLabels, colors, fonts } from "../../src/theme";
export default function Content() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    user,
    sessionReady,
    publications,
    favorites,
    completions,
    loading,
    actionBusy,
    authStatus,
    error,
    refresh,
    toggleFavorite,
    toggleCompletion,
  } = useEleva();
  const [busy, setBusy] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const item = publications.find((p) => p.id === id);
  if (!sessionReady || (loading && !user))
    return (
      <Page back>
        <Loading />
      </Page>
    );
  if (!user && error && (authStatus === "unknown" || authStatus === "verified"))
    return (
      <Page back title="Não foi possível abrir">
        <ErrorState text={error} onRetry={refresh} />
      </Page>
    );
  if (!user) return <Redirect href="/login" />;
  if (loading && !item)
    return (
      <Page back>
        <Loading />
      </Page>
    );
  if (error && !item)
    return (
      <Page back title="Não foi possível abrir">
        <ErrorState text={error} onRetry={refresh} />
      </Page>
    );
  if (!item)
    return (
      <Page back title="Conteúdo indisponível">
        <Empty text="Este conteúdo ainda não está publicado ou foi removido." />
      </Page>
    );
  async function favorite() {
    if (busy) return;
    setBusy(true);
    try {
      await toggleFavorite(id);
    } catch {
      /* The provider shows the action failure. */
    } finally {
      setBusy(false);
    }
  }
  async function openMedia() {
    try {
      setMediaError("");
      if (!item?.media_url || !/^https:\/\//i.test(item.media_url))
        throw new Error("Este link não está disponível.");
      await Linking.openURL(item.media_url);
    } catch {
      setMediaError("Não foi possível abrir o link. Tente novamente.");
    }
  }
  return (
    <Page
      back
      kicker={`${typeLabels[item.type]} / ${pillarLabels[item.pillar]}`}
      title={item.title}
    >
      {!!error && <ErrorState text={error} onRetry={refresh} />}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          favorites.includes(id) ? "Remover dos salvos" : "Salvar para depois"
        }
        accessibilityState={{
          selected: favorites.includes(id),
          disabled: busy || actionBusy,
        }}
        disabled={busy || actionBusy}
        onPress={() => void favorite()}
        style={({ pressed }) => ({
          alignSelf: "flex-start",
          minHeight: 48,
          justifyContent: "center",
          paddingHorizontal: 14,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: colors.muted,
          borderRadius: 4,
          backgroundColor: pressed ? colors.pink : "transparent",
        })}
      >
        <Text
          style={{
            fontFamily: fonts.medium,
            fontSize: 16,
            color: colors.burgundy,
          }}
        >
          {favorites.includes(id) ? "Salvo" : "Salvar"}
        </Text>
      </Pressable>
      {item.cover_path && (
        <ContentCover path={item.cover_path} variant="detail" />
      )}
      <PublicationBody item={item} />
      {item.media_url && (
        <View style={{ marginTop: 20 }}>
          <Button
            label="Abrir vídeo ou material"
            onPress={() => void openMedia()}
          />
        </View>
      )}
      {!!mediaError && (
        <ErrorState text={mediaError} onRetry={() => void openMedia()} />
      )}
      <View
        style={{
          marginTop: 32,
          paddingTop: 24,
          borderTopWidth: 1,
          borderTopColor: colors.line,
        }}
      >
        <Button
          label={
            completions.includes(id)
              ? "Concluído. Desfazer marcação"
              : "Marcar como concluído"
          }
          disabled={actionBusy}
          onPress={() => void toggleCompletion(id).catch(() => {})}
        />
      </View>
    </Page>
  );
}

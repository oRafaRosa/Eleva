import { useState } from "react";
import { View } from "react-native";
import { Redirect, useLocalSearchParams } from "expo-router";
import {
  Page,
  Body,
  Title,
  Field,
  Button,
  Empty,
  ErrorState,
  Loading,
  s,
} from "../../src/components/ui";
import { useEleva } from "../../src/state/AppProvider";
import { useForumScreen } from "../../src/components/forum/useForumScreen";
import { ForumMessageOptions } from "../../src/components/forum/ForumMessageOptions";
import { SocialAction } from "../../src/components/SocialAction";
import { useForumDraftLeave } from "../../src/components/forum/useForumDraftLeave";

export default function CommunityPost() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    sessionReady,
    loading: appLoading,
    user,
    isDemo,
    error,
    authStatus,
    refresh,
  } = useEleva();
  if (!sessionReady || (appLoading && !user)) return <Loading />;
  if (!user && error && (authStatus === "unknown" || authStatus === "verified"))
    return (
      <Page layout="reading" back backHref="/(tabs)/connect">
        <ErrorState text={error} onRetry={refresh} />
      </Page>
    );
  if (!user) return <Redirect href="/login" />;
  return <CommunityPostBody key={`${user.id}:${isDemo}:${id}`} id={id} />;
}
function CommunityPostBody({ id }: { id: string }) {
  const { user } = useEleva();
  const {
    topics,
    replies,
    loading,
    busy,
    notice,
    loadError,
    refresh,
    action,
    isDemo,
  } = useForumScreen(id);
  const [response, setResponse] = useState("");
  const leave = useForumDraftLeave(
    Boolean(response.trim()),
    busy,
    () => setResponse(""),
    Boolean(user),
  );
  if (!user) return null;
  const topic = topics.find((t) => t.id === id);
  return (
    <Page layout="reading" back backHref="/(tabs)/connect" onBack={leave}>
      {!!notice && (
        <View accessibilityLiveRegion="polite" style={{ marginVertical: 12 }}>
          <Body>{notice}</Body>
        </View>
      )}
      {!!loadError && <ErrorState text={loadError} onRetry={refresh} />}
      {loading && !topic ? (
        <Loading />
      ) : topic ? (
        <>
          <View style={[s.article, { gap: 10 }]}>
            <ForumMessageOptions
              item={topic}
              kind="topic"
              user={user}
              demo={isDemo}
              busy={busy}
              action={action}
            />
            <Title small>{topic.title}</Title>
            <Body>
              {topic.deleted ? "Esta mensagem foi removida." : topic.body}
            </Body>
            {!topic.deleted && (
              <SocialAction
                kind="heart"
                count={topic.like_count ?? 0}
                active={topic.liked_by_me}
                disabled={busy}
                onPress={() =>
                  void action((r) => r.setLike(topic.id, !topic.liked_by_me))
                }
              />
            )}
          </View>
          <Title
            small
            style={{ fontSize: 26, marginTop: 20, marginBottom: 12 }}
          >
            Comentários
          </Title>
          {replies.map((r) => (
            <View key={r.id} style={[s.article, { gap: 10 }]}>
              <ForumMessageOptions
                item={r}
                kind="reply"
                user={user}
                demo={isDemo}
                busy={busy}
                action={action}
              />
              <Body>{r.deleted ? "Esta resposta foi removida." : r.body}</Body>
            </View>
          ))}
          {!replies.length && !loadError && (
            <Body muted style={{ marginBottom: 16 }}>
              Ainda não há comentários.
            </Body>
          )}
          {!topic.deleted && (
            <View style={{ gap: 12, marginTop: 20 }}>
              <Field
                label="Seu comentário"
                value={response}
                onChangeText={setResponse}
                multiline
                maxLength={3000}
                editable={!busy}
                style={{ minHeight: 90, textAlignVertical: "top" }}
              />
              <Button
                label={busy ? "Publicando…" : "Comentar"}
                disabled={busy || !response.trim()}
                onPress={() =>
                  void action(
                    (r) => r.reply(topic.id, response),
                    "Comentário publicado.",
                    () => setResponse(""),
                  )
                }
              />
            </View>
          )}
        </>
      ) : (
        !loadError && <Empty text="Esta publicação não está disponível." />
      )}
    </Page>
  );
}

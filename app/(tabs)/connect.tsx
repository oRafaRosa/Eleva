import { useState } from "react";
import { View, Pressable } from "react-native";
import { router } from "expo-router";
import {
  Page,
  Body,
  Title,
  Button,
  Field,
  Empty,
  Loading,
  ErrorState,
  s,
} from "../../src/components/ui";
import { colors } from "../../src/theme";
import { SocialAction } from "../../src/components/SocialAction";
import { MotionBlock } from "../../src/components/MotionBlock";
import { useForumScreen } from "../../src/components/forum/useForumScreen";
import { ForumMessageOptions } from "../../src/components/forum/ForumMessageOptions";
import { useEleva } from "../../src/state/AppProvider";
import { useForumDraftLeave } from "../../src/components/forum/useForumDraftLeave";

export default function Connect() {
  const { user, isDemo } = useEleva();
  return <ConnectFeed key={`${user?.id ?? "signed-out"}:${isDemo}`} />;
}
function ConnectFeed() {
  const {
    user,
    isDemo,
    topics,
    loading,
    busy,
    notice,
    loadError,
    action,
    refresh,
  } = useForumScreen();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [compose, setCompose] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const requestLeave = useForumDraftLeave(
    Boolean(title.trim() || body.trim()),
    busy,
    () => {
      setTitle("");
      setBody("");
      setCompose(false);
    },
    Boolean(user),
  );
  const openTopic = (id: string) =>
    requestLeave(() => router.push(`/community/${encodeURIComponent(id)}`));
  return (
    <Page
      title="Conectar"
      animateHeading
      actions={
        user && (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: compose, disabled: busy }}
            disabled={busy}
            onPress={() => setCompose((v) => !v)}
            style={{
              minHeight: 48,
              paddingHorizontal: 12,
              justifyContent: "center",
            }}
          >
            <Body style={{ color: colors.burgundy }}>
              {compose ? "Fechar" : "Publicar"}
            </Body>
          </Pressable>
        )
      }
    >
      {!!notice && (
        <View accessibilityLiveRegion="polite" style={{ marginBottom: 12 }}>
          <Body>{notice}</Body>
        </View>
      )}
      {compose && user && (
        <MotionBlock style={{ gap: 14, marginBottom: 20 }}>
          <Field
            label="Título"
            value={title}
            onChangeText={setTitle}
            maxLength={120}
            editable={!busy}
          />
          <Field
            label="Mensagem"
            value={body}
            onChangeText={setBody}
            multiline
            maxLength={3000}
            editable={!busy}
            style={{ minHeight: 100, textAlignVertical: "top" }}
          />
          <Button
            label={busy ? "Publicando…" : "Publicar"}
            disabled={busy || !title.trim() || !body.trim()}
            onPress={() =>
              void action(
                (r) => r.createTopic(title, body),
                "Publicação enviada.",
                () => {
                  setTitle("");
                  setBody("");
                  setCompose(false);
                },
              )
            }
          />
        </MotionBlock>
      )}
      {!!loadError && <ErrorState text={loadError} onRetry={refresh} />}
      {loading && !topics.length ? (
        <Loading />
      ) : topics.length ? (
        topics.map((t, index) => {
          const TopicContainer = index === 0 ? MotionBlock : View;
          return (
            <TopicContainer key={t.id} style={[s.article, { marginBottom: 8 }]}>
              {user && (
                <ForumMessageOptions
                  item={t}
                  kind="topic"
                  user={user}
                  demo={isDemo}
                  busy={busy}
                  action={action}
                />
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Abrir ${t.title}`}
                onPress={() => openTopic(t.id)}
                style={{ minHeight: 48 }}
              >
                <Title small style={{ marginVertical: 10 }}>
                  {t.title}
                </Title>
              </Pressable>
              <Body numberOfLines={3}>
                {t.deleted ? "As respostas continuam disponíveis." : t.body}
              </Body>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 8,
                }}
              >
                {!t.deleted && (
                  <SocialAction
                    kind="heart"
                    count={t.like_count ?? 0}
                    active={t.liked_by_me}
                    disabled={busy}
                    onPress={() =>
                      void action((r) => r.setLike(t.id, !t.liked_by_me))
                    }
                  />
                )}
                <SocialAction
                  kind="comment"
                  count={t.comment_count ?? 0}
                  disabled={busy}
                  onPress={() => openTopic(t.id)}
                />
              </View>
            </TopicContainer>
          );
        })
      ) : (
        !loadError && (
          <Empty text="Ainda não há publicações. Compartilhe a primeira." />
        )
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: rulesOpen }}
        onPress={() => setRulesOpen((v) => !v)}
        style={{ minHeight: 48, justifyContent: "center", marginTop: 16 }}
      >
        <Body muted style={{ fontSize: 14 }}>
          Regras da comunidade
        </Body>
      </Pressable>
      {rulesOpen && (
        <Body muted style={{ fontSize: 15 }}>
          Respeite as experiências de cada pessoa. Não compartilhe relatos ou
          contatos de outras integrantes sem autorização. Para denunciar uma
          mensagem, abra Opções.
        </Body>
      )}
    </Page>
  );
}

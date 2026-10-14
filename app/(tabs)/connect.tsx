import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Pressable } from "react-native";
import {
  Page,
  Body,
  Title,
  Section,
  Button,
  Field,
  Empty,
  Loading,
  s,
} from "../../src/components/ui";
import { useEleva } from "../../src/state/AppProvider";
import { createForumRepository } from "../../src/services/forum";
import type { ForumTopic, ForumReply } from "../../src/types/forum";
import { colors } from "../../src/theme";
import { SocialAction } from "../../src/components/SocialAction";
import { MotionBlock } from "../../src/components/MotionBlock";
export default function Connect() {
  const { user, isDemo } = useEleva();
  const forum = useMemo(
    () => (user ? createForumRepository({ demo: isDemo, user }) : null),
    [user?.id, user?.role, user?.full_name, isDemo],
  );
  const [topics, setTopics] = useState<ForumTopic[]>([]),
    [replies, setReplies] = useState<ForumReply[]>([]),
    [selected, setSelected] = useState<string | null>(null);
  const [title, setTitle] = useState(""),
    [body, setBody] = useState(""),
    [response, setResponse] = useState(""),
    [compose, setCompose] = useState(false),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [notice, setNotice] = useState(""),
    [confirm, setConfirm] = useState("");
  const generation = useRef(0),
    lock = useRef(false);
  const [menu, setMenu] = useState("");
  const [rulesOpen, setRulesOpen] = useState(false);
  const topic = topics.find((t) => t.id === selected);
  async function refresh(quiet = false) {
    if (!forum) return;
    const version = ++generation.current;
    if (!quiet) setLoading(true);
    try {
      const [t, r] = await Promise.all([
        forum.listTopics(),
        selected ? forum.listReplies(selected) : Promise.resolve([]),
      ]);
      if (version === generation.current) {
        setTopics(t);
        setReplies(r);
      }
    } catch (e) {
      if (quiet) throw e;
      if (version === generation.current)
        setNotice(
          e instanceof Error
            ? e.message
            : "Não foi possível carregar as conversas.",
        );
    } finally {
      if (version === generation.current) setLoading(false);
    }
  }
  useEffect(() => {
    setTopics([]);
    setReplies([]);
    setConfirm("");
    void refresh();
    return () => {
      generation.current++;
    };
  }, [forum, selected]);
  async function action(work: () => Promise<void>, message: string) {
    if (lock.current) return;
    const version = generation.current;
    lock.current = true;
    setBusy(true);
    setNotice("");
    try {
      await work();
      if (version !== generation.current) return;
      await refresh(true);
      setNotice(message);
    } catch (e) {
      if (version !== generation.current) return;
      setNotice(
        e instanceof Error
          ? e.message
          : "Não foi possível salvar. Tente novamente.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function controls(item: ForumTopic | ForumReply, kind: "topic" | "reply") {
    if (item.deleted) return null;
    const mine = user?.id === item.author_id || user?.role === "admin";
    const key = `${kind}:${item.id}`;
    return (
      <View style={{ gap: 4 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Opções da mensagem"
          accessibilityState={{ expanded: menu === key }}
          onPress={() => {
            setMenu(menu === key ? "" : key);
            setConfirm("");
          }}
          style={{ minHeight: 48, justifyContent: "center" }}
        >
          <Body muted style={{ fontSize: 15 }}>
            Opções
          </Body>
        </Pressable>
        {menu === key && (
          <View style={{ flexDirection: "row", gap: 24, flexWrap: "wrap" }}>
            {mine && (
              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={() => setConfirm(key)}
                style={{ minHeight: 48, justifyContent: "center" }}
              >
                <Body style={{ color: colors.burgundy }}>Remover mensagem</Body>
              </Pressable>
            )}
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={() =>
                void action(
                  () => forum!.report(kind, item.id),
                  isDemo
                    ? "Mensagem sinalizada nesta prévia."
                    : "Denúncia enviada para revisão.",
                )
              }
              style={{ minHeight: 48, justifyContent: "center" }}
            >
              <Body muted>Denunciar</Body>
            </Pressable>
          </View>
        )}
        {confirm === key && (
          <View style={{ gap: 10 }}>
            <Body>Remover esta mensagem? As respostas serão mantidas.</Body>
            <Button
              label="Confirmar remoção"
              disabled={busy}
              onPress={() =>
                void action(async () => {
                  await forum!.remove(kind, item.id);
                  setConfirm("");
                }, "Mensagem removida.")
              }
            />
            <Button
              secondary
              label="Manter mensagem"
              disabled={busy}
              onPress={() => setConfirm("")}
            />
          </View>
        )}
      </View>
    );
  }
  function social(item: ForumTopic) {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          marginTop: 8,
        }}
      >
        {!item.deleted && (
          <SocialAction
            kind="heart"
            count={item.like_count ?? 0}
            active={item.liked_by_me}
            disabled={busy}
            onPress={() =>
              void action(() => forum!.setLike(item.id, !item.liked_by_me), "")
            }
          />
        )}
        <SocialAction
          kind="comment"
          disabled={busy}
          count={item.comment_count ?? 0}
          onPress={() => {
            setSelected(item.id);
            setResponse("");
          }}
        />
      </View>
    );
  }
  return (
    <Page
      title={selected ? "Comentários" : "Conectar"}
      actions={
        !selected && user ? (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: compose }}
            onPress={() => setCompose((v) => !v)}
            style={{
              minHeight: 48,
              paddingHorizontal: 12,
              justifyContent: "center",
            }}
          >
            <Body style={{ color: colors.burgundy }}>
              {compose ? "Cancelar" : "Publicar"}
            </Body>
          </Pressable>
        ) : undefined
      }
    >
      {!!notice && (
        <View
          accessibilityLiveRegion="polite"
          style={[s.panel, { marginBottom: 20 }]}
        >
          <Body>{notice}</Body>
        </View>
      )}
      {!user ? (
        <Empty text="Entre na sua conta para participar das conversas." />
      ) : selected ? (
        <>
          <Button
            secondary
            label="Voltar"
            disabled={busy}
            onPress={() => {
              setSelected(null);
              setResponse("");
            }}
          />
          {loading ? (
            <Loading />
          ) : topic ? (
            <>
              <MotionBlock key={topic.id} style={[s.panel, { marginTop: 24 }]}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <Body muted style={{ fontSize: 14, flexShrink: 1 }}>
                    {topic.author_name} ·{" "}
                    {new Date(topic.created_at).toLocaleDateString("pt-BR")}
                  </Body>
                  {menu !== `topic:${topic.id}` && controls(topic, "topic")}
                </View>
                <Title small style={{ marginVertical: 12 }}>
                  {topic.title}
                </Title>
                <Body>
                  {topic.deleted ? "Esta mensagem foi removida." : topic.body}
                </Body>
                {social(topic)}
                {menu === `topic:${topic.id}` && controls(topic, "topic")}
              </MotionBlock>
              {!topic.deleted && (
                <View style={{ gap: 12, marginTop: 16 }}>
                  <Field
                    label="Seu comentário"
                    value={response}
                    onChangeText={setResponse}
                    multiline
                    maxLength={3000}
                    editable={!busy}
                  />
                  <Button
                    label={busy ? "Publicando…" : "Comentar"}
                    disabled={busy || !response.trim()}
                    onPress={() =>
                      void action(async () => {
                        await forum!.reply(topic.id, response);
                        setResponse("");
                      }, "Comentário publicado.")
                    }
                  />
                </View>
              )}
              <Section title="Comentários" />
              {replies.length ? (
                replies.map((r) => (
                  <View key={r.id} style={[s.panel, { marginBottom: 16 }]}>
                    <Body muted>
                      {r.author_name} ·{" "}
                      {new Date(r.created_at).toLocaleDateString("pt-BR")}
                    </Body>
                    <Body style={{ marginTop: 12 }}>
                      {r.deleted ? "Esta resposta foi removida." : r.body}
                    </Body>
                    {controls(r, "reply")}
                  </View>
                ))
              ) : (
                <Empty text="Ainda não há comentários." />
              )}
            </>
          ) : (
            <Empty text="Esta conversa não foi encontrada." />
          )}
        </>
      ) : (
        <>
          {compose && (
            <MotionBlock style={{ gap: 14, marginTop: 24 }}>
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
              />
              <Button
                label={busy ? "Publicando…" : "Publicar"}
                disabled={busy || !title.trim() || !body.trim()}
                onPress={() =>
                  void action(async () => {
                    await forum!.createTopic(title, body);
                    setTitle("");
                    setBody("");
                    setCompose(false);
                  }, "Conversa publicada.")
                }
              />
            </MotionBlock>
          )}
          {loading ? (
            <Loading />
          ) : topics.length ? (
            topics.map((t) => (
              <View key={t.id} style={[s.article, { marginBottom: 8 }]}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <Body muted style={{ fontSize: 14, flexShrink: 1 }}>
                    {t.author_name} ·{" "}
                    {new Date(t.created_at).toLocaleDateString("pt-BR")}
                  </Body>
                  {menu !== `topic:${t.id}` && controls(t, "topic")}
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Abrir ${t.title}`}
                  onPress={() => setSelected(t.id)}
                  style={{ minHeight: 48 }}
                >
                  <Title small style={{ marginVertical: 10 }}>
                    {t.title}
                  </Title>
                </Pressable>
                <Body>
                  {t.deleted
                    ? "As respostas continuam disponíveis."
                    : t.body.slice(0, 180) + (t.body.length > 180 ? "…" : "")}
                </Body>
                {social(t)}
                {menu === `topic:${t.id}` && controls(t, "topic")}
              </View>
            ))
          ) : (
            <Empty text="Ainda não há publicações. Compartilhe a primeira." />
          )}
        </>
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

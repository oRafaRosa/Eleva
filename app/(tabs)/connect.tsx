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
import { Illustration } from "../../src/components/Illustration";
import { MotionBlock } from "../../src/components/MotionBlock";
export default function Connect() {
  const { user, isDemo } = useEleva();
  const forum = useMemo(
    () => (user ? createForumRepository({ demo: isDemo, user }) : null),
    [user?.id, user?.role, isDemo],
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
  const topic = topics.find((t) => t.id === selected);
  async function refresh() {
    if (!forum) return;
    const version = ++generation.current;
    setLoading(true);
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
    lock.current = true;
    setBusy(true);
    setNotice("");
    try {
      await work();
      await refresh();
      setNotice(message);
    } catch (e) {
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
      <View style={{ gap: 10, marginTop: 14 }}>
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
  return (
    <Page kicker="Comunidade ELEVA" title={topic ? "Conversa" : "Conectar"}>
      <Body muted style={{ marginBottom: 24 }}>
        {isDemo
          ? "Podem abrir uma conversa e testar as respostas por aqui."
          : "Um espaço para conversar com as integrantes da ELEVA."}
      </Body>
      <View
        style={[s.panel, { backgroundColor: colors.pink, marginBottom: 24 }]}
      >
        <MotionBlock illustration style={{ marginBottom: 12 }}>
          <Illustration kind="flower" size={88} />
        </MotionBlock>
        <Body>
          Respeite as experiências de cada pessoa. Não compartilhe relatos ou
          contatos de outras integrantes sem autorização. Denuncie mensagens que
          precisam de revisão.
        </Body>
      </View>
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
            label="Voltar para as conversas"
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
                <Body muted>
                  {topic.author_name} ·{" "}
                  {new Date(topic.created_at).toLocaleDateString("pt-BR")}
                </Body>
                <Title small style={{ marginVertical: 12 }}>
                  {topic.title}
                </Title>
                <Body>
                  {topic.deleted ? "Esta mensagem foi removida." : topic.body}
                </Body>
                {controls(topic, "topic")}
              </MotionBlock>
              <Section title="Respostas" />
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
                <Empty text="Ainda não há respostas. Você pode começar a conversa." />
              )}
              {!topic.deleted && (
                <View style={{ gap: 12, marginTop: 20 }}>
                  <Field
                    label="Sua resposta"
                    value={response}
                    onChangeText={setResponse}
                    multiline
                    maxLength={3000}
                    editable={!busy}
                  />
                  <Button
                    label={busy ? "Salvando…" : "Enviar resposta"}
                    disabled={busy || !response.trim()}
                    onPress={() =>
                      void action(async () => {
                        await forum!.reply(topic.id, response);
                        setResponse("");
                      }, "Resposta publicada.")
                    }
                  />
                </View>
              )}
            </>
          ) : (
            <Empty text="Esta conversa não foi encontrada." />
          )}
        </>
      ) : (
        <>
          <Button
            label={compose ? "Fechar nova conversa" : "Começar uma conversa"}
            onPress={() => setCompose((v) => !v)}
          />
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
                label={busy ? "Salvando…" : "Publicar conversa"}
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
          <Section title="Conversas da comunidade" />
          {loading ? (
            <Loading />
          ) : topics.length ? (
            topics.map((t) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Abrir ${t.title}`}
                key={t.id}
                onPress={() => setSelected(t.id)}
                style={[s.panel, { marginBottom: 16 }]}
              >
                <Body muted>
                  {t.author_name} ·{" "}
                  {new Date(t.created_at).toLocaleDateString("pt-BR")}
                </Body>
                <Title small style={{ marginVertical: 10 }}>
                  {t.title}
                </Title>
                <Body>
                  {t.deleted
                    ? "As respostas continuam disponíveis."
                    : t.body.slice(0, 180) + (t.body.length > 180 ? "…" : "")}
                </Body>
                <Body style={{ color: colors.burgundy, marginTop: 16 }}>
                  Abrir conversa ↗
                </Body>
              </Pressable>
            ))
          ) : (
            <Empty text="Ainda não há conversas. Comece contando o que você gostaria de compartilhar." />
          )}
        </>
      )}
    </Page>
  );
}

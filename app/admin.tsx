import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import {
  Body,
  Title,
  Button,
  Field,
  Chip,
  Empty,
  Loading,
  s,
} from "../src/components/ui";
import { PublicationEditor } from "../src/components/admin/PublicationEditor";
import {
  typeLabels,
  statusLabels,
  localDate,
  displayTime,
} from "../src/components/admin/editorial";
import { useEleva } from "../src/state/AppProvider";
import { colors, fonts } from "../src/theme";
import type {
  Publication,
  PublicationDraft,
  PublicationStatus,
  PublicationType,
} from "../src/types/domain";

export default function AdminScreen() {
  const { repository, user, isDemo, refresh, loading: appLoading } = useEleva();
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const requestVersion = useRef(0);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Publication[]>([]);
  const [section, setSection] = useState<"content" | "calendar">("content");
  const [status, setStatus] = useState<PublicationStatus | "all">("all");
  const [type, setType] = useState<PublicationType | "all">("all");
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState(localDate().slice(0, 7));
  const [editor, setEditor] = useState<{ item: Publication | null } | null>(
    null,
  );
  const [pendingAction, setPendingAction] = useState<{
    item: Publication;
    action: "archive" | "cancel";
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const acting = useRef(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    const version = ++requestVersion.current;
    setLoading(true);
    setAllowed(false);
    setItems([]);
    setError("");
    try {
      if (!user || user.role !== "admin") return;
      const access = await repository.getAccess();
      if (version !== requestVersion.current) return;
      if (!access || access.role !== "admin" || !access.active) return;
      setAllowed(true);
      const content = await repository.listPublications();
      if (version === requestVersion.current) setItems(content);
    } catch (e) {
      if (version === requestVersion.current)
        setError(
          e instanceof Error
            ? e.message
            : "Não foi possível abrir os conteúdos.",
        );
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, [repository, user?.id, user?.role]);
  useEffect(() => {
    void load();
    return () => {
      requestVersion.current++;
    };
  }, [load]);
  async function reloadAfterMutation() {
    // A committed write remains successful if fetching the new list later fails.
    try {
      setItems(await repository.listPublications());
      await refresh();
    } catch {
      setError(
        "A alteração foi salva, mas a lista não atualizou. Recarregue os conteúdos.",
      );
    }
  }
  async function save(draft: PublicationDraft) {
    await repository.savePublication(draft);
    setMessage(
      draft.status === "scheduled"
        ? `Publicação agendada para ${displayTime(draft.scheduled_at!)}.`
        : draft.status === "published"
          ? "Conteúdo publicado."
          : "Rascunho salvo.",
    );
    await reloadAfterMutation();
  }
  async function executeAction() {
    if (!pendingAction || acting.current) return;
    acting.current = true;
    setBusy(true);
    setError("");
    const { item, action } = pendingAction;
    try {
      if (action === "archive") await repository.archivePublication(item.id);
      else
        await repository.savePublication({
          id: item.id,
          title: item.title,
          summary: item.summary,
          body: item.body,
          type: item.type,
          pillar: item.pillar,
          status: "draft",
          details: item.details,
          reference_date: item.reference_date,
          media_url: item.media_url,
          cover_path: item.cover_path,
          scheduled_at: null,
        });
      setMessage(
        action === "archive"
          ? "Conteúdo arquivado."
          : "Agendamento cancelado. O conteúdo voltou para rascunho.",
      );
      setPendingAction(null);
      await reloadAfterMutation();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Não foi possível concluir a alteração. Tente novamente.",
      );
    } finally {
      acting.current = false;
      setBusy(false);
    }
  }
  if (loading || appLoading)
    return (
      <View style={styles.page}>
        <Loading />
      </View>
    );
  if (!allowed || user?.role !== "admin")
    return (
      <ScrollView style={styles.page} contentContainerStyle={styles.gate}>
        <Text style={styles.logo}>ELEVA</Text>
        <Title>Painel administrativo</Title>
        <Body>
          Entre com uma conta autorizada pela equipe para publicar e organizar
          os conteúdos.
        </Body>
        {!!error && (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        )}
        <Button
          label="Entrar na minha conta"
          onPress={() => router.push("/login")}
        />
        <Button
          label="Voltar para a plataforma"
          secondary
          onPress={() => router.push("/(tabs)/home")}
        />
      </ScrollView>
    );
  const visible = items.filter(
    (item) =>
      (status === "all" || item.status === status) &&
      (type === "all" || item.type === type) &&
      `${item.title} ${item.summary}`
        .toLocaleLowerCase("pt-BR")
        .includes(search.toLocaleLowerCase("pt-BR")),
  );
  const validMonth = /^\d{4}-(0[1-9]|1[0-2])$/.test(period);
  const monthItems = validMonth
    ? items
        .filter(
          (item) =>
            item.status !== "archived" &&
            (item.scheduled_at
              ? localDate(new Date(item.scheduled_at)).startsWith(period)
              : item.reference_date?.startsWith(period)),
        )
        .sort((a, b) =>
          (a.scheduled_at || a.reference_date || "").localeCompare(
            b.scheduled_at || b.reference_date || "",
          ),
        )
    : [];
  const dayCount = validMonth
    ? new Date(
        Number(period.slice(0, 4)),
        Number(period.slice(5, 7)),
        0,
      ).getDate()
    : 0;
  const missingDays = Array.from(
    { length: dayCount },
    (_, i) => `${period}-${String(i + 1).padStart(2, "0")}`,
  ).filter(
    (day) =>
      day >= localDate() &&
      !items.some(
        (item) =>
          item.type === "devotional" &&
          item.reference_date === day &&
          ["scheduled", "published"].includes(item.status),
      ),
  );
  const showItem = (item: Publication) => (
    <View key={item.id} style={styles.contentRow}>
      <View style={{ flex: 1, minWidth: 150, gap: 5 }}>
        <Body muted style={{ fontSize: 14 }}>
          {typeLabels[item.type]} / {statusLabels[item.status]}
        </Body>
        <Text style={styles.itemTitle}>{item.title}</Text>
        {item.scheduled_at && (
          <Body muted style={{ fontSize: 14 }}>
            Publicação: {displayTime(item.scheduled_at)}
          </Body>
        )}
        {item.reference_date && (
          <Body muted style={{ fontSize: 14 }}>
            Devocional: {item.reference_date.split("-").reverse().join("/")}
          </Body>
        )}
      </View>
      <View style={styles.itemActions}>
        <Button
          label="Editar"
          secondary
          onPress={() => {
            setMessage("");
            setEditor({ item });
          }}
        />
        {item.status === "scheduled" && (
          <Button
            label="Cancelar agendamento"
            secondary
            onPress={() => setPendingAction({ item, action: "cancel" })}
          />
        )}
        {item.status !== "archived" && (
          <Button
            label="Arquivar"
            secondary
            onPress={() => setPendingAction({ item, action: "archive" })}
          />
        )}
      </View>
    </View>
  );
  const navigation = (
    <>
      <Text style={styles.logo}>ELEVA</Text>
      <Body muted style={{ marginBottom: 20 }}>
        Administração
      </Body>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: section === "content" }}
        onPress={() => setSection("content")}
        style={[styles.navItem, section === "content" && styles.navSelected]}
      >
        <Text style={styles.navText}>Conteúdos</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: section === "calendar" }}
        onPress={() => setSection("calendar")}
        style={[styles.navItem, section === "calendar" && styles.navSelected]}
      >
        <Text style={styles.navText}>Calendário editorial</Text>
      </Pressable>
      {wide && (
        <>
          <View style={styles.navDivider} />
          <Body muted>Eventos e integrantes</Body>
          <Body muted style={{ fontSize: 14 }}>
            Gestão administrativa em uma próxima etapa.
          </Body>
        </>
      )}
      <View style={{ height: 20 }} />
      <Button
        label="Ver plataforma"
        secondary
        onPress={() => router.push("/(tabs)/home")}
      />
    </>
  );
  return (
    <View style={[styles.page, wide && { flexDirection: "row" }]}>
      {wide && <View style={styles.sidebar}>{navigation}</View>}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.main}
        keyboardShouldPersistTaps="handled"
      >
        {!wide && (
          <View style={styles.mobileNav}>
            <Text style={styles.logo}>ELEVA</Text>
            <View style={s.row}>
              <Chip
                label="Conteúdos"
                active={section === "content"}
                onPress={() => setSection("content")}
              />
              <Chip
                label="Calendário"
                active={section === "calendar"}
                onPress={() => setSection("calendar")}
              />
              <Chip
                label="Plataforma"
                onPress={() => router.push("/(tabs)/home")}
              />
            </View>
          </View>
        )}
        {isDemo && (
          <View style={styles.demo}>
            <Body>
              Demonstração do painel. Alterações salvas neste navegador. O
              agendamento automático depende do servidor.
            </Body>
          </View>
        )}
        <View style={styles.header}>
          <View style={{ flex: 1, minWidth: 200 }}>
            <Title>
              {section === "content" ? "Conteúdos" : "Calendário editorial"}
            </Title>
            <Body muted style={{ marginTop: 10 }}>
              {section === "content"
                ? "Organize as publicações e prepare os próximos dias."
                : "Confira as publicações e os dias que ainda precisam de devocional."}
            </Body>
          </View>
          <Button
            label="Novo conteúdo"
            onPress={() => {
              setMessage("");
              setEditor({ item: null });
            }}
          />
        </View>
        {!!message && (
          <View style={styles.notice}>
            <Text accessibilityLiveRegion="polite" style={styles.noticeText}>
              {message}
            </Text>
          </View>
        )}
        {!!error && (
          <View style={styles.notice}>
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
            <Button
              label="Recarregar conteúdos"
              secondary
              onPress={() => void load()}
            />
          </View>
        )}
        {pendingAction && (
          <View style={s.panel}>
            <Title small>
              {pendingAction.action === "archive"
                ? "Arquivar conteúdo?"
                : "Cancelar agendamento?"}
            </Title>
            <Body>
              {pendingAction.action === "archive"
                ? `“${pendingAction.item.title}” deixará de aparecer para as integrantes. Você poderá editar e publicar novamente.`
                : `“${pendingAction.item.title}” voltará para rascunho e não será publicado no horário previsto.`}
            </Body>
            <View style={s.row}>
              <Button
                label={
                  busy
                    ? "Salvando…"
                    : pendingAction.action === "archive"
                      ? "Confirmar arquivamento"
                      : "Cancelar agendamento"
                }
                onPress={() => void executeAction()}
                disabled={busy}
              />
              <Button
                label="Manter como está"
                secondary
                disabled={busy}
                onPress={() => setPendingAction(null)}
              />
            </View>
          </View>
        )}
        {section === "content" ? (
          <>
            <View style={styles.filters}>
              <Field
                label="Buscar por título ou resumo"
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar conteúdo"
              />
              <View style={s.row}>
                <Chip
                  label="Todos os status"
                  active={status === "all"}
                  onPress={() => setStatus("all")}
                />
                {Object.entries(statusLabels).map(([key, label]) => (
                  <Chip
                    key={key}
                    label={label}
                    active={status === key}
                    onPress={() => setStatus(key as PublicationStatus)}
                  />
                ))}
              </View>
              <View style={s.row}>
                <Chip
                  label="Todos os formatos"
                  active={type === "all"}
                  onPress={() => setType("all")}
                />
                {Object.entries(typeLabels).map(([key, label]) => (
                  <Chip
                    key={key}
                    label={label}
                    active={type === key}
                    onPress={() => setType(key as PublicationType)}
                  />
                ))}
              </View>
            </View>
            <Body muted style={{ marginBottom: 12 }}>
              {visible.length} {visible.length === 1 ? "conteúdo" : "conteúdos"}
            </Body>
            {visible.length ? (
              visible.map(showItem)
            ) : (
              <Empty text="Nenhum conteúdo com esses filtros. Ajuste a busca ou crie uma publicação." />
            )}
          </>
        ) : (
          <>
            <View style={styles.filters}>
              <Field
                label="Mês (AAAA-MM)"
                value={period}
                onChangeText={setPeriod}
                placeholder="2026-10"
              />
              <Body muted>
                Horário de São Paulo. Rascunhos com data também aparecem na
                agenda.
              </Body>
            </View>
            {!validMonth ? (
              <Empty text="Informe o mês no formato AAAA-MM." />
            ) : (
              <>
                <Title small style={{ marginTop: 22, marginBottom: 14 }}>
                  Agenda do mês
                </Title>
                {monthItems.length ? (
                  monthItems.map(showItem)
                ) : (
                  <Empty text="Nenhuma publicação prevista para este mês." />
                )}
                <View style={styles.pending}>
                  <Title small>Devocionais pendentes</Title>
                  <Body muted>
                    Datas de hoje em diante sem um devocional publicado ou
                    agendado. Rascunhos ainda precisam de publicação.
                  </Body>
                  {missingDays.length ? (
                    <View style={s.row}>
                      {missingDays.map((day) => (
                        <Chip
                          key={day}
                          label={day.split("-").reverse().slice(0, 2).join("/")}
                          onPress={() => {
                            const draft = items.find(
                              (item) =>
                                item.type === "devotional" &&
                                item.reference_date === day &&
                                item.status === "draft",
                            );
                            const now = new Date().toISOString();
                            setEditor({
                              item: draft || {
                                id: "",
                                title: "",
                                summary: "",
                                body: "",
                                type: "devotional",
                                pillar: "spirit",
                                status: "draft",
                                reference_date: day,
                                details: {},
                                media_url: null,
                                cover_path: null,
                                scheduled_at: null,
                                published_at: null,
                                created_at: now,
                                updated_at: now,
                                created_by: null,
                              },
                            });
                          }}
                        />
                      ))}
                    </View>
                  ) : (
                    <Body>
                      Os próximos dias deste mês já têm devocional previsto.
                    </Body>
                  )}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
      {editor && (
        <PublicationEditor
          item={editor.item}
          demo={isDemo}
          onClose={() => setEditor(null)}
          onSave={save}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.ivory },
  gate: {
    padding: 28,
    gap: 20,
    maxWidth: 550,
    width: "100%",
    alignSelf: "center",
    paddingTop: 70,
  },
  sidebar: {
    width: 246,
    backgroundColor: "#F3EBE7",
    borderRightWidth: 1,
    borderColor: colors.line,
    padding: 24,
    gap: 10,
  },
  main: {
    width: "100%",
    maxWidth: 1220,
    alignSelf: "center",
    padding: 24,
    paddingBottom: 60,
  },
  logo: {
    fontFamily: fonts.serif,
    color: colors.burgundy,
    fontSize: 37,
    letterSpacing: 1,
  },
  navItem: {
    minHeight: 48,
    justifyContent: "center",
    padding: 12,
    borderRadius: 3,
  },
  navSelected: { backgroundColor: colors.pink },
  navText: { fontFamily: fonts.medium, color: colors.burgundy, fontSize: 17 },
  navDivider: { height: 1, backgroundColor: colors.line, marginVertical: 22 },
  mobileNav: { gap: 12, marginBottom: 22 },
  header: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 18,
    marginBottom: 26,
  },
  demo: { backgroundColor: colors.pink, padding: 14, marginBottom: 24 },
  filters: {
    gap: 14,
    marginBottom: 24,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
    paddingVertical: 24,
  },
  contentRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: colors.line,
    paddingVertical: 20,
  },
  itemTitle: {
    fontFamily: fonts.medium,
    color: colors.ink,
    fontSize: 20,
    lineHeight: 26,
  },
  itemActions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  notice: {
    padding: 16,
    backgroundColor: colors.white,
    borderLeftWidth: 3,
    borderLeftColor: colors.burgundy,
    marginBottom: 20,
    gap: 12,
  },
  noticeText: {
    color: colors.burgundy,
    fontFamily: fonts.medium,
    fontSize: 17,
  },
  error: { color: "#8F1D30", fontFamily: fonts.medium, fontSize: 16 },
  pending: { marginTop: 32, padding: 22, backgroundColor: "#F3EBE7", gap: 16 },
});

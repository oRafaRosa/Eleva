import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  ReduceMotion,
} from "react-native-reanimated";
import { Body, Title, Button, Field, Chip, s } from "../ui";
import { colors, fonts } from "../../theme";
import type {
  Publication,
  PublicationDraft,
  PublicationType,
  Pillar,
} from "../../types/domain";
import {
  typeLabels,
  pillarLabels,
  localDate,
  scheduleFields,
  scheduledInstant,
  validateDraft,
  displayTime,
} from "./editorial";

type Props = {
  item: Publication | null;
  onClose: () => void;
  onSave: (draft: PublicationDraft) => Promise<void>;
  demo: boolean;
};
export function PublicationEditor({ item, onClose, onSave, demo }: Props) {
  const [title, setTitle] = useState(item?.title || "");
  const [summary, setSummary] = useState(item?.summary || "");
  const [body, setBody] = useState(item?.body || "");
  const [type, setType] = useState<PublicationType>(item?.type || "devotional");
  const [pillar, setPillar] = useState<Pillar>(item?.pillar || "spirit");
  const [reference, setReference] = useState(
    item?.reference_date || localDate(),
  );
  const [details, setDetails] = useState<Record<string, unknown>>(
    item?.details || {},
  );
  const [media, setMedia] = useState(item?.media_url || "");
  const initialSchedule = scheduleFields(item?.scheduled_at || null);
  const [day, setDay] = useState(initialSchedule.day);
  const [time, setTime] = useState(initialSchedule.time);
  const [preview, setPreview] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [discard, setDiscard] = useState(false);
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const [error, setError] = useState("");
  const [intent, setIntent] = useState<"published" | "scheduled" | null>(null);
  const edit = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setDirty(true);
    setIntent(null);
  };
  const setDetail = (key: string, value: string) => {
    setDetails((v) => ({ ...v, [key]: value }));
    setDirty(true);
    setIntent(null);
  };
  const close = () => {
    if (busy) return;
    if (dirty) setDiscard(true);
    else onClose();
  };
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const prior = document.activeElement as HTMLElement | null;
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const dialog = document.getElementById("eleva-publication-editor");
      if (!dialog) return;
      const elements = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          "button, a[href], input, textarea, select, [tabindex]",
        ),
      ).filter(
        (element) =>
          element.tabIndex >= 0 &&
          !element.hasAttribute("disabled") &&
          element.getClientRects().length > 0,
      );
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first) return;
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    const leaving = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    document.addEventListener("keydown", keyboard, true);
    window.addEventListener("beforeunload", leaving);
    return () => {
      document.removeEventListener("keydown", keyboard, true);
      window.removeEventListener("beforeunload", leaving);
      prior?.focus();
    };
  }, []);
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  function makeDraft(status: PublicationDraft["status"]): PublicationDraft {
    const contentDetails = { ...details };
    if (type === "training" && details.duration_minutes)
      contentDetails.duration_minutes = Number(details.duration_minutes);
    return {
      ...(item?.id ? { id: item.id } : {}),
      title: title.trim(),
      summary: summary.trim(),
      body: body.trim(),
      type,
      pillar,
      status,
      details: contentDetails,
      reference_date: type === "devotional" ? reference : null,
      media_url: media.trim() || null,
      cover_path: item?.cover_path || null,
      scheduled_at: status === "scheduled" ? scheduledInstant(day, time) : null,
    };
  }
  async function save(status: PublicationDraft["status"]) {
    if (saving.current) return;
    setError("");
    try {
      const draft = makeDraft(status);
      validateDraft(draft);
      saving.current = true;
      setBusy(true);
      await onSave(draft);
      setDirty(false);
      onClose();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Não foi possível salvar. Tente novamente.",
      );
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }
  const requestPublish = (next: "published" | "scheduled") => {
    try {
      validateDraft(makeDraft(next));
      setError("");
      setIntent(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Confira os campos.");
    }
  };
  const detailField = (label: string, key: string, multiline = true) => (
    <Field
      key={key}
      label={label}
      value={String(details[key] || "")}
      onChangeText={(v) => setDetail(key, v)}
      multiline={multiline}
      style={multiline ? styles.multiline : undefined}
      editable={!busy}
    />
  );
  return (
    <Modal visible transparent animationType="none" onRequestClose={close}>
      <View style={styles.scrim}>
        <Animated.View
          entering={FadeIn.duration(180)
            .easing(Easing.bezier(0.23, 1, 0.32, 1))
            .reduceMotion(ReduceMotion.System)}
          nativeID="eleva-publication-editor"
          style={styles.dialog}
          accessibilityViewIsModal
        >
          <View style={styles.heading}>
            <Title small>
              {preview
                ? "Prévia para a integrante"
                : item?.id
                  ? "Editar conteúdo"
                  : "Novo conteúdo"}
            </Title>
            <Button label="Fechar" secondary onPress={close} disabled={busy} />
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.form}
          >
            {demo && (
              <Body muted>
                Conteúdo de demonstração. As alterações ficam neste navegador. O
                agendamento automático depende do servidor.
              </Body>
            )}
            {discard ? (
              <View style={s.panel}>
                <Title small>Sair sem salvar?</Title>
                <Body>As alterações neste conteúdo serão descartadas.</Body>
                <Button
                  label="Continuar editando"
                  onPress={() => setDiscard(false)}
                />
                <Button
                  label="Descartar alterações"
                  secondary
                  onPress={onClose}
                />
              </View>
            ) : (
              <>
                {preview ? (
                  <View style={styles.preview}>
                    <Body muted>
                      {typeLabels[type]} / {pillarLabels[pillar]}
                    </Body>
                    {type === "devotional" && <Body muted>{reference}</Body>}
                    <Title style={{ marginVertical: 18 }}>
                      {title || "Título do conteúdo"}
                    </Title>
                    {!!summary && (
                      <Body style={{ marginBottom: 22 }}>{summary}</Body>
                    )}
                    {type === "devotional" && !!details.verse && (
                      <Body style={styles.verse}>{String(details.verse)}</Body>
                    )}
                    <Body style={styles.reading}>
                      {body || "O conteúdo aparecerá aqui."}
                    </Body>
                    {Object.entries(details)
                      .filter(([key, value]) => key !== "verse" && !!value)
                      .map(([key, value]) => (
                        <View key={key} style={{ marginTop: 22 }}>
                          <Text style={styles.label}>
                            {(
                              {
                                application: "Para hoje",
                                prayer: "Oração",
                                duration_minutes: "Duração em minutos",
                                level: "Nível",
                                equipment: "Equipamentos",
                                exercises: "Exercícios",
                                instructions: "Orientações",
                                author: "Autoria",
                                objective: "Objetivo",
                                professional: "Profissional responsável",
                              } as Record<string, string>
                            )[key] || key}
                          </Text>
                          <Body style={styles.reading}>{String(value)}</Body>
                        </View>
                      ))}
                    {!!media && (
                      <Body muted style={{ marginTop: 24 }}>
                        Mídia: {media}
                      </Body>
                    )}
                  </View>
                ) : (
                  <>
                    <Body muted>
                      Escolha o formato e preencha o conteúdo. Você pode salvar
                      agora e publicar depois.
                    </Body>
                    <Text style={styles.label}>Formato</Text>
                    <View style={s.row}>
                      {Object.entries(typeLabels).map(([key, label]) => (
                        <Chip
                          key={key}
                          label={label}
                          active={type === key}
                          onPress={() => {
                            if (busy || type === key) return;
                            setType(key as PublicationType);
                            setDetails({});
                            setDirty(true);
                            setIntent(null);
                          }}
                        />
                      ))}
                    </View>
                    <Text style={styles.label}>Pilar</Text>
                    <View style={s.row}>
                      {Object.entries(pillarLabels).map(([key, label]) => (
                        <Chip
                          key={key}
                          label={label}
                          active={pillar === key}
                          onPress={() => {
                            if (busy) return;
                            setPillar(key as Pillar);
                            setDirty(true);
                            setIntent(null);
                          }}
                        />
                      ))}
                    </View>
                    <Field
                      autoFocus
                      label="Título"
                      value={title}
                      onChangeText={edit(setTitle)}
                      editable={!busy}
                      maxLength={180}
                    />
                    <Field
                      label="Resumo (opcional)"
                      value={summary}
                      onChangeText={edit(setSummary)}
                      editable={!busy}
                      multiline
                      style={styles.multiline}
                    />
                    {type === "devotional" && (
                      <>
                        <Field
                          label="Dia do devocional (AAAA-MM-DD)"
                          value={reference}
                          onChangeText={edit(setReference)}
                          editable={!busy}
                          placeholder="2026-10-14"
                        />
                        {detailField("Versículo e referência", "verse")}
                      </>
                    )}
                    <Field
                      label={type === "devotional" ? "Reflexão" : "Conteúdo"}
                      value={body}
                      onChangeText={edit(setBody)}
                      editable={!busy}
                      multiline
                      style={[styles.multiline, { minHeight: 190 }]}
                    />
                    {type === "devotional" && (
                      <>
                        {detailField("Aplicação para o dia", "application")}
                        {detailField("Oração", "prayer")}
                      </>
                    )}
                    {type === "training" && (
                      <>
                        {detailField("Objetivo", "objective", false)}
                        {detailField(
                          "Duração em minutos",
                          "duration_minutes",
                          false,
                        )}
                        {detailField("Nível", "level", false)}
                        {detailField("Equipamentos", "equipment")}
                        {detailField(
                          "Exercícios, séries e repetições",
                          "exercises",
                        )}
                        {detailField(
                          "Orientações e adaptações",
                          "instructions",
                        )}
                        {detailField(
                          "Profissional responsável",
                          "professional",
                          false,
                        )}
                      </>
                    )}
                    {type === "motivation" &&
                      detailField("Autoria (opcional)", "author", false)}
                    <Field
                      label="Link da mídia (opcional, https://)"
                      value={media}
                      onChangeText={edit(setMedia)}
                      autoCapitalize="none"
                      editable={!busy}
                    />
                    <View style={styles.schedule}>
                      <Title small>Agendamento</Title>
                      <Body muted>
                        Fuso: America/Sao_Paulo. O conteúdo ficará disponível no
                        horário escolhido.
                      </Body>
                      <Field
                        label="Data de publicação (AAAA-MM-DD)"
                        value={day}
                        onChangeText={edit(setDay)}
                        editable={!busy}
                        placeholder="2026-10-14"
                      />
                      <Field
                        label="Horário (HH:MM)"
                        value={time}
                        onChangeText={edit(setTime)}
                        editable={!busy}
                        placeholder="07:00"
                      />
                    </View>
                  </>
                )}
                {!!error && (
                  <Text
                    accessibilityRole="alert"
                    accessibilityLiveRegion="assertive"
                    style={styles.error}
                  >
                    {error}
                  </Text>
                )}
                {intent && (
                  <View style={s.panel}>
                    <Body>
                      {intent === "published"
                        ? `Publicar “${title.trim()}” agora? As integrantes com acesso poderão ler o conteúdo.`
                        : `Agendar “${title.trim()}” para ${displayTime(scheduledInstant(day, time))}, no horário de São Paulo?`}
                    </Body>
                    <Button
                      label={
                        busy
                          ? "Salvando…"
                          : intent === "published"
                            ? "Confirmar publicação"
                            : "Confirmar agendamento"
                      }
                      disabled={busy}
                      onPress={() => void save(intent)}
                    />
                    <Button
                      label="Voltar ao conteúdo"
                      secondary
                      disabled={busy}
                      onPress={() => setIntent(null)}
                    />
                  </View>
                )}
                <View style={styles.actions}>
                  <Button
                    label={preview ? "Voltar à edição" : "Ver prévia"}
                    secondary
                    disabled={busy}
                    onPress={() => {
                      setPreview((v) => !v);
                      setIntent(null);
                    }}
                  />
                  <Button
                    label={busy ? "Salvando…" : "Salvar rascunho"}
                    secondary
                    disabled={busy}
                    onPress={() => void save("draft")}
                  />
                  <Button
                    label="Agendar"
                    disabled={busy}
                    onPress={() => requestPublish("scheduled")}
                  />
                  <Button
                    label="Publicar agora"
                    disabled={busy}
                    onPress={() => requestPublish("published")}
                  />
                </View>
                {item?.status === "published" && (
                  <Body muted>
                    Salvar como rascunho retira o conteúdo da área das
                    integrantes.
                  </Body>
                )}
              </>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: "rgba(48,37,42,.45)",
    justifyContent: "center",
    padding: 12,
  },
  dialog: {
    maxWidth: 930,
    width: "100%",
    maxHeight: "94%",
    alignSelf: "center",
    backgroundColor: colors.ivory,
    borderRadius: 6,
    overflow: "hidden",
  },
  heading: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  form: { padding: 22, gap: 18 },
  label: { fontFamily: fonts.medium, color: colors.ink, fontSize: 16 },
  multiline: { minHeight: 90, textAlignVertical: "top" },
  schedule: {
    paddingTop: 22,
    gap: 14,
    borderTopWidth: 1,
    borderColor: colors.line,
  },
  preview: {
    backgroundColor: colors.white,
    padding: 24,
    maxWidth: 420,
    width: "100%",
    alignSelf: "center",
  },
  reading: { fontSize: 18, lineHeight: 29 },
  verse: {
    fontFamily: fonts.serif,
    fontSize: 25,
    lineHeight: 31,
    color: colors.burgundy,
    paddingBottom: 24,
  },
  error: {
    color: "#8F1D30",
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 23,
  },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
});

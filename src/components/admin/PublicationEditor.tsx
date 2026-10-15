import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  StyleSheet,
  Platform,
  Image,
  Pressable,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  ReduceMotion,
} from "react-native-reanimated";
import { Body, Title, Button, Field, Chip, s } from "../ui";
import {
  pickPublicationCover,
  type PreparedCover,
} from "../../services/publicationCover";
import { readableValue } from "../../utils/publicationDetails";
import { PublicationBody } from "../PublicationBody";
import { DateControl } from "./DateControl";
import { ContentCover } from "../ui";
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
  const [coverPath, setCoverPath] = useState(item?.cover_path || null);
  const [coverUpload, setCoverUpload] = useState<PreparedCover | null>(null);
  const [pickingCover, setPickingCover] = useState(false);
  const [media, setMedia] = useState(item?.media_url || "");
  const initialSchedule = scheduleFields(item?.scheduled_at || null);
  const [day, setDay] = useState(initialSchedule.day);
  const [time, setTime] = useState(initialSchedule.time);
  const [formatOpen, setFormatOpen] = useState(false);
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [discard, setDiscard] = useState(false);
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const pickerLock = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
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
    if (busy || pickingCover) return;
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
      cover_path: coverPath,
      ...(coverUpload
        ? {
            cover_upload: {
              base64: coverUpload.base64,
              mimeType: coverUpload.mimeType,
            },
          }
        : {}),
      scheduled_at: status === "scheduled" ? scheduledInstant(day, time) : null,
    };
  }
  async function save(status: PublicationDraft["status"]) {
    if (saving.current || pickingCover) return;
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
  async function chooseCover() {
    if (busy || pickerLock.current) return;
    pickerLock.current = true;
    setPickingCover(true);
    setError("");
    try {
      const selected = await pickPublicationCover();
      if (!mounted.current) return;
      if (selected) {
        setCoverUpload(selected);
        setDirty(true);
        setIntent(null);
      }
    } catch (e) {
      if (!mounted.current) return;
      setError(
        e instanceof Error
          ? e.message
          : "Não foi possível abrir a imagem. Tente novamente.",
      );
    } finally {
      pickerLock.current = false;
      if (mounted.current) setPickingCover(false);
    }
  }
  const requestPublish = (next: "published" | "scheduled") => {
    if (next === "scheduled" && !scheduleOpen) {
      setScheduleOpen(true);
      setPreview(false);
      setIntent(null);
      return;
    }
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
      value={readableValue(details[key])}
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
            <Button
              label="Fechar"
              secondary
              onPress={close}
              disabled={busy || pickingCover}
            />
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets
            contentContainerStyle={styles.form}
          >
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
                    {coverUpload ? (
                      <Image
                        source={{ uri: coverUpload.preview }}
                        accessibilityLabel="Imagem da publicação"
                        style={{
                          width: "100%",
                          height: 240,
                          borderRadius: 4,
                          marginBottom: 16,
                        }}
                        resizeMode="contain"
                      />
                    ) : coverPath ? (
                      <ContentCover path={coverPath} variant="detail" />
                    ) : null}
                    <Body muted>
                      {typeLabels[type]} / {pillarLabels[pillar]}
                    </Body>
                    {type === "devotional" && (
                      <Body muted>
                        {reference.split("-").reverse().join("/")}
                      </Body>
                    )}
                    <Title style={{ marginVertical: 18 }}>
                      {title || "Título do conteúdo"}
                    </Title>
                    <PublicationBody item={{ type, body, details, summary }} />
                    {!!media && (
                      <Body muted style={{ marginTop: 24 }}>
                        Mídia: {media}
                      </Body>
                    )}
                  </View>
                ) : (
                  <>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ expanded: formatOpen }}
                      disabled={busy || pickingCover}
                      onPress={() => setFormatOpen((v) => !v)}
                      style={styles.disclosure}
                    >
                      <Body>
                        {typeLabels[type]} / {pillarLabels[pillar]}
                      </Body>
                      <Text style={styles.disclosureText}>
                        {formatOpen ? "Recolher" : "Alterar"}
                      </Text>
                    </Pressable>
                    {formatOpen && (
                      <View style={{ gap: 12 }}>
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
                      </View>
                    )}
                    <Field
                      autoFocus
                      label="Título"
                      value={title}
                      onChangeText={edit(setTitle)}
                      editable={!busy}
                      maxLength={180}
                    />
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
                        <DateControl
                          label="Dia do devocional"
                          value={reference}
                          onChangeText={edit(setReference)}
                          disabled={busy}
                        />
                        {detailField("Versículo e referência", "verse")}
                      </>
                    )}
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
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ expanded: extrasOpen }}
                      disabled={busy || pickingCover}
                      onPress={() => setExtrasOpen((v) => !v)}
                      style={styles.disclosure}
                    >
                      <Text style={styles.label}>Imagem e outros campos</Text>
                      <Text style={styles.disclosureText}>
                        {extrasOpen ? "Recolher" : "Abrir"}
                      </Text>
                    </Pressable>
                    {!extrasOpen && (coverUpload || coverPath) && (
                      <Body muted>Imagem adicionada.</Body>
                    )}
                    {extrasOpen && (
                      <View style={{ gap: 14 }}>
                        <View style={{ gap: 10 }}>
                          {coverUpload ? (
                            <Image
                              source={{ uri: coverUpload.preview }}
                              accessibilityLabel="Imagem selecionada"
                              style={{
                                width: "100%",
                                height: 150,
                                borderRadius: 4,
                              }}
                              resizeMode="contain"
                            />
                          ) : coverPath ? (
                            <ContentCover path={coverPath} variant="banner" />
                          ) : null}
                          <View style={s.row}>
                            <Button
                              label={
                                pickingCover
                                  ? "Preparando imagem…"
                                  : coverUpload || coverPath
                                    ? "Trocar imagem"
                                    : "Adicionar imagem"
                              }
                              secondary
                              disabled={busy || pickingCover}
                              onPress={() => void chooseCover()}
                            />
                            {(coverUpload || coverPath) && (
                              <Button
                                label="Remover imagem"
                                secondary
                                disabled={busy || pickingCover}
                                onPress={() => {
                                  setCoverUpload(null);
                                  setCoverPath(null);
                                  setDirty(true);
                                  setIntent(null);
                                }}
                              />
                            )}
                          </View>
                        </View>
                        <Field
                          label="Resumo (opcional)"
                          value={summary}
                          onChangeText={edit(setSummary)}
                          editable={!busy}
                          multiline
                          style={styles.multiline}
                        />
                        <Field
                          label="Link da mídia (opcional, https://)"
                          value={media}
                          onChangeText={edit(setMedia)}
                          autoCapitalize="none"
                          editable={!busy}
                        />
                      </View>
                    )}
                    {item?.scheduled_at && (
                      <Body muted>
                        Agendamento atual: {displayTime(item.scheduled_at)} (São
                        Paulo).
                      </Body>
                    )}
                    {scheduleOpen && (
                      <View style={styles.schedule}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityState={{ expanded: true }}
                          disabled={busy || pickingCover}
                          onPress={() => {
                            setScheduleOpen(false);
                            setIntent(null);
                          }}
                          style={styles.disclosure}
                        >
                          <Text style={styles.label}>Agendamento</Text>
                          <Text style={styles.disclosureText}>Recolher</Text>
                        </Pressable>
                        <Body muted>
                          Horário de São Paulo (America/Sao_Paulo).
                        </Body>
                        <DateControl
                          label="Data de publicação"
                          value={day}
                          onChangeText={edit(setDay)}
                          disabled={busy}
                        />
                        <DateControl
                          kind="time"
                          label="Horário"
                          value={time}
                          onChangeText={edit(setTime)}
                          disabled={busy}
                        />
                      </View>
                    )}
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
                      disabled={busy || pickingCover}
                      onPress={() => void save(intent)}
                    />
                    <Button
                      label="Voltar ao conteúdo"
                      secondary
                      disabled={busy || pickingCover}
                      onPress={() => setIntent(null)}
                    />
                  </View>
                )}
                <View style={styles.actions}>
                  <Button
                    label={preview ? "Voltar à edição" : "Ver prévia"}
                    secondary
                    disabled={busy || pickingCover}
                    onPress={() => {
                      setPreview((v) => !v);
                      setIntent(null);
                    }}
                  />
                  <Button
                    label={busy ? "Salvando…" : "Salvar rascunho"}
                    secondary
                    disabled={busy || pickingCover}
                    onPress={() => void save("draft")}
                  />
                  <Button
                    label={scheduleOpen ? "Revisar agendamento" : "Agendar"}
                    disabled={busy || pickingCover}
                    onPress={() => requestPublish("scheduled")}
                  />
                  <Button
                    label="Publicar agora"
                    disabled={busy || pickingCover}
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
  form: { padding: 20, gap: 14 },
  disclosure: {
    minHeight: 48,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  disclosureText: {
    fontFamily: fonts.medium,
    color: colors.burgundy,
    fontSize: 15,
  },
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
  error: {
    color: "#8F1D30",
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 23,
  },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
});

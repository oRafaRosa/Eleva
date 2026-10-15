import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  ScrollView,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import { Body, Title, Field, Button, s } from "../ui";
import { colors } from "../../theme";
import type { Challenge, ChallengeDraft } from "../../types/domain";
import { validateChallengeDraft } from "../../services/challengeValidation";
import { DateControl } from "./DateControl";
import { localDate } from "./editorial";

type Props = {
  item: Challenge | null;
  onClose: () => void;
  onSave: (draft: ChallengeDraft) => Promise<void>;
};
export function ChallengeEditor({ item, onClose, onSave }: Props) {
  const [title, setTitle] = useState(item?.title || "");
  const [description, setDescription] = useState(item?.description || "");
  const [starts, setStarts] = useState(item?.starts_on || localDate());
  const [ends, setEnds] = useState(item?.ends_on || localDate());
  const [link, setLink] = useState(item?.gymrats_url || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState<Challenge["status"] | null>(null);
  const [dirty, setDirty] = useState(false);
  const [discard, setDiscard] = useState(false);
  const saving = useRef(false);
  const edit = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    setDirty(true);
    setConfirm(null);
  };
  const draft = (status: Challenge["status"]): ChallengeDraft => ({
    ...(item ? { id: item.id } : {}),
    title,
    description,
    starts_on: starts,
    ends_on: ends,
    status,
    gymrats_url: link.trim() || null,
  });
  function request(status: Challenge["status"]) {
    try {
      validateChallengeDraft(draft(status));
      setError("");
      setConfirm(status);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Confira os campos.");
    }
  }
  async function save(status: Challenge["status"]) {
    if (saving.current) return;
    try {
      const content = draft(status);
      validateChallengeDraft(content);
      saving.current = true;
      setBusy(true);
      setError("");
      await onSave(content);
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
  const close = () => {
    if (busy) return;
    if (dirty) setDiscard(true);
    else onClose();
  };
  const closeRef = useRef(close);
  closeRef.current = close;
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  const priorFocus = useRef(
    Platform.OS === "web" && typeof document !== "undefined"
      ? (document.activeElement as HTMLElement | null)
      : null,
  );
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const dialog = document.getElementById("eleva-challenge-editor");
    dialog?.setAttribute("role", "dialog");
    dialog?.setAttribute("aria-modal", "true");
    dialog?.setAttribute("aria-label", "Editor de desafio");
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
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
      const first = elements[0],
        last = elements[elements.length - 1];
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
      priorFocus.current?.focus();
    };
  }, []);
  return (
    <Modal visible transparent animationType="none" onRequestClose={close}>
      <View style={styles.scrim}>
        <View
          nativeID="eleva-challenge-editor"
          accessibilityViewIsModal
          style={styles.dialog}
        >
          <View style={styles.heading}>
            <Title small>{item ? "Editar desafio" : "Novo desafio"}</Title>
            <Button label="Fechar" secondary disabled={busy} onPress={close} />
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
                <Body>As alterações deste desafio serão descartadas.</Body>
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
                <Field
                  autoFocus
                  label="Título"
                  value={title}
                  onChangeText={edit(setTitle)}
                  maxLength={120}
                  editable={!busy}
                />
                <Field
                  label="Descrição"
                  maxLength={3000}
                  value={description}
                  onChangeText={edit(setDescription)}
                  multiline
                  editable={!busy}
                  style={{ minHeight: 100, textAlignVertical: "top" }}
                />
                <DateControl
                  label="Início"
                  value={starts}
                  onChangeText={edit(setStarts)}
                  disabled={busy}
                />
                <DateControl
                  label="Fim"
                  value={ends}
                  onChangeText={edit(setEnds)}
                  disabled={busy}
                />
                <Field
                  label="Link do GymRats (opcional)"
                  value={link}
                  onChangeText={edit(setLink)}
                  autoCapitalize="none"
                  editable={!busy}
                  placeholder="https://share.gymrats.app/join?code=..."
                />
                {!!error && (
                  <Text accessibilityRole="alert" style={{ color: "#8F1D30" }}>
                    {error}
                  </Text>
                )}
                {confirm && (
                  <View style={s.panel}>
                    <Body>
                      {confirm === "archived"
                        ? `Arquivar “${title}”? O desafio deixará de aparecer para as integrantes.`
                        : `${confirm === "published" ? "Publicar" : "Salvar como rascunho"} “${title}”? ${confirm === "published" ? "As integrantes com acesso poderão abrir o desafio." : "O desafio ficará fora da área das integrantes."}`}
                    </Body>
                    <Button
                      label={
                        busy
                          ? "Salvando…"
                          : confirm === "archived"
                            ? "Confirmar arquivamento"
                            : confirm === "published"
                              ? "Confirmar publicação"
                              : "Salvar rascunho"
                      }
                      disabled={busy}
                      onPress={() => void save(confirm)}
                    />
                    <Button
                      label="Voltar à edição"
                      secondary
                      disabled={busy}
                      onPress={() => setConfirm(null)}
                    />
                  </View>
                )}
                <View style={s.row}>
                  <Button
                    label={busy ? "Salvando…" : "Salvar rascunho"}
                    secondary
                    disabled={busy}
                    onPress={() =>
                      item?.status === "published"
                        ? request("draft")
                        : void save("draft")
                    }
                  />
                  <Button
                    label="Publicar desafio"
                    disabled={busy}
                    onPress={() => request("published")}
                  />
                  {item && item.status !== "archived" && (
                    <Button
                      label="Arquivar"
                      secondary
                      disabled={busy}
                      onPress={() => request("archived")}
                    />
                  )}
                </View>
              </>
            )}
          </ScrollView>
        </View>
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
    maxWidth: 600,
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
    gap: 12,
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  form: { padding: 20, gap: 14 },
});

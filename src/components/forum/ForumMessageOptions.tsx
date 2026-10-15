import { useState } from "react";
import { Pressable, View } from "react-native";
import { Body, Button } from "../ui";
import { colors } from "../../theme";
import type {
  ForumTopic,
  ForumReply,
  ForumUser,
  ForumRepository,
} from "../../types/forum";

export function ForumMessageOptions({
  item,
  kind,
  user,
  demo,
  busy,
  action,
}: {
  item: ForumTopic | ForumReply;
  kind: "topic" | "reply";
  user: ForumUser;
  demo: boolean;
  busy: boolean;
  action: (
    work: (repository: ForumRepository) => Promise<unknown>,
    message?: string,
    committed?: () => void,
  ) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const mine = user.id === item.author_id || user.role === "admin";
  return (
    <View style={{ gap: 4 }}>
      <View
        style={{
          flexDirection: "row",
          gap: 12,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Body muted style={{ fontSize: 14, flex: 1 }}>
          {item.author_name} ·{" "}
          {new Date(item.created_at).toLocaleDateString("pt-BR")}
        </Body>
        {!item.deleted && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Opções da mensagem"
            accessibilityState={{ expanded: open, disabled: busy }}
            disabled={busy}
            onPress={() => {
              setOpen(!open);
              setConfirm(false);
            }}
            style={{ minHeight: 48, minWidth: 48, justifyContent: "center" }}
          >
            <Body muted style={{ fontSize: 15 }}>
              Opções
            </Body>
          </Pressable>
        )}
      </View>
      {open && !item.deleted && (
        <View style={{ flexDirection: "row", gap: 20, flexWrap: "wrap" }}>
          {mine && (
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={() => setConfirm(true)}
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
                (r) => r.report(kind, item.id),
                demo
                  ? "Mensagem sinalizada nesta prévia."
                  : "Denúncia enviada para revisão.",
                () => setOpen(false),
              )
            }
            style={{ minHeight: 48, justifyContent: "center" }}
          >
            <Body muted>Denunciar</Body>
          </Pressable>
        </View>
      )}
      {confirm && !item.deleted && (
        <View style={{ gap: 10 }}>
          <Body>Remover esta mensagem? As respostas serão mantidas.</Body>
          <Button
            label="Confirmar remoção"
            disabled={busy}
            onPress={() =>
              void action(
                (r) => r.remove(kind, item.id),
                "Mensagem removida.",
                () => {
                  setConfirm(false);
                  setOpen(false);
                },
              )
            }
          />
          <Button
            secondary
            label="Manter mensagem"
            disabled={busy}
            onPress={() => setConfirm(false)}
          />
        </View>
      )}
    </View>
  );
}

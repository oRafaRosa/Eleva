import { useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import {
  Page,
  Body,
  Title,
  Section,
  Chip,
  Empty,
  Button,
  ErrorState,
} from "../../src/components/ui";
import { useEleva } from "../../src/state/AppProvider";
import { colors } from "../../src/theme";
import { ProfileAvatar } from "../../src/components/ProfileAvatar";
import { CompactPublicationRow } from "../../src/components/CompactPublicationRow";
import { availableCompletions } from "../../src/utils/memberExperience";
import { MotionBlock } from "../../src/components/MotionBlock";
export default function Profile() {
  const {
    user,
    favorites,
    completions,
    publications,
    logout,
    actionBusy,
    error,
    refresh,
  } = useEleva();
  const [accountOpen, setAccountOpen] = useState(false);
  const [libraryTab, setLibraryTab] = useState<"saved" | "completed">("saved");
  const [leaving, setLeaving] = useState(false);
  const [accountError, setAccountError] = useState("");
  const saved = publications.filter((publication) =>
    favorites.includes(publication.id),
  );
  const completed = availableCompletions(publications, completions);
  const shown = libraryTab === "saved" ? saved : completed;
  async function exit() {
    if (leaving) return;
    setLeaving(true);
    setAccountError("");
    try {
      await logout();
      router.replace("/login");
    } catch {
      setAccountError("Não foi possível sair da conta. Tente novamente.");
    } finally {
      setLeaving(false);
    }
  }
  return (
    <Page title="Meu ELEVA" animateHeading>
      <MotionBlock
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 18,
          paddingVertical: 8,
          marginBottom: 16,
        }}
      >
        <ProfileAvatar
          name={user?.full_name ?? ""}
          uri={user?.avatar_url}
          path={user?.avatar_path}
          size={76}
        />
        <View style={{ flex: 1, gap: 4 }}>
          <Title small>{user?.full_name}</Title>
          {!!user?.city && <Body muted>{user.city}</Body>}
        </View>
      </MotionBlock>
      <Button
        secondary
        label="Editar perfil"
        onPress={() => router.push("/profile-edit")}
      />
      <View style={{ marginTop: 8 }}>
        <Button
          tertiary
          label="Ver meu perfil na comunidade"
          onPress={() => {
            if (user) router.push(`/people/${user.id}`);
          }}
        />
      </View>
      <View style={{ marginTop: 16 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Opções da conta"
          accessibilityState={{ expanded: accountOpen }}
          onPress={() => setAccountOpen(!accountOpen)}
          style={{
            minHeight: 48,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottomWidth: 1,
            borderBottomColor: colors.line,
            paddingVertical: 12,
          }}
        >
          <Body>Conta</Body>
          <Body muted style={{ fontSize: 15 }}>
            {accountOpen ? "Ocultar" : "Mostrar"}
          </Body>
        </Pressable>
        {accountOpen && (
          <View style={{ gap: 12, paddingVertical: 16 }}>
            {user?.role === "admin" && (
              <Button
                secondary
                label="Abrir painel administrativo"
                onPress={() => router.push("/admin")}
              />
            )}
            <Button
              secondary
              label={leaving ? "Saindo…" : "Sair da conta"}
              disabled={leaving || actionBusy}
              onPress={() => void exit()}
            />
          </View>
        )}
        {!!accountError && <ErrorState text={accountError} onRetry={exit} />}
      </View>
      <Section title="Sua biblioteca" />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <Chip
          label={`Salvos (${saved.length})`}
          active={libraryTab === "saved"}
          onPress={() => setLibraryTab("saved")}
        />
        <Chip
          label={`Concluídos (${completed.length})`}
          active={libraryTab === "completed"}
          onPress={() => setLibraryTab("completed")}
        />
      </View>
      {!!error && <ErrorState text={error} onRetry={refresh} />}
      {shown.length ? (
        shown.map((publication) => (
          <CompactPublicationRow key={publication.id} item={publication} />
        ))
      ) : !error ? (
        <Empty
          text={
            libraryTab === "saved"
              ? "Use “Salvar” em um conteúdo para encontrá-lo aqui."
              : "Os conteúdos que você marcar como concluídos aparecem aqui."
          }
        />
      ) : null}
    </Page>
  );
}

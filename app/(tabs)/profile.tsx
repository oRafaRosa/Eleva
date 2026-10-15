import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import {
  Page,
  Body,
  Title,
  Section,
  PublicationCard,
  Empty,
  Button,
  ErrorState,
} from "../../src/components/ui";
import { useEleva } from "../../src/state/AppProvider";
import { colors, fonts } from "../../src/theme";
export default function Profile() {
  const { user, favorites, publications, logout, actionBusy, error, refresh } =
    useEleva();
  const [accountOpen, setAccountOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [accountError, setAccountError] = useState("");
  const saved = publications.filter((publication) =>
    favorites.includes(publication.id),
  );
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
    <Page title="Meu ELEVA">
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 18,
          paddingVertical: 8,
          marginBottom: 16,
        }}
      >
        <View
          style={{
            width: 76,
            height: 76,
            borderRadius: 38,
            overflow: "hidden",
            backgroundColor: colors.pink,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {user?.avatar_url ? (
            <Image
              source={{ uri: user.avatar_url }}
              accessibilityLabel="Sua foto de perfil"
              style={{ width: 76, height: 76 }}
            />
          ) : (
            <Text
              style={{
                fontFamily: fonts.serif,
                fontSize: 34,
                color: colors.burgundy,
              }}
            >
              {user?.full_name.slice(0, 1).toUpperCase()}
            </Text>
          )}
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Title small>{user?.full_name}</Title>
          {!!user?.city && <Body muted>{user.city}</Body>}
        </View>
      </View>
      <Button
        secondary
        label="Editar perfil"
        onPress={() => router.push("/profile-edit")}
      />
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
      <Section title="Salvos para depois" />
      {!!error && <ErrorState text={error} onRetry={refresh} />}
      {saved.length ? (
        saved.map((publication) => (
          <PublicationCard key={publication.id} item={publication} />
        ))
      ) : !error ? (
        <Empty text="Use “Salvar” em um conteúdo para encontrá-lo aqui." />
      ) : null}
    </Page>
  );
}

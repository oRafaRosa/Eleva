import { Image, Text, View } from "react-native";
import { router } from "expo-router";
import {
  Page,
  Body,
  Title,
  Section,
  PublicationCard,
  Empty,
  Button,
} from "../../src/components/ui";
import { useEleva } from "../../src/state/AppProvider";
import { colors, fonts } from "../../src/theme";
export default function Profile() {
  const { user, favorites, publications, logout } = useEleva();
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
      <Section title="Salvos para depois" />
      {publications
        .filter((p) => favorites.includes(p.id))
        .map((p) => (
          <PublicationCard key={p.id} item={p} />
        ))}
      {!favorites.length && (
        <Empty text="Use “Salvar” em um conteúdo para encontrá-lo aqui." />
      )}
      <View style={{ gap: 12, marginTop: 32 }}>
        {user?.role === "admin" && (
          <Button
            label="Abrir painel administrativo"
            onPress={() => router.push("/admin")}
          />
        )}
        <Button
          secondary
          label="Sair da conta"
          onPress={() => void logout().then(() => router.replace("/login"))}
        />
      </View>
    </Page>
  );
}

import { View } from "react-native";
import { router } from "expo-router";
import {
  Page,
  Body,
  Title,
  Section,
  PublicationCard,
  Empty,
  Button,
  s,
} from "../../src/components/ui";
import { useEleva } from "../../src/state/AppProvider";
export default function Profile() {
  const { user, isDemo, favorites, completions, publications, logout } =
    useEleva();
  return (
    <Page kicker="Seu espaço" title="Meu ELEVA">
      <View style={s.panel}>
        <Title small>{user?.full_name || "Visitante"}</Title>
        <Body muted>
          {isDemo
            ? "Você está explorando uma prévia com dados de exemplo."
            : "Sua conta na ELEVA"}
        </Body>
        <Body>
          {completions.length}{" "}
          {completions.length === 1
            ? "conteúdo concluído"
            : "conteúdos concluídos"}
        </Body>
        {!user && (
          <Button
            label="Entrar na minha conta"
            onPress={() => router.push("/login")}
          />
        )}
      </View>
      <Section title="Salvos para depois" />
      {publications
        .filter((p) => favorites.includes(p.id))
        .map((p) => (
          <PublicationCard key={p.id} item={p} />
        ))}
      {!favorites.length && (
        <Empty text="Use “Salvar” em um conteúdo para encontrá-lo aqui." />
      )}
      <Section title="Conta" />
      {user?.role === "admin" && (
        <Button
          label="Abrir painel administrativo"
          onPress={() => router.push("/admin")}
        />
      )}
      <View style={{ marginTop: 12 }}>
        <Button
          secondary
          label={isDemo ? "Sair da prévia" : "Sair da conta"}
          onPress={() => {
            void logout().then(() => router.replace("/login"));
          }}
        />
      </View>
    </Page>
  );
}

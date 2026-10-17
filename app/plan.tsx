import React, { useState } from "react";
import { View, Linking, Image } from "react-native";
import { Redirect } from "expo-router";
import { Page, Title, Body, Button, Empty } from "../src/components/ui";
import { useEleva } from "../src/state/AppProvider";
import { clubLinks } from "../src/components/public/links";
import { colors } from "../src/theme";
export default function Plan() {
  const { user, refresh, logout, loading } = useEleva();
  const [error, setError] = useState("");
  if (user?.plan === "pro") return <Redirect href="/(tabs)/home" />;
  async function contact() {
    setError("");
    try {
      await Linking.openURL(clubLinks.salesWhatsapp);
    } catch {
      setError("Não foi possível abrir o WhatsApp. Tente novamente.");
    }
  }
  return (
    <Page title="Seu próximo passo na ELEVA">
      <View style={{ gap: 24 }}>
        <Body muted>
          Olá, {user?.full_name.split(" ")[0] || "bem-vinda"}. Sua conta está no
          plano FREE.
        </Body>
        <View style={{ backgroundColor: colors.pink, padding: 24, gap: 16 }}>
          <Image
            source={require("../assets/brand/seal.png")}
            style={{ width: 64, height: 64 }}
            accessibilityLabel="Carimbo ELEVA"
          />
          <Title small>Faça parte do ELEVA PRO</Title>
          <Body>
            Conteúdos sobre corpo, mente e espírito, devocionais, aulas,
            desafios, encontros e comunidade.
          </Body>
          <Body>
            Fale com a equipe para conhecer o plano e concluir sua contratação.
            Após a confirmação, elas liberam seu acesso por aqui.
          </Body>
          <Button
            label="Fechar o plano pelo WhatsApp"
            onPress={() => void contact()}
          />
        </View>
        <Body muted>
          Já contratou? Atualize seu acesso depois que a equipe confirmar a
          liberação.
        </Body>
        <Button
          label={loading ? "Verificando…" : "Atualizar meu acesso"}
          disabled={loading}
          onPress={() => {
            setError("");
            void refresh().catch(() =>
              setError("Não foi possível verificar. Tente novamente."),
            );
          }}
          secondary
        />
        {!!error && <Empty text={error} />}
        <Button
          label="Sair da conta"
          secondary
          onPress={() =>
            void logout().catch(() =>
              setError("Não foi possível sair. Tente novamente."),
            )
          }
        />
      </View>
    </Page>
  );
}

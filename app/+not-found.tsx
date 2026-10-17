import { View } from "react-native";
import { router } from "expo-router";
import { Page, Body, Button } from "../src/components/ui";
import { useEleva } from "../src/state/AppProvider";
export default function NotFound() {
  const { user } = useEleva();
  return (
    <Page layout="form" title="Esta página não está disponível.">
      <View style={{ gap: 20 }}>
        <Body>
          Volte ao início para encontrar os conteúdos e as atividades da ELEVA.
        </Body>
        <Button
          label="Voltar ao início"
          onPress={() => router.replace(user ? "/(tabs)/home" : "/")}
        />
      </View>
    </Page>
  );
}

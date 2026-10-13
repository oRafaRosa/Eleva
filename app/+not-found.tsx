import { router } from "expo-router";
import { Page, Body, Button } from "../src/components/ui";
export default function NotFound() {
  return (
    <Page title="Esta página não está disponível.">
      <Body>
        Volte ao início para encontrar os conteúdos e as atividades da ELEVA.
      </Body>
      <Button label="Voltar ao início" onPress={() => router.replace("/")} />
    </Page>
  );
}

import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Page, Body, Field, Button, Empty } from "../src/components/ui";
import { useEleva } from "../src/state/AppProvider";
export default function Login() {
  const { login, enterDemo, isDemo } = useEleva();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit() {
    if (!email.trim() || !password) {
      setError("Preencha o e-mail e a senha para entrar.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await login(email.trim(), password);
      router.replace("/(tabs)/home");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Não foi possível entrar. Tente novamente.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page back kicker="Bem-vinda de volta" title="Entrar na ELEVA">
      <Body muted style={{ marginBottom: 25 }}>
        Use o e-mail cadastrado pela equipe.
      </Body>
      <View style={{ gap: 20 }}>
        <Field
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="voce@email.com"
        />
        <Field
          label="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
          placeholder="Sua senha"
        />
        {!!error && <Empty text={error} />}
        <Button
          label={busy ? "Entrando…" : "Entrar"}
          onPress={() => void submit()}
          disabled={busy}
        />
        {isDemo && (
          <>
            <Body muted>
              O acesso por senha será ativado quando o ambiente estiver
              conectado. Você pode conhecer a prévia agora.
            </Body>
            <Button
              secondary
              label="Abrir prévia"
              onPress={() => {
                enterDemo();
                router.replace("/(tabs)/home");
              }}
            />
          </>
        )}
      </View>
    </Page>
  );
}

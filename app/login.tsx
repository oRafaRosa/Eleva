import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import {
  Page,
  Body,
  Title,
  Field,
  Button,
  Empty,
  s,
} from "../src/components/ui";
import { useEleva } from "../src/state/AppProvider";
import { isBackendConfigured } from "../src/services";
import type { DemoAccount } from "../src/services/demoRepository";
import { colors } from "../src/theme";

export default function Login() {
  const { login, enterDemo } = useEleva();
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
  async function preview(account: DemoAccount) {
    setBusy(true);
    setError("");
    try {
      await enterDemo(account);
      router.replace(account === "rebeca" ? "/admin" : "/(tabs)/home");
    } catch {
      setError("Não foi possível entrar. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page back kicker="Acesso à plataforma" title="Entrar na ELEVA">
      {isBackendConfigured && (
        <View style={{ gap: 20, marginBottom: 30 }}>
          <Body muted>Use o e-mail cadastrado pela equipe.</Body>
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
          <Button
            label={busy ? "Entrando…" : "Entrar"}
            onPress={() => void submit()}
            disabled={busy}
          />
        </View>
      )}
      <Body muted style={{ marginTop: 12, marginBottom: 22 }}>
        Preparei esta prévia para vocês testarem o app. Escolham um acesso, sem
        senha. Os conteúdos e as ações são exemplos.
      </Body>
      <View style={{ gap: 16 }}>
        <View
          style={[s.panel, { backgroundColor: colors.pink, borderWidth: 0 }]}
        >
          <Title small>Marina</Title>
          <Body>Integrante</Body>
          <Button
            label="Entrar como Marina"
            disabled={busy}
            onPress={() => void preview("marina")}
          />
        </View>
        <View style={s.panel}>
          <Title small>Rebeca</Title>
          <Body>Administradora</Body>
          <Button
            secondary
            label="Entrar como Rebeca"
            disabled={busy}
            onPress={() => void preview("rebeca")}
          />
        </View>
        {!!error && <Empty text={error} />}
      </View>
    </Page>
  );
}

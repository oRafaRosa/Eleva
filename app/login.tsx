import { useState, useRef } from "react";
import { View, TextInput } from "react-native";
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
  const { login, enterDemo, authStatus, error: accessError } = useEleva();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const passwordRef = useRef<TextInput>(null);
  async function submit() {
    if (lock.current) return;
    if (!email.trim() || !password) {
      setError("Preencha o e-mail e a senha para entrar.");
      return;
    }
    lock.current = true;
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
      lock.current = false;
      setBusy(false);
    }
  }
  async function preview(account: DemoAccount) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await enterDemo(account);
      router.replace(account === "rebeca" ? "/admin" : "/(tabs)/home");
    } catch {
      setError("Não foi possível entrar. Tente novamente.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <Page back backHref="/" title="Entrar na ELEVA">
      {authStatus === "denied" && !!accessError && <Empty text={accessError} />}
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
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <Field
            label="Senha"
            ref={passwordRef}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
            placeholder="Sua senha"
            returnKeyType="go"
            onSubmitEditing={() => void submit()}
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
          <Title small>Jeice</Title>
          <Body>Integrante</Body>
          <Button
            label="Entrar como Jeice"
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

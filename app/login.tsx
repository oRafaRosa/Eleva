import React, { useRef, useState } from "react";
import { View, TextInput } from "react-native";
import { router, Redirect } from "expo-router";
import { Page, Body, Button, Field, Empty } from "../src/components/ui";
import { useEleva } from "../src/state/AppProvider";
import { supabase } from "../src/services";
import { production } from "../src/services/production";
import { validateCredentials, authError } from "../src/services/authValidation";
export default function Login() {
  const { login, user, loading } = useEleva();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const passwordRef = useRef<TextInput>(null);
  const lock = useRef(false);
  if (user && !loading)
    return (
      <Redirect
        href={
          user.banned
            ? "/plan"
            : user.plan === "free"
              ? "/plan"
              : "/(tabs)/home"
        }
      />
    );
  async function submit(action: "login" | "reset" | "resend") {
    if (lock.current) return;
    setError("");
    setMessage("");
    try {
      const safeEmail = validateCredentials(
        email,
        action === "login" ? password : undefined,
      );
      lock.current = true;
      setBusy(true);
      if (action === "login") {
        await login(safeEmail, password);
      } else {
        if (!supabase)
          throw new Error("Não foi possível conectar. Tente novamente.");
        const result =
          action === "reset"
            ? await supabase.auth.resetPasswordForEmail(safeEmail, {
                redirectTo: `${production.siteUrl}/reset-password/`,
              })
            : await supabase.auth.resend({
                type: "signup",
                email: safeEmail,
                options: { emailRedirectTo: `${production.siteUrl}/auth/` },
              });
        if (result.error) throw new Error(authError(result.error));
        setMessage(
          action === "reset"
            ? "Se houver uma conta para este e-mail, você receberá um link para criar outra senha."
            : "Se houver um cadastro pendente, você receberá um e-mail de confirmação.",
        );
      }
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
  return (
    <Page back backHref="/" title="Entrar na ELEVA">
      <View style={{ gap: 20 }}>
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
          onSubmitEditing={() => void submit("login")}
        />
        {!!error && <Empty text={error} />}
        {!!message && <Body>{message}</Body>}
        <Button
          label={busy ? "Aguarde…" : "Entrar"}
          disabled={busy}
          onPress={() => void submit("login")}
        />
        <Button
          label="Criar minha conta"
          secondary
          disabled={busy}
          onPress={() => router.push("/signup")}
        />
        <Button
          label="Esqueci minha senha"
          secondary
          disabled={busy}
          onPress={() => void submit("reset")}
        />
        <Button
          label="Reenviar confirmação de e-mail"
          secondary
          disabled={busy}
          onPress={() => void submit("resend")}
        />
      </View>
    </Page>
  );
}

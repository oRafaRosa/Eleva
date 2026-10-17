import React, { useRef, useState } from "react";
import { View, TextInput } from "react-native";
import { router, Redirect } from "expo-router";
import { Page, Body, Field, Button, Empty } from "../src/components/ui";
import { supabase } from "../src/services";
import { useEleva } from "../src/state/AppProvider";
import { production } from "../src/services/production";
import {
  validateCredentials,
  validateNewPassword,
  authError,
} from "../src/services/authValidation";
export default function Signup() {
  const { user } = useEleva();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const emailRef = useRef<TextInput>(null),
    passwordRef = useRef<TextInput>(null),
    confirmRef = useRef<TextInput>(null),
    lock = useRef(false);
  if (user) return <Redirect href="/plan" />;
  async function submit() {
    if (lock.current) return;
    setError("");
    try {
      if (name.trim().length < 2 || name.trim().length > 120)
        throw new Error("Preencha seu nome, entre 2 e 120 caracteres.");
      const safeEmail = validateCredentials(email);
      validateNewPassword(password, confirmation);
      lock.current = true;
      setBusy(true);
      if (!supabase)
        throw new Error("Não foi possível conectar. Tente novamente.");
      const { data, error } = await supabase.auth.signUp({
        email: safeEmail,
        password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: `${production.siteUrl}/auth/`,
        },
      });
      if (error) throw new Error(authError(error));
      setPassword("");
      setConfirmation("");
      if (data.session) router.replace("/plan");
      else setSent(true);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Não foi possível criar sua conta. Tente novamente.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <Page
      layout="form"
      back
      backHref="/login"
      title={sent ? "Confirme seu e-mail" : "Crie sua conta"}
    >
      {sent ? (
        <View style={{ gap: 20 }}>
          <Body>
            Confira sua caixa de entrada e o spam. Se este e-mail ainda não
            estiver cadastrado, você receberá um link para confirmar a conta.
          </Body>
          <Body>
            Depois de confirmar, entre com sua senha. Seu acesso começa no plano
            FREE.
          </Body>
          <Button
            label="Ir para o login"
            onPress={() => router.replace("/login")}
          />
        </View>
      ) : (
        <View style={{ gap: 20 }}>
          <Body muted>
            Seu cadastro é gratuito. Para acessar os conteúdos, você poderá
            contratar o PRO com a equipe pelo WhatsApp.
          </Body>
          <Field
            label="Nome"
            value={name}
            onChangeText={setName}
            autoComplete="name"
            maxLength={120}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => emailRef.current?.focus()}
          />
          <Field
            label="E-mail"
            ref={emailRef}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
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
            autoComplete="new-password"
            placeholder="Pelo menos 10 caracteres"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => confirmRef.current?.focus()}
          />
          <Field
            label="Confirme a senha"
            ref={confirmRef}
            value={confirmation}
            onChangeText={setConfirmation}
            secureTextEntry
            autoComplete="new-password"
            returnKeyType="go"
            onSubmitEditing={() => void submit()}
          />
          {!!error && <Empty text={error} />}
          <Button
            label={busy ? "Criando conta…" : "Criar conta FREE"}
            disabled={busy}
            onPress={() => void submit()}
          />
        </View>
      )}
    </Page>
  );
}

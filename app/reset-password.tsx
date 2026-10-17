import React, { useState, useRef } from "react";
import { router } from "expo-router";
import { Page, Body, Field, Button, Empty } from "../src/components/ui";
import { supabase } from "../src/services";
import { validateNewPassword, authError } from "../src/services/authValidation";
export default function ResetPassword() {
  const [password, setPassword] = useState(""),
    [confirm, setConfirm] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [saved, setSaved] = useState(false);
  const lock = useRef(false);
  async function save() {
    if (lock.current) return;
    setError("");
    try {
      validateNewPassword(password, confirm);
      lock.current = true;
      setBusy(true);
      if (!supabase) throw new Error("Não foi possível conectar.");
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(authError(error));
      setPassword("");
      setConfirm("");
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <Page back backHref="/login" title="Criar outra senha">
      {saved ? (
        <>
          <Body>Sua senha foi atualizada.</Body>
          <Button
            label="Continuar"
            onPress={() => router.replace("/(tabs)/home")}
          />
        </>
      ) : (
        <>
          <Body>
            Abra esta página pelo link de recuperação enviado ao seu e-mail.
          </Body>
          <Field
            label="Nova senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            placeholder="Pelo menos 10 caracteres"
          />
          <Field
            label="Confirme a senha"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            autoComplete="new-password"
            onSubmitEditing={() => void save()}
          />
          {!!error && <Empty text={error} />}
          <Button
            label={busy ? "Salvando…" : "Salvar nova senha"}
            disabled={busy}
            onPress={() => void save()}
          />
        </>
      )}
    </Page>
  );
}

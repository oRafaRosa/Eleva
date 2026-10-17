import React, { useEffect, useState } from "react";
import { Redirect, useLocalSearchParams } from "expo-router";
import { Page, Body, Button, Loading } from "../src/components/ui";
import { useEleva } from "../src/state/AppProvider";
export default function AuthCallback() {
  const { user, loading, refresh } = useEleva();
  const params = useLocalSearchParams<{ error_description?: string }>();
  const [waiting, setWaiting] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setWaiting(false), 8000);
    return () => clearTimeout(timer);
  }, []);
  if (user)
    return <Redirect href={user.plan === "free" ? "/plan" : "/(tabs)/home"} />;
  if (!params.error_description && (loading || waiting)) return <Loading />;
  return (
    <Page title="Confirmação de e-mail">
      <Body>
        Se o link já foi utilizado, tente entrar com sua senha. Se ele expirou,
        peça outro e-mail de confirmação no login.
      </Body>
      <Button
        label="Verificar confirmação"
        onPress={() => {
          void refresh().catch(() => {});
        }}
      />
      <LoginLink />
    </Page>
  );
}
import { router } from "expo-router";
function LoginLink() {
  return (
    <Button
      label="Entrar com e-mail e senha"
      secondary
      onPress={() => router.replace("/login")}
    />
  );
}

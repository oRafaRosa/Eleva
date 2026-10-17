import React from "react";
import { Redirect, useSegments } from "expo-router";
import { useEleva } from "../state/AppProvider";
import { Body, Button, Loading, Page } from "./ui";
export function AccessBoundary({ children }: { children: React.ReactNode }) {
  const { user, sessionReady, loading, logout, error, refresh, authStatus } =
    useEleva();
  const segments = useSegments();
  const route = segments[0] as string | undefined;
  const publicRoute =
    !route ||
    ["index", "convite", "login", "signup", "auth", "reset-password"].includes(
      route,
    );
  if (publicRoute) return <>{children}</>;
  if (!sessionReady || (loading && !user)) return <Loading />;
  if (!user) {
    if (authStatus === "unknown")
      return (
        <Page title="Não foi possível verificar seu acesso">
          <Body>{error}</Body>
          <Button
            label="Tentar novamente"
            onPress={() => void refresh().catch(() => {})}
          />
          <Button label="Sair" secondary onPress={() => void logout()} />
        </Page>
      );
    return <Redirect href="/login" />;
  }
  if (user.banned)
    return (
      <Page title="Conta suspensa">
        <Body>O acesso desta conta foi suspenso pela equipe ELEVA.</Body>
        <Button label="Sair" onPress={() => void logout()} />
      </Page>
    );
  if (user.plan === "free" && route !== "plan")
    return <Redirect href="/plan" />;
  return <>{children}</>;
}

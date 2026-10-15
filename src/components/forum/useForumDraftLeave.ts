import { useEffect, useRef } from "react";
import { Alert, Platform } from "react-native";
import { router, useNavigation } from "expo-router";
import { usePreventRemove } from "expo-router/react-navigation";

export function useForumDraftLeave(
  dirty: boolean,
  busy: boolean,
  discard: () => void,
  enabled: boolean,
) {
  const navigation = useNavigation();
  const allowLeave = useRef(false);
  const latest = useRef({ dirty, busy, enabled });
  latest.current = { dirty, busy, enabled };
  useEffect(() => {
    if (!dirty && !busy) allowLeave.current = false;
  }, [dirty, busy]);
  function requestLeave(proceed: () => void) {
    if (latest.current.busy) {
      if (Platform.OS === "web" && typeof window !== "undefined")
        window.alert("Aguarde a publicação terminar.");
      else Alert.alert("Publicando", "Aguarde a publicação terminar.");
      return;
    }
    const leave = () => {
      allowLeave.current = true;
      discard();
      proceed();
    };
    if (!latest.current.dirty) {
      leave();
      return;
    }
    if (Platform.OS === "web") {
      if (
        typeof window !== "undefined" &&
        window.confirm("Descartar a mensagem que você está escrevendo?")
      )
        leave();
    } else
      Alert.alert(
        "Descartar mensagem?",
        "Sua mensagem ainda não foi publicada.",
        [
          { text: "Continuar escrevendo", style: "cancel" },
          { text: "Descartar", style: "destructive", onPress: leave },
        ],
      );
  }
  usePreventRemove(enabled && (dirty || busy), ({ data }) => {
    if (allowLeave.current) {
      navigation.dispatch(data.action);
      return;
    }
    requestLeave(() => navigation.dispatch(data.action));
  });
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    const leaving = (event: BeforeUnloadEvent) => {
      if (
        !latest.current.enabled ||
        allowLeave.current ||
        (!latest.current.dirty && !latest.current.busy)
      )
        return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", leaving);
    return () => window.removeEventListener("beforeunload", leaving);
  }, []);
  return (proceed?: () => void) =>
    requestLeave(
      proceed ??
        (() => {
          if (router.canGoBack()) router.back();
          else router.replace("/(tabs)/connect");
        }),
    );
}

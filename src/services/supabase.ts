import { authStorage } from "./authStorage";
import { createClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";

import { production } from "./production";
const url = process.env.EXPO_PUBLIC_SUPABASE_URL || production.url;
const key =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || production.publishableKey;
export const isBackendConfigured = Boolean(url && key);
export const supabase = isBackendConfigured
  ? createClient(url!, key!, {
      auth: {
        storage: authStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === "web",
        flowType: Platform.OS === "web" ? "implicit" : "pkce",
      },
    })
  : null;
// Browser refresh is managed by supabase-js. Native follows foreground state.
if (supabase && Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => {
    if (state === "active") supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}

/** Bucket paths are never public URLs. Call after access is checked by Storage RLS. */
export async function resolveContentAsset(path: string): Promise<string> {
  if (!supabase)
    throw new Error("Não foi possível abrir este conteúdo. Tente novamente.");
  const { data, error } = await supabase.storage
    .from("eleva-content")
    .createSignedUrl(path, 60);
  if (error) throw error;
  return data.signedUrl;
}

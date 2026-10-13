import { createDemoRepository } from "./demoRepository";
import { createSupabaseRepository } from "./supabaseRepository";
import { supabase, isBackendConfigured } from "./supabase";
export { supabase, isBackendConfigured };
export { createDemoRepository } from "./demoRepository";
export type { ElevaRepository, Activity, Access } from "./repository";
// Demo is opt-in; a live connection never falls back after an auth/server failure.
export function getRepository(
  options: { demo?: boolean; role?: "member" | "admin" } = {},
) {
  if (options.demo) return createDemoRepository(options.role);
  if (!supabase)
    throw new Error("Não foi possível abrir a plataforma. Tente novamente.");
  return createSupabaseRepository(supabase);
}

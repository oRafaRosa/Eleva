import React, { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { Redirect } from "expo-router";
import {
  Page,
  Body,
  Title,
  Field,
  Button,
  Empty,
  Loading,
  s,
} from "../src/components/ui";
import { supabase } from "../src/services";
import { useEleva } from "../src/state/AppProvider";
type Member = {
  user_id: string;
  full_name: string;
  email: string;
  plan: "free" | "pro";
  banned: boolean;
  role: "member" | "admin";
  active: boolean;
  expires_at: string | null;
  created_at: string;
  total_count: number;
};
type Action = "grant_pro" | "revoke_pro" | "ban" | "unban";
const labels: Record<Action, string> = {
  grant_pro: "Liberar PRO",
  revoke_pro: "Voltar para FREE",
  ban: "Banir conta",
  unban: "Remover banimento",
};
export default function Members() {
  const { user, loading: appLoading } = useEleva();
  const [search, setSearch] = useState(""),
    [query, setQuery] = useState(""),
    [offset, setOffset] = useState(0),
    [rows, setRows] = useState<Member[]>([]),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const [pending, setPending] = useState<{
    member: Member;
    action: Action;
  } | null>(null);
  const version = useRef(0),
    lock = useRef(false);
  const load = useCallback(async () => {
    const current = ++version.current;
    setLoading(true);
    setError("");
    setRows([]);
    try {
      if (!supabase || user?.role !== "admin") return;
      const { data, error } = await supabase.rpc("admin_list_members", {
        search_text: query,
        page_offset: offset,
      });
      if (error) throw error;
      if (current === version.current) setRows(data ?? []);
    } catch {
      if (current === version.current)
        setError("Não foi possível carregar as contas. Tente novamente.");
    } finally {
      if (current === version.current) setLoading(false);
    }
  }, [query, offset, user?.id, user?.role]);
  useEffect(() => {
    void load();
    return () => {
      version.current++;
    };
  }, [load]);
  if (appLoading && !user) return <Loading />;
  if (user?.role !== "admin") return <Redirect href="/(tabs)/home" />;
  async function save() {
    if (!pending || lock.current || !supabase) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    const change = pending;
    try {
      const { error } = await supabase.rpc("admin_change_member", {
        target_id: change.member.user_id,
        action_name: change.action,
      });
      if (error) throw error;
      setPending(null);
      setMessage("Alteração salva. O novo acesso já vale no banco.");
      await load();
    } catch {
      setError(
        "Não foi possível alterar a conta. Atualize a lista e tente novamente.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const total = rows[0]?.total_count ?? 0;
  return (
    <Page back backHref="/admin" title="Usuários">
      <View style={{ gap: 20 }}>
        <Body muted>
          Novas contas começam como FREE. Libere o PRO após confirmar a
          contratação. O banimento bloqueia o acesso mesmo de quem tem PRO.
        </Body>
        <Field
          label="Buscar por nome ou e-mail"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          returnKeyType="search"
          onSubmitEditing={() => {
            setOffset(0);
            setQuery(search.trim());
          }}
        />
        <Button
          label="Buscar usuários"
          disabled={busy}
          secondary
          onPress={() => {
            if (query === search.trim() && offset === 0) void load();
            else {
              setOffset(0);
              setQuery(search.trim());
            }
          }}
        />
        {!!error && (
          <>
            <Empty text={error} />
            <Button
              label="Atualizar lista"
              secondary
              onPress={() => void load()}
            />
          </>
        )}
        {!!message && <Body>{message}</Body>}
        {pending && (
          <View style={[s.panel, { gap: 16 }]}>
            <Title small>{labels[pending.action]}?</Title>
            <Body>{pending.member.full_name || pending.member.email}</Body>
            <Body>
              {pending.action === "ban"
                ? "A conta perderá o acesso aos conteúdos imediatamente. Você poderá remover o banimento depois."
                : pending.action === "revoke_pro"
                  ? "A conta verá apenas a página para contratar o plano."
                  : pending.action === "unban"
                    ? "A conta poderá entrar novamente, respeitando o plano atual."
                    : "A conta terá acesso aos conteúdos e à comunidade."}
            </Body>
            <Button
              label={busy ? "Salvando…" : "Confirmar alteração"}
              disabled={busy}
              onPress={() => void save()}
            />
            <Button
              label="Cancelar"
              disabled={busy}
              secondary
              onPress={() => setPending(null)}
            />
          </View>
        )}
        {loading ? (
          <Loading />
        ) : rows.length === 0 ? (
          <Empty text="Nenhuma conta encontrada." />
        ) : (
          <Body muted>{total} conta(s) encontradas</Body>
        )}
        {rows.map((member) => (
          <View key={member.user_id} style={[s.panel, { gap: 12 }]}>
            <Title small>{member.full_name || "Sem nome"}</Title>
            <Body>{member.email}</Body>
            <Body>
              {member.role === "admin"
                ? "Administradora"
                : member.banned
                  ? "Conta banida"
                  : member.active && member.plan === "pro"
                    ? "PRO"
                    : "FREE"}
              {member.banned && member.role === "admin" ? " · Banida" : ""}
            </Body>
            <Body muted>
              Cadastro:{" "}
              {new Date(member.created_at).toLocaleDateString("pt-BR")}
            </Body>
            {member.role !== "admin" && (
              <>
                <Button
                  label={
                    member.plan === "pro" ? labels.revoke_pro : labels.grant_pro
                  }
                  secondary
                  disabled={busy || Boolean(pending)}
                  onPress={() =>
                    setPending({
                      member,
                      action:
                        member.plan === "pro" ? "revoke_pro" : "grant_pro",
                    })
                  }
                />
                <Button
                  label={member.banned ? labels.unban : labels.ban}
                  secondary
                  disabled={busy || Boolean(pending)}
                  onPress={() =>
                    setPending({
                      member,
                      action: member.banned ? "unban" : "ban",
                    })
                  }
                />
              </>
            )}
          </View>
        ))}
        <View style={{ gap: 12 }}>
          {offset > 0 && (
            <Button
              label="Página anterior"
              secondary
              disabled={busy || loading}
              onPress={() => setOffset(Math.max(0, offset - 50))}
            />
          )}{" "}
          {offset + 50 < total && (
            <Button
              label="Próxima página"
              secondary
              disabled={busy || loading}
              onPress={() => setOffset(offset + 50)}
            />
          )}
        </View>
      </View>
    </Page>
  );
}

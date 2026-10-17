import { useCallback, useState } from "react";
import { Linking, Pressable, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useEleva } from "../../src/state/AppProvider";
import {
  Body,
  Button,
  Empty,
  ErrorState,
  Loading,
  Page,
  Section,
  Title,
  s,
} from "../../src/components/ui";
import { ProfileAvatar } from "../../src/components/ProfileAvatar";
import {
  getCommunityProfiles,
  getCommunityProfilePosts,
  type CommunityProfile,
} from "../../src/services/communityProfiles";
import {
  clubTenure,
  topCommunityPosts,
  whatsappUrl,
} from "../../src/services/communityProfileUtils";
import { createDemoForum } from "../../src/services/forum";
import type { ForumTopic } from "../../src/types/forum";
import { colors } from "../../src/theme";

export default function CommunityProfilePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isDemo } = useEleva();
  const [state, setState] = useState<{
    scope: string;
    profile: CommunityProfile | null;
    posts: ForumTopic[];
  } | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const scope = `${user?.id}:${isDemo}:${id}:${attempt}`;
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      setState(null);
      setError("");
      if (!user)
        return () => {
          alive = false;
        };
      async function load() {
        try {
          const [profile] = await getCommunityProfiles([id], isDemo);
          const posts = profile
            ? isDemo
              ? topCommunityPosts(
                  (await createDemoForum(user!).listTopics()).filter(
                    (t) => t.author_id === id,
                  ),
                )
              : await getCommunityProfilePosts(id)
            : [];
          if (alive) setState({ scope, profile: profile ?? null, posts });
        } catch {
          if (alive) setError("Não foi possível carregar este perfil.");
        }
      }
      void load();
      return () => {
        alive = false;
      };
    }, [scope, user?.id]),
  );
  const current = state?.scope === scope ? state : null;
  const profile = current?.profile;
  const whatsapp = whatsappUrl(profile?.whatsapp);
  return (
    <Page
      back
      backHref="/(tabs)/connect"
      layout="reading"
      title="Perfil na comunidade"
    >
      {error ? (
        <ErrorState text={error} onRetry={() => setAttempt((a) => a + 1)} />
      ) : !current ? (
        <Loading />
      ) : !profile ? (
        <Empty text="Este perfil não está disponível na comunidade." />
      ) : (
        <>
          <View style={{ gap: 20, paddingVertical: 16 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 20 }}
            >
              <ProfileAvatar
                name={profile.full_name}
                uri={profile.avatar_url}
                path={profile.avatar_path}
                size={96}
              />
              <View style={{ flex: 1, gap: 6 }}>
                <Title small>{profile.full_name}</Title>
                {!!profile.joined_at && (
                  <>
                    <Body>{clubTenure(profile.joined_at)}</Body>
                    <Body muted style={{ fontSize: 14 }}>
                      Desde{" "}
                      {new Date(profile.joined_at).toLocaleDateString("pt-BR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        timeZone: "America/Sao_Paulo",
                      })}
                    </Body>
                  </>
                )}
              </View>
            </View>
            {isDemo && <Body muted>Perfil de demonstração.</Body>}
            {whatsapp && (
              <View style={{ gap: 8 }}>
                <Body muted>{profile.whatsapp}</Body>
                <Button
                  secondary
                  label="Conversar no WhatsApp"
                  onPress={() =>
                    void Linking.openURL(whatsapp).catch(() =>
                      setError("Não foi possível abrir o WhatsApp."),
                    )
                  }
                />
              </View>
            )}
            {id === user?.id && (
              <Button
                tertiary
                label="Editar meu perfil"
                onPress={() => router.push("/profile-edit")}
              />
            )}
          </View>
          <Section title="Postagens em destaque" />
          <Body muted style={{ fontSize: 14, marginBottom: 8 }}>
            As publicações com mais curtidas e comentários.
          </Body>
          {!current.posts.length && (
            <Empty text="Ainda não há publicações deste perfil." />
          )}
          {current.posts.map((post) => (
            <Pressable
              key={post.id}
              accessibilityRole="button"
              accessibilityLabel={"Abrir publicação: " + post.title}
              onPress={() => router.push(`/community/${post.id}`)}
              style={[s.article, { gap: 10 }]}
            >
              <Title small>{post.title}</Title>
              <Body numberOfLines={3}>{post.body}</Body>
              <Body muted style={{ fontSize: 14 }}>
                {post.like_count ?? 0} curtidas · {post.comment_count ?? 0}{" "}
                comentários
              </Body>
              <Body style={{ color: colors.burgundy }}>Ver conversa</Body>
            </Pressable>
          ))}
        </>
      )}
    </Page>
  );
}

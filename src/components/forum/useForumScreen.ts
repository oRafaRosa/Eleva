import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useEleva } from "../../state/AppProvider";
import { createForumRepository } from "../../services/forum";
import {
  createForumScope,
  enterForumScope,
  leaveForumScope,
  beginForumRead,
  beginForumAction,
} from "./forumRequestScope";
import type {
  ForumReply,
  ForumTopic,
  ForumRepository,
} from "../../types/forum";

export function useForumScreen(topicId?: string) {
  const { user, isDemo } = useEleva();
  const scope = useMemo(
    () =>
      createForumScope(
        user ? createForumRepository({ demo: isDemo, user }) : null,
      ),
    [user?.id, user?.role, user?.full_name, isDemo, topicId],
  );
  const [snapshot, setSnapshot] = useState<{
    scope: typeof scope;
    topics: ForumTopic[];
    replies: ForumReply[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const current = snapshot?.scope === scope;

  const refresh = useCallback(
    async (quiet = false) => {
      if (!scope.repository || !scope.focused) return;
      const currentRequest = beginForumRead(scope);
      if (!quiet) setLoading(true);
      setLoadError("");
      try {
        const [topics, replies] = await Promise.all([
          scope.repository.listTopics(),
          topicId ? scope.repository.listReplies(topicId) : Promise.resolve([]),
        ]);
        if (currentRequest()) setSnapshot({ scope, topics, replies });
      } catch {
        if (currentRequest())
          setLoadError(
            topicId
              ? "Não foi possível carregar os comentários."
              : "Não foi possível carregar as publicações.",
          );
      } finally {
        if (currentRequest()) setLoading(false);
      }
    },
    [scope, topicId],
  );

  useFocusEffect(
    useCallback(() => {
      enterForumScope(scope);
      setBusy(scope.locked);
      setNotice("");
      void refresh(true);
      return () => {
        leaveForumScope(scope);
      };
    }, [scope, refresh]),
  );

  async function action(
    work: (repository: ForumRepository) => Promise<unknown>,
    message = "",
    committed?: () => void,
  ) {
    const request = beginForumAction(scope);
    if (!request || !scope.repository) return false;
    setBusy(true);
    setNotice("");
    try {
      await work(scope.repository);
      if (!request.current()) return false;
      committed?.();
      setNotice(message);
      await refresh(true);
      return true;
    } catch {
      if (request.current())
        setNotice("Não foi possível salvar. Tente novamente.");
      return false;
    } finally {
      request.release();
      if (scope.focused) setBusy(false);
    }
  }
  return {
    user,
    isDemo,
    action,
    refresh,
    busy,
    loading: loading || (!current && !loadError),
    loadError,
    notice,
    topics: current ? snapshot.topics : [],
    replies: current ? snapshot.replies : [],
  };
}

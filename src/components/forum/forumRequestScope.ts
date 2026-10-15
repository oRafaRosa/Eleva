import type { ForumRepository } from "../../types/forum";

export function createForumScope(repository: ForumRepository | null) {
  return {
    repository,
    generation: 0,
    request: 0,
    focused: false,
    locked: false,
  };
}
export type ForumScope = ReturnType<typeof createForumScope>;
export function enterForumScope(scope: ForumScope) {
  scope.focused = true;
  scope.generation++;
}
export function leaveForumScope(scope: ForumScope) {
  scope.focused = false;
  scope.generation++;
  scope.request++;
}
export function beginForumRead(scope: ForumScope) {
  const generation = scope.generation;
  const request = ++scope.request;
  return () =>
    scope.focused &&
    generation === scope.generation &&
    request === scope.request;
}
export function beginForumAction(scope: ForumScope) {
  if (!scope.repository || !scope.focused || scope.locked) return null;
  const generation = scope.generation;
  scope.locked = true;
  return {
    current: () => scope.focused && generation === scope.generation,
    release: () => {
      scope.locked = false;
    },
  };
}

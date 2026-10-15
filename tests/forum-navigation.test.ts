import test from "node:test";
import assert from "node:assert/strict";
import {
  createForumScope,
  enterForumScope,
  leaveForumScope,
  beginForumRead,
  beginForumAction,
} from "../src/components/forum/forumRequestScope";
import type { ForumRepository } from "../src/types/forum";

const repository = {} as ForumRepository;
test("fórum ignora carregamento antigo depois de retry e ao retornar da publicação", () => {
  const scope = createForumScope(repository);
  enterForumScope(scope);
  const first = beginForumRead(scope);
  const retry = beginForumRead(scope);
  assert.equal(first(), false);
  assert.equal(retry(), true);
  leaveForumScope(scope);
  enterForumScope(scope);
  assert.equal(retry(), false);
  assert.equal(beginForumRead(scope)(), true);
});
test("fórum não permite ação sem sessão nem dois envios enquanto o primeiro não acabou", () => {
  const anonymous = createForumScope(null);
  enterForumScope(anonymous);
  assert.equal(beginForumAction(anonymous), null);
  const scope = createForumScope(repository);
  assert.equal(beginForumAction(scope), null);
  enterForumScope(scope);
  const save = beginForumAction(scope)!;
  assert.equal(save.current(), true);
  assert.equal(beginForumAction(scope), null);
  leaveForumScope(scope);
  enterForumScope(scope);
  assert.equal(save.current(), false);
  assert.equal(beginForumAction(scope), null);
  save.release();
  assert.ok(beginForumAction(scope));
});
test("troca de conta não aceita retorno da sessão anterior", () => {
  const marina = createForumScope(repository);
  enterForumScope(marina);
  const pending = beginForumRead(marina);
  leaveForumScope(marina);
  const rebeca = createForumScope(repository);
  enterForumScope(rebeca);
  assert.equal(pending(), false);
  assert.equal(beginForumRead(rebeca)(), true);
});

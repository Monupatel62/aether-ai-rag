import test from "node:test";
import assert from "node:assert/strict";
import { createRagService, RagError } from "../src/index.js";

const principal = { id: "user-1", tenantId: "tenant-a" };
const candidates = [
  { sourceId: "source-1", tenantId: "tenant-a", aclVersion: 2, text: "allowed text", score: 0.9 },
  { sourceId: "source-2", tenantId: "tenant-a", aclVersion: 1, text: "stale ACL text", score: 0.8 },
  { sourceId: "source-3", tenantId: "tenant-b", aclVersion: 1, text: "other tenant", score: 0.7 },
];
function fixture(overrides = {}) {
  const calls = [];
  const service = createRagService({
    embedQuery: async () => [0.1, 0.2],
    search: async (input) => { calls.push(input); return candidates; },
    getCurrentSourceState: async ({ sourceId, tenantId }) => ({ sourceId, tenantId, status: "active", aclVersion: sourceId === "source-1" ? 2 : 2, title: "Verified source" }),
    authorizeSource: async () => true,
    ...overrides,
  });
  return { service, calls };
}

test("returns only tenant-matched chunks with current ACL version and authorization", async () => {
  const { service, calls } = fixture();
  const result = await service.retrieve({ principal, query: "question" });
  assert.equal(calls[0].tenantId, "tenant-a");
  assert.equal(result.count, 1);
  assert.equal(result.results[0].sourceId, "source-1");
});

test("fails closed when authorization state is unavailable", async () => {
  const { service } = fixture({ getCurrentSourceState: async () => { throw new Error("database private detail"); } });
  await assert.rejects(service.retrieve({ principal, query: "question" }), (e) => e.code === "authorization_state_unavailable");
});

test("filters candidates when source is revoked or access denied", async () => {
  const { service } = fixture({
    getCurrentSourceState: async ({ sourceId, tenantId }) => ({ tenantId, status: sourceId === "source-1" ? "revoked" : "active", aclVersion: 2 }),
    authorizeSource: async () => false,
  });
  assert.equal((await service.retrieve({ principal, query: "question" })).count, 0);
});

test("rejects malformed queries, vectors, and topK", async () => {
  const { service } = fixture();
  await assert.rejects(service.retrieve({ principal, query: "  " }), (e) => e.code === "invalid_query");
  await assert.rejects(service.retrieve({ principal, query: "question", topK: 100 }), (e) => e.code === "invalid_top_k");
  const badVector = fixture({ embedQuery: async () => [0.1, NaN] }).service;
  await assert.rejects(badVector.retrieve({ principal, query: "question" }), (e) => e.code === "invalid_embedding");
});

test("does not return results if search returns malformed response", async () => {
  const { service } = fixture({ search: async () => null });
  await assert.rejects(service.retrieve({ principal, query: "question" }), RagError);
});


test("rejects oversized result arrays and malformed ACL versions", async () => {
  const oversized = fixture({ maxResults: 2 });
  await assert.rejects(oversized.service.retrieve({ principal, query: "question" }), (e) => e.code === "invalid_search_response");
  const malformed = fixture({ search: async () => [{ sourceId: "source-1", tenantId: "tenant-a", aclVersion: -1, text: "must not pass" }] });
  assert.equal((await malformed.service.retrieve({ principal, query: "question" })).count, 0);
});

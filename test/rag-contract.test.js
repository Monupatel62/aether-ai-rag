import test from "node:test";
import assert from "node:assert/strict";
import { createRagChunk, createRetrievalRequest, isChunkEligible, createCitation, createDeletionNotice, MAX_CHUNK_TEXT_LENGTH } from "../src/index.js";

const chunk = {
  tenantId: "tenant-a", resourceId: "resource-a", resourceVersion: "rev-1", chunkId: "chunk-1",
  chunkIndex: 0, text: "Synthetic example text", embeddingModel: "model-placeholder",
  embeddingVersion: "embed-v1", policyVersion: "policy-v1", aclRefs: ["acl-a"],
  sourceUri: "https://example.invalid/doc/1",
};
const request = { tenantId: "tenant-a", principalId: "user-a", query: "synthetic query", allowedAclRefs: ["acl-a"], topK: 5 };

test("creates a versioned chunk with source, model, policy, and ACL metadata", () => {
  const result = createRagChunk(chunk);
  assert.equal(result.contractVersion, "1.0");
  assert.equal(result.embeddingVersion, "embed-v1");
  assert.deepEqual(result.aclRefs, ["acl-a"]);
  assert.throws(() => createRagChunk({ ...chunk, aclRefs: [] }), /explicitly provided/);
  assert.throws(() => createRagChunk({ ...chunk, text: "x".repeat(MAX_CHUNK_TEXT_LENGTH + 1) }), /exceeds/);
});

test("requires tenant and explicit ACL scope for retrieval", () => {
  const result = createRetrievalRequest(request);
  assert.equal(result.tenantId, "tenant-a");
  assert.throws(() => createRetrievalRequest({ ...request, allowedAclRefs: [] }), /explicitly provided/);
  assert.throws(() => createRetrievalRequest({ ...request, topK: 51 }), /topK/);
});

test("filters cross-tenant, revoked-scope, and deleted chunks", () => {
  const req = createRetrievalRequest(request);
  assert.equal(isChunkEligible(req, createRagChunk(chunk)), true);
  assert.equal(isChunkEligible(req, createRagChunk({ ...chunk, tenantId: "tenant-b" })), false);
  assert.equal(isChunkEligible(req, createRagChunk({ ...chunk, aclRefs: ["acl-b"] })), false);
  assert.equal(isChunkEligible(req, createRagChunk({ ...chunk, status: "deleted" })), false);
});

test("creates provenance citations and deletion notices", () => {
  const citation = createCitation({ resourceId: "resource-a", resourceVersion: "rev-1", chunkId: "chunk-1", sourceUri: "https://example.invalid/doc/1", startOffset: 0, endOffset: 10 });
  assert.equal(citation.endOffset, 10);
  const event = createDeletionNotice({ tenantId: "tenant-a", resourceId: "resource-a", resourceVersion: "rev-2", correlationId: "corr-1" });
  assert.equal(event.eventType, "rag.resource.deletion-requested");
  assert.equal("text" in event, false);
});

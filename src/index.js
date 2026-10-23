export const RAG_CONTRACT_VERSION = "1.0";
export const MAX_CHUNK_TEXT_LENGTH = 12000;
export const MAX_CHUNKS_PER_BATCH = 100;
export const MAX_TOP_K = 50;

const ID_RE = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,199}$/;
function id(value, field) {
  if (typeof value !== "string" || !ID_RE.test(value)) throw new TypeError(`${field} must be a valid identifier`);
  return value;
}
function nonEmptyText(value, field, max) {
  if (typeof value !== "string" || !value.trim()) throw new TypeError(`${field} must be a non-empty string`);
  const result = value.trim();
  if (result.length > max) throw new RangeError(`${field} exceeds ${max} characters`);
  return result;
}

export function createRagChunk(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new TypeError("chunk input must be an object");
  if (!Array.isArray(input.aclRefs) || input.aclRefs.length === 0) throw new TypeError("aclRefs must be explicitly provided and non-empty");
  const aclRefs = [...new Set(input.aclRefs.map((v) => id(v, "aclRef")))];
  if (aclRefs.length > 20) throw new RangeError("at most 20 ACL references are allowed");
  const status = input.status ?? "active";
  if (!["active", "deleted"].includes(status)) throw new TypeError("status must be active or deleted");
  return Object.freeze({
    contractVersion: RAG_CONTRACT_VERSION,
    tenantId: id(input.tenantId, "tenantId"),
    resourceId: id(input.resourceId, "resourceId"),
    resourceVersion: id(input.resourceVersion, "resourceVersion"),
    chunkId: id(input.chunkId, "chunkId"),
    chunkIndex: input.chunkIndex,
    text: nonEmptyText(input.text, "text", MAX_CHUNK_TEXT_LENGTH),
    embeddingModel: nonEmptyText(input.embeddingModel, "embeddingModel", 200),
    embeddingVersion: id(input.embeddingVersion, "embeddingVersion"),
    policyVersion: id(input.policyVersion, "policyVersion"),
    aclRefs: Object.freeze(aclRefs),
    status,
    sourceUri: nonEmptyText(input.sourceUri, "sourceUri", 2048),
    ...(typeof input.correlationId === "string" && ID_RE.test(input.correlationId) ? { correlationId: input.correlationId } : {}),
  });
}

export function createRetrievalRequest(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new TypeError("retrieval input must be an object");
  if (!Array.isArray(input.allowedAclRefs) || input.allowedAclRefs.length === 0) throw new TypeError("allowedAclRefs must be explicitly provided and non-empty");
  const allowedAclRefs = [...new Set(input.allowedAclRefs.map((v) => id(v, "allowedAclRef")))];
  if (allowedAclRefs.length > 20) throw new RangeError("at most 20 allowed ACL references are permitted");
  const query = nonEmptyText(input.query, "query", 2000);
  const topK = input.topK ?? 5;
  if (!Number.isInteger(topK) || topK < 1 || topK > MAX_TOP_K) throw new RangeError(`topK must be an integer from 1 to ${MAX_TOP_K}`);
  return Object.freeze({
    contractVersion: RAG_CONTRACT_VERSION,
    tenantId: id(input.tenantId, "tenantId"),
    principalId: id(input.principalId, "principalId"),
    query,
    allowedAclRefs: Object.freeze(allowedAclRefs),
    topK,
    ...(typeof input.correlationId === "string" && ID_RE.test(input.correlationId) ? { correlationId: input.correlationId } : {}),
  });
}

/** Defense-in-depth projection filter only; never replaces fresh authoritative authorization. */
export function isChunkEligible(request, chunk) {
  if (!request || !chunk || chunk.status !== "active") return false;
  if (request.tenantId !== chunk.tenantId) return false;
  if (!Array.isArray(request.allowedAclRefs) || !Array.isArray(chunk.aclRefs)) return false;
  return request.allowedAclRefs.some((ref) => chunk.aclRefs.includes(ref));
}

export function createCitation(input = {}) {
  return Object.freeze({
    contractVersion: RAG_CONTRACT_VERSION,
    resourceId: id(input.resourceId, "resourceId"),
    resourceVersion: id(input.resourceVersion, "resourceVersion"),
    chunkId: id(input.chunkId, "chunkId"),
    sourceUri: nonEmptyText(input.sourceUri, "sourceUri", 2048),
    ...(Number.isInteger(input.startOffset) && input.startOffset >= 0 ? { startOffset: input.startOffset } : {}),
    ...(Number.isInteger(input.endOffset) && input.endOffset >= 0 && (!Number.isInteger(input.startOffset) || input.endOffset >= input.startOffset) ? { endOffset: input.endOffset } : {}),
  });
}

export function createDeletionNotice(input = {}) {
  return Object.freeze({
    contractVersion: RAG_CONTRACT_VERSION,
    eventType: "rag.resource.deletion-requested",
    tenantId: id(input.tenantId, "tenantId"),
    resourceId: id(input.resourceId, "resourceId"),
    resourceVersion: id(input.resourceVersion, "resourceVersion"),
    ...(typeof input.correlationId === "string" && ID_RE.test(input.correlationId) ? { correlationId: input.correlationId } : {}),
  });
}

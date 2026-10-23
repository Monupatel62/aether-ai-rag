export class RagError extends Error {
  constructor(code, message = "Retrieval failed") { super(message); this.name = "RagError"; this.code = code; }
}
function isRecord(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
function validPrincipal(value) { return isRecord(value) && typeof value.id === "string" && value.id.length > 0 && typeof value.tenantId === "string" && value.tenantId.length > 0; }

export function createRagService({ embedQuery, search, getCurrentSourceState, authorizeSource, maxQueryLength = 4000, maxResults = 8, maxVectorDimensions = 8192 }) {
  if (typeof embedQuery !== "function" || typeof search !== "function" || typeof getCurrentSourceState !== "function" || typeof authorizeSource !== "function") {
    throw new TypeError("Embedding, search, current-source, and authorization adapters are required");
  }
  if (!Number.isSafeInteger(maxQueryLength) || maxQueryLength < 1 || maxQueryLength > 20_000) throw new TypeError("maxQueryLength is invalid");
  if (!Number.isSafeInteger(maxResults) || maxResults < 1 || maxResults > 50) throw new TypeError("maxResults is invalid");
  if (!Number.isSafeInteger(maxVectorDimensions) || maxVectorDimensions < 1 || maxVectorDimensions > 65_536) throw new TypeError("maxVectorDimensions is invalid");

  return Object.freeze({
    async retrieve({ principal, query, topK = maxResults } = {}) {
      if (!validPrincipal(principal)) throw new RagError("unauthenticated", "A trusted principal is required");
      if (typeof query !== "string" || !query.trim() || query.length > maxQueryLength) throw new RagError("invalid_query", "Query is invalid");
      if (!Number.isSafeInteger(topK) || topK < 1 || topK > maxResults) throw new RagError("invalid_top_k", "Requested result count is invalid");

      let vector;
      try { vector = await embedQuery({ query, tenantId: principal.tenantId }); }
      catch { throw new RagError("embedding_unavailable", "Query embedding failed"); }
      if (!Array.isArray(vector) || vector.length === 0 || vector.length > maxVectorDimensions || vector.some((n) => typeof n !== "number" || !Number.isFinite(n))) {
        throw new RagError("invalid_embedding", "Embedding adapter returned an invalid vector");
      }

      let candidates;
      try { candidates = await search({ vector, tenantId: principal.tenantId, topK }); }
      catch { throw new RagError("search_unavailable", "Search failed"); }
      if (!Array.isArray(candidates)) throw new RagError("invalid_search_response", "Search adapter returned an invalid response");

      const results = [];
      for (const candidate of candidates.slice(0, topK)) {
        if (!isRecord(candidate) || typeof candidate.sourceId !== "string" || candidate.tenantId !== principal.tenantId || !Number.isSafeInteger(candidate.aclVersion) || typeof candidate.text !== "string") continue;
        if (candidate.text.length > 100_000) continue;
        let current;
        try { current = await getCurrentSourceState({ sourceId: candidate.sourceId, tenantId: principal.tenantId }); }
        catch { throw new RagError("authorization_state_unavailable", "Current source authorization state could not be checked"); }
        if (!isRecord(current) || current.status !== "active" || current.tenantId !== principal.tenantId || current.aclVersion !== candidate.aclVersion) continue;
        let allowed = false;
        try { allowed = (await authorizeSource({ principal, sourceId: candidate.sourceId, tenantId: principal.tenantId, aclVersion: current.aclVersion })) === true; }
        catch { throw new RagError("authorization_unavailable", "Source access could not be verified"); }
        if (!allowed) continue;
        results.push(Object.freeze({
          sourceId: candidate.sourceId,
          title: typeof current.title === "string" ? current.title : "Source",
          text: candidate.text,
          score: Number.isFinite(candidate.score) ? candidate.score : null,
          aclVersion: current.aclVersion,
        }));
      }
      return Object.freeze({ results: Object.freeze(results), count: results.length });
    },
  });
}

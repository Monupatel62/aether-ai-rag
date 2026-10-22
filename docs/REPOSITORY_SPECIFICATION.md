# Repository specification: aether-ai-rag

**Status:** Repository exists; documentation-only on the inspected `main` branch. No application implementation is present in the audited tree.

## Mission

Retrieval-augmented generation pipeline for ingestion hooks, chunking, embeddings, retrieval, and citations.

## Dependencies and connections

aether-ai-files, aether-ai-knowledge, aether-ai-search, aether-ai-providers for embeddings, and aether-ai-security.

## Owned capabilities

Ingestion/chunking orchestration, embedding model/version metadata, source provenance, citation links, retrieval-time ACL filter propagation, prompt-injection resistance and retrieval evaluation. RAG consumes authoritative source/ACL state; it does not own the source ACL authority.

## Must not own

- Responsibilities assigned to another repository in the master catalog.
- Secrets, identity decisions, or authorization bypasses outside its documented boundary.
- Private database tables owned by another service.
- Unversioned contracts or undocumented side effects.

## Required contracts

- Typed schemas, explicit versioning, stable error categories, limits, and compatibility policy.
- Tenant/user context and authorization rules for any scoped data/action.
- Correlation IDs, safe telemetry, and explicit failure/timeout/retry behavior.
- Retention/deletion semantics whenever data is persisted.

## Security and privacy checklist

- [ ] Threat model and abuse cases documented.
- [ ] Least privilege and tenant isolation defined.
- [ ] Sensitive fields excluded or redacted in logs.
- [ ] Input size/type validation and rate/usage limits defined.
- [ ] Deletion, retention, export, and audit requirements defined where applicable.

## Test plan

Unit tests, contract tests, authorization/tenant isolation tests, malformed-input tests, dependency failure tests, and a non-production integration smoke test are required before release. Tests use synthetic or sanitized data only.

## Implementation gates

1. Create the repository only when the owner and direct dependencies are ready.
2. Review this specification against [the master catalog](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/REPOSITORY_CATALOG.md).
3. Record an ADR for unresolved technology choices before selecting a database, identity provider, queue, cache, vector store, or payment provider.
4. Implement a minimal vertical slice with tests and operational docs.
5. Update the master catalog and this spec when the contract changes.

## Research references

- [Aether AI master catalog](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/REPOSITORY_CATALOG.md)
- [AI DIAL Core](https://github.com/epam/ai-dial-core) — model gateway reference; verify exact release/license before reuse.
- [AI DIAL Chat](https://github.com/epam/ai-dial-chat) — UI/BFF reference; verify file-level notices before reuse.
- [Model Context Protocol](https://modelcontextprotocol.io/) — relevant for MCP/tool integration.

These links are research inputs, not proof that the Aether implementation exists or that all referenced code is reusable under one license.

## Retrieval baseline and acceptance gate

See [Data Infrastructure Evaluation](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/DATA_INFRASTRUCTURE_EVALUATION.md). PostgreSQL full-text search + pgvector is the proposed baseline for the first benchmark; Qdrant is an alternative only if representative evaluation justifies it. Keep chunking, embedding model/version, source ACL/policy version, tenant/resource IDs, document version and deletion status attached to each indexed chunk. Compare against labeled relevance data using recall@k, precision/nDCG where applicable, latency and cost. Test access revocation, tenant crossover, re-indexing, stale embeddings and partial failures. Never trust vector metadata alone as the final authorization decision. Fresh authorization must be checked through the agreed policy/domain contract before protected content is returned.

## Related documentation

- [Master repository catalog](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/REPOSITORY_CATALOG.md)
- [Master architecture](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/MASTER_ARCHITECTURE.md)
- [Architecture audit](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/ARCHITECTURE_AUDIT.md)
- [Security threat model](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/SECURITY_THREAT_MODEL.md)
- [Open decisions and research](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/OPEN_DECISIONS_RESEARCH.md)
- [Continuity handoff](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/WORK_HANDOFF.md)

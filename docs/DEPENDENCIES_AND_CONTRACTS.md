# Dependencies and Contracts — aether-ai-rag

**Status:** Proposed; provider/model and extraction tools are not selected.

## Dependencies
Files lifecycle contract; knowledge metadata/ACL/deletion contracts; search indexing/query contract; providers embedding contract; security policy contract. Knowledge and Search must not import RAG implementation.

## Owned contracts
Ingestion/chunking orchestration, embedding model/version metadata, source provenance, citation links, retrieval-time ACL filter propagation, prompt-injection resistance and retrieval evaluation. RAG consumes authoritative source/ACL state; it does not own the source ACL authority.

## Required contracts
- Typed schemas, explicit versioning, stable error categories, limits, and compatibility policy.
- Tenant/user context and authorization rules for any scoped data/action.
- Correlation IDs, safe telemetry, and explicit failure/timeout/retry behavior.
- Retention/deletion semantics whenever data is persisted.

- Version ingestion jobs, chunk metadata, embedding metadata and citation records.
- Preserve source ID/version, tenant scope and ACL reference through every stage.
- Define payload limits, retry/idempotency, deletion propagation and error categories.
- Do not treat index metadata or RAG filters as authoritative permission grants.
- Record model/version changes and migration/re-embedding behavior explicitly.

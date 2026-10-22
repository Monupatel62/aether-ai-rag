# Technical Design — aether-ai-rag

**Status:** Proposed design, not implementation evidence.

## Purpose
Retrieval-augmented generation pipeline for ingestion hooks, chunking, embeddings, retrieval, and citations.

## Responsibilities
Ingestion/chunking orchestration, embedding model/version metadata, source provenance, citation links, retrieval-time ACL filter propagation, prompt-injection resistance and retrieval evaluation. RAG consumes authoritative source/ACL state; it does not own the source ACL authority.

## Connections
Files lifecycle contract; knowledge metadata/ACL/deletion contracts; search indexing/query contract; providers embedding contract; security policy contract. Knowledge and Search must not import RAG implementation.

## Ingestion flow
Validate source reference and scope; extract within limits; chunk deterministically where possible; persist provenance and embedding-model version; send versioned records to Search; make retries idempotent; propagate deletion and revocation.

## Retrieval flow
Resolve trusted principal/tenant context; obtain current ACL constraints from authoritative owners; query Search with those constraints; reject stale/deleted sources; assemble bounded context with provenance; expose citations only for authorized sources. Retrieved text is untrusted data, not policy.

## Security
- [ ] Threat model and abuse cases documented.
- [ ] Least privilege and tenant isolation defined.
- [ ] Sensitive fields excluded or redacted in logs.
- [ ] Input size/type validation and rate/usage limits defined.
- [ ] Deletion, retention, export, and audit requirements defined where applicable.

## Open decisions
Extraction sandbox, embedding provider, chunking/ranking policy, evaluation thresholds and operational SLOs remain open.

# Architecture — aether-ai-rag

**Status:** Proposed; not implemented.

## Mission
Retrieval-augmented generation pipeline for ingestion hooks, chunking, embeddings, retrieval, and citations.

## Ownership
Ingestion/chunking orchestration, embedding model/version metadata, source provenance, citation links, retrieval-time ACL filter propagation, prompt-injection resistance and retrieval evaluation. RAG consumes authoritative source/ACL state; it does not own the source ACL authority.

## Dependencies
Files lifecycle contract; knowledge metadata/ACL/deletion contracts; search indexing/query contract; providers embedding contract; security policy contract. Knowledge and Search must not import RAG implementation.

## Pipeline
1. Receive a versioned ingestion request tied to an authorized source reference.
2. Validate metadata, size, media type, source version and tenant scope.
3. Extract/chunk content under explicit limits and preserve source provenance.
4. Generate embeddings with recorded model/version metadata.
5. Send index updates through the Search contract; do not own authoritative ACLs.
6. At retrieval, propagate current ACL filters and treat retrieved content as untrusted input.
7. Return citations linked to permitted source identifiers and versions.

## Trust and failure boundaries
Source ACLs remain authoritative in Knowledge/source owners. Deletion/revocation must propagate. Reject malformed/oversized inputs, bound retries, and never let retrieved instructions override system policy.

## Open decisions
Chunking strategy, embedding model, extraction tools, thresholds and freshness targets require benchmark evidence and ADR review.

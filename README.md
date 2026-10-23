# aether-ai-rag

**Status:** Initial authorization-aware retrieval pipeline implemented on a feature branch. No production embedding or search backend is configured.

## Implemented

- [RAG source](src/index.js): injected embedding/search adapters, tenant-scoped retrieval, current source lifecycle/ACL version checks, per-source authorization, bounded query/result/vector sizes, and fail-closed behavior when authorization state is unavailable.
- [Unit tests](test/rag.test.js): tenant isolation, stale ACL projection filtering, revoked sources, authorization backend failure, and malformed inputs.
- Dependency-free Node.js package with Node 20/22 CI.

## Security boundary

Search indexes are projections, not access-control authorities. Before returning a chunk, the pipeline checks that its tenant matches the authenticated principal, the source is still active, the indexed ACL version is current, and the current authorization callback allows access. Any future adapter must preserve this check after retrieval and before returning content.

## Limitations

No embedding provider, vector store, chunker, ingestion worker, citation renderer, reranker, index deletion consumer, or production telemetry is included. Query/content retention and privacy controls remain to be integrated.

## Documentation

- [Repository specification](docs/REPOSITORY_SPECIFICATION.md)
- [Project specification](docs/PROJECT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Dependencies and contracts](docs/DEPENDENCIES_AND_CONTRACTS.md)
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Security review](docs/SECURITY_REVIEW.md)
- [Master catalog](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/REPOSITORY_CATALOG.md)

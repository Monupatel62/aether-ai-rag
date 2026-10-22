# Engineering Standard — aether-ai-rag

- Preserve source ID/version, tenant scope, ACL reference and provenance end to end.
- Version chunk and embedding schemas; record model/version changes.
- Make ingestion and deletion handlers idempotent.
- Bound file size, extraction time, chunk count, token count, concurrency and retries.
- Treat retrieved text as untrusted content, never as policy.
- Enforce current ACLs at retrieval and before exposing citations/snippets.
- Avoid raw content in logs and use sanitized evaluation datasets.
- Test cross-tenant isolation, prompt injection, stale/deleted sources and citation accuracy.

- [ ] Threat model and abuse cases documented.
- [ ] Least privilege and tenant isolation defined.
- [ ] Sensitive fields excluded or redacted in logs.
- [ ] Input size/type validation and rate/usage limits defined.
- [ ] Deletion, retention, export, and audit requirements defined where applicable.

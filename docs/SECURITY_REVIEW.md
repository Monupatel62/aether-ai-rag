# Security Review — aether-ai-rag

**Status:** Design checklist only; no security audit/certification claimed.

## Main risks
Cross-tenant retrieval, unauthorized citations/snippets, stale ACL or deletion state, malicious files, prompt injection in retrieved text, extraction resource exhaustion and sensitive telemetry leakage.

## Required controls
- [ ] Threat model and abuse cases documented.
- [ ] Least privilege and tenant isolation defined.
- [ ] Sensitive fields excluded or redacted in logs.
- [ ] Input size/type validation and rate/usage limits defined.
- [ ] Deletion, retention, export, and audit requirements defined where applicable.
- Keep authoritative ACL ownership outside RAG and propagate constraints to Search.
- Treat retrieved content as untrusted; it must not change system policy or grant tools.
- Bound extraction, chunking, embedding, query and context assembly resources.
- Preserve source provenance and deletion/revocation behavior.
- Redact sensitive text from logs and evaluation artifacts.

## Verification
Unit tests, contract tests, authorization/tenant isolation tests, malformed-input tests, dependency failure tests, and a non-production integration smoke test are required before release. Tests use synthetic or sanitized data only.
- [ ] Cross-tenant and ACL-filter bypass tests.
- [ ] Prompt-injection and poisoned-content cases.
- [ ] Deleted/revoked source and citation tests.
- [ ] Oversized/malformed content and dependency-failure tests.

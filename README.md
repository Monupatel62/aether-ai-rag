# @aether-ai/rag

Deterministic text chunking utility for Aether AI retrieval pipelines.

## Status

This is a first pure-function utility, not a complete RAG pipeline. Extraction sandboxing, embedding provider, chunking/ranking policy, persistence, ACL filtering, source deletion/revocation propagation, and retrieval evaluation remain open or unimplemented.

## Current implementation

- Deterministic text chunking with configurable chunk length and overlap.
- Stable chunk IDs based on source ID, source version, and chunk index.
- Source offsets and content slices for provenance/citation alignment.
- Input byte limit and bounded chunk/overlap configuration.
- Paragraph/space boundary preference when a reasonable boundary is available.

## Example

```ts
import { chunkText } from "@aether-ai/rag";

const chunks = chunkText("source/doc-1", "v1", extractedText, {
  maxChars: 1200,
  overlapChars: 120
});
```

The function does not extract files, persist content, embed text, enforce ACLs, or decide whether processing is authorized. Retrieved text is untrusted data and must not override system policy.

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

CI is configured for Node.js 20 and 22. A production RAG flow requires approved file/knowledge/search/provider/security contracts and tenant/deletion integration tests.

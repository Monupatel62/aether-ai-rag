export interface ChunkOptions {
  /** Maximum JavaScript UTF-16 code units per chunk. Default: 1200. */
  readonly maxChars?: number;
  /** Number of UTF-16 code units overlapped between adjacent chunks. Default: 120. */
  readonly overlapChars?: number;
  /** Maximum input size in UTF-8 bytes. Default: 5 MiB. */
  readonly maxInputBytes?: number;
}

export interface TextChunk {
  readonly chunkId: string;
  readonly sourceId: string;
  readonly sourceVersion: string;
  readonly index: number;
  readonly startOffset: number;
  readonly endOffset: number;
  readonly content: string;
}

/**
 * Deterministic heuristic chunker. It does not extract files, embed content, persist data,
 * enforce ACLs, or decide whether the caller is authorized to process the source.
 */
export function chunkText(
  sourceId: string,
  sourceVersion: string,
  text: string,
  options: ChunkOptions = {}
): readonly TextChunk[] {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,255}$/.test(sourceId) ||
      !/^[a-zA-Z0-9][a-zA-Z0-9._+-]{0,63}$/.test(sourceVersion)) {
    throw new TypeError("Source ID and version must be bounded identifiers.");
  }
  if (typeof text !== "string") throw new TypeError("Text content must be a string.");
  const maxInputBytes = options.maxInputBytes ?? 5 * 1024 * 1024;
  if (!Number.isInteger(maxInputBytes) || maxInputBytes < 1 || maxInputBytes > 50 * 1024 * 1024) {
    throw new RangeError("maxInputBytes must be an integer between 1 and 52428800.");
  }
  if (new TextEncoder().encode(text).byteLength > maxInputBytes) {
    throw new RangeError("Text input exceeded the configured byte limit.");
  }
  if (text.length === 0) return [];

  const maxChars = options.maxChars ?? 1200;
  const overlapChars = options.overlapChars ?? 120;
  if (!Number.isInteger(maxChars) || maxChars < 200 || maxChars > 20_000) {
    throw new RangeError("maxChars must be an integer between 200 and 20000.");
  }
  if (!Number.isInteger(overlapChars) || overlapChars < 0 || overlapChars >= maxChars) {
    throw new RangeError("overlapChars must be an integer from 0 up to maxChars - 1.");
  }

  const chunks: TextChunk[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + maxChars, text.length);
    if (end < text.length) {
      const lowerBound = start + Math.floor(maxChars * 0.6);
      const newline = text.lastIndexOf("\n", end - 1);
      const space = text.lastIndexOf(" ", end - 1);
      const boundary = Math.max(newline, space);
      if (boundary >= lowerBound) end = boundary + 1;
    }
    if (end <= start) end = Math.min(start + maxChars, text.length);

    const index = chunks.length;
    chunks.push({
      chunkId: `${sourceId}@${sourceVersion}:${index}`,
      sourceId,
      sourceVersion,
      index,
      startOffset: start,
      endOffset: end,
      content: text.slice(start, end)
    });
    if (end >= text.length) break;
    // Guarantee forward progress even when overlap is large.
    start = Math.max(start + 1, end - overlapChars);
  }
  return chunks;
}

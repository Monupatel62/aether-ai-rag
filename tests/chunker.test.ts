import { describe, expect, it } from "vitest";
import { chunkText } from "../src/index.js";

describe("deterministic text chunking", () => {
  it("produces stable IDs and offsets for the same source version", () => {
    const text = ("Paragraph one with enough text to form a useful chunk. ".repeat(8) + "\n" +
      "Paragraph two with more synthetic words. ".repeat(8));
    const first = chunkText("source/doc-1", "v1", text, { maxChars: 220, overlapChars: 30 });
    const second = chunkText("source/doc-1", "v1", text, { maxChars: 220, overlapChars: 30 });
    expect(first).toEqual(second);
    expect(first.map(chunk => chunk.chunkId)).toEqual(first.map((_, index) => `source/doc-1@v1:${index}`));
  });

  it("keeps chunk lengths bounded and preserves overlapping source offsets", () => {
    const text = "word ".repeat(250);
    const chunks = chunkText("doc", "1", text, { maxChars: 200, overlapChars: 25 });
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every(chunk => chunk.content.length <= 200)).toBe(true);
    for (let i = 1; i < chunks.length; i++) {
      expect(chunks[i]!.startOffset).toBeLessThan(chunks[i - 1]!.endOffset);
    }
    expect(chunks[chunks.length - 1]!.endOffset).toBe(text.length);
  });

  it("returns no chunks for empty content", () => {
    expect(chunkText("doc", "1", "")).toEqual([]);
  });

  it("rejects oversized inputs and invalid overlap settings", () => {
    expect(() => chunkText("doc", "1", "x".repeat(500), { maxInputBytes: 100 })).toThrow("byte limit");
    expect(() => chunkText("doc", "1", "text", { maxChars: 200, overlapChars: 200 })).toThrow("overlapChars");
  });
});

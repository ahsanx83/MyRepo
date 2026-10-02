/**
 * Parse a tags.txt file.
 *
 * Format:
 *   FolderName:Tag1,Tag2,Tag3
 *   Parent>Child:Tag1,Tag2
 *   Parent>Child>Grandchild:Tag1
 *
 * Lines are trimmed. Blank lines and lines starting with '#' are ignored.
 */

/**
 * @param {string} text  raw contents of tags.txt
 * @returns {{ catalog: Map<string, string[]>, pathIndex: Array<{segments: string[], tags: string[]}> }}
 */
export function parseTagsFile(text) {
  const catalog = new Map(); // canonical key → tags[]
  const pathIndex = []; // ordered list for prefix fallback

  if (!text) return { catalog, pathIndex };

  const lines = text.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    // Split "path : tags" on the LAST colon so Windows-style drive letters
    // or URLs with colons don't accidentally break the split.
    const lastColon = line.lastIndexOf(":");
    if (lastColon < 0) continue;

    const rawPath = line.slice(0, lastColon).trim();
    const rawTags = line.slice(lastColon + 1).trim();
    if (!rawPath) continue;

    const segments = rawPath
      .split(">")
      .map((s) => s.trim())
      .filter(Boolean);
    if (segments.length === 0) continue;

    const tags = rawTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const key = segments.join(">");
    catalog.set(key, tags);

    pathIndex.push({
      segments: segments.map((s) => s.toLowerCase()),
      tags,
    });
  }

  // Sort longest-first so prefix matching prefers the most specific entry.
  pathIndex.sort((a, b) => b.segments.length - a.segments.length);

  return { catalog, pathIndex };
}

/**
 * Return every unique tag defined in tags.txt, alphabetically sorted.
 * Useful for the root-folder view, where there's no specific folder to match.
 *
 * @param {{ catalog: Map<string, string[]> }} parsed  output of parseTagsFile
 * @returns {string[]}
 */
export function getAllTags({ catalog }) {
  if (!catalog || catalog.size === 0) return [];
  const set = new Set();
  for (const tags of catalog.values()) {
    for (const t of tags) set.add(t);
  }
  return Array.from(set).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
}

/**
 * Resolve tags for a folder path.
 *
 * @param {Array<{id,name}>} path      breadcrumb array (root first)
 * @param {Object} catalog             output of parseTagsFile
 * @param {Object} [opts]
 * @returns {{ tags: string[], source: 'exact'|'ancestor'|'none', matchedAt: string|null }}
 */
export function resolveTagsForPath(path, { catalog, pathIndex }, opts = {}) {
  if (!path || path.length === 0 || !pathIndex) {
    return { tags: [], source: "none", matchedAt: null };
  }

  const fullSegs = path.map((p) => (p.name || "").toLowerCase());
  const tailSegs = fullSegs.slice(1);

  // Helper: does `entrySegments` equal `targetSegs` from the end?
  const matchesSuffix = (entrySegments, targetSegs) => {
    if (targetSegs.length < entrySegments.length) return false;
    const offset = targetSegs.length - entrySegments.length;
    for (let i = 0; i < entrySegments.length; i++) {
      if (targetSegs[offset + i] !== entrySegments[i]) return false;
    }
    return true;
  };

  // Exact match (highest priority)
  for (const entry of pathIndex) {
    if (
      entry.segments.length === fullSegs.length &&
      entry.segments.every((s, i) => s === fullSegs[i])
    ) {
      return {
        tags: entry.tags,
        source: "exact",
        matchedAt: entry.segments.join(" > "),
      };
    }
    if (
      entry.segments.length === tailSegs.length &&
      tailSegs.length > 0 &&
      entry.segments.every((s, i) => s === tailSegs[i])
    ) {
      return {
        tags: entry.tags,
        source: "exact",
        matchedAt: entry.segments.join(" > "),
      };
    }
  }

  // Ancestor fallback: longest entry whose segments are a suffix of `tailSegs`.
  for (const entry of pathIndex) {
    if (matchesSuffix(entry.segments, tailSegs)) {
      return {
        tags: entry.tags,
        source: "ancestor",
        matchedAt: entry.segments.join(" > "),
      };
    }
  }

  return { tags: [], source: "none", matchedAt: null };
}

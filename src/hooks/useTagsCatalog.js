import { useEffect, useState, useMemo } from "react";
import { findFileByName, getFileContent } from "../services/driveApi";
import { parseTagsFile } from "../utils/tagsFile";

/**
 * Loads tags.txt from the Drive root folder and provides a resolver.
 *
 * @param {string} rootFolderId  Drive ID of GitDriveRepos (same as .env folder)
 */
export function useTagsCatalog(rootFolderId) {
  const [raw, setRaw] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!rootFolderId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const meta = await findFileByName("tags.txt", rootFolderId);
        if (!meta) {
          if (!cancelled) {
            setRaw("");
            setLoading(false);
          }
          return;
        }
        const content = await getFileContent(meta.id);
        if (!cancelled) {
          setRaw(content);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [rootFolderId]);

  const catalog = useMemo(() => parseTagsFile(raw || ""), [raw]);

  return { ...catalog, loading, error, raw };
}

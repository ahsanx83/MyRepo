import { useEffect, useState, useMemo } from "react";
import { listFilesRecursive } from "../services/driveApi";
import { formatBytes } from "../utils/format";
import { computeLanguages } from "../utils/languages";
import { resolveTagsForPath, getAllTags } from "../utils/tagsFile";

export function Sidebar({ files = [], path = [], folderId, tagsCatalog }) {
  const [subtree, setSubtree] = useState(null);
  const [subtreeError, setSubtreeError] = useState(null);

  useEffect(() => {
    if (!folderId) {
      setSubtree([]);
      return;
    }
    let cancelled = false;
    setSubtree(null);
    setSubtreeError(null);

    listFilesRecursive(folderId, { maxDepth: 5, maxFiles: 2000 })
      .then((list) => {
        if (!cancelled) setSubtree(list);
      })
      .catch((err) => {
        if (!cancelled) setSubtreeError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [folderId]);

  const aggregate = useMemo(() => subtree ?? files, [subtree, files]);
  const isLoading = subtree === null && !!folderId;

  const languages = useMemo(() => computeLanguages(aggregate), [aggregate]);

  // Tags come from tags.txt, resolved against the current breadcrumb path.
  const isAtRoot = path.length <= 1;

  const { tags, source, matchedAt } = useMemo(() => {
    if (!tagsCatalog) return { tags: [], source: "none", matchedAt: null };

    // At the root folder, show every tag in the catalog
    if (isAtRoot) {
      return {
        tags: getAllTags(tagsCatalog),
        source: "all",
        matchedAt: null,
      };
    }

    return resolveTagsForPath(path, tagsCatalog);
  }, [path, tagsCatalog, isAtRoot]);

  const totalSize = files.reduce((s, f) => s + Number(f.size || 0), 0);
  const folderCount = files.filter(
    (f) => f.mimeType === "application/vnd.google-apps.folder",
  ).length;
  const fileCount = files.length - folderCount;

  const subtreeFileCount = aggregate.length;
  const subtreeSize = aggregate.reduce((s, f) => s + Number(f.size || 0), 0);

  const currentFolderName =
    path.length > 0 ? path[path.length - 1].name : "Repository";

  return (
    <aside className="sidebar">
      {folderId && (
        <div className="sidebar-section">
          <h4 className="sidebar-subtitle">Contents</h4>
          {isLoading ? (
            <p className="sidebar-muted">
              <span className="sidebar-inline-spinner" /> Scanning subfolders…
            </p>
          ) : subtreeError ? (
            <p className="sidebar-muted">Could not scan subfolders.</p>
          ) : (
            <ul className="sidebar-list">
              <li>📄 {subtreeFileCount} files</li>
              <li>💾 {formatBytes(subtreeSize)}</li>
            </ul>
          )}
        </div>
      )}

      <div className="sidebar-section">
        <h4 className="sidebar-subtitle">Languages</h4>
        {isLoading ? (
          <p className="sidebar-muted">Analyzing…</p>
        ) : languages.length === 0 ? (
          <p className="sidebar-muted">Not detected</p>
        ) : (
          <>
            <div
              className="lang-bar"
              role="img"
              aria-label="Language breakdown"
            >
              {languages.map((l) => (
                <div
                  key={l.name}
                  className="lang-segment"
                  style={{ width: `${l.pct}%`, background: l.color }}
                  title={`${l.name}: ${l.pct.toFixed(1)}%`}
                />
              ))}
            </div>
            <ul className="sidebar-list lang-list">
              {languages.slice(0, 10).map((l) => (
                <li key={l.name}>
                  <span
                    className="lang-dot"
                    style={{ background: l.color }}
                    aria-hidden="true"
                  />
                  <span className="lang-name">{l.name}</span>
                  <span className="lang-pct">{l.pct.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="sidebar-section">
        <h4 className="sidebar-subtitle">Tags</h4>

        {tagsCatalog?.loading ? (
          <p className="sidebar-muted">Loading tags.txt…</p>
        ) : tags.length === 0 ? (
          <p className="sidebar-muted">No tags defined</p>
        ) : (
          <>
            <div className="tag-cloud">
              {tags.map((t) => (
                <span key={t} className="tag-chip">
                  {t}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

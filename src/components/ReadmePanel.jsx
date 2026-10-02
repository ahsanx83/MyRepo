import { useEffect, useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getFileContent } from "../services/driveApi";
import { resolveDriveImageSrc, resolveDriveHref } from "../utils/driveMarkdown";

export function findReadme(files) {
  if (!files || !files.length) return null;
  return files.find((f) => f.name?.toLowerCase() === "readme.md") || null;
}

export function ReadmePanel({ file, folderFiles = [], folderId = null }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  // Cache: rawSrc → resolvedUrl (so we don't refetch on every render)
  const [resolvedCache, setResolvedCache] = useState({});

  useEffect(() => {
    if (!file) return;
    setContent(null);
    setError(null);
    setLoading(true);
    setCollapsed(false);
    setResolvedCache({});

    getFileContent(file.id)
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [file?.id]);

  if (!file) return null;

  // A small component that resolves its src asynchronously.
  const DriveImage = ({ src, alt }) => {
    const [resolved, setResolved] = useState(resolvedCache[src] || null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
      let cancelled = false;
      if (resolvedCache[src]) {
        setResolved(resolvedCache[src]);
        return;
      }

      resolveDriveImageSrc(src, folderFiles, folderId).then((url) => {
        if (cancelled) return;
        setResolved(url);
        setResolvedCache((c) => ({ ...c, [src]: url }));
      });
      return () => {
        cancelled = true;
      };
    }, [src]);

    if (failed) {
      return (
        <span className="img-fallback">
          🖼 {alt || src} (could not load — check that the file is public)
        </span>
      );
    }
    if (!resolved) {
      return <span className="img-loading">Loading image…</span>;
    }
    return (
      <img
        src={resolved}
        alt={alt || ""}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  };

  const components = {
    img: ({ node, src, alt, ...props }) => <DriveImage src={src} alt={alt} />,
    a: ({ node, href, children, ...props }) => {
      const resolved = resolveDriveHref(href, folderFiles);
      const isExternal = /^https?:\/\//i.test(resolved);
      return (
        <a
          href={resolved}
          {...(isExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          {...props}
        >
          {children}
        </a>
      );
    },
  };

  return (
    <div className="readme-panel">
      <div className="readme-header">
        <div className="readme-header-left">
          <span className="readme-icon">📖</span>
          <span className="readme-title">{file.name}</span>
        </div>
        <button
          className="readme-toggle"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand README" : "Collapse README"}
        >
          {collapsed ? "▼ Show" : "▲ Hide"}
        </button>
      </div>

      {!collapsed && (
        <div className="readme-body">
          {loading && (
            <div className="readme-loading">
              <div className="spinner" />
              <span>Loading README…</span>
            </div>
          )}

          {error && (
            <div className="readme-error">
              <p>Could not load README.</p>
              <p className="error-detail">{error}</p>
              {file.webViewLink && (
                <a
                  href={file.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Google Drive ↗
                </a>
              )}
            </div>
          )}

          {!loading && !error && content !== null && (
            <div className="markdown-preview">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={components}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

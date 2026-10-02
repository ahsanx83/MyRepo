import { useEffect, useState, useMemo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { getFileContent } from "../services/driveApi";
import { isTextFile, isImageFile, getFileIcon } from "../utils/fileIcons";
import { formatBytes, timeAgo } from "../utils/format";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getDownloadLink } from "../services/driveApi";

const EXT_TO_LANG = {
  js: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "tsx",
  py: "python",
  java: "java",
  c: "c",
  h: "c",
  cpp: "cpp",
  hpp: "cpp",
  cs: "csharp",
  go: "go",
  rs: "rust",
  rb: "ruby",
  php: "php",
  html: "html",
  css: "css",
  scss: "scss",
  sass: "sass",
  less: "less",
  json: "json",
  md: "markdown",
  txt: "text",
  yml: "yaml",
  yaml: "yaml",
  xml: "xml",
  sh: "bash",
  bash: "bash",
  sql: "sql",
  csv: "text",
  log: "text",
  env: "bash",
  dockerfile: "docker",
  gitignore: "bash",
};

function detectLanguage(name = "") {
  const lower = name.toLowerCase();
  if (lower === "dockerfile") return "docker";
  if (lower === ".gitignore" || lower === ".env") return "bash";
  const ext = lower.split(".").pop();
  return EXT_TO_LANG[ext] || "text";
}

export function FileViewer({ file, onBack }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wrap, setWrap] = useState(false);
  const [copied, setCopied] = useState(false);

  const isText = isTextFile(file);
  const isImage = isImageFile(file);
  const isGoogleDoc = file.mimeType?.startsWith("application/vnd.google-apps");
  const icon = getFileIcon(file);
  const language = useMemo(() => detectLanguage(file.name), [file.name]);

  useEffect(() => {
    setContent(null);
    setError(null);
    setLoading(true);
    setCopied(false);
    if (!isText) {
      setLoading(false);
      return;
    }

    getFileContent(file.id)
      .then((t) => {
        setContent(t);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [file.id, isText]);

  const lineCount = content ? content.split("\n").length : 0;

  const handleCopy = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const handleDownload = () => {
    if (!file) return;
    const link = getDownloadLink(file);
    // Trigger a navigation-style download (no CORS involved)
    const a = document.createElement("a");
    a.href = link;
    a.download = file.name || "download";
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="file-viewer">
      {/* ---------- Top bar ---------- */}
      <div className="viewer-topbar">
        <div className="viewer-path">
          <button className="back-btn" onClick={onBack} title="Back to files">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L4.81 7h7.44a.75.75 0 0 1 0 1.5H4.81l2.97 2.97a.75.75 0 0 1 0 1.06Z"></path>
            </svg>
            <span>{file.name}</span>
          </button>
          {isText && (
            <span className="viewer-badge">
              {language} · {lineCount} lines
            </span>
          )}
        </div>

        <div className="viewer-actions">
          {isText && (
            <>
              <button
                className={"viewer-icon-btn" + (wrap ? " active" : "")}
                onClick={() => setWrap((w) => !w)}
                title="Toggle word wrap"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M2 3.75A.75.75 0 0 1 2.75 3h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 3.75Zm0 4A.75.75 0 0 1 2.75 7h7a.75.75 0 0 1 0 1.5h-7A.75.75 0 0 1 2 7.75Zm0 4A.75.75 0 0 1 2.75 11h4a.75.75 0 0 1 0 1.5h-4A.75.75 0 0 1 2 11.75Z"></path>
                </svg>
              </button>
              <button
                className="viewer-icon-btn"
                onClick={handleCopy}
                title="Copy contents"
              >
                {copied ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="#1a7f37"
                  >
                    <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path>
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25v-7.5Z"></path>
                    <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25v-7.5Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25h-7.5Z"></path>
                  </svg>
                )}
              </button>
              <button
                className="viewer-icon-btn"
                onClick={handleDownload}
                title="Download"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14H2.75Z"></path>
                  <path d="M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z"></path>
                </svg>
              </button>
            </>
          )}
          {file.webViewLink && (
            <a
              className="viewer-icon-btn open-drive"
              href={file.webViewLink}
              target="_blank"
              rel="noopener noreferrer"
              title="Open in Google Drive"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2Zm6.854-1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 9.28 7.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.75-3.75-1.543-1.543A.25.25 0 0 1 10.604 1Z"></path>
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* ---------- File header ---------- */}
      <div className="viewer-header">
        <span className={"file-icon-large " + (icon.className || "")}>
          {icon.emoji}
        </span>
        <div className="viewer-meta">
          <h1 className="viewer-filename">{file.name}</h1>
          <div className="viewer-sub">
            <span>{file.size ? formatBytes(file.size) : file.mimeType}</span>
            <span className="dot">·</span>
            <span>Modified {timeAgo(file.modifiedTime)}</span>
            {file.owners?.[0] && (
              <>
                <span className="dot">·</span>
                <span>by {file.owners[0].displayName}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Content ---------- */}
      <div className="viewer-content">
        {loading && (
          <div className="viewer-loading">
            <div className="spinner" />
            <p>Loading file…</p>
          </div>
        )}

        {error && (
          <div className="viewer-error">
            <p>Could not load file content.</p>
            <p className="error-detail">{error}</p>
            {file.webViewLink && (
              <a
                href={file.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in Google Drive
              </a>
            )}
          </div>
        )}

        {!loading && !error && isImage && (
          <div className="image-preview">
            <img
              src={`https://drive.google.com/uc?export=view&id=${file.id}`}
              alt={file.name}
            />
          </div>
        )}

        {!loading && !error && isGoogleDoc && (
          <div className="gdoc-preview">
            <p>Google Workspace document</p>
            <a
              href={file.webViewLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Google Docs ↗
            </a>
          </div>
        )}

        {!loading &&
          !error &&
          content !== null &&
          (language === "markdown" ? (
            <div className="markdown-preview">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <SyntaxHighlighter
              language={language}
              style={oneDark}
              showLineNumbers
              wrapLongLines={wrap}
              /* ...same props as before... */
            >
              {content}
            </SyntaxHighlighter>
          ))}

        {!loading && !error && !isText && !isImage && !isGoogleDoc && (
          <div className="unsupported-preview">
            <p>Preview not available for this file type.</p>
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
      </div>
    </div>
  );
}

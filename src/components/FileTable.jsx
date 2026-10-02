import { FileRow } from "./FileRow";

export function FileTable({ files, onOpenFile, onOpenFolder, latestCommit }) {
  function formatDate(dateString) {
    if (!dateString) return "—";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "—";

    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleString("en-US", { month: "long" }); // "October"
    const year = d.getFullYear();

    return `${day} ${month}, ${year}`;
  }

  return (
    <div className="file-table">
      {latestCommit && (
        <div className="latest-commit">
          <div className="commit-avatar">
            {latestCommit.owner && latestCommit.owner.photoLink ? (
              <img src={latestCommit.owner.photoLink} alt="" />
            ) : (
              <div className="avatar-placeholder">👤</div>
            )}
          </div>
          <div className="commit-author">
            <strong>
              {(latestCommit.owner && latestCommit.owner.displayName) ||
                "Drive User"}
            </strong>
          </div>
          <div className="commit-msg">{""}</div>
          <div className="commit-time">{formatDate(latestCommit.time)}</div>
        </div>
      )}
      <div className="file-table-header">
        <div className="col-name">Name</div>
        <div className="col-msg">Last modified</div>
        <div className="col-date">Modified</div>
      </div>
      <div className="file-table-body">
        {files.map((file) => (
          <FileRow
            key={file.id}
            file={file}
            onOpen={() =>
              file.mimeType === "application/vnd.google-apps.folder"
                ? onOpenFolder(file)
                : onOpenFile(file)
            }
          />
        ))}
        {files.length === 0 && (
          <div className="empty-row">This folder is empty</div>
        )}
      </div>
    </div>
  );
}

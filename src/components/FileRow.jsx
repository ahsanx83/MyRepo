import { getFileIcon } from '../utils/fileIcons';
import { timeAgo } from '../utils/format';

export function FileRow({ file, onOpen }) {
  const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
  const icon = getFileIcon(file);
  const isGoogleDoc = file.mimeType && file.mimeType.startsWith('application/vnd.google-apps');

  return (
    <div className="file-row" onClick={onOpen}>
      <div className="col-name">
        <span className={'file-icon ' + (icon.className || '')}>{icon.emoji}</span>
        <span className="file-name">{file.name}</span>
        {isGoogleDoc && !isFolder && <span className="file-badge">Google</span>}
      </div>
      <div className="col-msg">{isFolder ? 'Folder' : (file.mimeType || '').split('/').pop()}</div>
      <div className="col-date">{timeAgo(file.modifiedTime)}</div>
    </div>
  );
}

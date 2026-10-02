import { listFiles } from "../services/driveApi";

const DRIVE_FILE_ID_REGEX = /\/file\/d\/([a-zA-Z0-9_-]{10,})/;
const DRIVE_OPEN_ID_REGEX = /[?&]id=([a-zA-Z0-9_-]{10,})/;

function driveViewUrl(id) {
  // Thumbnail endpoint — reliable for public images.
  return `https://drive.google.com/thumbnail?id=${id}&sz=s1024`;
}

export function extractDriveId(url) {
  const m1 = url.match(DRIVE_FILE_ID_REGEX);
  if (m1) return m1[1];
  const m2 = url.match(DRIVE_OPEN_ID_REGEX);
  if (m2) return m2[1];
  return null;
}

function normalise(p) {
  return String(p)
    .replace(/^\.?\//, "")
    .replace(/^\//, "");
}

/**
 * Resolve a Markdown image src to a renderable URL.
 *
 * @param {string} src                the raw src from Markdown
 * @param {Array}  currentFolderFiles files in the currently-open Drive folder
 * @param {string} currentFolderId    Drive ID of the currently-open folder
 * @returns {Promise<string>}
 */
export async function resolveDriveImageSrc(
  src,
  currentFolderFiles = [],
  currentFolderId = null,
) {
  if (!src) return src;

  // 1) Absolute URL
  if (/^https?:\/\//i.test(src)) {
    if (/drive\.google\.com/i.test(src)) {
      const id = extractDriveId(src);
      if (id) return driveViewUrl(id);
    }
    return src;
  }

  // 2) Data URI
  if (src.startsWith("data:")) return src;

  // 3) Relative path — split into segments.
  //    Examples:
  //      "image.png"                → ["image.png"]
  //      "./image.png"              → ["image.png"]
  //      "/Screenshots/image.png"   → ["Screenshots", "image.png"]
  //      "img/icons/logo.png"       → ["img", "icons", "logo.png"]
  const clean = normalise(src);
  const segments = clean.split("/").filter(Boolean);
  if (segments.length === 0) return src;

  const fileName = segments[segments.length - 1].toLowerCase();
  const folderSegments = segments.slice(0, -1);

  // 3a) No subfolder — search the current folder.
  if (folderSegments.length === 0) {
    const match = currentFolderFiles.find(
      (f) => f.name?.toLowerCase() === fileName,
    );
    if (match) return driveViewUrl(match.id);
    return src;
  }

  // 3b) Subfolder path — walk the tree starting from the current folder.
  let folderId = currentFolderId;
  if (!folderId) {
    // We can't walk without a starting folder ID — try matching the
    // basename in currentFolderFiles as a last resort.
    const match = currentFolderFiles.find(
      (f) => f.name?.toLowerCase() === fileName,
    );
    return match ? driveViewUrl(match.id) : src;
  }

  for (const seg of folderSegments) {
    const listing = await listFiles(folderId);
    const next = listing.find(
      (f) =>
        f.name?.toLowerCase() === seg.toLowerCase() &&
        f.mimeType === "application/vnd.google-apps.folder",
    );
    if (!next) return src;
    folderId = next.id;
  }

  // Finally, look up the file inside the resolved subfolder.
  const listing = await listFiles(folderId);
  const match = listing.find((f) => f.name?.toLowerCase() === fileName);
  return match ? driveViewUrl(match.id) : src;
}

/**
 * Resolve a Markdown link href.
 */
export function resolveDriveHref(href, folderFiles = []) {
  if (!href) return href;
  if (/drive\.google\.com/i.test(href)) return href;
  if (/^https?:\/\//i.test(href)) return href;
  if (href.startsWith("#")) return href;
  if (/^[a-z]+:/i.test(href)) return href;

  const wanted = normalise(href).split("/").pop().toLowerCase();
  const match = folderFiles.find((f) => f.name?.toLowerCase() === wanted);
  if (match && match.webViewLink) return match.webViewLink;
  return href;
}

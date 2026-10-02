const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const BASE = "https://www.googleapis.com/drive/v3";

console.log(
  "API key loaded:",
  API_KEY ? "yes (" + API_KEY.slice(0, 8) + "…)" : "NO",
);
console.log("Folder ID loaded:", import.meta.env.VITE_DRIVE_FOLDER_ID || "NO");

export async function listFiles(folderId) {
  const q = encodeURIComponent(
    "'" + folderId + "' in parents and trashed=false",
  );
  const fields = encodeURIComponent(
    "files(id,name,mimeType,size,modifiedTime,createdTime,iconLink,webViewLink,owners(displayName,photoLink))",
  );
  const url =
    BASE +
    "/files?q=" +
    q +
    "&fields=" +
    fields +
    "&key=" +
    API_KEY +
    "&orderBy=folder,name&pageSize=200";
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err && err.error && err.error.message) ||
        "Failed to list files (" + res.status + ")",
    );
  }
  const data = await res.json();
  return data.files || [];
}

export async function getFile(fileId) {
  const fields = encodeURIComponent(
    "id,name,mimeType,size,modifiedTime,createdTime,iconLink,webViewLink,owners(displayName,photoLink),parents",
  );
  const res = await fetch(
    BASE + "/files/" + fileId + "?fields=" + fields + "&key=" + API_KEY,
  );
  if (!res.ok) throw new Error("Failed to fetch file metadata");
  return res.json();
}

export async function getFileContent(fileId) {
  const res = await fetch(
    BASE + "/files/" + fileId + "?alt=media&key=" + API_KEY,
  );
  if (!res.ok) throw new Error("Failed to fetch file content");
  return res.text();
}

// Add this new function at the end of the file
export function getDownloadLink(file) {
  // Prefer webContentLink for binary downloads (bypasses CORS)
  if (file.webContentLink) return file.webContentLink;

  // Fallback for Google Workspace docs: use exportLinks
  if (file.exportLinks) {
    const pdfLink = file.exportLinks["application/pdf"];
    if (pdfLink) return pdfLink;
  }

  // Last resort: the media URL (may hit CORS in browser)
  return `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${API_KEY}`;
}

/**
 * Recursively list all files under a folder (BFS).
 *
 * @param {string} folderId     - the starting folder
 * @param {object} [opts]
 * @param {number} [opts.maxDepth=5]     - how deep to descend
 * @param {number} [opts.maxFiles=2000]  - stop early if we exceed this count
 * @returns {Promise<Array>} flat list of files, each with a `_depth` and `_parentId`
 */
export async function listFilesRecursive(folderId, opts = {}) {
  const maxDepth = opts.maxDepth ?? 5;
  const maxFiles = opts.maxFiles ?? 2000;

  const results = [];
  // BFS queue: [{ id, depth }]
  const queue = [{ id: folderId, depth: 0 }];

  while (queue.length > 0) {
    if (results.length >= maxFiles) break;

    // Process one level at a time in parallel for speed
    const batch = queue.splice(0, 5); // 5 folders at a time
    const listings = await Promise.all(
      batch.map(({ id }) => listFiles(id).catch(() => [])),
    );

    for (let i = 0; i < batch.length; i++) {
      const { depth } = batch[i];
      const files = listings[i];

      for (const f of files) {
        if (f.mimeType === "application/vnd.google-apps.folder") {
          if (depth + 1 < maxDepth) {
            queue.push({ id: f.id, depth: depth + 1 });
          }
          // Folders themselves aren't added to results —
          // we only care about files for language/tag detection.
        } else {
          results.push({ ...f, _depth: depth });
        }

        if (results.length >= maxFiles) break;
      }
    }
  }

  return results;
}

/**
 * Find a single file by exact name inside a folder.
 * Returns the file object or null.
 */
export async function findFileByName(name, parentId) {
  const q = encodeURIComponent(
    `name='${name.replace(/'/g, "\\'")}' and '${parentId}' in parents and trashed=false`,
  );
  const fields = encodeURIComponent(
    "files(id,name,mimeType,size,modifiedTime,webViewLink)",
  );
  const url = `${BASE}/files?q=${q}&fields=${fields}&key=${API_KEY}&pageSize=1`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return data.files?.[0] || null;
}

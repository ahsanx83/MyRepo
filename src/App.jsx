import { useEffect, useState, useCallback } from "react";
import { Header } from "./components/Header";
import { RepoHeader } from "./components/RepoHeader";
import { Breadcrumbs } from "./components/Breadcrumbs";
import { FileTable } from "./components/FileTable";
import { FileViewer } from "./components/FileViewer";
import { Sidebar } from "./components/Sidebar";
import { listFiles, getFile } from "./services/driveApi";
import "./App.css";
import { ReadmePanel, findReadme } from "./components/ReadmePanel";
import { ProfileSidebar } from "./components/ProfileSidebar";
import { useTagsCatalog } from "./hooks/useTagsCatalog";

const ROOT_FOLDER_ID = import.meta.env.VITE_DRIVE_FOLDER_ID;
const REPO_OWNER = "Ahsan Ali";
const REPO_NAME = "my-repo";

export default function App() {
  const [folderId, setFolderId] = useState(ROOT_FOLDER_ID);
  const [path, setPath] = useState([{ id: ROOT_FOLDER_ID, name: REPO_NAME }]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [following, setFollowing] = useState(false);
  const tagsCatalog = useTagsCatalog(ROOT_FOLDER_ID);

  const loadFolder = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    setSelectedFile(null);
    try {
      const list = await listFiles(id);
      // Hide tags.txt from the UI — it's metadata, not repo content.
      const visible = list.filter((f) => f.name?.toLowerCase() !== "tags.txt");
      setFiles(visible);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFolder(folderId);
  }, [folderId, loadFolder]);

  const handleOpenFolder = (folder) => {
    setPath((p) => [...p, { id: folder.id, name: folder.name }]);
    setFolderId(folder.id);
  };

  const handleNavigate = (id, index) => {
    setPath((p) => p.slice(0, index + 1));
    setFolderId(id);
  };

  const handleOpenFile = async (file) => {
    try {
      const full = await getFile(file.id);
      setSelectedFile({ ...file, ...full });
    } catch {
      setSelectedFile(file);
    }
  };

  const latestCommit = files[0]
    ? {
        name: "Update " + files[0].name,
        owner: files[0].owners && files[0].owners[0],
        time: files[0].modifiedTime,
      }
    : null;

  const readmeFile = findReadme(files);

  return (
    <div className="app">
      <main className="main">
        <RepoHeader owner={REPO_OWNER} repoName={REPO_NAME} activeTab="code" />

        <div className="repo-body">
          {/* ---------- LEFT: profile rail ---------- */}
          <div className="profile-rail">
            <ProfileSidebar
              following={following}
              onFollow={() => setFollowing((f) => !f)}
            />
          </div>

          {/* ---------- MIDDLE: files + readme ---------- */}
          <div className="repo-content">
            {!selectedFile ? (
              <>
                <div className="branch-bar">
                  <Breadcrumbs path={path} onNavigate={handleNavigate} />
                </div>

                {loading && (
                  <div className="loading">Loading from Google Drive…</div>
                )}

                {error && (
                  <div className="error-box">
                    <h3>Could not load Drive contents</h3>
                    <p>{error}</p>
                    <p className="error-hint">
                      Make sure the folder is shared as "Anyone with the link"
                      and your API key is set in .env
                    </p>
                  </div>
                )}

                {!loading && !error && (
                  <>
                    <FileTable
                      files={files}
                      onOpenFolder={handleOpenFolder}
                      onOpenFile={handleOpenFile}
                      latestCommit={latestCommit}
                    />
                    {readmeFile && (
                      <ReadmePanel
                        file={readmeFile}
                        folderFiles={files}
                        folderId={folderId}
                      />
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                <div className="branch-bar">
                  <Breadcrumbs path={path} onNavigate={handleNavigate} />
                </div>
                <FileViewer
                  file={selectedFile}
                  onBack={() => setSelectedFile(null)}
                />
              </>
            )}
          </div>

          {/* ---------- RIGHT: languages / tags sidebar ---------- */}
          <Sidebar
            files={files}
            path={path}
            folderId={folderId}
            tagsCatalog={tagsCatalog}
          />
        </div>
      </main>
    </div>
  );
}

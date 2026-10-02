// Extension → language name
export const EXT_TO_LANGUAGE = {
  js: "JavaScript",
  mjs: "JavaScript",
  cjs: "JavaScript",
  jsx: "JavaScript",
  ts: "TypeScript",
  tsx: "TypeScript",
  py: "Python",
  pyw: "Python",
  java: "Java",
  kt: "Kotlin",
  kts: "Kotlin",
  scala: "Scala",
  c: "C",
  h: "C",
  cpp: "C++",
  cc: "C++",
  cxx: "C++",
  hpp: "C++",
  hh: "C++",
  cs: "C#",
  go: "Go",
  rs: "Rust",
  rb: "Ruby",
  php: "PHP",
  swift: "Swift",
  dart: "Dart",
  lua: "Lua",
  r: "R",
  jl: "Julia",
  hs: "Haskell",
  elm: "Elm",
  ex: "Elixir",
  exs: "Elixir",
  erl: "Erlang",
  clj: "Clojure",
  cljs: "Clojure",
  sh: "Shell",
  bash: "Shell",
  zsh: "Shell",
  fish: "Shell",
  ps1: "PowerShell",
  bat: "Batchfile",
  cmd: "Batchfile",
  html: "HTML",
  htm: "HTML",
  css: "CSS",
  scss: "SCSS",
  sass: "SCSS",
  less: "Less",
  styl: "Stylus",
  vue: "Vue",
  svelte: "Svelte",
  astro: "Astro",
  md: "Markdown",
  mdx: "Markdown",
  rst: "reStructuredText",
  json: "JSON",
  jsonc: "JSON",
  yml: "YAML",
  yaml: "YAML",
  toml: "TOML",
  ini: "INI",
  cfg: "INI",
  conf: "INI",
  xml: "XML",
  sql: "SQL",
  graphql: "GraphQL",
  gql: "GraphQL",
  proto: "Protocol Buffer",
  dockerfile: "Dockerfile",
  makefile: "Makefile",
  cmake: "CMake",
  gradle: "Gradle",
  // images
  png: "Image",
  jpg: "Image",
  jpeg: "Image",
  gif: "Image",
  webp: "Image",
  bmp: "Image",
  ico: "Image",
  svg: "Image",
  tiff: "Image",
  // media
  mp4: "Video",
  mov: "Video",
  avi: "Video",
  mkv: "Video",
  webm: "Video",
  mp3: "Audio",
  wav: "Audio",
  flac: "Audio",
  ogg: "Audio",
  m4a: "Audio",
  // archives
  zip: "Archive",
  tar: "Archive",
  gz: "Archive",
  rar: "Archive",
  "7z": "Archive",
  // docs
  pdf: "PDF",
  doc: "Document",
  docx: "Document",
  xls: "Spreadsheet",
  xlsx: "Spreadsheet",
  csv: "CSV",
  ppt: "Presentation",
  pptx: "Presentation",
  txt: "Text",
  log: "Text",
};

// GitHub-style color per language (subset; add your own)
export const LANGUAGE_COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  Kotlin: "#A97BFF",
  Scala: "#c22d40",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Dart: "#00B4AB",
  Lua: "#000080",
  R: "#198CE7",
  Julia: "#a270ba",
  Haskell: "#5e5086",
  Elm: "#60B5CC",
  Elixir: "#6e4a7e",
  Erlang: "#B83998",
  Clojure: "#db5855",
  Shell: "#89e051",
  PowerShell: "#012456",
  Batchfile: "#C1F12E",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Less: "#1d365d",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Astro: "#ff5a03",
  Markdown: "#083fa1",
  reStructuredText: "#141414",
  JSON: "#292929",
  YAML: "#cb171e",
  TOML: "#9c4221",
  INI: "#d1dbe0",
  XML: "#0060ac",
  SQL: "#e38c00",
  GraphQL: "#e10098",
  "Protocol Buffer": "#7d17d3",
  Dockerfile: "#384d54",
  Makefile: "#427819",
  CMake: "#DA3434",
  Gradle: "#02303a",
  Image: "#a463f2",
  Video: "#f5822f",
  Audio: "#f1e05a",
  Archive: "#9e7cff",
  PDF: "#e34c26",
  Document: "#2b579a",
  Spreadsheet: "#217346",
  CSV: "#237346",
  Presentation: "#d24726",
  Text: "#7d7d7d",
};

export function detectLanguage(name = "") {
  const lower = name.toLowerCase();
  // Special filenames first
  if (lower === "dockerfile" || lower.startsWith("dockerfile."))
    return "Dockerfile";
  if (lower === "makefile" || lower.startsWith("makefile.")) return "Makefile";
  if (lower === "cmakelists.txt") return "CMake";
  if (lower === ".gitignore" || lower === ".gitattributes") return "Text";
  if (lower === "license" || lower === "license.md") return "Text";

  const dot = lower.lastIndexOf(".");
  if (dot < 0) return null;
  const ext = lower.slice(dot + 1);
  return EXT_TO_LANGUAGE[ext] || null;
}

/**
 * Aggregate languages across a folder listing.
 * Folders are ignored (we only count files at this level).
 * Returns [{ name, count, pct, color }] sorted desc.
 */
export function computeLanguages(files) {
  const counts = {};
  for (const f of files) {
    if (!f || f.mimeType === "application/vnd.google-apps.folder") continue;
    const lang = detectLanguage(f.name);
    if (!lang) continue;
    counts[lang] = (counts[lang] || 0) + 1;
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return [];

  return Object.entries(counts)
    .map(([name, count]) => ({
      name,
      count,
      pct: (count / total) * 100,
      color: LANGUAGE_COLORS[name] || "#8b949e",
    }))
    .sort((a, b) => b.count - a.count);
}

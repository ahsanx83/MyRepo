/**
 * Infer "tags" for a folder based on its full recursive contents.
 * Detects: languages, frameworks, libraries, technologies, conventions.
 */

// ---------- Framework / library detection from filenames ----------
const FILENAME_TAGS = {
  // JS ecosystem
  "package.json": "Node.js",
  "package-lock.json": "npm",
  "yarn.lock": "Yarn",
  "pnpm-lock.yaml": "pnpm",
  "vite.config.js": "Vite",
  "vite.config.ts": "Vite",
  "next.config.js": "Next.js",
  "next.config.mjs": "Next.js",
  "nuxt.config.js": "Nuxt",
  "nuxt.config.ts": "Nuxt",
  "angular.json": "Angular",
  "svelte.config.js": "Svelte",
  "astro.config.mjs": "Astro",
  "remix.config.js": "Remix",
  "gatsby-config.js": "Gatsby",
  "tailwind.config.js": "Tailwind CSS",
  "tailwind.config.ts": "Tailwind CSS",
  "postcss.config.js": "PostCSS",
  "tsconfig.json": "TypeScript",
  "jsconfig.json": "JavaScript",
  "babel.config.js": "Babel",
  ".babelrc": "Babel",
  "webpack.config.js": "Webpack",
  "rollup.config.js": "Rollup",
  "esbuild.config.js": "esbuild",
  "jest.config.js": "Jest",
  "jest.config.ts": "Jest",
  "vitest.config.ts": "Vitest",
  "playwright.config.ts": "Playwright",
  "cypress.config.js": "Cypress",
  "cypress.config.ts": "Cypress",
  storybook: "Storybook",
  ".storybook": "Storybook",
  "eslint.config.js": "ESLint",
  ".eslintrc": "ESLint",
  ".eslintrc.js": "ESLint",
  ".eslintrc.json": "ESLint",
  ".prettierrc": "Prettier",
  "prettier.config.js": "Prettier",
  ".editorconfig": "EditorConfig",
  // Containers / CI
  dockerfile: "Docker",
  "docker-compose.yml": "Docker Compose",
  "docker-compose.yaml": "Docker Compose",
  ".dockerignore": "Docker",
  ".github": "GitHub Actions",
  ".gitlab-ci.yml": "GitLab CI",
  jenkinsfile: "Jenkins",
  ".travis.yml": "Travis CI",
  "circle.yml": "CircleCI",
  ".circleci": "CircleCI",
  "netlify.toml": "Netlify",
  "vercel.json": "Vercel",
  "firebase.json": "Firebase",
  "app.yaml": "Google App Engine",
  procfile: "Heroku",
  // Python
  "requirements.txt": "Python",
  "pyproject.toml": "Python",
  pipfile: "Pipenv",
  "poetry.lock": "Poetry",
  "setup.py": "setuptools",
  "manage.py": "Django",
  "wsgi.py": "WSGI",
  "asgi.py": "ASGI",
  "app.py": "Flask",
  "environment.yml": "Conda",
  "conda.yaml": "Conda",
  // Ruby
  gemfile: "Ruby",
  "gemfile.lock": "Bundler",
  rakefile: "Rake",
  "config.ru": "Rack",
  // PHP
  "composer.json": "Composer",
  "composer.lock": "Composer",
  artisan: "Laravel",
  // Java / JVM
  "pom.xml": "Maven",
  "build.gradle": "Gradle",
  "build.gradle.kts": "Gradle",
  "settings.gradle": "Gradle",
  // Rust
  "cargo.toml": "Rust",
  "cargo.lock": "Cargo",
  // Go
  "go.mod": "Go",
  "go.sum": "Go",
  // Dart / Flutter
  "pubspec.yaml": "Flutter",
  "pubspec.lock": "Flutter",
  // .NET
  "global.json": ".NET",
  // Data / ML
  "kaggle.json": "Kaggle",
  "mlflow.yml": "MLflow",
  "dvc.yaml": "DVC",
  "dvc.lock": "DVC",
};

// ---------- Folder name → tag ----------
const FOLDER_TAGS = {
  // Conventional layout
  src: "Source",
  source: "Source",
  lib: "Library",
  libs: "Library",
  app: "App",
  api: "API",
  server: "Backend",
  backend: "Backend",
  client: "Frontend",
  frontend: "Frontend",
  web: "Web",
  mobile: "Mobile",
  ios: "iOS",
  android: "Android",
  desktop: "Desktop",
  components: "Components",
  pages: "Pages",
  views: "Views",
  routes: "Routes",
  hooks: "Hooks",
  store: "State",
  store: "State Management",
  redux: "Redux",
  context: "Context",
  utils: "Utils",
  helpers: "Utils",
  services: "Services",
  models: "Models",
  controllers: "Controllers",
  middleware: "Middleware",
  config: "Config",
  configs: "Config",
  scripts: "Scripts",
  bin: "Binaries",
  public: "Static",
  static: "Static",
  assets: "Assets",
  styles: "Styles",
  theme: "Theme",
  themes: "Theme",
  images: "Images",
  img: "Images",
  icons: "Icons",
  fonts: "Fonts",
  docs: "Docs",
  doc: "Docs",
  documentation: "Docs",
  examples: "Examples",
  example: "Examples",
  samples: "Examples",
  test: "Testing",
  tests: "Testing",
  __tests__: "Testing",
  spec: "Testing",
  e2e: "E2E Testing",
  cypress: "Cypress",
  playwright: "Playwright",
  data: "Data",
  dataset: "Dataset",
  datasets: "Dataset",
  notebooks: "Jupyter",
  notebook: "Jupyter",
  ml: "Machine Learning",
  ai: "AI",
  models: "ML Models",
  checkpoints: "Checkpoints",
  weights: "Model Weights",
  logs: "Logs",
  migrations: "Database Migrations",
  prisma: "Prisma",
  database: "Database",
  db: "Database",
  sql: "SQL",
  grafana: "Grafana",
  prometheus: "Prometheus",
  k8s: "Kubernetes",
  kubernetes: "Kubernetes",
  helm: "Helm",
  terraform: "Terraform",
  ansible: "Ansible",
  ".github": "GitHub Actions",
};

// ---------- Language detection (unchanged from your current file) ----------
const EXT_TO_LANGUAGE = {
  js: "JavaScript",
  mjs: "JavaScript",
  cjs: "JavaScript",
  jsx: "React",
  ts: "TypeScript",
  tsx: "React (TSX)",
  py: "Python",
  pyw: "Python",
  ipynb: "Jupyter",
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
  mdx: "MDX",
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
};

// ---------- Extension → extra tag (beyond language) ----------
const EXT_TO_TAG = {
  ipynb: "Jupyter",
  sql: "SQL",
  graphql: "GraphQL",
  gql: "GraphQL",
  proto: "gRPC",
  dockerfile: "Docker",
  tf: "Terraform",
  hcl: "Terraform",
  svg: "SVG",
  png: "Images",
  jpg: "Images",
  jpeg: "Images",
  gif: "Images",
  webp: "Images",
  bmp: "Images",
  ico: "Images",
  tiff: "Images",
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
  zip: "Archive",
  tar: "Archive",
  gz: "Archive",
  rar: "Archive",
  "7z": "Archive",
  pdf: "PDF",
  csv: "CSV",
  xlsx: "Excel",
  xls: "Excel",
  doc: "Word",
  docx: "Word",
  ppt: "PowerPoint",
  pptx: "PowerPoint",
};

function detectLanguage(name = "") {
  const lower = name.toLowerCase();
  if (lower === "dockerfile" || lower.startsWith("dockerfile."))
    return "Dockerfile";
  if (lower === "makefile" || lower.startsWith("makefile.")) return "Makefile";
  if (lower === "cmakelists.txt") return "CMake";
  if (lower === ".gitignore" || lower === ".gitattributes") return null;
  if (lower === "license" || lower.startsWith("license.")) return null;
  const i = lower.lastIndexOf(".");
  if (i < 0) return null;
  const ext = lower.slice(i + 1);
  return EXT_TO_LANGUAGE[ext] || null;
}

function getExt(name = "") {
  const lower = name.toLowerCase();
  if (lower === "dockerfile") return "dockerfile";
  const i = lower.lastIndexOf(".");
  return i >= 0 ? lower.slice(i + 1) : "";
}

/**
 * Compute tags for a folder subtree.
 *
 * @param {Array} files - recursive file list (with `_depth` optionally)
 * @param {Array} path  - current breadcrumb path
 */
export function computeTags(files = [], path = []) {
  const tags = new Set();
  const names = new Set();

  // Collect all basenames + extensions
  for (const f of files) {
    const name = (f.name || "").toLowerCase();
    names.add(name);
    const ext = getExt(name);
    if (ext && EXT_TO_TAG[ext]) tags.add(EXT_TO_TAG[ext]);
  }

  // Filenames → framework/library tags
  for (const n of names) {
    if (FILENAME_TAGS[n]) tags.add(FILENAME_TAGS[n]);
  }

  // Folder names in the path → convention tags
  for (const p of path) {
    const nm = (p.name || "").toLowerCase();
    if (FOLDER_TAGS[nm]) tags.add(FOLDER_TAGS[nm]);
  }

  // Top-level folder in the current view (the folder itself)
  if (path.length > 0) {
    const current = path[path.length - 1].name;
    if (current && current.length <= 24 && /^[\w\-. ]+$/.test(current)) {
      tags.add(current);
    }
  }

  // Docs presence
  if (names.has("readme.md")) tags.add("Docs");
  if (names.has("license") || names.has("license.md")) tags.add("Licensed");
  if (names.has("contributing.md")) tags.add("Contributing");
  if (names.has("changelog.md")) tags.add("Changelog");
  if (names.has(".gitignore")) tags.add("Git");

  // Deduplicate against language tags already detected elsewhere — but
  // some overlap (e.g. 'React' as both language-of-file and framework)
  // is fine and informative. We cap the total below.
  return Array.from(tags).slice(0, 20);
}

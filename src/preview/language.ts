const languages: Record<string, string> = {
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  jsx: "javascript",
  ts: "typescript",
  mts: "typescript",
  cts: "typescript",
  tsx: "tsx",
  py: "python",
  pyw: "python",
  rs: "rust",
  go: "go",
  c: "c",
  h: "c",
  cc: "cpp",
  cpp: "cpp",
  cxx: "cpp",
  hpp: "cpp",
  hxx: "cpp",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  json: "json",
  html: "html",
  htm: "html",
  css: "css",
  md: "markdown",
  markdown: "markdown",
  yml: "yaml",
  yaml: "yaml",
  toml: "toml",
  java: "java",
};

export function languageFor(name: string): string | undefined {
  const lower = name.toLowerCase();
  if (lower === ".bashrc" || lower === ".profile" || lower === ".bash_profile")
    return "bash";
  const dot = lower.lastIndexOf(".");
  return dot < 0 ? undefined : languages[lower.slice(dot + 1)];
}

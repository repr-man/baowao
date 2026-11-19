import { createBrowserTreelight } from "@treelight/browser";
import githubLight from "@treelight/theme-github-light";

const highlighter = createBrowserTreelight({ themes: [githubLight] });
highlighter.registerLanguage(
  "javascript",
  () => import("@treelight/javascript/browser"),
);
highlighter.registerLanguage(
  "typescript",
  () => import("@treelight/typescript/browser"),
);
highlighter.registerLanguage("tsx", () => import("@treelight/tsx/browser"));
highlighter.registerLanguage(
  "python",
  () => import("@treelight/python/browser"),
);
highlighter.registerLanguage("rust", () => import("@treelight/rust/browser"));
highlighter.registerLanguage("go", () => import("@treelight/go/browser"));
highlighter.registerLanguage("c", () => import("@treelight/c/browser"));
highlighter.registerLanguage("cpp", () => import("@treelight/cpp/browser"));
highlighter.registerLanguage("bash", () => import("@treelight/bash/browser"));
highlighter.registerLanguage("json", () => import("@treelight/json/browser"));
highlighter.registerLanguage("html", () => import("@treelight/html/browser"));
highlighter.registerLanguage("css", () => import("@treelight/css/browser"));
highlighter.registerLanguage(
  "markdown",
  () => import("@treelight/markdown/browser"),
);
highlighter.registerLanguage("yaml", () => import("@treelight/yaml/browser"));
highlighter.registerLanguage("toml", () => import("@treelight/toml/browser"));
highlighter.registerLanguage("java", () => import("@treelight/java/browser"));

self.onmessage = async (
  event: MessageEvent<{ text: string; language: string }>,
) => {
  try {
    // Treelight escapes the source before producing its highlighted HTML.
    const lines = await highlighter.highlightLines(
      event.data.text,
      event.data.language,
      { theme: "github-light", strict: true },
    );
    self.postMessage({ html: lines.join("\n") });
  } catch {
    self.postMessage({ html: null });
  }
};

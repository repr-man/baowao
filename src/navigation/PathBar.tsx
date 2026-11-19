import { createMemo, createSignal, For, Show } from "solid-js";
import { Breadcrumb, Breadcrumbs } from "@solid2-aria/components/breadcrumbs";
import { Link } from "@solid2-aria/components/link";
import {
  ArrowClockwiseRegular,
  CaretRightRegular,
  CheckRegular,
  CopyRegular,
} from "phosphor-solid";
import { copyPath } from "./desktop";
import { notifyError } from "../toast";

export default function PathBar(props: {
  path: string;
  onRefresh: () => void;
  onNavigate: (path: string) => void;
}) {
  const currentPath = () => props.path;
  const [copied, setCopied] = createSignal(() => {
    currentPath();
    return false;
  });
  const breadcrumbs = createMemo(() => {
    const parts = currentPath().split("/").filter(Boolean);
    let fullPath = "";
    return [
      { name: "/", path: "/" },
      ...parts.map((name) => {
        fullPath += `/${name}`;
        return { name, path: fullPath };
      }),
    ];
  });

  async function copyFolderPath() {
    const path = currentPath();
    try {
      await copyPath(path);
      if (currentPath() === path) setCopied(true);
    } catch (cause) {
      notifyError(cause);
    }
  }

  return (
    <div class="path-bar">
      <button
        class="icon-button"
        title="Rescan folder"
        aria-label="Rescan folder"
        onClick={props.onRefresh}
      >
        <ArrowClockwiseRegular width={19} height={19} />
      </button>
      <button
        class="icon-button"
        title={copied() ? "Path copied" : "Copy folder path"}
        aria-label="Copy folder path"
        onClick={() => void copyFolderPath()}
      >
        {copied() ? (
          <CheckRegular width={19} height={19} />
        ) : (
          <CopyRegular width={19} height={19} />
        )}
      </button>
      <nav class="breadcrumbs" aria-label="Folder path">
        <Breadcrumbs
          aria-label="Folder path"
          onAction={(key) => props.onNavigate(String(key))}
        >
          <For each={breadcrumbs()}>
            {(crumb, index) => (
              <Breadcrumb id={crumb.path}>
                <Show when={index() > 0}>
                  <CaretRightRegular
                    class="breadcrumb-separator"
                    width={14}
                    height={14}
                    aria-hidden="true"
                  />
                </Show>
                <Link>{crumb.name}</Link>
              </Breadcrumb>
            )}
          </For>
        </Breadcrumbs>
      </nav>
    </div>
  );
}

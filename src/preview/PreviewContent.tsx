import { createMemo, Loading, onSettled, refresh, Show } from "solid-js";
import { FileRegular } from "phosphor-solid";
import type { Scan } from "../scan/cache";
import CodeView from "./CodeView";
import { loadPreview } from "./load-preview";

export default function PreviewContent(props: {
  file: Scan["entries"][number];
}) {
  const controller = new AbortController();
  const preview = createMemo(() => loadPreview(props.file, controller.signal));
  onSettled(() => () => controller.abort());

  return (
    <Loading fallback={PreviewSkeleton()}>
      <div class="preview-body">
        <Show
          when={preview()}
          fallback={
            <div class="preview-unavailable">
              <FileRegular width={32} height={32} aria-hidden="true" />
              <p>Preview unavailable</p>
              <button class="primary-button" onClick={() => refresh(preview)}>
                Retry
              </button>
            </div>
          }
        >
          {(content) => <CodeView file={props.file} content={content()} />}
        </Show>
      </div>
    </Loading>
  );
}

function PreviewSkeleton() {
  return (
    <div class="preview-loading" role="status" aria-label="Loading file">
      <span class="skeleton" />
      <span class="skeleton" />
      <span class="skeleton" />
      <span class="skeleton" />
    </div>
  );
}

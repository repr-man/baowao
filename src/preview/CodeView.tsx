import { createMemo, Show } from "solid-js";
import type { Scan } from "../scan/cache";

export default function CodeView(props: {
  file: Scan["entries"][number];
  content: { text: string; html: string | null };
}) {
  const lineNumbers = createMemo(() =>
    Array.from(
      { length: props.content.text.split("\n").length },
      (_, i) => i + 1,
    ).join("\n"),
  );
  return (
    <div
      class="code-scroll"
      tabindex="0"
      role="region"
      aria-label={`Read-only preview of ${props.file.name}`}
    >
      <pre class="line-numbers" aria-hidden="true">
        {lineNumbers()}
      </pre>
      <Show
        when={props.content.html !== null}
        fallback={<pre class="code-text">{props.content.text}</pre>}
      >
        <pre class="code-text" innerHTML={props.content.html!} />
      </Show>
    </div>
  );
}

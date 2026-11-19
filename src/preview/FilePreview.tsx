import { Show } from "solid-js";
import { preview, closePreview } from "./store";
import { XRegular } from "phosphor-solid";
import { Dialog } from "@solid2-aria/components/dialog";
import { Modal, ModalOverlay } from "@solid2-aria/components/modal";
import { Button } from "@solid2-aria/components/button";
import PreviewContent from "./PreviewContent";

export default function FilePreview() {
  return (
    <Show when={preview.file}>
      {(file) => (
        <ModalOverlay
          class="preview-overlay"
          defaultOpen
          isDismissable
          onOpenChange={(open) => {
            if (!open) closePreview();
          }}
        >
          <Modal class="preview-dialog">
            <Dialog
              class="preview-dialog-content"
              aria-labelledby="preview-title"
            >
              <header class="preview-header">
                <div class="preview-title">
                  <h2 id="preview-title">{file().name}</h2>
                  <span title={file().path}>{file().path}</span>
                </div>
                <span title="Close preview">
                  <Button
                    slot="close"
                    class="preview-close"
                    aria-label="Close preview"
                  >
                    <XRegular width={20} height={20} />
                  </Button>
                </span>
              </header>
              <PreviewContent file={file()} />
            </Dialog>
          </Modal>
        </ModalOverlay>
      )}
    </Show>
  );
}

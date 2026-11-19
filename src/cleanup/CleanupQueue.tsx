import { createSignal, For, snapshot } from "solid-js";
import { Button } from "@solid2-aria/components/button";
import { Dialog } from "@solid2-aria/components/dialog";
import { Modal, ModalOverlay } from "@solid2-aria/components/modal";
import {
  FileRegular,
  FolderRegular,
  LinkRegular,
  TrashRegular,
} from "phosphor-solid";
import { cleanup, deleteQueued, removeCleanupItem } from "./queue";
import type { QueueItem } from "./queue";
import { openPath } from "../navigation/store";

export default function CleanupQueue() {
  const [pendingItems, setPendingItems] = createSignal<QueueItem[] | null>(
    null,
  );

  function openItem(item: QueueItem) {
    openPath(
      item.directory
        ? item.path
        : item.path.slice(0, item.path.lastIndexOf("/")) || "/",
    );
  }

  function requestDelete() {
    if (cleanup.deleting || !cleanup.items.length) return;
    setPendingItems(snapshot(cleanup.items));
  }

  return (
    <section class="cleanup" aria-label="Cleanup queue">
      <div class="cleanup-list">
        <For each={cleanup.items}>
          {(item) => (
            <div class="cleanup-row">
              <button
                class="cleanup-item"
                aria-label={`${item.link ? "Symbolic link: " : ""}${item.path}`}
                title={`${item.path}${item.link ? " — symbolic link" : ""}`}
                onClick={() => openItem(item)}
                onMouseDown={(event) => {
                  if (event.button === 1) event.preventDefault();
                }}
                onAuxClick={(event) => {
                  if (event.button === 1) {
                    event.preventDefault();
                    removeCleanupItem(item.path);
                  }
                }}
              >
                {item.link ? (
                  <LinkRegular width={17} height={17} />
                ) : item.directory ? (
                  <FolderRegular width={17} height={17} />
                ) : (
                  <FileRegular width={17} height={17} />
                )}
                <span class="cleanup-name">{item.name}</span>
              </button>
            </div>
          )}
        </For>
      </div>
      <div class="cleanup-footer">
        <span>
          Cleanup <span class="cleanup-count">{cleanup.items.length}</span>
        </span>
        <button
          class="cleanup-delete"
          title="Permanently delete queued items"
          aria-label="Permanently delete queued items"
          disabled={!cleanup.items.length || cleanup.deleting}
          onClick={requestDelete}
        >
          <TrashRegular width={18} height={18} />
        </button>
      </div>
      <ModalOverlay
        class="cleanup-confirm-overlay"
        isOpen={pendingItems() !== null}
        isDismissable
        onOpenChange={(open) => {
          if (!open) setPendingItems(null);
        }}
      >
        <Modal class="cleanup-confirm-dialog">
          <Dialog
            class="cleanup-confirm-content"
            aria-labelledby="cleanup-confirm-title"
            aria-describedby="cleanup-confirm-description"
          >
            {({ close }) => (
              <>
                <h2 id="cleanup-confirm-title">Delete queued items?</h2>
                <p id="cleanup-confirm-description">
                  Permanently delete {pendingItems()?.length ?? 0}{" "}
                  {(pendingItems()?.length ?? 0) === 1 ? "item" : "items"}? This
                  cannot be undone.
                </p>
                <div class="cleanup-confirm-actions">
                  <Button class="cleanup-confirm-cancel" onPress={close}>
                    Cancel
                  </Button>
                  <Button
                    class="cleanup-confirm-delete"
                    onPress={() => {
                      const queued = pendingItems();
                      close();
                      if (queued) void deleteQueued(queued);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </section>
  );
}

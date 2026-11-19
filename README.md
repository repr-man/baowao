# Baowao

A Linux disk usage explorer built with SolidJS 2, Electron, Valence, and Phosphor Solid.

## Run

Requirements: Node.js 22.12 or later and pnpm.

```sh
pnpm install
pnpm run setup:electron
pnpm run dev
```

Build with `pnpm run build`, then launch the built application with `pnpm run start`.

## How scanning works

Choose a folder, or scan the home folder or filesystem. Baowao reads its immediate entries and measures up to four child directories at once. Results appear as each measurement finishes; select a directory in the chart or list to explore it. The chart and list show allocated disk space in binary units, including hidden files. Symbolic links are measured as links and are not followed.

A directory's own allocation is included in its total but has no list entry. Entries with multiple hard links are marked separately and excluded from usage totals, including when nested in a scanned folder. Permission errors and other incomplete scans are flagged in the interface. Filesystem changes during a scan can affect accuracy. A single exceptionally large child directory is measured by one traversal. Switching directories cancels an unfinished scan; returning to it starts a fresh scan. Completed results are cached in memory while the app is open; use the rescan button to refresh them. Back and forward navigation restores cached results.

## Cleanup queue

Middle-click an item in the contents list or chart to add it to or remove it from the queue. Hard links cannot be queued or deleted, and folders containing them cannot be deleted through the cleanup queue. Cleanup stops at filesystem boundaries detected by device number; same-device bind mounts cannot be detected this way. Middle-click a queued item to remove it. Select a queued directory to open it, or a queued file to open its containing directory. The delete button permanently removes queued items after confirmation. Items that cannot be deleted remain in the queue, and their errors appear in a notification.

## Text preview

Click a regular file in the contents list or chart to open a read-only preview. Common source formats are highlighted with Tree-sitter; other UTF-8 text appears as plain text. Binary files, symbolic links, special files, and files larger than 1 MiB are not previewed.

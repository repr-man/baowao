import {
  FolderOpenRegular,
  HardDrivesRegular,
  HouseRegular,
} from "phosphor-solid";
import CleanupQueue from "../cleanup/CleanupQueue";
import { openPath } from "./store";
import { chooseDirectory, homeDirectory } from "./desktop";
import { notifyError } from "../toast";

export default function Sidebar() {
  async function pick() {
    try {
      const path = await chooseDirectory();
      if (path) openPath(path);
    } catch (cause) {
      notifyError(cause);
    }
  }
  async function home() {
    try {
      openPath(await homeDirectory());
    } catch (cause) {
      notifyError(cause);
    }
  }

  return (
    <aside class="rail">
      <button
        class="rail-button"
        title="Select folder"
        onClick={() => void pick()}
      >
        <FolderOpenRegular width={19} height={19} /> Select folder
      </button>
      <button
        class="rail-button"
        title="Home folder"
        onClick={() => void home()}
      >
        <HouseRegular width={19} height={19} /> Home folder
      </button>
      <button
        class="rail-button"
        title="File system"
        onClick={() => openPath("/")}
      >
        <HardDrivesRegular width={19} height={19} /> File system
      </button>
      <CleanupQueue />
    </aside>
  );
}

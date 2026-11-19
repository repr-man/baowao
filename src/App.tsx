import { Toaster } from "@solid2-aria/sonner";
import Navigation from "./navigation/Navigation";
import Sidebar from "./navigation/Sidebar";
import FilePreview from "./preview/FilePreview";
import ScanWorkspace from "./scan/ScanWorkspace";

export default function App() {
  return (
    <div class="app-shell">
      <Navigation />
      <Sidebar />
      <ScanWorkspace />
      <Toaster position="top-right" closeButton richColors expand />
      <FilePreview />
    </div>
  );
}

import { onSettled } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";
import { disposeScans } from "../scan/cache";
import { resetNavigation, selectPath } from "./store";

/** Synchronizes browser history with the selected scan and owns global listeners. */
export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();

  onSettled(() => {
    selectPath(new URLSearchParams(location.search).get("path"));
    const onHashChange = () => {
      const url = new URL(
        window.location.hash.slice(1) || "/",
        "http://localhost",
      );
      selectPath(url.searchParams.get("path"));
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey &&
        (event.key === "ArrowLeft" || event.key === "ArrowRight")
      ) {
        event.preventDefault();
        navigate(event.key === "ArrowLeft" ? -1 : 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("hashchange", onHashChange);
      disposeScans();
      resetNavigation();
    };
  });
  return null;
}

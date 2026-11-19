import { render } from "@solidjs/web";
import { createRouter, hashHistory } from "@solidjs/router";
import App from "./App";
import "./style.css";
import "./navigation/navigation.css";
import "./scan/scan.css";
import "./cleanup/cleanup.css";
import "./preview/preview.css";
import "@solid2-aria/sonner/styles.css";

const Router = createRouter({
  routes: [{ path: "/", component: App }],
  history: hashHistory(),
});
const root = document.getElementById("root");
if (!root) throw new Error("The application root element is missing.");
render(() => <Router>{(props) => props.children}</Router>, root);

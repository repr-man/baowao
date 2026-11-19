import { Menu } from "electron";
import { defineElectronApp } from "valence/electron";

export default defineElectronApp({
  ready() {
    Menu.setApplicationMenu(null);
  },
});

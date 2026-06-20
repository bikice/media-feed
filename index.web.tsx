import React from "react";
import { createRoot } from "react-dom/client";
import { AppRegistry } from "react-native";
import App from "./App";

AppRegistry.registerComponent("media-feed", () => App);

const { getApplication } = AppRegistry as unknown as {
  getApplication: (
    appName: string,
    appParams: object
  ) => { element: React.ReactElement };
};

const { element } = getApplication("media-feed", {});
const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(element);
}

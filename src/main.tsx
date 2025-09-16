console.log('main.tsx: Starting app initialization');

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log('main.tsx: Imports loaded, creating root');

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('main.tsx: Root element not found!');
} else {
  console.log('main.tsx: Root element found, rendering App');
  createRoot(rootElement).render(<App />);
}

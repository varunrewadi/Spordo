import { Outlet } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";

import "./index.css";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

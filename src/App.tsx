import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Store from "./pages/Store";
import Vote from "./pages/Vote";
import Jobs from "./pages/Jobs";
import NotFound from "./pages/NotFound";
import Aurex from "./pages/Aurex";
import AdminStore from "./pages/AdminStore";
import Seo from "./components/Seo";
import { useScrollReveal } from "./hooks/useScrollReveal";
import AccessibilityDock from "./components/AccessibilityDock";

export default function App() {
  useScrollReveal();

  return (
    <>
      <Seo />
      <Routes>
        <Route path="/admin" element={<AdminStore />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/store" element={<Store />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/aurex" element={<Aurex />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>

      <AccessibilityDock />
    </>
  );
}
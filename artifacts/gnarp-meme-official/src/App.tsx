import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import StarField from "./components/StarField";
import FloatingGnarp from "./components/FloatingGnarp";
import HomePage from "./pages/HomePage";
import LorePage from "./pages/LorePage";
import GalleryPage from "./pages/GalleryPage";
import CommunityPage from "./pages/CommunityPage";
import TokenPage from "./pages/TokenPage";
import GamePage from "./pages/GamePage";

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <div className="relative min-h-screen" style={{ background: "#050812" }}>
        <StarField />
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lore" element={<LorePage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/token" element={<TokenPage />} />
          <Route path="/game" element={<GamePage />} />
        </Routes>
        <FloatingGnarp />
      </div>
    </BrowserRouter>
  );
}

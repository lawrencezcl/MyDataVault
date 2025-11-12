import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Dashboard from "@/pages/Dashboard";
import DataManager from "@/pages/DataManager";
import AccessManager from "@/pages/AccessManager";
import CrossChainBridge from "@/pages/CrossChainBridge";
import Settings from "@/pages/Settings";

export default function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/data" element={<DataManager />} />
        <Route path="/access" element={<AccessManager />} />
        <Route path="/cross-chain" element={<CrossChainBridge />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

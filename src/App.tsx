import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Dashboard from "@/pages/Dashboard";
import DataManager from "@/pages/DataManager";
import AccessManager from "@/pages/AccessManager";
import CrossChainBridge from "@/pages/CrossChainBridge";
import Settings from "@/pages/Settings";
import { setApiBaseUrl } from "@/config/api";

export default function App() {
  useEffect(() => {
    // Force production mode for Vercel deployments
    const hostname = window.location.hostname;
    const isVercel = hostname.includes('vercel.app') || hostname.includes('vercel.dev');
    const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');
    
    console.log('App initialization:', { hostname, isVercel, isLocalhost });
    
    if (isVercel && !isLocalhost) {
      console.log('Forcing relative URLs for Vercel production');
      setApiBaseUrl(''); // Force relative URLs in production
    }
  }, []);

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

import { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext.jsx";
import PublicNav from "./PublicNav.jsx";
import Logo from "./components/Logo.jsx";
import HomePage from "./pages/HomePage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import TermsPage from "./pages/TermsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AdminLoginPage from "./pages/AdminLoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LeaderboardPage from "./pages/LeaderboardPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import ZoomPage from "./pages/ZoomPage.jsx";
import TestPage from "./pages/TestPage.jsx";
import TestResultPage from "./pages/TestResultPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import SupportPage from "./pages/SupportPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import StudyMaterialsPage from "./pages/StudyMaterialsPage.jsx";
import ArenaPage from "./pages/ArenaPage.jsx";
import BookmarksPage from "./pages/BookmarksPage.jsx";
import WalletPage from "./pages/WalletPage.jsx";
import VaultPage from "./pages/VaultPage.jsx";
import LibraryPage from "./pages/LibraryPage.jsx";
import CollectionPage from "./pages/CollectionPage.jsx";
import UpgradePage from "./pages/UpgradePage.jsx";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminProtected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!user.is_admin && user.role !== "super_admin" && user.role !== "school_admin") return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  
  const isAdminRoute = location.pathname.startsWith("/admin");
  
  // FIXED: Added "/terms" so the Terms page opens as a clean full-width page
  const isFullWidthRoute = 
    location.pathname === "/" || 
    location.pathname === "/login" || 
    location.pathname === "/register" ||
    location.pathname === "/terms" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/reset-password" ||
    location.pathname.startsWith("/test/");

  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminProtected><AdminPage /></AdminProtected>} />
      </Routes>
    );
  }

  if (isFullWidthRoute) {
    return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={user ? <Navigate to={user.is_admin ? "/admin" : "/dashboard"} replace /> : <LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/test/:id/result" element={<Protected><TestResultPage /></Protected>} />
        <Route path="/test/:subject/:mode" element={<Protected><TestPage /></Protected>} />
      </Routes>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", width: "100%" }}>
      <div className="public-mobile-header">
        <Logo size="sm" linkTo={user ? "/dashboard" : "/"} />
        <button onClick={() => setMobileOpen(true)} style={{ background: "transparent", border: "none", color: "var(--mk-text)", fontSize: "1.5rem", cursor: "pointer", padding: 0 }} aria-label="Open menu">☰</button>
      </div>

      <div className="public-layout" style={{ flex: 1 }}>
        <PublicNav mobileOpen={mobileOpen} closeMobile={() => setMobileOpen(false)} />
        {mobileOpen && <div className="public-overlay" onClick={() => setMobileOpen(false)}></div>}

        <main className="public-main">
          <Routes>
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/zoom" element={<ZoomPage />} />
            <Route path="/support" element={<Protected><SupportPage /></Protected>} />
            <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
            <Route path="/history" element={<Protected><HistoryPage /></Protected>} />
            <Route path="/bookmarks" element={<Protected><BookmarksPage /></Protected>} />
            <Route path="/materials" element={<Protected><StudyMaterialsPage /></Protected>} />
            <Route path="/arena" element={<Protected><ArenaPage /></Protected>} />
            <Route path="/wallet" element={<Protected><WalletPage /></Protected>} />
            <Route path="/vault" element={<Protected><VaultPage /></Protected>} />
            <Route path="/library" element={<Protected><LibraryPage /></Protected>} />
            <Route path="/collection" element={<Protected><CollectionPage /></Protected>} />
            <Route path="/upgrade" element={<Protected><UpgradePage /></Protected>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import DashboardLayout from "./layouts/DashboardLayout";

import CityMapPage from "./pages/CityMapPage";
import Login from "./pages/Login";
import ReportIssue from "./pages/ReportIssue";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ExplorePage from "./pages/ExplorePage";
import MyReportsPage from "./pages/MyReportsPage";
import ProfilePage from "./pages/ProfilePage";
import AboutPage from "./pages/AboutPage";
import WishlistPage from "./pages/WishlistPage";

const PlaceholderPage = ({ title }) => (
  <div className="mx-auto max-w-7xl px-4 py-8">
    <h1 className="text-3xl font-semibold tracking-tight">
      {title}
    </h1>
    <p className="mt-2 text-sm text-[#737873]">
      This section will be implemented next.
    </p>
  </div>
);

const App = () => (
  <BrowserRouter>
    <Navbar />

    <Routes>
      {/* Default landing page */}
      <Route
        path="/"
        element={<Navigate to="/explore" replace />}
      />

      {/* Login page */}
      <Route path="/login" element={<Login />} />

      {/* Main application layout */}
      <Route element={<DashboardLayout />}>
        <Route path="explore" element={<ExplorePage />} />

        <Route path="dashboard" element={<DashboardPage />} />

        <Route path="report" element={<ReportIssue />} />

        <Route path="map" element={<CityMapPage />} />

        <Route path="my-reports" element={<MyReportsPage />} />

        <Route path="profile" element={<ProfilePage />} />

        <Route path="about" element={<AboutPage />} />

        <Route path="wishlist" element={<WishlistPage />} />
      </Route>

      {/* Unknown routes */}
      <Route
        path="*"
        element={<PlaceholderPage title="Page not found" />}
      />
    </Routes>
  </BrowserRouter>
);

export default App;

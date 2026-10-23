
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close the drawer after navigating to another page.
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Listen for the menu button in the Navbar.
  useEffect(() => {
    const handleToggleSidebar = () => {
      setSidebarOpen((open) => !open);
    };

    const handleCloseSidebar = () => {
      setSidebarOpen(false);
    };

    window.addEventListener(
      "citypulse:toggle-sidebar",
      handleToggleSidebar
    );

    window.addEventListener(
      "citypulse:close-sidebar",
      handleCloseSidebar
    );

    return () => {
      window.removeEventListener(
        "citypulse:toggle-sidebar",
        handleToggleSidebar
      );

      window.removeEventListener(
        "citypulse:close-sidebar",
        handleCloseSidebar
      );
    };
  }, []);

  // Prevent background scrolling while the mobile drawer is open.
  useEffect(() => {
    if (!sidebarOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  // Allow Escape to close the drawer.
  useEffect(() => {
    if (!sidebarOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [sidebarOpen]);

  return (
    <div className="flex h-[calc(100dvh-68px)] overflow-hidden bg-[#FFFCF8]">
      {/* Permanent desktop sidebar */}
      <aside className="fixed bottom-0 left-0 top-[68px] z-30 hidden w-64 md:block">
        <Sidebar />
      </aside>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-x-0 bottom-0 top-[68px] z-40 bg-black/40 backdrop-blur-[2px] md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile slide-out sidebar */}
      <aside
        id="mobile-sidebar"
        aria-label="Mobile navigation"
        aria-hidden={!sidebarOpen}
        className={`fixed bottom-0 left-0 top-[68px] z-50 w-[280px] max-w-[85vw] overflow-hidden shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </aside>

      {/* Main content */}
      <main className="h-full min-w-0 flex-1 overflow-y-auto px-4 pb-8 pt-16 sm:px-5 md:ml-64 md:px-8 md:py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;

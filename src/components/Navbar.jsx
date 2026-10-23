import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  Menu,
  MapPin,
  Search,
  Heart,
  UserRound,
  LogIn,
  LogOut,
  Plus,
} from "lucide-react";

import { auth } from "../firebase/config";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const isLoginPage = location.pathname === "/login";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  const toggleSidebar = () => {
    window.dispatchEvent(new Event("citypulse:toggle-sidebar"));
  };

  const closeSidebar = () => {
    window.dispatchEvent(new Event("citypulse:close-sidebar"));
  };

  const handleLogout = async () => {
    try {
      closeSidebar();
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Unable to log out. Please try again.");
    }
  };

  const navLinks = [
    { name: "Explore", path: "/explore", icon: Search },
    { name: "Wishlist", path: "/wishlist", icon: Heart },
    { name: "Profile", path: "/profile", icon: UserRound },
  ];

  return (
    <header className="relative z-[60] h-[68px] border-b border-[#E9E1D9] bg-[#FFFCF8]">
      <div className="mx-auto flex h-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <NavLink
          to="/"
          onClick={closeSidebar}
          className="flex shrink-0 items-center gap-2.5"
          aria-label="CityPulse home"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl">
            <img
              src="/favicon.png"
              alt="CityPulse Logo"
              className="h-full w-full object-contain"
            />
          </span>

          <span className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-[#253B35]">
              CityPulse
            </span>
            <span className="-mt-0.5 hidden text-[10px] tracking-wide text-[#85877F] sm:block">
              Your city, your voice.
            </span>
          </span>
        </NavLink>

        {/* Desktop navigation */}
        {!isLoginPage && (
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map(({ name, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-[#253B35] text-white"
                      : "text-[#626A63] hover:bg-[#F7E9E5] hover:text-[#A84346]"
                  }`
                }
              >
                <Icon size={16} />
                {name}
              </NavLink>
            ))}
          </nav>
        )}

        {/* Right-side actions */}
        <div className="flex shrink-0 items-center gap-2">
          {!isLoginPage && (
            <>
              {/* Report shortcut for signed-in users */}
              {user && (
                <NavLink
                  to="/report"
                  onClick={closeSidebar}
                  className="hidden items-center gap-2 rounded-xl bg-[#B84C50] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#A84346] sm:flex"
                >
                  <Plus size={17} />
                  Report Issue
                </NavLink>
              )}

              {/* Login for logged-out users */}
              {!authLoading && !user && (
                <NavLink
                  to="/login"
                  className="flex items-center gap-2 rounded-xl bg-[#253B35] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#344E46] sm:px-4"
                >
                  <LogIn size={17} />
                  <span>Login</span>
                </NavLink>
              )}

              {/* Account menu shortcut for signed-in users */}
              {!authLoading && user && (
                <NavLink
                  to="/profile"
                  onClick={closeSidebar}
                  aria-label="Your profile"
                  title={user.displayName || user.email || "Your profile"}
                  className="hidden h-10 w-10 items-center justify-center rounded-xl border border-[#E9E1D9] bg-white text-[#253B35] transition hover:bg-[#F7E9E5] sm:flex"
                >
                  <UserRound size={19} />
                </NavLink>
              )}

              {/* One mobile sidebar toggle */}
              <button
                type="button"
                onClick={toggleSidebar}
                aria-label="Toggle navigation sidebar"
                aria-controls="mobile-sidebar"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E9E1D9] bg-[#FFFCF8] text-[#253B35] transition hover:bg-[#F7E9E5] md:hidden"
              >
                <Menu size={22} />
              </button>
            </>
          )}

          {/* Login page: offer home navigation */}
          {isLoginPage && (
            <NavLink
              to="/"
              className="rounded-xl border border-[#E9E1D9] px-3 py-2 text-sm font-medium text-[#253B35] hover:bg-[#F7E9E5]"
            >
              Home
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

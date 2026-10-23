
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Plus,
  MapPinned,
  FileText,
  UserRound,
  ArrowUpRight,
} from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  { name: "Explore Issues", path: "/explore", icon: Search },
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Report an Issue", path: "/report", icon: Plus },
  { name: "City Map", path: "/map", icon: MapPinned },
  { name: "My Reports", path: "/my-reports", icon: FileText },
  { name: "Profile", path: "/profile", icon: UserRound },
];

const jaipurPhotos = [
  {
    image:
      "https://i.pinimg.com/1200x/aa/5d/92/aa5d9273ec5f92954c510d75f4f1b19f.jpg",
  },
  {
    image:
      "https://i.pinimg.com/736x/c4/79/cb/c479cbe7a3ac3d887d03670d17f7f50b.jpg",
  },
  {
    image:
      "https://i.pinimg.com/736x/35/60/61/35606178eca773e2c10227d828f80a3c.jpg",
  },
  {
    image:
      "https://i.pinimg.com/736x/1e/7f/3e/1e7f3e5d971edd95a2149eefa88e2a89.jpg",
  },
  {
    image:
      "https://i.pinimg.com/736x/29/82/32/2982328abd5c780ade1c20d4aa23c175.jpg",
  },
];

const JaipurCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex(
        (current) => (current + 1) % jaipurPhotos.length
      );
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-[#EBD8D0] bg-[#253B35]">
      <div className="relative h-[180px]">
        {jaipurPhotos.map((photo, index) => (
          <img
            key={photo.image}
            src={photo.image}
            alt={`Jaipur view ${index + 1}`}
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              activeIndex === index
                ? "opacity-100"
                : "opacity-0"
            }`}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-[#17251F]/95 via-[#17251F]/20 to-transparent" />
      </div>
    </div>
  );
};

const Sidebar = ({ onNavigate }) => {
  return (
    <aside className="flex h-full min-h-0 w-full flex-col overflow-y-auto border-r border-[#E9E1D9] bg-[#FFFCF8] p-4 sm:p-5">
      {/* Workspace heading */}
      <div className="mb-5 shrink-0 px-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A46C60]">
          Your workspace
        </p>
        <p className="mt-1 text-xs text-[#85877F]">
          Your city, your voice.
        </p>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 space-y-1.5"
        aria-label="Main navigation"
      >
        {links.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end
            onClick={onNavigate}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] transition-all duration-200 ${
                isActive
                  ? "bg-[#253B35] font-semibold text-white shadow-[0_4px_12px_rgba(37,59,53,0.14)]"
                  : "font-medium text-[#626A63] hover:bg-[#F7E9E5] hover:text-[#A84346]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "bg-white/10 text-[#F5D7CA]"
                      : "bg-transparent text-[#8C9188] group-hover:bg-white group-hover:text-[#B84C50]"
                  }`}
                >
                  <Icon size={18} strokeWidth={1.8} />
                </span>

                <span className="flex-1">{name}</span>

                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#F0B7A7]" />
                )}

                {!isActive && path === "/report" && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#F7E9E5] text-[#B84C50] transition-colors group-hover:bg-white">
                    <ArrowUpRight size={12} />
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Jaipur identity card */}
      <div className="shrink-0">
        <JaipurCarousel />

        <p className="px-2 pb-1 pt-4 text-center text-[10px] tracking-wide text-[#A09D95]">
          Built for a better tomorrow.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;

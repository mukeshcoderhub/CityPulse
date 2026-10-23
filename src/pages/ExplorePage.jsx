
import { Link } from "react-router-dom";
import { Plus, Compass, MapPin, ArrowUpRight } from "lucide-react";
import IssueFeed from "../components/IssueFeed";

const ExplorePage = () => {
  return (
    <div className="min-h-full bg-[#FFFCF8]">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* Page heading */}
        <header className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#EBD8D0] bg-[#F7E9E5] px-3 py-1.5">
                <Compass size={14} className="text-[#B84C50]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#A84346]">
                  CityPulse Community
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[#253B35] sm:text-4xl">
                Explore issues<span className="text-[#B84C50]">.</span>
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[#747970] sm:text-base">
                Discover local problems, explore community reports, and help
                Jaipur become a better place to live.
              </p>
            </div>

            <Link
              to="/report"
              className="group inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#253B35] px-4 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#344D44] hover:shadow-md"
            >
              <Plus size={17} strokeWidth={2.2} />
              Report an issue
              <ArrowUpRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        </header>

        {/* Community feed */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-[#B84C50]" />
            <h2 className="text-sm font-semibold text-[#253B35]">
              Community reports
            </h2>
          </div>

          <IssueFeed />
        </section>

        {/* Footer note */}
        <div className="mt-8 border-t border-[#E9E1D9] pt-4">
          <p className="text-center text-xs leading-5 text-[#96958D]">
            Every report matters. Together, we can make our city better.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;

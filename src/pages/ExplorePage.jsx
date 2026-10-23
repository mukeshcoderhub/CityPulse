
import { Link } from "react-router-dom";
import IssueFeed from "../components/IssueFeed";

const ExplorePage = () => (
  <div className="min-h-screen bg-[#fafaf8]">
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#ec4952]">
            CityPulse Community
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#202522] sm:text-3xl">
            Explore issues
          </h1>

          <p className="mt-2 max-w-lg text-sm leading-6 text-[#737873]">
            Discover local problems, check the evidence, and help the community
            verify reports.
          </p>
        </div>

        <Link
          to="/report"
          className="shrink-0 rounded-lg bg-[#202522] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#383e39]"
        >
          + Report issue
        </Link>
      </header>


      <IssueFeed />
    </div>
  </div>
);

export default ExplorePage;

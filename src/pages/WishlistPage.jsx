import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { getSavedReports } from "../services/wishlistService";
import IssueCard from "../components/IssueCard";

const WishlistPage = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const loadWishlist = useCallback(async () => {
    if (!user?.uid) {
      setIssues([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const reports = await getSavedReports(user.uid);
      setIssues(reports);
    } catch (err) {
      console.error("Failed to load Wishlist:", err);
      setError("Couldn't load your saved reports. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist, reloadKey]);

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl py-12 text-center">
        <Bookmark className="mx-auto text-[#53665A]" size={36} />
        <h1 className="mt-4 text-2xl font-bold text-[#253B35]">
          Your Wishlist
        </h1>
        <p className="mt-2 text-sm text-[#85877F]">
          Log in to view and manage your saved city reports.
        </p>
        <Link
          to="/login"
          className="mt-5 inline-flex rounded-xl bg-[#253B35] px-5 py-3 text-sm font-semibold text-white hover:bg-[#344D44]"
        >
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        to="/"
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#69716A] hover:text-[#253B35]"
      >
        <ArrowLeft size={16} />
        Back to dashboard
      </Link>

      <header className="mb-7 rounded-2xl border border-[#EBD8D0] bg-[#F7E9E5] p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#A84346] shadow-sm">
            <Bookmark size={23} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#A84346]">
              Your collection
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#253B35] sm:text-3xl">
              Saved issues
            </h1>
          </div>
        </div>

        <p className="mt-4 max-w-xl text-sm leading-6 text-[#886A62]">
          Keep track of local problems you care about and want to help solve.
        </p>
      </header>

      {loading ? (
        <div className="py-12 text-center text-sm text-[#85877F]">
          Loading your saved reports...
        </div>
      ) : error ? (
        <div
          role="alert"
          className="rounded-2xl border border-[#E9B8B5] bg-[#FAECEA] p-5 text-sm text-[#A43E43]"
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>

          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#253B35] px-4 py-2.5 font-semibold text-white hover:bg-[#344D44]"
          >
            <RefreshCw size={15} />
            Try again
          </button>
        </div>
      ) : issues.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#DCCFC1] bg-white px-5 py-12 text-center">
          <Bookmark
            size={32}
            className="mx-auto text-[#B8A89B]"
            strokeWidth={1.5}
          />
          <h2 className="mt-4 text-lg font-bold text-[#253B35]">
            Nothing saved yet
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#85877F]">
            Browse community reports and tap the bookmark icon on any issue you
            want to keep track of.
          </p>
          <Link
            to="/explore"
            className="mt-5 inline-flex rounded-xl bg-[#253B35] px-4 py-3 text-sm font-semibold text-white hover:bg-[#344D44]"
          >
            Explore reports
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-[#85877F]">
            {issues.length} saved {issues.length === 1 ? "report" : "reports"}
          </p>

          <div className="space-y-5">
            {issues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                currentUser={user}
                onBookmarkChange={(saved) => {
                  if (!saved) {
                    setIssues((current) =>
                      current.filter((item) => item.id !== issue.id),
                    );
                  }
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#E9E1D9] bg-white px-4 py-2.5 text-sm font-medium text-[#53665A] hover:bg-[#F5F2EB]"
          >
            <RefreshCw size={15} />
            Refresh Wishlist
          </button>
        </>
      )}
    </div>
  );
};

export default WishlistPage;

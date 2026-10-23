
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileSearch,
  Plus,
  RefreshCw,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { getLatestReports } from "../services/reportService";
import IssueCard from "./IssueCard";

const IssueFeed = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    const loadIssues = async () => {
      setLoading(true);
      setError("");

      try {
        const reports = await getLatestReports();

        if (active) {
          setIssues(reports);
        }
      } catch (err) {
        console.error("Failed to load reports:", err);

        if (active) {
          setError("We couldn't load the community reports. Please try again.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadIssues();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  if (loading) {
    return (
      <div className="space-y-5" aria-label="Loading community reports">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="overflow-hidden rounded-2xl border border-[#E9E1D9] bg-white p-5 sm:p-6"
          >
            <div className="flex animate-pulse items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-[#EEEAE2]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 rounded bg-[#EEEAE2]" />
                <div className="h-2.5 w-24 rounded bg-[#F3F0E9]" />
              </div>
              <div className="h-7 w-20 rounded-full bg-[#F3F0E9]" />
            </div>

            <div className="mt-6 space-y-3 animate-pulse">
              <div className="h-5 w-4/5 rounded bg-[#EEEAE2]" />
              <div className="h-3 w-full rounded bg-[#F3F0E9]" />
              <div className="h-3 w-3/4 rounded bg-[#F3F0E9]" />
              <div className="mt-5 h-24 rounded-xl bg-[#F3F0E9]" />
            </div>
          </div>
        ))}
        <p className="text-center text-xs text-[#898B83]">
          Gathering reports from your community...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-[#E9B8B5] bg-[#FAECEA] p-6 text-center sm:p-8"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#B84C50]">
          <AlertCircle size={22} />
        </div>

        <h3 className="mt-4 text-base font-bold text-[#713F3D]">
          Reports couldn't load
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#886A62]">
          {error}
        </p>

        <button
          type="button"
          onClick={() => setReloadKey((value) => value + 1)}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#253B35] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#344D44]"
        >
          <RefreshCw size={15} />
          Try again
        </button>
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#DCCFC1] bg-white px-5 py-12 text-center sm:px-8 sm:py-16">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#EBD8D0] bg-[#F7E9E5] text-[#B84C50]">
          <FileSearch size={28} strokeWidth={1.5} />
        </div>

        <h3 className="mt-5 text-xl font-bold tracking-tight text-[#253B35]">
          Your community starts here.
        </h3>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#85877F]">
          No reports have been shared yet. Be the first to bring a local issue
          to the community's attention.
        </p>

        <Link
          to="/report"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#253B35] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#344D44]"
        >
          <Plus size={17} />
          Report the first issue
          <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {issues.map((issue) => (
        <IssueCard
          key={issue.id}
          issue={issue}
          currentUser={user}
        />
      ))}
    </div>
  );
};

export default IssueFeed;

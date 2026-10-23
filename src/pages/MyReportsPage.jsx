
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import {
  AlertCircle,
  CalendarDays,
  FileText,
  LoaderCircle,
  MapPin,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { auth, db } from "../firebase/config";

const MyReportsPage = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Listen for the currently logged-in user.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  // Fetch only reports created by the current user.
  const fetchMyReports = useCallback(async () => {
    if (!user) {
      setReports([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const reportsQuery = query(
        collection(db, "reports"),
        where("authorId", "==", user.uid)
      );

      const snapshot = await getDocs(reportsQuery);

      const myReports = snapshot.docs.map((reportDoc) => ({
        id: reportDoc.id,
        ...reportDoc.data(),
      }));

      // Newest reports first.
      myReports.sort((a, b) => {
        const dateA = a.createdAt?.toMillis
          ? a.createdAt.toMillis()
          : new Date(a.createdAt || 0).getTime();

        const dateB = b.createdAt?.toMillis
          ? b.createdAt.toMillis()
          : new Date(b.createdAt || 0).getTime();

        return dateB - dateA;
      });

      setReports(myReports);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      setError("Unable to load your reports. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchMyReports();
    }
  }, [authLoading, fetchMyReports]);

  // Delete a report after confirmation.
  const handleDelete = async (report) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${report.title || "this report"}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(report.id);
      setError("");

      await deleteDoc(doc(db, "reports", report.id));

      // Remove the deleted report from the UI immediately.
      setReports((previousReports) =>
        previousReports.filter((item) => item.id !== report.id)
      );
    } catch (err) {
      console.error("Failed to delete report:", err);
      setError(
        "Could not delete this report. Check your permissions and try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Date unavailable";

    try {
      const date = dateValue?.toDate
        ? dateValue.toDate()
        : new Date(dateValue);

      if (Number.isNaN(date.getTime())) return "Date unavailable";

      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Date unavailable";
    }
  };

  const getStatusStyle = (status) => {
    const normalizedStatus = (status || "reported").toLowerCase();

    if (normalizedStatus === "resolved") {
      return "bg-green-100 text-green-800";
    }

    if (normalizedStatus === "in progress") {
      return "bg-blue-100 text-blue-800";
    }

    if (normalizedStatus === "rejected") {
      return "bg-red-100 text-red-800";
    }

    return "bg-[#F7E9E5] text-[#A84346]";
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <LoaderCircle className="animate-spin text-[#253B35]" size={32} />
        <p className="text-sm text-[#73776F]">Loading your reports...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-5 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7E9E5] text-[#B84C50]">
          <FileText size={30} />
        </div>

        <h1 className="text-2xl font-bold text-[#253B35]">
          Your Reports
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#73776F]">
          Please log in to view and manage the city issues you have reported.
        </p>

        <Link
          to="/login"
          className="mt-6 rounded-xl bg-[#253B35] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#344E46]"
        >
          Login to continue
        </Link>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Page heading */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#B84C50]">
            Your activity
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-[#253B35] sm:text-3xl">
            My Reports
          </h1>

          <p className="mt-2 text-sm text-[#73776F]">
            Manage the city issues you have reported.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchMyReports}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-[#E9E1D9] bg-white px-4 py-3 text-sm font-semibold text-[#253B35] transition hover:bg-[#F7E9E5] disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <Link
            to="/report"
            className="flex items-center gap-2 rounded-xl bg-[#B84C50] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#A84346]"
          >
            <Plus size={17} />
            Report Issue
          </Link>
        </div>
      </div>

      {/* Report count */}
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-[#E9E1D9] bg-white p-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F7E9E5] text-[#B84C50]">
          <FileText size={21} />
        </div>

        <div>
          <p className="text-xl font-bold text-[#253B35]">
            {reports.length}
          </p>
          <p className="text-sm text-[#73776F]">
            {reports.length === 1 ? "Report submitted" : "Reports submitted"}
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <div className="flex-1">{error}</div>

          <button
            type="button"
            onClick={fetchMyReports}
            className="shrink-0 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#DCD2C8] bg-white px-5 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7E9E5] text-[#B84C50]">
            <MapPin size={30} />
          </div>

          <h2 className="text-xl font-bold text-[#253B35]">
            No reports yet
          </h2>

          <p className="mt-2 max-w-sm text-sm leading-6 text-[#73776F]">
            Spotted a pothole, garbage problem, or another city issue?
            Report it to help make your city better.
          </p>

          <Link
            to="/report"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#253B35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#344E46]"
          >
            <Plus size={17} />
            Create your first report
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {reports.map((report) => {
            const isDeleting = deletingId === report.id;
            const imageUrl = report.image || report.imageUrl;
            const address =
              report.location?.address ||
              report.address ||
              "Address not available";

            return (
              <article
                key={report.id}
                className="overflow-hidden rounded-2xl border border-[#E9E1D9] bg-white shadow-sm transition hover:shadow-md"
              >
                {/* Report image */}
                {imageUrl && (
                  <div className="h-48 overflow-hidden bg-[#F7E9E5]">
                    <img
                      src={imageUrl}
                      alt={report.title || "Reported city issue"}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="p-5">
                  {/* Category and status */}
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-lg bg-[#F7E9E5] px-3 py-1.5 text-xs font-semibold text-[#A84346]">
                      {report.category || "General Issue"}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getStatusStyle(
                        report.status
                      )}`}
                    >
                      {(report.status || "reported").replaceAll("_", " ")}
                    </span>
                  </div>

                  {/* Title and description */}
                  <h2 className="text-lg font-bold leading-snug text-[#253B35]">
                    {report.title || "Untitled report"}
                  </h2>

                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#73776F]">
                    {report.description || "No description provided."}
                  </p>

                  {/* Address and date */}
                  <div className="mt-4 space-y-2 border-t border-[#F0EAE4] pt-4">
                    <div className="flex items-start gap-2 text-sm text-[#73776F]">
                      <MapPin
                        size={16}
                        className="mt-0.5 shrink-0 text-[#B84C50]"
                      />
                      <span className="break-words">{address}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-[#73776F]">
                      <CalendarDays
                        size={16}
                        className="shrink-0 text-[#B84C50]"
                      />
                      <span>{formatDate(report.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <Link
                      to={`/explore`}
                      className="text-sm font-semibold text-[#253B35] underline-offset-4 hover:underline"
                    >
                      Explore reports
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(report)}
                      disabled={isDeleting}
                      aria-label={`Delete ${report.title || "report"}`}
                      title="Delete report"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isDeleting ? (
                        <LoaderCircle size={17} className="animate-spin" />
                      ) : (
                        <Trash2 size={17} />
                      )}

                      {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default MyReportsPage;

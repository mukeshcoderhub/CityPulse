
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLatestIssues } from "../utils/issues";
import { getCurrentUser } from "../utils/auth";

const STATUS_STYLES = {
  reported: "bg-orange-100 text-orange-700",
  "in progress": "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
  "needs review": "bg-red-100 text-red-700",
};

const formatStatus = (status) =>
  String(status || "reported")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (date) => {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Date unavailable";

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const MyReportsPage = () => {
  const [issues, setIssues] = useState([]);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const loadIssues = () => setIssues(getLatestIssues());
    const loadUser = () => setCurrentUser(getCurrentUser());

    loadIssues();

    window.addEventListener("citypulse-issues-change", loadIssues);
    window.addEventListener("citypulse-auth-change", loadUser);

    const handleStorage = (event) => {
      if (
        !event.key ||
        event.key === "citypulse-issues"
      ) {
        loadIssues();
      }

      if (
        !event.key ||
        event.key.includes("user") ||
        event.key.includes("auth")
      ) {
        loadUser();
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("citypulse-issues-change", loadIssues);
      window.removeEventListener("citypulse-auth-change", loadUser);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const userId = currentUser?.id ?? currentUser?.uid;

  const myIssues = issues.filter(
    (issue) =>
      userId != null &&
      issue.authorId != null &&
      String(issue.authorId) === String(userId)
  );

  const filteredIssues =
    statusFilter === "all"
      ? myIssues
      : myIssues.filter(
          (issue) =>
            String(issue.status || "reported").toLowerCase() ===
            statusFilter
        );

  const resolvedCount = myIssues.filter(
    (issue) => issue.status === "resolved"
  ).length;

  const reportedCount = myIssues.filter(
    (issue) => issue.status === "reported"
  ).length;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#fafaf8] px-4 py-12">
        <div className="mx-auto max-w-xl rounded-2xl border border-[#e8e9e4] bg-white p-8 text-center">
          <h1 className="text-2xl font-bold text-[#202522]">
            Sign in to view your reports
          </h1>
          <p className="mt-2 text-sm text-[#737873]">
            Log in to see the city problems you've reported.
          </p>
          <Link
            to="/login"
            className="mt-5 inline-flex rounded-xl bg-[#ec4952] px-5 py-3 font-semibold text-white hover:bg-[#d93843]"
          >
            Log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-[#ec4952]">
              YOUR CONTRIBUTION
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#202522]">
              My Reports
            </h1>
            <p className="mt-2 text-sm text-[#737873]">
              Track the city problems you've reported.
            </p>
          </div>

          <Link
            to="/report"
            className="inline-flex w-fit items-center justify-center rounded-xl bg-[#ec4952] px-5 py-3 text-sm font-semibold text-white hover:bg-[#d93843]"
          >
            + Report an issue
          </Link>
        </div>

        {/* Summary cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#e8e9e4] bg-white p-4">
            <p className="text-sm text-[#737873]">Total reports</p>
            <p className="mt-2 text-2xl font-bold text-[#202522]">
              {myIssues.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e8e9e4] bg-white p-4">
            <p className="text-sm text-[#737873]">Reported</p>
            <p className="mt-2 text-2xl font-bold text-orange-600">
              {reportedCount}
            </p>
          </div>

          <div className="col-span-2 rounded-2xl border border-[#e8e9e4] bg-white p-4 sm:col-span-1">
            <p className="text-sm text-[#737873]">Resolved</p>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {resolvedCount}
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="mt-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="text-lg font-semibold text-[#202522]">
            Your submissions
          </h2>

          <select
            aria-label="Filter reports by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-[#dedfd9] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#ec4952]"
          >
            <option value="all">All statuses</option>
            <option value="reported">Reported</option>
            <option value="in progress">In progress</option>
            <option value="resolved">Resolved</option>
            <option value="needs review">Needs review</option>
          </select>
        </div>

        {/* Report list */}
        <div className="mt-4 flex flex-col gap-4">
          {filteredIssues.map((issue) => {
            const status = String(
              issue.status || "reported"
            ).toLowerCase();

            const statusStyle =
              STATUS_STYLES[status] || "bg-gray-100 text-gray-700";

            return (
              <article
                key={issue.id}
                className="overflow-hidden rounded-2xl border border-[#e8e9e4] bg-white"
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:p-5">
                  {issue.image ? (
                    <img
                      src={issue.image}
                      alt={issue.title || "Reported issue"}
                      className="h-48 w-full rounded-xl object-cover sm:h-36 sm:w-44"
                    />
                  ) : (
                    <div className="flex h-36 w-full items-center justify-center rounded-xl bg-[#f3f3ef] text-sm text-[#737873] sm:w-44">
                      No photo
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#fcebed] px-3 py-1 text-xs font-semibold text-[#c73540]">
                        {issue.category || "Other"}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle}`}
                      >
                        {formatStatus(status)}
                      </span>
                    </div>

                    <h3 className="mt-3 text-lg font-semibold text-[#202522]">
                      {issue.title || "Untitled issue"}
                    </h3>

                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#737873]">
                      {issue.description || "No description provided."}
                    </p>

                    <p className="mt-3 text-sm text-[#737873]">
                      📍 {issue.location?.address || "Address unavailable"}
                    </p>

                    <p className="mt-1 text-xs text-[#8a8e89]">
                      Submitted {formatDate(issue.createdAt)}
                    </p>

                    <Link
                      to="/explore"
                      className="mt-3 inline-flex text-sm font-semibold text-[#ec4952] hover:underline"
                    >
                      View in Explore →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}

          {filteredIssues.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#dedfd9] bg-white px-6 py-12 text-center">
              <div className="text-4xl">📋</div>
              <h3 className="mt-4 text-lg font-semibold text-[#202522]">
                {myIssues.length === 0
                  ? "You haven't reported anything yet"
                  : "No reports match this filter"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#737873]">
                {myIssues.length === 0
                  ? "Help improve Jaipur by reporting a pothole, garbage problem, broken streetlight, or another civic issue."
                  : "Try selecting a different status to see your other reports."}
              </p>

              {myIssues.length === 0 && (
                <Link
                  to="/report"
                  className="mt-5 inline-flex rounded-xl bg-[#ec4952] px-5 py-3 text-sm font-semibold text-white hover:bg-[#d93843]"
                >
                  Create your first report
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyReportsPage;

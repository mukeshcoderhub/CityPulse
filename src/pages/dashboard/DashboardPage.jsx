import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLatestIssues } from "../../utils/issues";

const Bar = ({ label, value, total }) => {
  const percentage = total ? Math.round((value / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-[#383e39]">{label}</span>
        <span className="font-medium text-[#202522]">
          {value} · {percentage}%
        </span>
      </div>

      <div
        className="h-2.5 overflow-hidden rounded-full bg-gray-100"
        role="progressbar"
        aria-label={label}
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-[#ec4952] transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    const load = () => setIssues(getLatestIssues());

    load();
    window.addEventListener("citypulse-issues-change", load);

    return () =>
      window.removeEventListener("citypulse-issues-change", load);
  }, []);

  const total = issues.length;
  const inProgress = issues.filter(
    (issue) => issue.status === "in-progress"
  ).length;
  const resolved = issues.filter(
    (issue) => issue.status === "resolved"
  ).length;
  const reported = total - inProgress - resolved;

  const categories = issues.reduce((result, issue) => {
    const category = issue.category || "Other";
    result[category] = (result[category] || 0) + 1;
    return result;
  }, {});

  const sortedCategories = Object.entries(categories).sort(
    (a, b) => b[1] - a[1]
  );

  const stats = [
    { label: "Total reports", value: total },
    { label: "Reported", value: reported },
    { label: "In progress", value: inProgress },
    { label: "Resolved", value: resolved },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[#737873]">
            City overview · Rajasthan
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#202522]">
            Jaipur city dashboard
          </h1>
          <p className="mt-2 text-sm text-[#737873]">
            A snapshot of civic issues reported by the community.
          </p>
        </div>

        <Link
          to="/report"
          className="rounded-lg bg-[#202522] px-4 py-3 text-sm font-medium text-white hover:bg-[#383e39]"
        >
          + Report an issue
        </Link>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[#e5e5e0] bg-white p-5"
          >
            <p className="text-sm text-[#737873]">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-[#202522]">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#e5e5e0] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#202522]">
            Issue status
          </h2>
          <p className="mb-6 mt-1 text-sm text-[#737873]">
            How reports are currently progressing.
          </p>

          <div className="space-y-5">
            <Bar label="Reported" value={reported} total={total} />
            <Bar label="In progress" value={inProgress} total={total} />
            <Bar label="Resolved" value={resolved} total={total} />
          </div>
        </div>

        <div className="rounded-2xl border border-[#e5e5e0] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#202522]">
            Issues by category
          </h2>
          <p className="mb-6 mt-1 text-sm text-[#737873]">
            Which types of problems are being reported most often.
          </p>

          {sortedCategories.length ? (
            <div className="space-y-5">
              {sortedCategories.map(([category, count]) => (
                <Bar
                  key={category}
                  label={category}
                  value={count}
                  total={total}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-lg bg-gray-50 p-5 text-sm text-[#737873]">
              Category statistics will appear after the first report.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-[#e5e5e0] bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#202522]">
              Recent reporting activity
            </h2>
            <p className="mt-1 text-sm text-[#737873]">
              A summary of the latest submissions, not a post feed.
            </p>
          </div>

          <Link
            to="/explore"
            className="text-sm font-medium text-[#383e39] underline underline-offset-4"
          >
            Explore reports
          </Link>
        </div>

        {issues.length ? (
          <div className="mt-5 divide-y divide-[#e5e5e0]">
            {issues.slice(0, 5).map((issue) => (
              <div
                key={issue.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div>
                  <p className="font-medium text-[#202522]">
                    {issue.category || "Other"}
                  </p>
                  <p className="mt-1 text-sm text-[#737873]">
                    {issue.title}
                  </p>
                </div>
                <p className="text-xs text-[#737873]">
                  {new Date(issue.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-lg bg-gray-50 p-5 text-sm text-[#737873]">
            No city activity yet. Submit the first report to start building
            this overview.
          </p>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
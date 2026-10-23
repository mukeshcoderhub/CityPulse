import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  Plus,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { getLatestReports } from "../../services/reportService";

const COLORS = {
  green: "#253B35",
  rose: "#B84C50",
  ivory: "#FFFCF8",
  muted: "#777C74",
  border: "#E9E1D9",
};

const STATUS_CONFIG = {
  reported: {
    label: "Reported",
    className: "bg-[#F7E9E5] text-[#A84346]",
    dot: "bg-[#B84C50]",
  },
  "in-progress": {
    label: "In progress",
    className: "bg-[#FFF2D9] text-[#94651C]",
    dot: "bg-[#D49A35]",
  },
  resolved: {
    label: "Resolved",
    className: "bg-[#E7F3E9] text-[#337447]",
    dot: "bg-[#46965C]",
  },
};

const getStatus = (status) => {
  const normalized = String(status || "reported")
    .toLowerCase()
    .replaceAll("_", "-")
    .replaceAll(" ", "-");

  return STATUS_CONFIG[normalized] || STATUS_CONFIG.reported;
};

const formatDate = (createdAt) => {
  if (!createdAt) return "Recently submitted";

  try {
    const date =
      typeof createdAt?.toDate === "function"
        ? createdAt.toDate()
        : createdAt instanceof Date
          ? createdAt
          : typeof createdAt === "number"
            ? new Date(createdAt)
            : typeof createdAt === "string"
              ? new Date(createdAt)
              : null;

    if (!date || Number.isNaN(date.getTime())) {
      return "Recently submitted";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Recently submitted";
  }
};

const StatCard = ({ label, value, icon: Icon, description, tone }) => {
  const tones = {
    green: {
      icon: "bg-[#E7EFE9] text-[#315D47]",
      border: "hover:border-[#C5D8CA]",
    },
    rose: {
      icon: "bg-[#F8E8E4] text-[#B84C50]",
      border: "hover:border-[#E8C6BF]",
    },
    amber: {
      icon: "bg-[#FFF1D9] text-[#A87522]",
      border: "hover:border-[#EAD7B2]",
    },
    blue: {
      icon: "bg-[#E8EFF8] text-[#496B9A]",
      border: "hover:border-[#C9D6E8]",
    },
  };

  const style = tones[tone] || tones.green;

  return (
    <div
      className={`group rounded-2xl border border-[#E9E1D9] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(54,44,35,0.06)] sm:p-6 ${style.border}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#777C74]">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-[#253B35] sm:text-4xl">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${style.icon}`}
        >
          <Icon size={21} strokeWidth={1.8} />
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-[#85877F]">{description}</p>
    </div>
  );
};

const Bar = ({ label, value, total, color = "rose" }) => {
  const percentage = total ? Math.round((value / total) * 100) : 0;

  const barColor = {
    rose: "bg-[#B84C50]",
    green: "bg-[#47765A]",
    amber: "bg-[#D49A35]",
    blue: "bg-[#6586B5]",
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="min-w-0 truncate font-medium text-[#535D55]">
          {label}
        </span>

        <span className="shrink-0 text-xs font-semibold tabular-nums text-[#253B35]">
          {value}
          <span className="mx-1 text-[#B9B7B0]">·</span>
          {percentage}%
        </span>
      </div>

      <div
        className="h-2.5 overflow-hidden rounded-full bg-[#F1EEE9]"
        role="progressbar"
        aria-label={label}
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const SectionHeading = ({ eyebrow, title, description, icon: Icon }) => (
  <div className="flex items-start gap-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F7E9E5] text-[#A84346]">
      <Icon size={19} strokeWidth={1.8} />
    </div>

    <div className="min-w-0">
      {eyebrow && (
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.17em] text-[#A46C60]">
          {eyebrow}
        </p>
      )}

      <h2 className="text-base font-bold tracking-tight text-[#253B35] sm:text-lg">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-sm leading-5 text-[#85877F]">{description}</p>
      )}
    </div>
  </div>
);

const DashboardPage = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setError("");
        const reports = await getLatestReports();

        if (active) {
          setIssues(Array.isArray(reports) ? reports : []);
        }
      } catch (err) {
        console.error("Failed to load dashboard reports:", err);

        if (active) {
          setError("Unable to load dashboard data. Please try again.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const total = issues.length;

  const inProgress = issues.filter(
    (issue) => issue.status === "in-progress",
  ).length;

  const resolved = issues.filter((issue) => issue.status === "resolved").length;

  const reported = total - inProgress - resolved;

  const categories = issues.reduce((result, issue) => {
    const category = issue.category || "Other";
    result[category] = (result[category] || 0) + 1;
    return result;
  }, {});

  const sortedCategories = Object.entries(categories).sort(
    (a, b) => b[1] - a[1],
  );

  const stats = [
    {
      label: "Total reports",
      value: total,
      icon: FileText,
      description: "Reports available in the dashboard",
      tone: "green",
    },
    {
      label: "Reported",
      value: reported,
      icon: Clock3,
      description: "Awaiting further progress",
      tone: "rose",
    },
    {
      label: "In progress",
      value: inProgress,
      icon: TrendingUp,
      description: "Currently being addressed",
      tone: "amber",
    },
    {
      label: "Resolved",
      value: resolved,
      icon: CheckCircle2,
      description: "Marked as resolved",
      tone: "blue",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6 pb-8 sm:space-y-8">
      {/* Dashboard welcome */}
      <section className="relative overflow-hidden rounded-2xl border border-[#EBD8D0] bg-[#F8EDE8] p-5 sm:p-7 lg:p-8">
        <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full border-[24px] border-white/30 sm:h-64 sm:w-64" />
        <div className="pointer-events-none absolute -bottom-16 right-28 h-36 w-36 rounded-full bg-[#E9CEC4]/40 blur-2xl" />

        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E7D2C9] bg-white/70 px-3 py-1.5 text-xs font-semibold text-[#8F554E]">
              <MapPin size={13} />
              Jaipur, Rajasthan
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#253B35] sm:text-3xl lg:text-4xl">
              Your city, your voice.
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#786B63] sm:text-base">
              Discover civic issues, report what needs attention, and help make
              Jaipur a better place for everyone.
            </p>
          </div>

          <Link
            to="/report"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-[#253B35] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#344E45] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84C50] focus-visible:ring-offset-2 sm:self-center"
          >
            <Plus size={18} />
            Report an issue
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Loading state */}
      {loading ? (
        <section
          aria-label="Loading dashboard"
          aria-busy="true"
          className="space-y-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-[#E9E1D9] bg-white p-6"
              >
                <div className="h-4 w-28 rounded bg-[#F1EEE9]" />
                <div className="mt-5 h-9 w-16 rounded bg-[#F1EEE9]" />
                <div className="mt-5 h-3 w-40 max-w-full rounded bg-[#F1EEE9]" />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 py-6 text-sm text-[#777C74]">
            <RefreshCw size={16} className="animate-spin" />
            Loading your city dashboard...
          </div>
        </section>
      ) : error ? (
        <section
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6"
        >
          <p className="font-semibold text-red-800">
            Couldn't load the dashboard
          </p>
          <p className="mt-1 text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-red-800 ring-1 ring-red-200 transition hover:bg-red-100"
          >
            <RefreshCw size={15} />
            Reload page
          </button>
        </section>
      ) : (
        <>
          {/* Statistics */}
          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#A46C60]">
                  At a glance
                </p>
                <h2 className="mt-1 text-lg font-bold text-[#253B35]">
                  City overview
                </h2>
              </div>

              <span className="hidden items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#777C74] ring-1 ring-[#E9E1D9] sm:inline-flex">
                <ShieldCheck size={14} className="text-[#47765A]" />
                Community reports
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
              {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>
          </section>

          {/* Analytics */}
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
            <div className="min-w-0 rounded-2xl border border-[#E9E1D9] bg-white p-5 sm:p-6">
              <SectionHeading
                eyebrow="Progress tracking"
                title="Issue status"
                description="See how community reports are progressing."
                icon={BarChart3}
              />

              <div className="mt-7 space-y-6">
                <Bar
                  label="Reported"
                  value={reported}
                  total={total}
                  color="rose"
                />
                <Bar
                  label="In progress"
                  value={inProgress}
                  total={total}
                  color="amber"
                />
                <Bar
                  label="Resolved"
                  value={resolved}
                  total={total}
                  color="green"
                />
              </div>

              <div className="mt-6 flex items-center gap-2 border-t border-[#F0EBE5] pt-4 text-xs leading-5 text-[#85877F]">
                <span className="h-2 w-2 shrink-0 rounded-full bg-[#47765A]" />
                Status distribution based on reports currently loaded.
              </div>
            </div>

            <div className="min-w-0 rounded-2xl border border-[#E9E1D9] bg-white p-5 sm:p-6">
              <SectionHeading
                eyebrow="Community insights"
                title="Issues by category"
                description="Understand what kinds of problems are being reported."
                icon={TrendingUp}
              />

              {sortedCategories.length ? (
                <div className="mt-7 space-y-6">
                  {sortedCategories.map(([category, count], index) => (
                    <Bar
                      key={category}
                      label={category}
                      value={count}
                      total={total}
                      color={["rose", "green", "amber", "blue"][index % 4]}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-6 flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-[#E9E1D9] bg-[#FFFCF8] px-4 py-6 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F7E9E5] text-[#B84C50]">
                    <BarChart3 size={20} />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-[#253B35]">
                    No category data yet
                  </p>
                  <p className="mt-1 max-w-xs text-xs leading-5 text-[#85877F]">
                    Category insights will appear when community reports are
                    available.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Recent reports */}
          <section className="overflow-hidden rounded-2xl border border-[#E9E1D9] bg-white">
            <div className="flex flex-col justify-between gap-4 border-b border-[#F0EBE5] p-5 sm:flex-row sm:items-center sm:p-6">
              <SectionHeading
                eyebrow="Latest submissions"
                title="Recent reporting activity"
                description="A quick look at the latest reports from the community."
                icon={FileText}
              />

              <Link
                to="/explore"
                className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-[#E9E1D9] px-4 py-2.5 text-sm font-semibold text-[#253B35] transition hover:border-[#D9B6AC] hover:bg-[#F8EDE8] sm:self-center"
              >
                Explore reports
                <ArrowRight size={15} />
              </Link>
            </div>

            {issues.length ? (
              <>
                {/* Desktop table headings */}
                <div className="hidden grid-cols-[minmax(0,1fr)_minmax(120px,0.65fr)_minmax(120px,0.6fr)] gap-4 bg-[#FFFCF8] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#85877F] sm:grid">
                  <span>Report</span>
                  <span>Category</span>
                  <span>Status</span>
                </div>

                <div className="divide-y divide-[#F0EBE5]">
                  {issues.slice(0, 5).map((issue) => {
                    const status = getStatus(issue.status);

                    return (
                      <div
                        key={issue.id}
                        className="grid grid-cols-1 gap-3 px-5 py-4 transition-colors hover:bg-[#FFFCF8] sm:grid-cols-[minmax(0,1fr)_minmax(120px,0.65fr)_minmax(120px,0.6fr)] sm:items-center sm:gap-4 sm:px-6"
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F7E9E5] text-[#A84346]">
                            <MapPin size={18} strokeWidth={1.8} />
                          </div>

                          <div className="min-w-0">
                            <p className="break-words text-sm font-semibold text-[#253B35]">
                              {issue.title ||
                                issue.category ||
                                "Untitled report"}
                            </p>
                            <p className="mt-1 text-xs text-[#85877F]">
                              {formatDate(issue.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="sm:min-w-0">
                          <span className="text-xs font-medium text-[#626A63]">
                            <span className="mr-2 text-[#B7A69C] sm:hidden">
                              Category:
                            </span>
                            {issue.category || "Other"}
                          </span>
                        </div>

                        <div>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold ${status.className}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                            />
                            {status.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-[#F0EBE5] bg-[#FFFCF8] px-5 py-3.5 sm:px-6">
                  <Link
                    to="/explore"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#A84346] transition hover:text-[#7D3034]"
                  >
                    View all reports
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center px-5 py-12 text-center sm:py-16">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F7E9E5] text-[#A84346]">
                  <FileText size={25} strokeWidth={1.6} />
                </div>

                <h3 className="mt-4 text-base font-bold text-[#253B35]">
                  Jaipur starts with you
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-[#85877F]">
                  No reports are available yet. Spotted a pothole, a broken
                  streetlight, or another civic issue? Share it with the
                  community.
                </p>

                <Link
                  to="/report"
                  className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#253B35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#344E45]"
                >
                  <Plus size={17} />
                  Submit the first report
                </Link>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default DashboardPage;

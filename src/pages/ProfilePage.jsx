
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  FileText,
  PlusCircle,
  UserRound,
  LogOut,
  MapPin,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { getLatestReports } from "../services/reportService";

const ProfilePage = () => {
  const { user, logout, loading: authLoading } = useAuth();

  const [issues, setIssues] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState("");
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    let active = true;

    const loadIssues = async () => {
      if (!user) {
        setIssues([]);
        setReportsLoading(false);
        return;
      }

      setReportsLoading(true);
      setReportsError("");

      try {
        const reports = await getLatestReports();

        if (active) {
          setIssues(
            reports.filter((issue) => issue.authorId === user.uid)
          );
        }
      } catch (error) {
        console.error("Failed to load profile reports:", error);

        if (active) {
          setReportsError(
            "Unable to load your contribution statistics."
          );
        }
      } finally {
        if (active) setReportsLoading(false);
      }
    };

    loadIssues();

    return () => {
      active = false;
    };
  }, [user, authLoading]);

  const myIssues = issues;

  const resolvedCount = myIssues.filter((issue) => {
    const status = String(issue.status || "reported")
      .toLowerCase()
      .replace(/[-_]/g, " ");

    return status === "resolved";
  }).length;

  const name = user?.displayName || "CityPulse Member";

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const handleLogout = async () => {
    if (logoutLoading) return;

    setLogoutLoading(true);

    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
      setLogoutLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FFFCF8] px-4 py-12 text-center text-[#737873]">
        Checking your account...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FFFCF8] px-4 py-12">
        <div className="mx-auto max-w-lg rounded-2xl border border-[#E9E1D9] bg-white p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F7E9E5] text-[#A84346]">
            <UserRound size={30} />
          </div>

          <h1 className="mt-4 text-2xl font-bold text-[#253B35]">
            Your profile
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#737873]">
            Log in to view your account and community contributions.
          </p>

          <Link
            to="/login"
            className="mt-5 inline-flex rounded-xl bg-[#253B35] px-5 py-3 font-semibold text-white transition hover:bg-[#344D44]"
          >
            Log in
          </Link>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      to: "/my-reports",
      title: "View my reports",
      description: "Check the status of your submissions.",
      icon: FileText,
      iconClass: "bg-[#E8EFE9] text-[#355747]",
    },
    {
      to: "/wishlist",
      title: "My Wishlist",
      description: "View the city issues you've saved.",
      icon: Bookmark,
      iconClass: "bg-[#F7E9E5] text-[#A84346]",
    },
    {
      to: "/report",
      title: "Report a city problem",
      description: "Help make Jaipur a better place.",
      icon: PlusCircle,
      iconClass: "bg-[#F5EEE0] text-[#92713D]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFFCF8] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-4xl">
        {/* Page heading */}
        <div className="mb-6">
          <p className="text-xs font-bold tracking-[0.16em] text-[#A84346]">
            YOUR ACCOUNT
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#253B35]">
            My Profile
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#737873]">
            Manage your account and track your contribution to Jaipur.
          </p>
        </div>

        {/* Profile card */}
        <section className="overflow-hidden rounded-2xl border border-[#E9E1D9] bg-white shadow-sm">
          <div className="h-28 bg-gradient-to-r from-[#253B35] via-[#456354] to-[#B84C50]" />

          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={name}
                    className="h-24 w-24 shrink-0 rounded-2xl border-4 border-white object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-[#253B35] text-3xl font-bold text-white shadow-sm">
                    {initials || "C"}
                  </div>
                )}

                <div className="pb-1">
                  <h2 className="text-xl font-bold text-[#253B35]">
                    {name}
                  </h2>

                  <p className="mt-1 text-sm text-[#737873]">
                    CityPulse Community Member
                  </p>
                </div>
              </div>

              <span className="w-fit rounded-full bg-[#E8EFE9] px-3 py-1.5 text-xs font-semibold text-[#355747]">
                ● Account active
              </span>
            </div>

            {/* Account details */}
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-[#FAF8F3] p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[#85877F]">
                  Full name
                </p>

                <p className="mt-2 break-words font-medium text-[#253B35]">
                  {name}
                </p>
              </div>

              <div className="rounded-xl bg-[#FAF8F3] p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[#85877F]">
                  Email address
                </p>

                <p className="mt-2 break-all font-medium text-[#253B35]">
                  {user.email || "Not provided"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contribution statistics */}
        <section className="mt-7">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-[#253B35]">
              Your contributions
            </h2>

            {reportsLoading && (
              <RefreshCw
                size={16}
                className="animate-spin text-[#85877F]"
              />
            )}
          </div>

          {reportsError && (
            <p
              role="alert"
              className="mb-3 rounded-xl border border-[#E9B8B5] bg-[#FAECEA] p-3 text-sm text-[#A43E46]"
            >
              {reportsError}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#E9E1D9] bg-white p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8EFE9] text-[#355747]">
                <FileText size={20} />
              </div>

              <p className="mt-4 text-sm text-[#737873]">
                Reports submitted
              </p>

              <p className="mt-2 text-3xl font-bold text-[#253B35]">
                {reportsLoading ? "—" : myIssues.length}
              </p>
            </div>

            <div className="rounded-2xl border border-[#E9E1D9] bg-white p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8EFE9] text-[#28734B]">
                <span className="text-xl font-bold">✓</span>
              </div>

              <p className="mt-4 text-sm text-[#737873]">
                Resolved reports
              </p>

              <p className="mt-2 text-3xl font-bold text-[#28734B]">
                {reportsLoading ? "—" : resolvedCount}
              </p>
            </div>

            <div className="col-span-2 rounded-2xl border border-[#E9E1D9] bg-white p-5 sm:col-span-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7E9E5] text-[#A84346]">
                <MapPin size={20} />
              </div>

              <p className="mt-4 text-sm text-[#737873]">City</p>

              <p className="mt-2 text-xl font-bold text-[#253B35]">
                Jaipur
              </p>

              <p className="mt-1 text-xs text-[#737873]">
                Rajasthan, India
              </p>
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section className="mt-7 rounded-2xl border border-[#E9E1D9] bg-white p-5 sm:p-6">
          <h2 className="text-lg font-bold text-[#253B35]">
            Quick actions
          </h2>

          <p className="mt-1 text-sm text-[#737873]">
            Jump straight to the things you use most.
          </p>

          <div className="mt-4 flex flex-col gap-3">
            {quickActions.map((action) => {
              const ActionIcon = action.icon;

              return (
                <Link
                  key={action.to}
                  to={action.to}
                  className="group flex items-center justify-between gap-4 rounded-xl border border-[#E9E1D9] bg-[#FFFCF8] p-4 transition hover:border-[#D8B5AD] hover:bg-[#F7E9E5]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${action.iconClass}`}
                    >
                      <ActionIcon size={20} strokeWidth={1.8} />
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-[#253B35]">
                        {action.title}
                      </p>

                      <p className="mt-1 text-sm leading-5 text-[#737873]">
                        {action.description}
                      </p>
                    </div>
                  </div>

                  <span className="text-xl text-[#85877F] transition group-hover:translate-x-1 group-hover:text-[#A84346]">
                    →
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Account actions */}
        <section className="mt-6 rounded-2xl border border-[#E9D5D0] bg-white p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAECEA] text-[#A84346]">
              <LogOut size={19} />
            </div>

            <div>
              <h2 className="font-bold text-[#253B35]">
                Account actions
              </h2>

              <p className="mt-1 text-sm text-[#737873]">
                Sign out of your CityPulse account on this browser.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutLoading}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-[#E9B8B5] px-5 py-2.5 text-sm font-semibold text-[#A84346] transition hover:bg-[#FAECEA] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={16} />
            {logoutLoading ? "Logging out..." : "Log out"}
          </button>
        </section>

        <p className="mt-5 text-center text-xs leading-5 text-[#85877F]">
          CityPulse prototype · Your account is managed by Firebase.
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;


import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../utils/auth";
import { getLatestIssues } from "../utils/issues";

const ProfilePage = () => {
  const [user, setUser] = useState(getCurrentUser());
  const [issues, setIssues] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = () => setUser(getCurrentUser());
    const loadIssues = () => setIssues(getLatestIssues());

    loadUser();
    loadIssues();

    window.addEventListener("citypulse-auth-change", loadUser);
    window.addEventListener("citypulse-issues-change", loadIssues);

    return () => {
      window.removeEventListener("citypulse-auth-change", loadUser);
      window.removeEventListener("citypulse-issues-change", loadIssues);
    };
  }, []);

  const userId = user?.id ?? user?.uid;

  const myIssues = issues.filter(
    (issue) =>
      userId != null &&
      issue.authorId != null &&
      String(issue.authorId) === String(userId)
  );

  const resolvedCount = myIssues.filter(
    (issue) => issue.status === "resolved"
  ).length;

  const name = user?.name || "CityPulse Member";
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#fafaf8] px-4 py-12">
        <div className="mx-auto max-w-lg rounded-2xl border border-[#e8e9e4] bg-white p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fcebed] text-2xl">
            👤
          </div>

          <h1 className="mt-4 text-2xl font-bold text-[#202522]">
            Your profile
          </h1>

          <p className="mt-2 text-sm text-[#737873]">
            Log in to view your account and community contributions.
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
      <div className="mx-auto max-w-4xl">
        {/* Page heading */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-[#ec4952]">
            YOUR ACCOUNT
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#202522]">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-[#737873]">
            Manage your account and track your contribution to Jaipur.
          </p>
        </div>

        {/* Profile card */}
        <section className="overflow-hidden rounded-2xl border border-[#e8e9e4] bg-white">
          <div className="h-28 bg-gradient-to-r from-[#ec4952] to-[#ff967c]" />

          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-[#202522] text-3xl font-bold text-white shadow-sm">
                  {initials || "C"}
                </div>

                <div className="pb-1">
                  <h2 className="text-xl font-bold text-[#202522]">
                    {name}
                  </h2>
                  <p className="mt-1 text-sm text-[#737873]">
                    CityPulse Community Member
                  </p>
                </div>
              </div>

              <span className="w-fit rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                ● Account active
              </span>
            </div>

            {/* Account details */}
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-[#fafaf8] p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[#8a8e89]">
                  Full name
                </p>
                <p className="mt-2 font-medium text-[#202522]">
                  {name}
                </p>
              </div>

              <div className="rounded-xl bg-[#fafaf8] p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[#8a8e89]">
                  Mobile number
                </p>
                <p className="mt-2 font-medium text-[#202522]">
                  {user.mobile || "Not provided"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contribution statistics */}
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-semibold text-[#202522]">
            Your contributions
          </h2>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#e8e9e4] bg-white p-5">
              <p className="text-sm text-[#737873]">Reports submitted</p>
              <p className="mt-2 text-3xl font-bold text-[#202522]">
                {myIssues.length}
              </p>
            </div>

            <div className="rounded-2xl border border-[#e8e9e4] bg-white p-5">
              <p className="text-sm text-[#737873]">Resolved reports</p>
              <p className="mt-2 text-3xl font-bold text-green-600">
                {resolvedCount}
              </p>
            </div>

            <div className="col-span-2 rounded-2xl border border-[#e8e9e4] bg-white p-5 sm:col-span-1">
              <p className="text-sm text-[#737873]">City</p>
              <p className="mt-2 text-xl font-bold text-[#202522]">
                Jaipur
              </p>
              <p className="mt-1 text-xs text-[#737873]">
                Rajasthan, India
              </p>
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section className="mt-6 rounded-2xl border border-[#e8e9e4] bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-[#202522]">
            Quick actions
          </h2>

          <div className="mt-4 flex flex-col gap-3">
            <Link
              to="/my-reports"
              className="flex items-center justify-between rounded-xl border border-[#e8e9e4] p-4 transition hover:bg-[#fafaf8]"
            >
              <div>
                <p className="font-medium text-[#202522]">
                  View my reports
                </p>
                <p className="mt-1 text-sm text-[#737873]">
                  Check the status of your submissions.
                </p>
              </div>
              <span className="text-lg text-[#737873]">→</span>
            </Link>

            <Link
              to="/report"
              className="flex items-center justify-between rounded-xl border border-[#e8e9e4] p-4 transition hover:bg-[#fafaf8]"
            >
              <div>
                <p className="font-medium text-[#202522]">
                  Report a city problem
                </p>
                <p className="mt-1 text-sm text-[#737873]">
                  Help make Jaipur a better place.
                </p>
              </div>
              <span className="text-lg text-[#737873]">→</span>
            </Link>
          </div>
        </section>

        {/* Account actions */}
        <section className="mt-6 rounded-2xl border border-red-100 bg-white p-5 sm:p-6">
          <h2 className="font-semibold text-[#202522]">
            Account actions
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#737873]">
            Sign out of your current CityPulse account on this browser.
          </p>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 rounded-xl border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            Log out
          </button>
        </section>

        <p className="mt-5 text-center text-xs leading-5 text-[#8a8e89]">
          CityPulse prototype · Account details are stored locally in this
          browser.
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;

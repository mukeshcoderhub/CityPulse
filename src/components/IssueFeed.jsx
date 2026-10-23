
import { useEffect, useState } from "react";
import { getLatestIssues } from "../utils/issues";
import { getCurrentUser } from "../utils/auth";
import IssueCard from "./IssueCard";

const IssueFeed = () => {
  const [issues, setIssues] = useState([]);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  useEffect(() => {
    const loadIssues = () => setIssues(getLatestIssues());
    const loadUser = () => setCurrentUser(getCurrentUser());

    loadIssues();

    window.addEventListener("citypulse-issues-change", loadIssues);
    window.addEventListener("citypulse-auth-change", loadUser);

    return () => {
      window.removeEventListener("citypulse-issues-change", loadIssues);
      window.removeEventListener("citypulse-auth-change", loadUser);
    };
  }, []);

  if (issues.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#dedfd9] bg-white p-8 text-center">
        <p className="font-medium text-[#202522]">No reports yet</p>
        <p className="mt-2 text-sm text-[#737873]">
          Be the first to report a problem in Jaipur.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5">
      {issues.map((issue) => (
        <IssueCard
          key={issue.id}
          issue={issue}
          currentUser={currentUser}
        />
      ))}
    </div>
  );
};

export default IssueFeed;

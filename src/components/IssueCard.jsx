
import { useState } from "react";
import { castVote } from "../utils/issues";
import { evaluateSignal } from "../utils/governance";

const signals = [
  { key: "genuine", label: "Genuine" },
  { key: "duplicate", label: "Duplicate" },
  { key: "resolved", label: "Resolved" },
  { key: "suspicious", label: "Suspicious" },
];

const IssueCard = ({ issue, currentUser }) => {
  const [, setRefresh] = useState(0);
  const [error, setError] = useState("");

  const votes = issue.votes || {};
  const userId = currentUser?.id ?? currentUser?.uid;

  const counts = Object.fromEntries(
    signals.map(({ key }) => [
      key,
      Array.isArray(votes[key]) ? votes[key].length : 0,
    ])
  );

  const currentVote = signals.find(({ key }) =>
    (votes[key] || []).some(
      (vote) => String(vote.userId) === String(userId)
    )
  )?.key;

  const totalVotes = Object.values(counts).reduce(
    (sum, count) => sum + count,
    0
  );

  const handleVote = (signal) => {
    setError("");

    if (!userId) {
      setError("Log in to vote on this report.");
      return;
    }

    if (String(issue.authorId) === String(userId)) {
      setError("You cannot vote on your own report.");
      return;
    }

    try {
      castVote(issue.id, userId, signal);
      setRefresh((value) => value + 1);
    } catch (err) {
      setError(err.message || "Could not save your vote.");
    }
  };

  const location = issue.location;
  const hasCoordinates =
    Number.isFinite(location?.lat) &&
    Number.isFinite(location?.lng);

  const statusLabels = {
    reported: "Reported",
    "in-progress": "In progress",
    resolved: "Resolved",
  };

  const genuineResult = evaluateSignal(counts, "genuine");
  const resolvedResult = evaluateSignal(
    counts,
    "resolved",
    Boolean(issue.resolutionEvidence)
  );

  return (
    <article className="mx-auto w-full max-w-2xl overflow-hidden rounded-xl border border-[#e7e7e2] bg-white shadow-sm transition hover:shadow-md">
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#202522]">
              {issue.authorName || "Community member"}
            </p>
            <p className="mt-1 text-xs text-[#858a84]">
              {new Date(issue.createdAt).toLocaleString()}
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-[#f5f5f1] px-3 py-1 text-xs text-[#555b55]">
            {statusLabels[issue.status] || "Reported"}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-[#fff0f1] px-2.5 py-1 text-xs font-medium text-[#c63740]">
            {issue.category || "Other"}
          </span>
        </div>

        <h2 className="mt-3 text-lg font-semibold leading-snug text-[#202522]">
          {issue.title}
        </h2>

        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#626862]">
          {issue.description}
        </p>
      </div>

      {issue.image && (
        <img
          src={issue.image}
          alt={`Photo evidence for ${issue.title}`}
          loading="lazy"
          className="block max-h-80 w-full bg-gray-50 object-cover"
        />
      )}

      <div className="space-y-4 p-4 sm:p-5">
        {location?.address && (
          <p className="flex items-start gap-2 text-sm text-[#626862]">
            <span aria-hidden="true">📍</span>
            <span className="min-w-0 break-words">{location.address}</span>
          </p>
        )}

        {hasCoordinates && (
          <a
            href={`https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lng}#map=17/${location.lat}/${location.lng}`}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-xs font-medium text-[#555b55] underline underline-offset-4"
          >
            View exact location
          </a>
        )}

        <div className="border-t border-[#eeeeea] pt-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-[#202522]">
              Verify this report
            </h3>
            <span className="text-xs text-[#858a84]">
              {totalVotes} vote{totalVotes === 1 ? "" : "s"}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {signals.map(({ key, label }) => {
              const selected = currentVote === key;

              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => handleVote(key)}
                  className={`flex min-h-10 items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs transition sm:text-sm ${
                    selected
                      ? "border-[#202522] bg-[#202522] text-white"
                      : "border-[#e5e5e0] bg-white text-[#383e39] hover:bg-gray-50"
                  }`}
                >
                  <span>{label}</span>
                  <span>{counts[key]}</span>
                </button>
              );
            })}
          </div>

          {currentVote && (
            <p className="mt-2 text-xs text-[#737873]">
              Your vote: {signals.find((item) => item.key === currentVote)?.label}.
              You can change it at any time.
            </p>
          )}

          {error && (
            <p role="alert" className="mt-3 text-xs text-red-600">
              {error}
            </p>
          )}
        </div>

        <div className="space-y-2 border-t border-[#eeeeea] pt-3 text-xs leading-5 text-[#626862]">
          <p>
            <strong>Genuine:</strong>{" "}
            {genuineResult.qualified
              ? genuineResult.label
              : `${genuineResult.percentage}% support · ${genuineResult.reason}`}
          </p>
          <p>
            <strong>Resolved:</strong>{" "}
            {resolvedResult.qualified
              ? resolvedResult.label
              : `${resolvedResult.percentage}% support · ${resolvedResult.reason}`}
          </p>
        </div>
      </div>
    </article>
  );
};

export default IssueCard;

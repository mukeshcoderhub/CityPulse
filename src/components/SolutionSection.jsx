
import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  ImagePlus,
  LoaderCircle,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
  Upload,
  X,
} from "lucide-react";

import {
  createReportSolution,
  getReportSolutions,
  getSolutionVotes,
  saveSolutionVote,
} from "../services/solutionService";

const getVerification = ({ solved, notSolved, total }) => {
  if (total < 5) {
    return {
      label: "Awaiting community votes",
      color: "bg-amber-50 text-amber-800 border-amber-200",
      percentage: total ? Math.round((solved / total) * 100) : 0,
    };
  }

  const solvedPercentage = Math.round((solved / total) * 100);
  const notSolvedPercentage = 100 - solvedPercentage;

  if (solvedPercentage >= 80) {
    return {
      label: "Community-verified solution",
      color: "bg-emerald-50 text-emerald-800 border-emerald-200",
      percentage: solvedPercentage,
    };
  }

  if (notSolvedPercentage >= 60) {
    return {
      label: "Community-disputed solution",
      color: "bg-rose-50 text-rose-800 border-rose-200",
      percentage: solvedPercentage,
    };
  }

  return {
    label: "Awaiting community votes",
    color: "bg-amber-50 text-amber-800 border-amber-200",
    percentage: solvedPercentage,
  };
};

const formatDate = (value) => {
  if (!value) return "Just now";

  const date =
    typeof value.toDate === "function"
      ? value.toDate()
      : new Date(value);

  if (Number.isNaN(date.getTime())) return "Recently";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const SolutionSection = ({ issueId, currentUser }) => {
  const [solutions, setSolutions] = useState([]);
  const [voteData, setVoteData] = useState({});
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [votingId, setVotingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSolutions = useCallback(async () => {
    if (!issueId) {
      setSolutions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const items = await getReportSolutions(issueId);
      setSolutions(items);

      const results = await Promise.all(
        items.map(async (solution) => {
          try {
            const votes = await getSolutionVotes({
              reportId: issueId,
              solutionId: solution.id,
              userId: currentUser?.uid,
            });

            return [solution.id, votes];
          } catch {
            return [
              solution.id,
              {
                solved: 0,
                notSolved: 0,
                total: 0,
                currentVote: null,
              },
            ];
          }
        })
      );

      setVoteData(Object.fromEntries(results));
    } catch (err) {
      setError(err.message || "Could not load solutions.");
    } finally {
      setLoading(false);
    }
  }, [issueId, currentUser?.uid]);

  useEffect(() => {
    loadSolutions();
  }, [loadSolutions]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return undefined;
    }

    const previewURL = URL.createObjectURL(imageFile);
    setImagePreview(previewURL);

    return () => URL.revokeObjectURL(previewURL);
  }, [imageFile]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    setImageFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!currentUser?.uid) {
      setError("Please log in to submit a solution.");
      return;
    }

    if (!imageFile) {
      setError("Please upload a photo showing the correction.");
      return;
    }

    setSubmitting(true);

    try {
      const authorName =
        currentUser.displayName ||
        currentUser.email?.split("@")[0] ||
        "Community member";

      await createReportSolution({
        reportId: issueId,
        userId: currentUser.uid,
        authorName,
        description,
        imageFile,
      });

      setDescription("");
      setImageFile(null);
      setSuccess("Your solution has been submitted.");
      await loadSolutions();
    } catch (err) {
      setError(err.message || "Could not submit your solution.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (solution, signal) => {
    if (!currentUser?.uid) {
      setError("Please log in to vote.");
      return;
    }

    setError("");
    setSuccess("");
    setVotingId(solution.id);

    try {
      const result = await saveSolutionVote({
        reportId: issueId,
        solutionId: solution.id,
        userId: currentUser.uid,
        signal,
      });

      setVoteData((previous) => ({
        ...previous,
        [solution.id]: result,
      }));
    } catch (err) {
      setError(err.message || "Could not save your vote.");
    } finally {
      setVotingId("");
    }
  };

  return (
    <section className="mt-6 border-t border-[#E9E1D9] pt-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-[#253B35]">
            <ShieldCheck size={21} />
            Community Solutions
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Share a correction and let the community verify it.
          </p>
        </div>

        <span className="rounded-full bg-[#F7E9E5] px-3 py-1 text-sm font-semibold text-[#9E4247]">
          {solutions.length} {solutions.length === 1 ? "solution" : "solutions"}
        </span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-6 space-y-4 rounded-2xl border border-[#E9E1D9] bg-[#FFFCF8] p-4"
      >
        <div>
          <label
            htmlFor={`solution-description-${issueId}`}
            className="mb-2 block text-sm font-semibold text-[#253B35]"
          >
            What was corrected?
          </label>

          <textarea
            id={`solution-description-${issueId}`}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="Describe the repair, action taken, or current condition..."
            className="w-full resize-y rounded-xl border border-[#E9E1D9] bg-white p-3 text-sm outline-none transition focus:border-[#253B35] focus:ring-2 focus:ring-[#253B35]/10"
            required
          />

          <p className="mt-1 text-right text-xs text-gray-400">
            {description.length}/1000
          </p>
        </div>

        <div>
          <span className="mb-2 block text-sm font-semibold text-[#253B35]">
            Upload evidence photo
          </span>

          {!imagePreview ? (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#D9CEC4] bg-white px-4 py-6 text-center transition hover:border-[#253B35]">
              <ImagePlus size={28} className="mb-2 text-[#B84C50]" />
              <span className="text-sm font-semibold text-[#253B35]">
                Choose a solution image
              </span>
              <span className="mt-1 text-xs text-gray-500">
                JPG, PNG, or WebP · Maximum 5 MB
              </span>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative overflow-hidden rounded-xl border border-[#E9E1D9]">
              <img
                src={imagePreview}
                alt="Solution preview"
                className="max-h-72 w-full bg-white object-contain"
              />

              <button
                type="button"
                onClick={() => setImageFile(null)}
                className="absolute right-2 top-2 rounded-full bg-white p-2 text-gray-700 shadow hover:bg-rose-50"
                aria-label="Remove selected image"
              >
                <X size={18} />
              </button>

              <label className="flex cursor-pointer items-center justify-center gap-2 border-t border-[#E9E1D9] bg-white px-3 py-2 text-sm font-medium text-[#253B35] hover:bg-gray-50">
                <Upload size={16} />
                Change image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </p>
        )}

        {success && (
          <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#253B35] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#304D44] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {submitting ? (
            <>
              <LoaderCircle size={17} className="animate-spin" />
              Uploading solution...
            </>
          ) : (
            <>
              <Upload size={17} />
              Submit solution
            </>
          )}
        </button>

        {!currentUser?.uid && (
          <p className="text-xs text-gray-500">
            You need to log in to submit a solution or vote.
          </p>
        )}
      </form>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
          <LoaderCircle size={19} className="animate-spin" />
          Loading community solutions...
        </div>
      ) : solutions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#D9CEC4] px-4 py-8 text-center">
          <ImagePlus size={28} className="mx-auto mb-2 text-gray-400" />
          <p className="font-semibold text-[#253B35]">
            No solutions submitted yet
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Share a photo and description if you have evidence of a correction.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {solutions.map((solution) => {
            const votes = voteData[solution.id] || {
              solved: 0,
              notSolved: 0,
              total: 0,
              currentVote: null,
            };

            const verification = getVerification(votes);
            const isOwnSolution =
              currentUser?.uid === solution.authorId;

            return (
              <article
                key={solution.id}
                className="overflow-hidden rounded-2xl border border-[#E9E1D9] bg-white"
              >
                <div className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="break-words font-semibold text-[#253B35]">
                      {solution.authorName || "Community member"}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock3 size={13} />
                      {formatDate(solution.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${verification.color}`}
                  >
                    {verification.label}
                  </span>
                </div>

                {solution.imageURL && (
                  <a
                    href={solution.imageURL}
                    target="_blank"
                    rel="noreferrer"
                    className="block bg-[#F7F4F0]"
                  >
                    <img
                      src={solution.imageURL}
                      alt="Photo submitted as solution evidence"
                      loading="lazy"
                      className="max-h-96 w-full object-contain"
                    />
                  </a>
                )}

                <div className="p-4">
                  <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                    {solution.description}
                  </p>

                  <div className="mt-4 rounded-xl bg-[#F8F7F4] p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-[#253B35]">
                        Community verification
                      </span>
                      <span className="text-xs text-gray-500">
                        {votes.total} {votes.total === 1 ? "vote" : "votes"}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-rose-100">
                      <div
                        className="h-full rounded-full bg-emerald-600 transition-all"
                        style={{
                          width: `${verification.percentage}%`,
                        }}
                      />
                    </div>

                    <div className="mt-2 flex justify-between gap-3 text-xs">
                      <span className="text-emerald-700">
                        Solved: {votes.solved}
                      </span>
                      <span className="text-rose-700">
                        Not solved: {votes.notSolved}
                      </span>
                    </div>
                  </div>

                  {isOwnSolution ? (
                    <p className="mt-3 text-xs text-gray-500">
                      You submitted this solution, so you cannot vote on it.
                    </p>
                  ) : (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        disabled={!currentUser?.uid || votingId === solution.id}
                        onClick={() => handleVote(solution, "solved")}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          votes.currentVote === "solved"
                            ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                            : "border-gray-200 text-gray-700 hover:border-emerald-500 hover:bg-emerald-50"
                        }`}
                      >
                        {votingId === solution.id ? (
                          <LoaderCircle size={16} className="animate-spin" />
                        ) : (
                          <ThumbsUp size={16} />
                        )}
                        Solved
                      </button>

                      <button
                        type="button"
                        disabled={!currentUser?.uid || votingId === solution.id}
                        onClick={() => handleVote(solution, "notSolved")}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          votes.currentVote === "notSolved"
                            ? "border-rose-500 bg-rose-50 text-rose-800"
                            : "border-gray-200 text-gray-700 hover:border-rose-400 hover:bg-rose-50"
                        }`}
                      >
                        <ThumbsDown size={16} />
                        Not Solved
                      </button>
                    </div>
                  )}

                  {!currentUser?.uid && (
                    <p className="mt-2 text-center text-xs text-gray-500">
                      Log in to verify this solution.
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                    <CheckCircle2 size={14} />
                    {votes.total < 5
                      ? `${5 - votes.total} more vote${5 - votes.total === 1 ? "" : "s"} needed for verification`
                      : "Status is based on community votes"}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default SolutionSection;

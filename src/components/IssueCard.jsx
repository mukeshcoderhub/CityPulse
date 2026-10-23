import { useCallback, useEffect, useState } from "react";
import {
  MapPin,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  CalendarDays,
  Users,
  Image as ImageIcon,
  LoaderCircle,
  Bookmark,
  MessageCircle,
  ChevronDown,
  RefreshCw,
} from "lucide-react";

import { evaluateSignal } from "../utils/governance";
import { getReportVotes, saveReportVote } from "../services/voteService";
import { isReportSaved, toggleSavedReport } from "../services/wishlistService";
import { getReportReplies, addReportReply } from "../services/replyService";

const SIGNALS = [
  {
    id: "genuine",
    label: "Genuine issue",
    icon: CheckCircle2,
    color: "text-emerald-700",
    active: "border-emerald-300 bg-emerald-50",
  },
  {
    id: "resolved",
    label: "Resolved",
    icon: ShieldCheck,
    color: "text-blue-700",
    active: "border-blue-300 bg-blue-50",
  },
  {
    id: "suspicious",
    label: "Suspicious",
    icon: AlertTriangle,
    color: "text-rose-700",
    active: "border-rose-300 bg-rose-50",
  },
];

const STATUS_STYLES = {
  reported: "bg-[#F5EEE0] text-[#92713D]",
  "in progress": "bg-blue-50 text-blue-700",
  resolved: "bg-emerald-50 text-emerald-700",
  duplicate: "bg-amber-50 text-amber-700",
  suspicious: "bg-rose-50 text-rose-700",
};

const normalizeStatus = (status) =>
  String(status || "reported")
    .toLowerCase()
    .replace(/[-_]/g, " ");

const formatDate = (value) => {
  if (!value) return "Just now";

  try {
    const date =
      typeof value?.toDate === "function"
        ? value.toDate()
        : value instanceof Date
          ? value
          : typeof value?.seconds === "number"
            ? new Date(value.seconds * 1000)
            : new Date(value);

    if (Number.isNaN(date.getTime())) return "Recently";

    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "Recently";
  }
};

const IssueCard = ({ issue, currentUser, onBookmarkChange }) => {
  const userId = currentUser?.uid || currentUser?.id || null;
  const isAuthor = Boolean(userId && issue.authorId === userId);

  // Community voting state
  const [votes, setVotes] = useState([]);
  const [counts, setCounts] = useState({});
  const [currentVote, setCurrentVote] = useState(null);
  const [votesLoading, setVotesLoading] = useState(true);
  const [savingVote, setSavingVote] = useState(false);
  const [voteError, setVoteError] = useState("");

  // Wishlist state
  const [isSaved, setIsSaved] = useState(false);
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [bookmarkError, setBookmarkError] = useState("");

  // Report image state
  const [imageError, setImageError] = useState(false);

  // Comments state
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSaving, setCommentSaving] = useState(false);
  const [commentError, setCommentError] = useState("");

  const status = normalizeStatus(issue.status);
  const statusClass = STATUS_STYLES[status] || STATUS_STYLES.reported;

  const location = issue.location || {};
  const latitude = location.lat ?? location.latitude;
  const longitude = location.lng ?? location.longitude;

  const address =
    location.address || issue.address || "Location details unavailable";

  const hasCoordinates =
    latitude != null &&
    longitude != null &&
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude));

  const mapUrl = hasCoordinates
    ? `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`
    : null;

  const reportDate = formatDate(issue.createdAt);

  // Load community verification votes
  const loadVotes = useCallback(async () => {
    if (!issue?.id) {
      setVotesLoading(false);
      return;
    }

    setVotesLoading(true);
    setVoteError("");

    try {
      const result = await getReportVotes(issue.id, userId);

      const voteList = Array.isArray(result)
        ? result
        : Array.isArray(result?.votes)
          ? result.votes
          : [];

      setVotes(voteList);
      setCounts(result?.counts || {});

      const foundVote =
        result?.currentVote ||
        voteList.find((vote) => vote.userId === userId || vote.uid === userId)
          ?.signal ||
        null;

      setCurrentVote(
        typeof foundVote === "string" ? foundVote : foundVote?.signal || null,
      );
    } catch (error) {
      console.error("Failed to load report votes:", error);
      setVoteError("Unable to load community votes.");
    } finally {
      setVotesLoading(false);
    }
  }, [issue?.id, userId]);

  useEffect(() => {
    loadVotes();
  }, [loadVotes]);

  // Check whether this report is in the user's Wishlist
  useEffect(() => {
    let active = true;

    const checkBookmark = async () => {
      if (!userId || !issue?.id) {
        setIsSaved(false);
        return;
      }

      try {
        const saved = await isReportSaved(userId, issue.id);
        if (active) setIsSaved(saved);
      } catch (error) {
        console.error("Failed to check Wishlist status:", error);
      }
    };

    checkBookmark();

    return () => {
      active = false;
    };
  }, [userId, issue?.id]);

  // Submit a community verification vote
  const handleVote = async (signal) => {
    if (!userId) {
      setVoteError("Please log in to vote on this report.");
      return;
    }

    if (isAuthor) {
      setVoteError("You cannot vote on your own report.");
      return;
    }

    if (savingVote) return;

    setSavingVote(true);
    setVoteError("");

    try {
      await saveReportVote({
        reportId: issue.id,
        userId,
        signal,
      });

      await loadVotes();
    } catch (error) {
      console.error("Failed to save vote:", error);

      setVoteError(
        error.code === "permission-denied"
          ? "Firebase rules blocked this vote."
          : error.message || "Unable to save your vote.",
      );
    } finally {
      setSavingVote(false);
    }
  };

  // Add or remove a report from Wishlist
  const handleBookmark = async () => {
    if (!userId) {
      setBookmarkError("Please log in to save reports.");
      return;
    }

    if (savingBookmark) return;

    setSavingBookmark(true);
    setBookmarkError("");

    try {
      const saved = await toggleSavedReport(userId, issue.id);
      setIsSaved(saved);
      onBookmarkChange?.(saved);
    } catch (error) {
      console.error("Failed to update Wishlist:", error);

      setBookmarkError(error.message || "Unable to update your Wishlist.");
    } finally {
      setSavingBookmark(false);
    }
  };

  // Load comments only when the user opens the comments section
  const loadComments = async () => {
    if (!issue?.id) return;

    setCommentsLoading(true);
    setCommentError("");

    try {
      const result = await getReportReplies(issue.id);
      setComments(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Failed to load comments:", error);
      setCommentError("Unable to load comments. Please try again.");
    } finally {
      setCommentsLoading(false);
    }
  };

  // Submit a text-only comment
  const handleSubmitComment = async (event) => {
    event.preventDefault();

    if (!userId) {
      setCommentError("Please log in to post a comment.");
      return;
    }

    const text = commentText.trim();

    if (!text) {
      setCommentError("Please write a comment first.");
      return;
    }

    if (text.length > 500 || commentSaving) return;

    setCommentSaving(true);
    setCommentError("");

    try {
      await addReportReply({
        reportId: issue.id,
        userId,
        authorName:
          currentUser?.displayName || currentUser?.email || "Community member",
        text,
        type: "comment",
      });

      setCommentText("");
      await loadComments();
    } catch (error) {
      console.error("Failed to post comment:", error);

      setCommentError(
        error.code === "permission-denied"
          ? "Firebase rules blocked this comment. Check your Firestore rules."
          : error.message || "Could not post your comment.",
      );
    } finally {
      setCommentSaving(false);
    }
  };

  const getCount = (signal) => {
    if (typeof counts[signal] === "number") {
      return counts[signal];
    }

    if (typeof counts[signal]?.count === "number") {
      return counts[signal].count;
    }

    return votes.filter((vote) => vote.signal === signal).length;
  };

  const getPercentage = (signal) => {
    const total = SIGNALS.reduce((sum, item) => sum + getCount(item.id), 0);

    if (total === 0) return 0;

    return Math.round((getCount(signal) / total) * 100);
  };

  const imageSrc =
    typeof issue.image === "string"
      ? issue.image
      : issue.image?.url || issue.image?.src || "";

  const evidence =
    issue.resolutionEvidence || issue.resolutionImage || issue.evidence || null;

  return (
    <article className="overflow-hidden rounded-2xl border border-[#E9E1D9] bg-white shadow-sm transition hover:shadow-md">
      {/* Report header */}
      <div className="flex items-start justify-between gap-3 px-4 pt-5 sm:px-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8EFE9] text-[#355747]">
            <MapPin size={20} />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#85877F]">
              {issue.category || "City issue"}
            </p>

            <h2 className="mt-1 break-words text-lg font-bold leading-6 text-[#253B35]">
              {issue.title || "Untitled city report"}
            </h2>

            <p className="mt-1 text-xs text-[#85877F]">
              Reported by {issue.authorName || "Community member"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${statusClass}`}
          >
            {status}
          </span>

          <button
            type="button"
            onClick={handleBookmark}
            disabled={savingBookmark}
            aria-label={isSaved ? "Remove from Wishlist" : "Save to Wishlist"}
            title={isSaved ? "Remove from Wishlist" : "Save to Wishlist"}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition disabled:opacity-50 ${
              isSaved
                ? "border-[#D8B5AD] bg-[#F7E9E5] text-[#A84346]"
                : "border-[#E9E1D9] bg-white text-[#69716A] hover:bg-[#F7E9E5] hover:text-[#A84346]"
            }`}
          >
            {savingBookmark ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
            )}
          </button>
        </div>
      </div>

      {/* Report date and location */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 px-4 text-xs text-[#85877F] sm:px-6">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays size={14} />
          {reportDate}
        </span>

        <span className="inline-flex min-w-0 items-center gap-1.5">
          <MapPin size={14} className="shrink-0" />
          <span className="break-words">{address}</span>
        </span>
      </div>

      {bookmarkError && (
        <p role="alert" className="mx-4 mt-3 text-xs text-rose-700 sm:mx-6">
          {bookmarkError}
        </p>
      )}

      {/* Report description */}
      <div className="px-4 pb-4 pt-4 sm:px-6">
        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[#536057]">
          {issue.description || "No additional description provided."}
        </p>
      </div>

      {/* Report image */}
      {imageSrc && !imageError && (
        <div className="px-4 pb-4 sm:px-6">
          <img
            src={imageSrc}
            alt={issue.title || "Reported city issue"}
            loading="lazy"
            onError={() => setImageError(true)}
            className="max-h-[420px] w-full rounded-xl border border-[#E9E1D9] bg-[#FAF8F3] object-cover"
          />
        </div>
      )}

      {imageSrc && imageError && (
        <div className="mx-4 mb-4 flex items-center gap-2 rounded-xl bg-[#FAF8F3] p-3 text-xs text-[#85877F] sm:mx-6">
          <ImageIcon size={16} />
          This report image could not be displayed.
        </div>
      )}

      {/* Map link */}
      {mapUrl && (
        <div className="px-4 pb-4 sm:px-6">
          <a
            href={mapUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-[#E9E1D9] px-3 py-2 text-xs font-semibold text-[#355747] transition hover:bg-[#E8EFE9]"
          >
            <MapPin size={15} />
            View location on map
            <ExternalLink size={13} />
          </a>
        </div>
      )}

      {/* Community verification */}
      <section className="border-t border-[#EEE8E0] bg-[#FFFCF8] px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-sm font-bold text-[#253B35]">
            <Users size={17} />
            Community verification
          </h3>

          <button
            type="button"
            onClick={loadVotes}
            disabled={votesLoading}
            title="Refresh votes"
            className="rounded-lg p-1.5 text-[#85877F] transition hover:bg-[#F0EAE0] disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={votesLoading ? "animate-spin" : ""}
            />
          </button>
        </div>

        <p className="mt-1 text-xs leading-5 text-[#85877F]">
          Help the community verify whether this report is genuine, resolved, or
          suspicious.
        </p>

        {isAuthor && (
          <p className="mt-3 rounded-lg bg-[#F5EEE0] px-3 py-2 text-xs leading-5 text-[#92713D]">
            You submitted this report, so you cannot vote on it.
          </p>
        )}

        {voteError && (
          <p role="alert" className="mt-3 text-xs text-rose-700">
            {voteError}
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SIGNALS.map((signal) => {
            const SignalIcon = signal.icon;
            const selected = currentVote === signal.id;

            return (
              <button
                key={signal.id}
                type="button"
                onClick={() => handleVote(signal.id)}
                disabled={savingVote || votesLoading || isAuthor}
                className={`rounded-xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  selected
                    ? signal.active
                    : "border-[#E9E1D9] bg-white hover:border-[#D8D0C5]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <SignalIcon size={17} className={signal.color} />

                  {selected && (
                    <CheckCircle2 size={14} className={signal.color} />
                  )}
                </div>

                <p className="mt-2 text-xs font-semibold text-[#253B35]">
                  {signal.label}
                </p>

                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="text-xs text-[#85877F]">
                    {votesLoading ? "—" : getCount(signal.id)} votes
                  </span>

                  <span className="text-xs font-semibold text-[#536057]">
                    {votesLoading ? "—" : `${getPercentage(signal.id)}%`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {savingVote && (
          <p className="mt-3 text-xs text-[#85877F]">Saving your vote...</p>
        )}

        {/* Governance results */}
        <div className="mt-4 space-y-2">
          {SIGNALS.map((signal) => {
            const result = evaluateSignal(votes, signal.id, Boolean(evidence));

            if (!result?.qualified) return null;

            return (
              <div
                key={signal.id}
                className="flex items-start gap-2 rounded-lg border border-[#D9E6DB] bg-[#EAF0EB] px-3 py-2.5"
              >
                <ShieldCheck
                  size={16}
                  className="mt-0.5 shrink-0 text-[#355747]"
                />

                <div>
                  <p className="text-xs font-bold text-[#355747]">
                    {result.label || signal.label}
                  </p>

                  {result.reason && (
                    <p className="mt-1 text-xs leading-5 text-[#536057]">
                      {result.reason}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {status === "resolved" && evidence && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-xs font-semibold text-emerald-800">
              Resolution evidence is available
            </p>

            {typeof evidence === "string" && evidence.startsWith("http") && (
              <a
                href={evidence}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 underline"
              >
                View evidence <ExternalLink size={12} />
              </a>
            )}
          </div>
        )}
      </section>

      {/* Collapsible text-only comments */}
      <section className="border-t border-[#EEE8E0] bg-white">
        <button
          type="button"
          onClick={() => {
            const opening = !commentsOpen;
            setCommentsOpen(opening);
            if (opening) loadComments();
          }}
          aria-expanded={commentsOpen}
          aria-controls={`comments-${issue.id}`}
          className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition hover:bg-[#FFFCF8] sm:px-6"
        >
          <span className="flex items-center gap-2.5">
            <MessageCircle size={19} className="text-[#53665A]" />

            <span>
              <span className="block font-semibold text-[#253B35]">
                Comments
              </span>

              <span className="mt-0.5 block text-xs font-normal text-[#85877F]">
                {commentsOpen
                  ? "Hide community comments"
                  : "Open to read or add a comment"}
              </span>
            </span>

            <span className="rounded-full bg-[#F4F0E9] px-2 py-0.5 text-xs font-semibold text-[#69716A]">
              {comments.length}
            </span>
          </span>

          <ChevronDown
            size={18}
            className={`shrink-0 text-[#85877F] transition-transform duration-200 ${
              commentsOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {commentsOpen && (
          <div
            id={`comments-${issue.id}`}
            className="border-t border-[#EEE8E0] px-4 py-5 sm:px-6"
          >
            <form onSubmit={handleSubmitComment}>
              <label
                htmlFor={`comment-${issue.id}`}
                className="mb-2 block text-sm font-semibold text-[#253B35]"
              >
                Add a comment
              </label>

              <textarea
                id={`comment-${issue.id}`}
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Share a useful comment or update..."
                className="w-full resize-y rounded-xl border border-[#E9E1D9] bg-[#FFFCF8] p-3 text-sm leading-6 text-[#253B35] outline-none transition placeholder:text-[#A09F96] focus:border-[#789582] focus:ring-2 focus:ring-[#E8EFE9]"
              />

              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-[#85877F]">
                  {commentText.length}/500 characters
                </span>

                <button
                  type="submit"
                  disabled={commentSaving || !commentText.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#253B35] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#344D44] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {commentSaving ? (
                    <LoaderCircle size={15} className="animate-spin" />
                  ) : (
                    <MessageCircle size={15} />
                  )}

                  {commentSaving ? "Posting..." : "Post comment"}
                </button>
              </div>
            </form>

            {commentError && (
              <p
                role="alert"
                className="mt-3 rounded-lg border border-[#E9B8B5] bg-[#FAECEA] px-3 py-2.5 text-xs leading-5 text-[#A43E43]"
              >
                {commentError}
              </p>
            )}

            <div className="mt-5 space-y-3">
              {commentsLoading ? (
                <p className="flex items-center gap-2 py-3 text-sm text-[#85877F]">
                  <LoaderCircle size={16} className="animate-spin" />
                  Loading comments...
                </p>
              ) : comments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#E9E1D9] bg-[#FFFCF8] px-4 py-6 text-center">
                  <MessageCircle size={24} className="mx-auto text-[#B8A89B]" />

                  <p className="mt-2 text-sm font-semibold text-[#253B35]">
                    No comments yet
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#85877F]">
                    Be the first to share a helpful update.
                  </p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-xl border border-[#E9E1D9] bg-[#FFFCF8] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[#253B35]">
                        {comment.authorName || "Community member"}
                      </p>

                      <span className="text-xs text-[#85877F]">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>

                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#536057]">
                      {comment.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </section>
    </article>
  );
};

export default IssueCard;

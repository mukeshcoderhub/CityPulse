const ISSUES_KEY = "citypulse-issues";

export const getIssues = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(ISSUES_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const getLatestIssues = () =>
  [...getIssues()].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

export const saveIssues = (issues) => {
  localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
  window.dispatchEvent(new Event("citypulse-issues-change"));
};

export const createIssue = ({
  title,
  description,
  category,
  location,
  image,
  authorId,
  authorName,
}) => {
  if (
    !location ||
    !Number.isFinite(location.lat) ||
    !Number.isFinite(location.lng)
  ) {
    throw new Error("Please select a valid location on the map.");
  }

  if (!image) {
    throw new Error("A photo is required.");
  }

  const now = new Date().toISOString();

  const issue = {
    id: crypto.randomUUID(),
    title: title.trim(),
    description: description.trim(),
    category,
    location: {
      lat: location.lat,
      lng: location.lng,
      address: location.address || "",
    },
    image,
    authorId,
    authorName,
    status: "reported",
    votes: {
      genuine: [],
      duplicate: [],
      resolved: [],
      suspicious: [],
    },
    resolutionEvidence: "",
    duplicateOf: null,
    createdAt: now,
    activity: [
      {
        type: "reported",
        message: "Issue reported to CityPulse",
        createdAt: now,
      },
    ],
  };

  saveIssues([issue, ...getIssues()]);
  return issue;
};

export const castVote = (issueId, userId, signal) => {
  const validSignals = ["genuine", "duplicate", "resolved", "suspicious"];

  if (!userId) throw new Error("Please log in before voting.");
  if (!validSignals.includes(signal)) {
    throw new Error("Invalid community signal.");
  }

  const issues = getIssues();
  const index = issues.findIndex((item) => item.id === issueId);

  if (index === -1) throw new Error("Issue not found.");

  const issue = issues[index];

  if (String(issue.authorId) === String(userId)) {
    throw new Error("You cannot vote on your own issue.");
  }

  // Normalize older records, if any.
  issue.votes = issue.votes || {};
  for (const key of validSignals) {
    if (!Array.isArray(issue.votes[key])) {
      issue.votes[key] = [];
    }
  }

  // Remove this user's previous vote across all four signals.
  for (const key of validSignals) {
    issue.votes[key] = issue.votes[key].filter(
      (vote) => String(vote.userId) !== String(userId),
    );
  }

  // Save exactly one new selection.
  issue.votes[signal].push({
    userId,
    createdAt: new Date().toISOString(),
  });

  issues[index] = issue;
  saveIssues(issues);

  return issue;
};


const MIN_VOTES = 5;

export const SIGNAL_RULES = {
  genuine: {
    threshold: 80,
    label: "Community Verified",
  },
  duplicate: {
    threshold: 70,
    label: "Likely Duplicate",
  },
  resolved: {
    threshold: 80,
    label: "Community Confirmed Resolved",
  },
  suspicious: {
    threshold: 60,
    label: "Community Review",
  },
};

// Calculate the percentage of a signal
export const getSignalPercentage = (votes, signal) => {
  const totalVotes = Object.values(votes).reduce(
    (sum, count) => sum + count,
    0
  );

  if (totalVotes === 0) return 0;

  return Math.round(
    ((votes[signal] || 0) / totalVotes) * 100
  );
};

// Check whether a signal meets its threshold
export const evaluateSignal = (
  votes,
  signal,
  hasEvidence = false
) => {
  const totalVotes = Object.values(votes).reduce(
    (sum, count) => sum + count,
    0
  );

  const percentage = getSignalPercentage(votes, signal);
  const rule = SIGNAL_RULES[signal];

  if (!rule) {
    return {
      qualified: false,
      percentage,
      reason: "Unknown signal",
    };
  }

  if (totalVotes < MIN_VOTES) {
    return {
      qualified: false,
      percentage,
      reason: `Needs ${MIN_VOTES - totalVotes} more votes`,
    };
  }

  if (percentage < rule.threshold) {
    return {
      qualified: false,
      percentage,
      reason: "Threshold not reached",
    };
  }

  // Resolved reports require supporting evidence
  if (signal === "resolved" && !hasEvidence) {
    return {
      qualified: false,
      percentage,
      reason: "Resolution evidence required",
    };
  }

  return {
    qualified: true,
    percentage,
    label: rule.label,
    reason: "Threshold reached",
  };
};

// Create a fresh issue's community vote record
export const createVoteRecord = () => ({
  genuine: 0,
  duplicate: 0,
  resolved: 0,
  suspicious: 0,
});

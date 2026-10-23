
import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase/config";

const getVotesCollection = (reportId) =>
  collection(db, "reports", reportId, "votes");

export const getReportVotes = async (reportId, userId) => {
  const snapshot = await getDocs(getVotesCollection(reportId));

  const counts = {
    genuine: 0,
    duplicate: 0,
    resolved: 0,
    suspicious: 0,
  };

  let currentVote = null;

  snapshot.forEach((voteDoc) => {
    const vote = voteDoc.data();

    if (Object.prototype.hasOwnProperty.call(counts, vote.signal)) {
      counts[vote.signal] += 1;
    }

    if (voteDoc.id === userId) {
      currentVote = vote.signal;
    }
  });

  return { counts, currentVote };
};

export const saveReportVote = async ({
  reportId,
  userId,
  signal,
}) => {
  const allowedSignals = [
    "genuine",
    "duplicate",
    "resolved",
    "suspicious",
  ];

  if (!reportId || !userId) {
    throw new Error("You must be signed in to vote.");
  }

  if (!allowedSignals.includes(signal)) {
    throw new Error("Invalid vote selection.");
  }

  const voteRef = doc(
    db,
    "reports",
    reportId,
    "votes",
    userId
  );

  await setDoc(voteRef, {
    userId,
    signal,
    updatedAt: serverTimestamp(),
  });
};

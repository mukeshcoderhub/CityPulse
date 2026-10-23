
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  orderBy,
  limit,
} from "firebase/firestore";

import { db } from "../firebase/config";

const getRepliesCollection = (reportId) =>
  collection(db, "reports", reportId, "replies");

// Load replies for one report
export const getReportReplies = async (reportId) => {
  if (!reportId) {
    throw new Error("Report ID is missing.");
  }

  const repliesQuery = query(
    getRepliesCollection(reportId),
    orderBy("createdAt", "desc"),
    limit(100)
  );

  const snapshot = await getDocs(repliesQuery);

  return snapshot.docs.map((replyDoc) => ({
    id: replyDoc.id,
    ...replyDoc.data(),
  }));
};

// Add a reply to a report
export const addReportReply = async ({
  reportId,
  userId,
  authorName,
  text,
  type = "comment",
}) => {
  if (!reportId) {
    throw new Error("Report ID is missing.");
  }

  if (!userId) {
    throw new Error("Please log in to reply.");
  }

  const trimmedText = text?.trim();

  if (!trimmedText) {
    throw new Error("Please write something before posting.");
  }

  if (trimmedText.length > 500) {
    throw new Error("Replies must be 500 characters or fewer.");
  }

  if (!["comment", "solution"].includes(type)) {
    throw new Error("Invalid reply type.");
  }

  const replyData = {
    reportId,
    userId,
    authorName: authorName?.trim() || "Community member",
    text: trimmedText,
    type,
    createdAt: serverTimestamp(),
  };

  const replyRef = await addDoc(
    getRepliesCollection(reportId),
    replyData
  );

  return {
    id: replyRef.id,
    ...replyData,
  };
};

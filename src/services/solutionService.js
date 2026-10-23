
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import { db, storage } from "../firebase/config";

const getSolutionsCollection = (reportId) =>
  collection(db, "reports", reportId, "solutions");

const getVotesCollection = (reportId, solutionId) =>
  collection(
    db,
    "reports",
    reportId,
    "solutions",
    solutionId,
    "votes"
  );

export const getReportSolutions = async (reportId) => {
  if (!reportId) throw new Error("Report ID is missing.");

  const solutionsQuery = query(
    getSolutionsCollection(reportId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(solutionsQuery);

  return snapshot.docs.map((solutionDoc) => ({
    id: solutionDoc.id,
    ...solutionDoc.data(),
  }));
};

export const createReportSolution = async ({
  reportId,
  userId,
  authorName,
  description,
  imageFile,
}) => {
  if (!reportId) throw new Error("Report ID is missing.");
  if (!userId) throw new Error("Please log in to submit a solution.");

  const trimmedDescription = description?.trim();

  if (!trimmedDescription) {
    throw new Error("Please describe the solution.");
  }

  if (trimmedDescription.length > 1000) {
    throw new Error("Description must be 1000 characters or fewer.");
  }

  if (!imageFile) {
    throw new Error("Please upload an image showing the solution.");
  }

  if (!["image/jpeg", "image/png", "image/webp"].includes(imageFile.type)) {
    throw new Error("Upload a JPG, PNG, or WebP image.");
  }

  if (imageFile.size > 5 * 1024 * 1024) {
    throw new Error("The image must be 5 MB or smaller.");
  }

  // Create a stable ID before uploading the image.
  const solutionRef = doc(getSolutionsCollection(reportId));

  const safeFileName = imageFile.name.replace(
    /[^a-zA-Z0-9._-]/g,
    "_"
  );

  const imagePath =
    `reports/${reportId}/solutions/${solutionRef.id}/${safeFileName}`;

  const imageRef = ref(storage, imagePath);

  await uploadBytes(imageRef, imageFile, {
    contentType: imageFile.type,
  });

  const imageURL = await getDownloadURL(imageRef);

  const solutionData = {
    reportId,
    authorId: userId,
    authorName: authorName?.trim() || "Community member",
    description: trimmedDescription,
    imageURL,
    imagePath,
    createdAt: serverTimestamp(),
  };

  await setDoc(solutionRef, solutionData);

  return {
    id: solutionRef.id,
    ...solutionData,
    createdAt: new Date(),
  };
};

export const getSolutionVotes = async ({
  reportId,
  solutionId,
  userId,
}) => {
  if (!reportId || !solutionId) {
    throw new Error("Report or solution ID is missing.");
  }

  const snapshot = await getDocs(
    getVotesCollection(reportId, solutionId)
  );

  let solved = 0;
  let notSolved = 0;
  let currentVote = null;

  snapshot.docs.forEach((voteDoc) => {
    const vote = voteDoc.data();

    if (vote.signal === "solved") solved += 1;
    if (vote.signal === "notSolved") notSolved += 1;

    if (voteDoc.id === userId) {
      currentVote = vote.signal;
    }
  });

  return {
    solved,
    notSolved,
    total: solved + notSolved,
    currentVote,
  };
};

export const saveSolutionVote = async ({
  reportId,
  solutionId,
  userId,
  signal,
}) => {
  if (!reportId || !solutionId || !userId) {
    throw new Error("Missing information needed to vote.");
  }

  if (!["solved", "notSolved"].includes(signal)) {
    throw new Error("Invalid vote.");
  }

  const solutionRef = doc(
    db,
    "reports",
    reportId,
    "solutions",
    solutionId
  );

  const solutionSnapshot = await getDoc(solutionRef);

  if (!solutionSnapshot.exists()) {
    throw new Error("This solution no longer exists.");
  }

  if (solutionSnapshot.data().authorId === userId) {
    throw new Error("You cannot vote on your own solution.");
  }

  const voteRef = doc(
    db,
    "reports",
    reportId,
    "solutions",
    solutionId,
    "votes",
    userId
  );

  await setDoc(
    voteRef,
    {
      userId,
      signal,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return getSolutionVotes({ reportId, solutionId, userId });
};


import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase/config";

const savedReportsCollection = (userId) =>
  collection(db, "users", userId, "savedReports");

export const isReportSaved = async (userId, reportId) => {
  if (!userId || !reportId) return false;

  const savedRef = doc(
    db,
    "users",
    userId,
    "savedReports",
    reportId
  );

  const snapshot = await getDoc(savedRef);
  return snapshot.exists();
};

export const toggleSavedReport = async (userId, reportId) => {
  if (!userId) {
    throw new Error("Please log in to save reports.");
  }

  if (!reportId) {
    throw new Error("Report ID is missing.");
  }

  const savedRef = doc(
    db,
    "users",
    userId,
    "savedReports",
    reportId
  );

  const snapshot = await getDoc(savedRef);

  if (snapshot.exists()) {
    await deleteDoc(savedRef);
    return false;
  }

  await setDoc(savedRef, {
    reportId,
    savedAt: serverTimestamp(),
  });

  return true;
};

export const getSavedReports = async (userId) => {
  if (!userId) return [];

  const snapshot = await getDocs(savedReportsCollection(userId));

  const savedItems = snapshot.docs.map((savedDoc) => ({
    id: savedDoc.id,
    savedAt: savedDoc.data().savedAt,
  }));

  const reports = await Promise.all(
    savedItems.map(async (savedItem) => {
      const reportRef = doc(db, "reports", savedItem.id);
      const reportSnapshot = await getDoc(reportRef);

      if (!reportSnapshot.exists()) return null;

      return {
        id: reportSnapshot.id,
        ...reportSnapshot.data(),
        savedAt: savedItem.savedAt,
      };
    })
  );

  return reports
    .filter(Boolean)
    .sort((a, b) => {
      const getTime = (value) => {
        if (typeof value?.toMillis === "function") {
          return value.toMillis();
        }

        if (typeof value?.seconds === "number") {
          return value.seconds * 1000;
        }

        return 0;
      };

      return getTime(b.savedAt) - getTime(a.savedAt);
    });
};

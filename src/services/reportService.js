
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/config";

const reportsCollection = collection(db, "reports");

export const createReport = async ({
  title,
  description,
  category,
  location,
  imageUrl,
  authorId,
  authorName,
}) => {
  if (!authorId) {
    throw new Error("Please sign in before reporting an issue.");
  }

  if (
    !location ||
    !Number.isFinite(location.lat) ||
    !Number.isFinite(location.lng)
  ) {
    throw new Error("Please select a valid location on the map.");
  }

  const report = {
    title: title.trim(),
    description: description.trim(),
    category,
    location: {
      lat: location.lat,
      lng: location.lng,
      address: location.address || "",
    },
    image: imageUrl || "",
    authorId,
    authorName: authorName || "Community member",
    status: "reported",
    votes: {
      genuine: [],
      duplicate: [],
      resolved: [],
      suspicious: [],
    },
    resolutionEvidence: "",
    duplicateOf: null,
    createdAt: serverTimestamp(),
    activity: [
      {
        type: "reported",
        message: "Issue reported to CityPulse",
        createdAt: new Date().toISOString(),
      },
    ],
  };

  const docRef = await addDoc(reportsCollection, report);

  return { ...report, id: docRef.id };
};

export const getLatestReports = async () => {
  const reportsQuery = query(
    reportsCollection,
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(reportsQuery);

  return snapshot.docs.map((document) => ({
    ...document.data(),
    id: document.id,
    createdAt: document.data().createdAt?.toDate?.().toISOString() || null,
  }));
};

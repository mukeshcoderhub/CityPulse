import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../utils/auth";
import { createIssue } from "../utils/issues";
import MapPicker from "../components/MapPicker";

const categories = [
  "Roads & Potholes",
  "Water Supply",
  "Garbage & Sanitation",
  "Street Lights",
  "Drainage",
  "Traffic",
  "Public Safety",
  "Other",
];

const compressImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const scale = Math.min(
          1,
          1200 / Math.max(img.width, img.height)
        );

        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Could not process this image."));
          return;
        }

        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };

      img.onerror = () => reject(new Error("Invalid image file."));
      img.src = reader.result;
    };

    reader.onerror = () => reject(new Error("Could not read the image."));
    reader.readAsDataURL(file);
  });

const ReportIssue = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
  });

  const [location, setLocation] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!imageFile) {
      setPreview("");
      return;
    }

    const url = URL.createObjectURL(imageFile);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!location) {
      setError("Please select the issue location on the map.");
      return;
    }

    if (!imageFile) {
      setError("Please upload a photo of the issue.");
      return;
    }

    setLoading(true);

    try {
      const image = await compressImage(imageFile);

      createIssue({
        ...form,
        location,
        image,
        authorId: currentUser.id ?? currentUser.uid,
        authorName: currentUser.name || "Community member",
      });

      navigate("/explore");
    } catch (err) {
      console.error(err);

      setError(
        err?.name === "QuotaExceededError"
          ? "Browser storage is full. Try a smaller photo or clear old demo reports."
          : err.message || "Unable to submit this report."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div>
        <p className="text-sm font-medium text-[#ec4952]">
          Make your city better
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-[#202522]">
          Report a city issue
        </h1>
        <p className="mt-2 text-sm text-[#737873]">
          Add the details, mark the exact location, and attach photo evidence.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-[#e5e5e0] bg-white p-5 sm:p-8"
      >
        <div>
          <label htmlFor="title" className="mb-2 block text-sm font-medium">
            Issue title *
          </label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            maxLength={100}
            required
            placeholder="e.g. Large pothole on the main road"
            className="w-full rounded-lg border border-[#dedfd9] px-4 py-3 text-sm outline-none focus:border-[#ec4952]"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium"
          >
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            maxLength={1500}
            rows={4}
            required
            placeholder="What is the problem? How does it affect people?"
            className="w-full rounded-lg border border-[#dedfd9] px-4 py-3 text-sm outline-none focus:border-[#ec4952]"
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-sm font-medium"
          >
            Category *
          </label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-[#dedfd9] bg-white px-4 py-3 text-sm outline-none focus:border-[#ec4952]"
          >
            <option value="">Choose a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium">Issue location *</p>
          <MapPicker location={location} onChange={setLocation} />
        </div>

        <div>
          <label htmlFor="image" className="mb-2 block text-sm font-medium">
            Photo evidence *
          </label>
          <input
            id="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            onChange={(event) => {
              const file = event.target.files?.[0] || null;

              if (file && file.size > 10 * 1024 * 1024) {
                setError("Choose an image smaller than 10 MB.");
                event.target.value = "";
                setImageFile(null);
                return;
              }

              if (file && !file.type.startsWith("image/")) {
                setError("Please choose a valid image.");
                setImageFile(null);
                return;
              }

              setError("");
              setImageFile(file);
            }}
            className="block w-full rounded-lg border border-[#dedfd9] p-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2"
          />

          {preview && (
            <img
              src={preview}
              alt="Selected issue"
              className="mt-4 max-h-72 w-full rounded-xl border object-cover"
            />
          )}
          <p className="mt-2 text-xs text-[#737873]">
            Maximum file size: 10 MB. Images are compressed before saving.
          </p>
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#202522] px-5 py-3 text-sm font-medium text-white hover:bg-[#383e39] disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit issue"}
        </button>
      </form>
    </div>
  );
};

export default ReportIssue;
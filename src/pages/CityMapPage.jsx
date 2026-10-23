
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  ZoomControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getLatestIssues } from "../utils/issues";

const JAIPUR_CENTER = [26.9124, 75.7873];

const STATUS_COLORS = {
  reported: "#f97316",
  "in progress": "#2563eb",
  resolved: "#16a34a",
  "needs review": "#dc2626",
};

const getStatusColor = (status) =>
  STATUS_COLORS[String(status || "reported").toLowerCase()] ||
  "#64748b";

const formatStatus = (status) =>
  String(status || "reported")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const CityMapPage = () => {
  const [issues, setIssues] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const loadIssues = () => setIssues(getLatestIssues());

    loadIssues();

    window.addEventListener("citypulse-issues-change", loadIssues);

    // Also refresh if LocalStorage changes in another browser tab.
    const handleStorage = (event) => {
      if (!event.key || event.key === "citypulse-issues") {
        loadIssues();
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("citypulse-issues-change", loadIssues);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const categories = useMemo(
    () => [
      ...new Set(
        issues
          .map((issue) => issue.category)
          .filter(Boolean)
      ),
    ].sort(),
    [issues]
  );

  const validIssues = useMemo(
    () =>
      issues.filter((issue) => {
        const lat = Number(issue.location?.lat);
        const lng = Number(issue.location?.lng);

        return (
          issue.location?.lat !== "" &&
          issue.location?.lng !== "" &&
          Number.isFinite(lat) &&
          Number.isFinite(lng) &&
          lat >= -90 &&
          lat <= 90 &&
          lng >= -180 &&
          lng <= 180
        );
      }),
    [issues]
  );

  const filteredIssues = useMemo(
    () =>
      validIssues.filter((issue) => {
        const matchesCategory =
          categoryFilter === "all" ||
          issue.category === categoryFilter;

        const normalizedStatus = String(
          issue.status || "reported"
        ).toLowerCase();

        const matchesStatus =
          statusFilter === "all" ||
          normalizedStatus === statusFilter;

        return matchesCategory && matchesStatus;
      }),
    [validIssues, categoryFilter, statusFilter]
  );

  return (
    <div className="min-h-screen bg-[#fafaf8] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Page heading */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-[#ec4952]">
              JAIPUR, RAJASTHAN
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#202522]">
              City Map
            </h1>

            <p className="mt-2 text-sm text-[#737873]">
              Explore reported city problems by location.
            </p>
          </div>

          <Link
            to="/report"
            className="inline-flex w-fit items-center justify-center rounded-xl bg-[#ec4952] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d93843]"
          >
            + Report an issue
          </Link>
        </div>

        {/* Statistics */}
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#e8e9e4] bg-white p-4">
            <p className="text-sm text-[#737873]">Total reports</p>
            <p className="mt-1 text-2xl font-bold text-[#202522]">
              {issues.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e8e9e4] bg-white p-4">
            <p className="text-sm text-[#737873]">Locations on map</p>
            <p className="mt-1 text-2xl font-bold text-[#202522]">
              {validIssues.length}
            </p>
          </div>

          <div className="col-span-2 rounded-2xl border border-[#e8e9e4] bg-white p-4 sm:col-span-1">
            <p className="text-sm text-[#737873]">Currently displayed</p>
            <p className="mt-1 text-2xl font-bold text-[#202522]">
              {filteredIssues.length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-[#e8e9e4] bg-white p-4 sm:flex-row">
          <div className="flex-1">
            <label
              htmlFor="map-category"
              className="mb-1.5 block text-sm font-medium text-[#202522]"
            >
              Issue category
            </label>

            <select
              id="map-category"
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
              className="w-full rounded-xl border border-[#dedfd9] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#ec4952]"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label
              htmlFor="map-status"
              className="mb-1.5 block text-sm font-medium text-[#202522]"
            >
              Issue status
            </label>

            <select
              id="map-status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="w-full rounded-xl border border-[#dedfd9] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#ec4952]"
            >
              <option value="all">All statuses</option>
              <option value="reported">Reported</option>
              <option value="in progress">In progress</option>
              <option value="resolved">Resolved</option>
              <option value="needs review">Needs review</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              setCategoryFilter("all");
              setStatusFilter("all");
            }}
            className="self-end rounded-xl border border-[#dedfd9] px-4 py-2.5 text-sm font-medium text-[#202522] hover:bg-[#f5f5f1]"
          >
            Reset filters
          </button>
        </div>

        {/* Map */}
        <div className="relative overflow-hidden rounded-2xl border border-[#e8e9e4] bg-white shadow-sm">
          <MapContainer
            center={JAIPUR_CENTER}
            zoom={12}
            scrollWheelZoom
            zoomControl={false}
            className="h-[55vh] min-h-[400px] w-full sm:h-[600px]"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <ZoomControl position="bottomright" />

            {filteredIssues.map((issue) => {
              const position = [
                Number(issue.location.lat),
                Number(issue.location.lng),
              ];

              const color = getStatusColor(issue.status);

              return (
                <CircleMarker
                  key={issue.id}
                  center={position}
                  radius={9}
                  pathOptions={{
                    color: "#ffffff",
                    weight: 2,
                    fillColor: color,
                    fillOpacity: 0.95,
                  }}
                >
                  <Popup>
                    <div className="w-[220px]">
                      {issue.image && (
                        <img
                          src={issue.image}
                          alt={issue.title || "Reported issue"}
                          className="mb-3 h-28 w-full rounded-lg object-cover"
                        />
                      )}

                      <p className="text-xs font-semibold uppercase tracking-wide text-[#ec4952]">
                        {issue.category || "Other"}
                      </p>

                      <h3 className="mt-1 text-base font-bold text-[#202522]">
                        {issue.title || "Untitled issue"}
                      </h3>

                      <p className="mt-2 text-sm text-gray-600">
                        {issue.description || "No description provided."}
                      </p>

                      <p className="mt-2 text-xs text-gray-500">
                        📍 {issue.location.address || "Address unavailable"}
                      </p>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span
                          style={{
                            backgroundColor: color + "18",
                            color,
                          }}
                          className="rounded-full px-2 py-1 text-xs font-semibold"
                        >
                          {formatStatus(issue.status)}
                        </span>

                        <span className="text-xs text-gray-500">
                          {formatDate(issue.createdAt)}
                        </span>
                      </div>

                      <Link
                        to="/explore"
                        className="mt-3 inline-block text-sm font-semibold text-[#ec4952] hover:underline"
                      >
                        Explore all reports →
                      </Link>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>

          {filteredIssues.length === 0 && (
            <div className="pointer-events-none absolute left-1/2 top-4 z-[1000] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl border border-[#e8e9e4] bg-white/95 p-4 text-center shadow-sm">
              <p className="font-semibold text-[#202522]">
                No matching locations
              </p>
              <p className="mt-1 text-sm text-[#737873]">
                Try changing your filters or report an issue with GPS enabled.
              </p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 rounded-2xl border border-[#e8e9e4] bg-white p-4">
          {[
            ["reported", "Reported"],
            ["in progress", "In progress"],
            ["resolved", "Resolved"],
            ["needs review", "Needs review"],
          ].map(([status, label]) => (
            <div key={status} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: getStatusColor(status),
                }}
              />
              <span className="text-sm text-[#555b56]">{label}</span>
            </div>
          ))}
        </div>

        {issues.length > validIssues.length && (
          <p className="mt-3 text-xs text-[#737873]">
            {issues.length - validIssues.length} report(s) do not have valid
            GPS coordinates and cannot be plotted on the map.
          </p>
        )}
      </div>
    </div>
  );
};

export default CityMapPage;

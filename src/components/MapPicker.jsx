
import { useState } from "react";

const MapPicker = ({ location, onChange }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const useMyLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      setError("Your browser does not support GPS location.");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const selected = {
          lat: coords.latitude,
          lng: coords.longitude,
          address: "",
        };

        // Save coordinates immediately, even if address lookup fails.
        onChange(selected);

        try {
          const url = new URL(
            "https://nominatim.openstreetmap.org/reverse"
          );

          url.searchParams.set("format", "jsonv2");
          url.searchParams.set("lat", String(selected.lat));
          url.searchParams.set("lon", String(selected.lng));
          url.searchParams.set("addressdetails", "1");

          const response = await fetch(url.toString(), {
            headers: { Accept: "application/json" },
          });

          if (!response.ok) {
            throw new Error("Address lookup failed.");
          }

          const result = await response.json();
          const address = result.address || {};

          const readableAddress =
            result.name && result.display_name
              ? result.display_name
              : result.display_name || [
                  address.amenity,
                  address.building,
                  address.road,
                  address.suburb || address.neighbourhood,
                  address.city || address.town || address.village,
                  address.state,
                  address.postcode,
                  address.country,
                ]
                  .filter(Boolean)
                  .join(", ");

          if (readableAddress) {
            onChange({
              ...selected,
              address: readableAddress,
            });
          }
        } catch (lookupError) {
          console.warn("Could not retrieve a readable address:", lookupError);
          setError(
            "GPS location was captured, but the address could not be retrieved."
          );
        } finally {
          setLoading(false);
        }
      },
      (geoError) => {
        setLoading(false);

        if (geoError.code === 1) {
          setError("Location permission was denied. Allow location access in your browser settings.");
        } else if (geoError.code === 2) {
          setError("Your current location is unavailable. Check your device's location settings.");
        } else {
          setError("Location request timed out. Please try again.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="rounded-xl border border-[#e5e5e0] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#fff0f1] text-[#ec4952]">
          <span className="text-xl">📍</span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-medium text-[#202522]">
            Use your current location
          </p>
          <p className="mt-1 text-sm text-[#737873]">
            GPS will capture your coordinates and CityPulse will look up the
            nearest readable address.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={useMyLocation}
        disabled={loading}
        className="mt-4 w-full rounded-lg bg-[#202522] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#383e39] disabled:cursor-wait disabled:opacity-60"
      >
        {loading ? "Getting location and address..." : "◎ Use my current location"}
      </button>

      {location && (
        <div className="mt-4 rounded-lg bg-gray-50 p-3">
          <p className="text-sm font-medium text-[#202522]">
            {location.address || "Coordinates captured; looking up address..."}
          </p>
          <p className="mt-2 break-all text-xs text-[#737873]">
            {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </p>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-amber-700">
          {error}
        </p>
      )}

      {!location && !error && (
        <p className="mt-3 text-xs text-[#737873]">
          Your location is required to submit a report.
        </p>
      )}
    </div>
  );
};

export default MapPicker;

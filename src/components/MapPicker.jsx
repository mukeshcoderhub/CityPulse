
// import { useState } from "react";

// const MapPicker = ({ location, onChange }) => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const useMyLocation = () => {
//     setError("");

//     if (!navigator.geolocation) {
//       setError("Your browser does not support GPS location.");
//       return;
//     }

//     setLoading(true);

//     navigator.geolocation.getCurrentPosition(
//       async ({ coords }) => {
//         const selected = {
//           lat: coords.latitude,
//           lng: coords.longitude,
//           address: "",
//         };

//         // Save coordinates immediately, even if address lookup fails.
//         onChange(selected);

//         try {
//           const url = new URL(
//             "https://nominatim.openstreetmap.org/reverse"
//           );

//           url.searchParams.set("format", "jsonv2");
//           url.searchParams.set("lat", String(selected.lat));
//           url.searchParams.set("lon", String(selected.lng));
//           url.searchParams.set("addressdetails", "1");

//           const response = await fetch(url.toString(), {
//             headers: { Accept: "application/json" },
//           });

//           if (!response.ok) {
//             throw new Error("Address lookup failed.");
//           }

//           const result = await response.json();
//           const address = result.address || {};

//           const readableAddress =
//             result.name && result.display_name
//               ? result.display_name
//               : result.display_name || [
//                   address.amenity,
//                   address.building,
//                   address.road,
//                   address.suburb || address.neighbourhood,
//                   address.city || address.town || address.village,
//                   address.state,
//                   address.postcode,
//                   address.country,
//                 ]
//                   .filter(Boolean)
//                   .join(", ");

//           if (readableAddress) {
//             onChange({
//               ...selected,
//               address: readableAddress,
//             });
//           }
//         } catch (lookupError) {
//           console.warn("Could not retrieve a readable address:", lookupError);
//           setError(
//             "GPS location was captured, but the address could not be retrieved."
//           );
//         } finally {
//           setLoading(false);
//         }
//       },
//       (geoError) => {
//         setLoading(false);

//         if (geoError.code === 1) {
//           setError("Location permission was denied. Allow location access in your browser settings.");
//         } else if (geoError.code === 2) {
//           setError("Your current location is unavailable. Check your device's location settings.");
//         } else {
//           setError("Location request timed out. Please try again.");
//         }
//       },
//       {
//         enableHighAccuracy: true,
//         timeout: 15000,
//         maximumAge: 0,
//       }
//     );
//   };

//   return (
//     <div className="rounded-xl border border-[#e5e5e0] p-4">
//       <div className="flex items-start gap-3">
//         <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#fff0f1] text-[#ec4952]">
//           <span className="text-xl">📍</span>
//         </div>

//         <div className="min-w-0 flex-1">
//           <p className="font-medium text-[#202522]">
//             Use your current location
//           </p>
//           <p className="mt-1 text-sm text-[#737873]">
//             GPS will capture your coordinates and CityPulse will look up the
//             nearest readable address.
//           </p>
//         </div>
//       </div>

//       <button
//         type="button"
//         onClick={useMyLocation}
//         disabled={loading}
//         className="mt-4 w-full rounded-lg bg-[#202522] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#383e39] disabled:cursor-wait disabled:opacity-60"
//       >
//         {loading ? "Getting location and address..." : "◎ Use my current location"}
//       </button>

//       {location && (
//         <div className="mt-4 rounded-lg bg-gray-50 p-3">
//           <p className="text-sm font-medium text-[#202522]">
//             {location.address || "Coordinates captured; looking up address..."}
//           </p>
//           <p className="mt-2 break-all text-xs text-[#737873]">
//             {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
//           </p>
//         </div>
//       )}

//       {error && (
//         <p role="alert" className="mt-3 text-sm text-amber-700">
//           {error}
//         </p>
//       )}

//       {!location && !error && (
//         <p className="mt-3 text-xs text-[#737873]">
//           Your location is required to submit a report.
//         </p>
//       )}
//     </div>
//   );
// };

// export default MapPicker;






import { useState } from "react";

const demoLocations = [
  {
    address: "Albert Hall Museum, Ram Niwas Garden, Jaipur, Rajasthan",
    lat: 26.9115,
    lng: 75.8190,
  },
  {
    address: "Hawa Mahal Road, Badi Choupad, Jaipur, Rajasthan",
    lat: 26.9239,
    lng: 75.8267,
  },
  {
    address: "Sindhi Camp Bus Stand, Jaipur, Rajasthan",
    lat: 26.9219,
    lng: 75.7997,
  },
  {
    address: "Ajmer Road, near Civil Lines, Jaipur, Rajasthan",
    lat: 26.9084,
    lng: 75.7815,
  },
  {
    address: "Raja Park, Jaipur, Rajasthan",
    lat: 26.8967,
    lng: 75.8272,
  },
  {
    address: "Bani Park, Jaipur, Rajasthan",
    lat: 26.9298,
    lng: 75.7921,
  },
  {
    address: "Jhotwara Road, Jaipur, Rajasthan",
    lat: 26.9412,
    lng: 75.7765,
  },
  {
    address: "Vidyadhar Nagar, Jaipur, Rajasthan",
    lat: 26.9602,
    lng: 75.7795,
  },
  {
    address: "Pratap Nagar, Sanganer, Jaipur, Rajasthan",
    lat: 26.8138,
    lng: 75.8203,
  },
  {
    address: "Sitapura Industrial Area, Jaipur, Rajasthan",
    lat: 26.7845,
    lng: 75.8370,
  },
  {
    address: "Amer Road, near Jal Mahal, Jaipur, Rajasthan",
    lat: 26.9535,
    lng: 75.8467,
  },
  {
    address: "Gandhi Nagar Railway Station, Jaipur, Rajasthan",
    lat: 26.8917,
    lng: 75.8050,
  },
];

const MapPicker = ({ location, onChange }) => {
  const [selectedIndex, setSelectedIndex] = useState("");

  const chooseRandomLocation = () => {
    const availableLocations = demoLocations
      .map((item, index) => ({ ...item, index }))
      .filter((item) => item.index !== Number(selectedIndex));

    const pool =
      availableLocations.length > 0
        ? availableLocations
        : demoLocations.map((item, index) => ({ ...item, index }));

    const selected = pool[Math.floor(Math.random() * pool.length)];

    setSelectedIndex(String(selected.index));

    onChange({
      address: selected.address,
      latitude: selected.lat,
      longitude: selected.lng,
      lat: selected.lat,
      lng: selected.lng,
    });
  };

  return (
    <div className="space-y-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ec4952]/10 text-xl">
          📍
        </span>

        <div>
          <h3 className="font-medium text-[#202522]">
            Demo location picker
          </h3>
          <p className="text-xs text-gray-500">
            Temporary prototype mode · Jaipur
          </p>
        </div>
      </div>

      {location ? (
        <div className="rounded-lg border border-green-200 bg-white p-3">
          <p className="text-sm font-medium text-gray-800">
            {location.address}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Latitude: {location.latitude.toFixed(5)}
            <br />
            Longitude: {location.longitude.toFixed(5)}
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          Generate a random demo location to continue.
        </p>
      )}

      <button
        type="button"
        onClick={chooseRandomLocation}
        className="w-full rounded-lg bg-[#202522] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#383e39]"
      >
        {location ? "↻ Generate another location" : "Generate random location"}
      </button>

      <p className="text-xs text-amber-700">
        Demo data only. These coordinates are illustrative and do not
        represent your actual GPS location or verify the exact issue address.
      </p>
    </div>
  );
};

export default MapPicker;

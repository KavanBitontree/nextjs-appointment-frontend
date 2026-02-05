"use client";

import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  MapPin,
  List,
  Map as MapIcon,
  Navigation,
  X,
  Loader,
} from "lucide-react";
import DoctorsList from "./DoctorsList";
import DoctorSearchBar from "./DoctorSearchBar";
import DoctorFilterBar from "./DoctorFilterBar";
import DoctorPagination from "./DoctorPagination";
import { api } from "@/lib/axios";

interface Doctor {
  id: number;
  user_id: number;
  name: string;
  speciality: string;
  address: string;
  opd_fees: string | number;
  experience?: number;
  latitude?: number;
  longitude?: number;
  minimum_slot_duration?: string;
}

interface DoctorsResponse {
  doctors: Doctor[];
  total: number;
  skip: number;
  limit: number;
}

interface DoctorFilters {
  search_name?: string;
  search_address?: string;
  filter_speciality?: string;
  sort_by?: string;
  sort_order?: string;
  skip?: number;
  limit?: number;
}

export default function ShowDoctorsClient({
  initialData,
  searchParams,
}: {
  initialData: DoctorsResponse | null;
  searchParams: {
    search_name?: string;
    search_address?: string;
    filter_speciality?: string;
    sort_by?: string;
    sort_order?: string;
    skip?: string;
    limit?: string;
  };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [doctorsData, setDoctorsData] = useState<DoctorsResponse | null>(
    initialData,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Map related states
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [routingControl, setRoutingControl] = useState<any>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const [filters, setFilters] = useState<DoctorFilters>({
    search_name: searchParams.search_name || "",
    search_address: searchParams.search_address || "",
    filter_speciality: searchParams.filter_speciality || "",
    sort_by: searchParams.sort_by || "name",
    sort_order: searchParams.sort_order || "asc",
    skip: parseInt(searchParams.skip || "0"),
    limit: parseInt(searchParams.limit || "10"),
  });

  // Fetch doctors data when filters change
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (filters.search_name)
          params.append("search_name", filters.search_name);
        if (filters.search_address)
          params.append("search_address", filters.search_address);
        if (filters.filter_speciality)
          params.append("filter_speciality", filters.filter_speciality);
        params.append("sort_by", filters.sort_by || "name");
        params.append("sort_order", filters.sort_order || "asc");
        params.append("skip", String(filters.skip || 0));
        params.append("limit", String(filters.limit || 10));

        const response = await api.get(`/doctors?${params.toString()}`);

        if (response.status !== 200) {
          throw new Error(`Failed to fetch doctors: ${response.statusText}`);
        }

        console.log("Fetched doctors data:", response.data);

        // Backend now returns the correct structure directly
        setDoctorsData(response.data);
        console.log("State updated with:", response.data);
      } catch (err: any) {
        console.error("Error fetching doctors:", err);
        setError(err.message || "Failed to fetch doctors");
        setDoctorsData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [filters]);

  // Load Leaflet scripts when switching to map view
  useEffect(() => {
    if (viewMode !== "map" || mapLoaded || typeof window === "undefined")
      return;

    const loadScript = (src: string) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const loadCSS = (href: string) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    };

    const loadLeaflet = async () => {
      try {
        loadCSS("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css");
        loadCSS(
          "https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css",
        );

        await loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js");
        await loadScript(
          "https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js",
        );

        setMapLoaded(true);
      } catch (err) {
        console.error("Error loading Leaflet:", err);
      }
    };

    loadLeaflet();
  }, [viewMode, mapLoaded]);

  // Clean up map instance when leaving map view
  useEffect(() => {
    if (viewMode !== "map" && mapInstance) {
      try {
        if (routingControl && mapInstance) {
          mapInstance.removeControl(routingControl);
        }
        mapInstance.remove();
        setMapInstance(null);
        setMarkers([]);
        setRoutingControl(null);
      } catch (err) {
        console.error("Error cleaning up map:", err);
      }
    }
  }, [viewMode]);

  // Initialize map
  useEffect(() => {
    if (viewMode !== "map" || !mapLoaded || typeof window === "undefined")
      return;

    // Only initialize if map instance doesn't exist
    if (mapInstance) return;

    const L = (window as any).L;
    if (!L) return;

    setTimeout(() => {
      const mapElement = document.getElementById("doctors-map");
      if (!mapElement) return;

      try {
        const map = L.map("doctors-map").setView([20.5937, 78.9629], 5);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(map);

        setMapInstance(map);
      } catch (err) {
        console.error("Error initializing map:", err);
      }
    }, 100);
  }, [viewMode, mapLoaded]);

  // Add markers when map is ready and doctors are loaded
  useEffect(() => {
    if (
      !mapInstance ||
      !mapLoaded ||
      !doctorsData ||
      doctorsData.doctors.length === 0
    )
      return;

    const L = (window as any).L;
    if (!L) return;

    // Clear existing markers
    markers.forEach((marker) => marker.remove());

    const newMarkers: any[] = [];

    // Find first doctor with valid coordinates to center map
    const firstDoctorWithCoords = doctorsData.doctors.find(
      (d) => d.latitude && d.longitude,
    );
    if (
      firstDoctorWithCoords &&
      firstDoctorWithCoords.latitude &&
      firstDoctorWithCoords.longitude
    ) {
      mapInstance.setView(
        [firstDoctorWithCoords.latitude, firstDoctorWithCoords.longitude],
        12,
      );
    }

    doctorsData.doctors.forEach((doctor) => {
      const lat = doctor.latitude;
      const lon = doctor.longitude;

      if (!lat || !lon) return; // Skip doctors without coordinates

      const marker = L.marker([lat, lon])
        .addTo(mapInstance)
        .bindPopup(
          `
          <div style="min-width: 250px;">
            <b>${doctor.name}</b><br/>
            <small>${doctor.speciality}</small><br/>
            <small>${doctor.address}</small><br/>
            <small>Fees: ₹${doctor.opd_fees}</small><br/><br/>
            <div style="display: flex; gap: 8px;">
              <button
                onclick="window.selectDoctorFromMap(${doctor.id}, ${lat}, ${lon})"
                style="
                  background: #0f172a;
                  color: white;
                  border: none;
                  padding: 6px 12px;
                  border-radius: 6px;
                  cursor: pointer;
                  font-size: 12px;
                  width: 100%;
                "
              >
                View Details
              </button>
            </div>
          </div>
        `,
          { maxWidth: 300 },
        );

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    // Global function for popup button
    (window as any).selectDoctorFromMap = (
      doctorId: number,
      lat: number,
      lon: number,
    ) => {
      const doctor = doctorsData.doctors.find((d) => d.id === doctorId);
      if (doctor) {
        setSelectedDoctor({ ...doctor, latitude: lat, longitude: lon });
        // Don't automatically show route - let user click the button
        // Center map on doctor
        if (mapInstance) {
          mapInstance.setView([lat, lon], 14);
        }
      }
    };
  }, [mapInstance, doctorsData, mapLoaded]);

  const clearRoute = () => {
    // Remove routing control
    if (routingControl && mapInstance) {
      try {
        mapInstance.removeControl(routingControl);
        setRoutingControl(null);
      } catch (e) {
        console.log("Error removing route:", e);
      }
    }

    // Clear selected doctor
    setSelectedDoctor(null);

    // Zoom back to show all doctors
    if (mapInstance && doctorsData && doctorsData.doctors.length > 0) {
      const doctorsWithCoords = doctorsData.doctors.filter(
        (d) => d.latitude && d.longitude,
      );

      if (doctorsWithCoords.length > 0) {
        const L = (window as any).L;
        const bounds = L.latLngBounds(
          doctorsWithCoords.map((d) => [d.latitude!, d.longitude!]),
        );
        mapInstance.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  };

  const getUserLocation = () => {
    return new Promise<{ lat: number; lon: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        reject(new Error("Geolocation not supported"));
        return;
      }

      setLocationLoading(true);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          setUserLocation({ lat, lon });
          setLocationLoading(false);

          const L = (window as any).L;
          if (mapInstance && L) {
            // Remove existing user marker if any
            if ((window as any).userMarker) {
              mapInstance.removeLayer((window as any).userMarker);
            }

            // Add new user location marker
            const userMarker = L.marker([lat, lon], {
              icon: L.icon({
                iconUrl:
                  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
                shadowUrl:
                  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
              }),
            })
              .addTo(mapInstance)
              .bindPopup("<b>You are here</b>");

            (window as any).userMarker = userMarker;
          }

          resolve({ lat, lon });
        },
        (error) => {
          setLocationLoading(false);
          alert(
            "Unable to retrieve your location. Please enable location access.",
          );
          console.error("Geolocation error:", error);
          reject(error);
        },
      );
    });
  };

  const showRoute = async (destLat: number, destLon: number) => {
    try {
      let location = userLocation;

      if (!location) {
        // Get user location first
        location = await getUserLocation();
      }

      if (location) {
        drawRoute(location.lat, location.lon, destLat, destLon);
      }
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const drawRoute = (
    userLat: number,
    userLon: number,
    destLat: number,
    destLon: number,
  ) => {
    if (!mapInstance) {
      console.error("Map instance not available");
      return;
    }

    const L = (window as any).L;
    if (!L || !L.Routing) {
      console.error("Leaflet Routing not loaded");
      return;
    }

    // Remove existing route
    if (routingControl) {
      try {
        mapInstance.removeControl(routingControl);
      } catch (e) {
        console.log("Error removing old route:", e);
      }
    }

    // Create new route
    const control = L.Routing.control({
      waypoints: [L.latLng(userLat, userLon), L.latLng(destLat, destLon)],
      addWaypoints: false,
      draggableWaypoints: false,
      routeWhileDragging: false,
      showAlternatives: false,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [
          {
            color: "#0f172a",
            weight: 6,
            opacity: 0.8,
          },
        ],
      },
      createMarker: function () {
        return null;
      }, // Don't create default markers
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
      }),
    }).addTo(mapInstance);

    setRoutingControl(control);

    // Fit bounds to show both points
    const bounds = L.latLngBounds([
      [userLat, userLon],
      [destLat, destLon],
    ]);
    mapInstance.fitBounds(bounds, { padding: [50, 50] });
  };

  const updateFilters = (newFilters: Partial<DoctorFilters>) => {
    // Save current scroll position
    const scrollPosition = window.scrollY || window.pageYOffset;

    const updated = { ...filters, ...newFilters, skip: 0 };
    setFilters(updated);

    const queryParams = new URLSearchParams();
    if (updated.search_name)
      queryParams.set("search_name", updated.search_name);
    if (updated.search_address)
      queryParams.set("search_address", updated.search_address);
    if (updated.filter_speciality)
      queryParams.set("filter_speciality", updated.filter_speciality);
    queryParams.set("sort_by", updated.sort_by || "name");
    queryParams.set("sort_order", updated.sort_order || "asc");
    queryParams.set("skip", String(updated.skip || 0));
    queryParams.set("limit", String(updated.limit || 10));

    startTransition(() => {
      router.push(`${pathname}?${queryParams.toString()}`, {
        scroll: false,
      });
      // Restore scroll position after navigation
      window.scrollTo({ top: scrollPosition, behavior: "auto" });
    });
  };

  const handleSearchChange = (searchName: string, searchAddress: string) => {
    updateFilters({
      search_name: searchName,
      search_address: searchAddress,
    });
  };

  const handleFilterChange = (newFilters: {
    filter_speciality?: string;
    sort_by?: string;
    sort_order?: string;
  }) => {
    updateFilters(newFilters);
  };

  const handlePageChange = (newSkip: number) => {
    // Save current scroll position
    const scrollPosition = window.scrollY || window.pageYOffset;

    setFilters((prev) => ({ ...prev, skip: newSkip }));

    const queryParams = new URLSearchParams();
    if (filters.search_name)
      queryParams.set("search_name", filters.search_name);
    if (filters.search_address)
      queryParams.set("search_address", filters.search_address);
    if (filters.filter_speciality)
      queryParams.set("filter_speciality", filters.filter_speciality);
    queryParams.set("sort_by", filters.sort_by || "name");
    queryParams.set("sort_order", filters.sort_order || "asc");
    queryParams.set("skip", String(newSkip));
    queryParams.set("limit", String(filters.limit || 10));

    startTransition(() => {
      router.push(`${pathname}?${queryParams.toString()}`, {
        scroll: false,
      });
      // Restore scroll position after navigation
      window.scrollTo({ top: scrollPosition, behavior: "auto" });
    });
  };

  const resetFilters = () => {
    // Save current scroll position
    const scrollPosition = window.scrollY || window.pageYOffset;

    setFilters({
      search_name: "",
      search_address: "",
      filter_speciality: "",
      sort_by: "name",
      sort_order: "asc",
      skip: 0,
      limit: 10,
    });
    startTransition(() => {
      router.push(pathname, {
        scroll: false,
      });
      // Restore scroll position after navigation
      window.scrollTo({ top: scrollPosition, behavior: "auto" });
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-1 sm:mb-2">
          Find Doctors
        </h1>
        <p className="text-sm sm:text-base text-slate-700">
          Search and book appointments with qualified doctors
        </p>
      </div>

      {/* View Toggle */}
      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
        <button
          onClick={() => setViewMode("list")}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            viewMode === "list"
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
          }`}
        >
          <List className="w-5 h-5" />
          List View
        </button>
        <button
          onClick={() => setViewMode("map")}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            viewMode === "map"
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
          }`}
        >
          <MapIcon className="w-5 h-5" />
          Map View
        </button>
        {viewMode === "map" && (
          <button
            onClick={async () => {
              try {
                const location = await getUserLocation();
                if (location && mapInstance) {
                  mapInstance.setView([location.lat, location.lon], 13);
                }
              } catch (error) {
                console.error("Error getting location:", error);
              }
            }}
            disabled={locationLoading}
            className="flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium sm:ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {locationLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5" />
                {userLocation ? "Location Enabled ✓" : "Enable My Location"}
              </>
            )}
          </button>
        )}
      </div>

      {viewMode === "list" && (
        <>
          {/* Search and Filter Bar */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-6">
            <DoctorSearchBar
              searchName={filters.search_name || ""}
              searchAddress={filters.search_address || ""}
              onSearchChange={handleSearchChange}
            />
            <DoctorFilterBar
              speciality={filters.filter_speciality || ""}
              sortBy={filters.sort_by || "name"}
              sortOrder={filters.sort_order || "asc"}
              onFilterChange={handleFilterChange}
              onReset={resetFilters}
            />
          </div>

          {/* Doctors List */}
          <DoctorsList
            initialData={doctorsData}
            filters={filters}
            onPageChange={handlePageChange}
            isPending={isPending}
            loading={loading}
            error={error}
          />

          {/* Pagination */}
          {doctorsData && (
            <DoctorPagination
              currentPage={
                filters.skip
                  ? Math.floor(filters.skip / (filters.limit || 10)) + 1
                  : 1
              }
              totalPages={Math.ceil(
                (doctorsData.total || 0) / (filters.limit || 10),
              )}
              total={doctorsData.total || 0}
              currentCount={doctorsData.doctors.length}
              onPageChange={handlePageChange}
              isPending={isPending}
              limit={filters.limit || 10}
            />
          )}
        </>
      )}

      {viewMode === "map" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
          <div className="bg-slate-900 p-4 text-white">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Interactive Map - {doctorsData?.doctors.length || 0} Doctors
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Click on markers to see details and get directions
            </p>
          </div>

          <div
            id="doctors-map"
            className="w-full"
            style={{ height: "70vh" }}
          ></div>
        </div>
      )}

      {/* Selected Doctor Info */}
      {selectedDoctor &&
        viewMode === "map" &&
        typeof window !== "undefined" &&
        createPortal(
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-6 right-6
                 bg-white rounded-xl shadow-2xl border border-slate-200
                 p-6 max-w-sm w-full z-[1000]"
          >
            <button
              onClick={clearRoute}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center">
                <Navigation className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  {routingControl ? "Route to" : "Selected Doctor"}
                </h3>
                <p className="text-sm text-slate-600">{selectedDoctor.name}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <p className="text-slate-600">
                <span className="font-medium">Speciality:</span>{" "}
                {selectedDoctor.speciality}
              </p>
              <p className="text-slate-600">
                <span className="font-medium">Address:</span>{" "}
                {selectedDoctor.address}
              </p>
              <p className="text-slate-600">
                <span className="font-medium">Fees:</span> ₹
                {selectedDoctor.opd_fees}
              </p>
            </div>

            {!userLocation && !routingControl && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-3">
                <p className="text-sm text-amber-800">
                  Enable location to see the route on the map
                </p>
              </div>
            )}

            {routingControl && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
                <p className="text-sm text-green-800 flex items-center gap-2">
                  <Navigation className="w-4 h-4" />
                  Route is displayed on the map
                </p>
              </div>
            )}

            <div className="flex gap-2">
              {routingControl ? (
                <button
                  onClick={clearRoute}
                  className="flex-1 px-4 py-2 bg-red-600 text-white
                       rounded-lg hover:bg-red-700 transition-colors
                       font-medium text-sm flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel Route
                </button>
              ) : (
                selectedDoctor.latitude &&
                selectedDoctor.longitude && (
                  <button
                    onClick={() =>
                      showRoute(
                        selectedDoctor.latitude!,
                        selectedDoctor.longitude!,
                      )
                    }
                    className="flex-1 px-4 py-2 bg-slate-900 text-white
                         rounded-lg hover:bg-slate-800 transition-colors
                         font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <Navigation className="w-4 h-4" />
                    Show Route
                  </button>
                )
              )}
            </div>
          </motion.div>,
          document.body,
        )}
    </motion.div>
  );
}

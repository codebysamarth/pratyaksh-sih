"use client";

import React, { useEffect, useRef, useState } from "react";
import { ATMHotspot } from "@/lib/mockData";
import "leaflet/dist/leaflet.css";

interface RadarMapProps {
  center: [number, number];
  zoom?: number;
  atms: ATMHotspot[];
  selectedAtm: ATMHotspot | null;
  onSelectAtm: (atm: ATMHotspot) => void;
  muleLocation?: [number, number];
  locationName?: string;
}

export const RadarMap: React.FC<RadarMapProps> = ({
  center,
  zoom = 15,
  atms,
  selectedAtm,
  onSelectAtm,
  muleLocation = [18.4682, 73.8610],
  locationName,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);

  // Initialize Map ONCE
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;
    let isMounted = true;

    const setupMap = async () => {
      const L = (await import("leaflet")).default;
      if (!isMounted || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const validCenter: [number, number] = (
          Array.isArray(center) &&
          typeof center[0] === "number" && !isNaN(center[0]) &&
          typeof center[1] === "number" && !isNaN(center[1])
        ) ? center : [18.4636, 73.8682];

        const map = L.map(mapContainerRef.current, {
          center: validCenter,
          zoom: zoom || 14,
          zoomControl: false,
        });

        L.control.zoom({ position: "bottomright" }).addTo(map);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        const layerGroup = L.layerGroup().addTo(map);
        layerGroupRef.current = layerGroup;
        mapInstanceRef.current = map;
        setMapReady(true);
      }
    };

    setupMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          // ignore cleanup race
        }
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Layers & View reactively without recreating the map instance
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !layerGroupRef.current) return;

    const updateLayers = async () => {
      const L = (await import("leaflet")).default;
      const map = mapInstanceRef.current;
      const layerGroup = layerGroupRef.current;
      if (!map || !layerGroup) return;

      const validCenter: [number, number] = (
        Array.isArray(center) &&
        typeof center[0] === "number" && !isNaN(center[0]) &&
        typeof center[1] === "number" && !isNaN(center[1])
      ) ? center : [18.4636, 73.8682];

      try {
        map.setView(validCenter, zoom || 14, { animate: false });
      } catch (e) {
        // ignore view race
      }

      layerGroup.clearLayers();

      // 1. Plot Mule Last Known IP / BTS Cell Tower Pin (Clean Tactical Blue or Live Device GPS)
      const validMuleLocation: [number, number] = (
        Array.isArray(muleLocation) &&
        typeof muleLocation[0] === "number" && !isNaN(muleLocation[0]) &&
        typeof muleLocation[1] === "number" && !isNaN(muleLocation[1])
      ) ? muleLocation : validCenter;

      const isLiveDeviceGps = Boolean(locationName && (locationName.toLowerCase().includes("device") || locationName.toLowerCase().includes("gps")));

      if (validMuleLocation) {
        const muleIcon = L.divIcon({
          className: "custom-mule-pin",
          html: `
            <div class="relative flex items-center justify-center">
              <div class="absolute w-7 h-7 rounded-full bg-blue-500/20 animate-ping"></div>
              <div class="relative w-5 h-5 rounded-full ${isLiveDeviceGps ? "bg-rose-600" : "bg-blue-600"} border-2 border-white flex items-center justify-center shadow-md">
                <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
              </div>
              <div class="absolute -bottom-5 whitespace-nowrap bg-white ${isLiveDeviceGps ? "text-rose-800 border-rose-300" : "text-blue-800 border-blue-200"} text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border shadow-sm">
                ${isLiveDeviceGps ? "📍 YOUR LIVE DEVICE GPS" : "LAST MULE SIGNAL"}
              </div>
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        L.marker(validMuleLocation, { icon: muleIcon })
          .bindPopup(`
            <div style="padding:10px; font-family:sans-serif; min-width:190px;">
              <div style="color:${isLiveDeviceGps ? "#E11D48" : "#2563EB"}; font-weight:700; font-size:11px; margin-bottom:2px; text-transform:uppercase;">
                ${isLiveDeviceGps ? "📍 REAL PHYSICAL DEVICE GPS" : "CELLULAR BTS • IP TRIANGULATION"}
              </div>
              <div style="font-size:12px; font-weight:600; color:#0F172A;">
                ${isLiveDeviceGps ? "Live Fraud Origin Triangulated to Your Device" : "BTS Tower Near Mule Ping"}
              </div>
              <div style="font-size:11px; color:#64748B; font-family:monospace; margin-top:2px;">
                Coords: ${validMuleLocation[0].toFixed(4)}, ${validMuleLocation[1].toFixed(4)}
              </div>
            </div>
          `)
          .addTo(layerGroup);
      }

      // 2. Plot Predicted Candidate ATMs with Clean Vector Radar Rings
      const targetAtm = selectedAtm || (atms || []).find((a, idx) => (a.rank ?? idx + 1) === 1) || (atms || [])[0];

      (atms || []).forEach((atm, index) => {
        if (!atm) return;
        const rank = atm.rank ?? index + 1;
        const isSelected = selectedAtm && (
          (selectedAtm.id && atm.id && selectedAtm.id === atm.id) ||
          (selectedAtm.name && atm.name && selectedAtm.name === atm.name) ||
          (selectedAtm.rank && atm.rank && selectedAtm.rank === atm.rank)
        );
        const isRank1 = rank === 1;
        const isRank2 = rank === 2;

        const mainColor = isSelected ? "#2563EB" : isRank1 ? "#E11D48" : isRank2 ? "#D97706" : "#475569";
        const pulseBg = isSelected
          ? "rgba(37, 99, 235, 0.2)"
          : isRank1
          ? "rgba(225, 29, 72, 0.15)"
          : isRank2
          ? "rgba(217, 119, 6, 0.12)"
          : "transparent";

        const riskVal = atm.riskScore ?? Math.round(atm.risk_score <= 1 ? atm.risk_score * 100 : atm.risk_score);
        const etaVal = atm.etaMinutes ?? atm.est_eta_mins ?? 15;
        const distVal = atm.distanceMeters ?? Math.round((atm.distance_km || 0.8) * 1000);
        const kioskVal = atm.kioskType ?? (atm.is_standalone_kiosk ? "24/7 Standalone Kiosk" : "Bank Branch ATM");
        const atmLat = typeof atm.lat === "number" && !isNaN(atm.lat) ? atm.lat : validCenter[0];
        const rawLng = atm.lng ?? atm.lon;
        const atmLng = typeof rawLng === "number" && !isNaN(rawLng) ? rawLng : validCenter[1];

        const atmIcon = L.divIcon({
          className: "custom-atm-marker",
          html: `
            <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-200 ${isSelected ? "scale-110" : ""}">
              <!-- Translucent Gradient Radar Pulse -->
              ${
                (isSelected || isRank1)
                  ? `<div class="absolute -inset-4 rounded-full animate-vector-radar" style="background:${pulseBg}; border: 2px solid ${mainColor};"></div>`
                  : ""
              }

              <!-- Crisp Minimalist Vector Badge -->
              <div class="relative flex items-center justify-center w-7 h-7 rounded-md bg-white border-2 font-mono text-xs font-bold shadow-md" style="border-color:${mainColor}; color:${mainColor};">
                #${rank}
              </div>

              <!-- High-Contrast Tag -->
              <div class="absolute -bottom-5 whitespace-nowrap px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-white border shadow-sm" style="border-color:${mainColor}; color:${mainColor};">
                ${isSelected ? "SELECTED: " : ""}${riskVal}% RISK &bull; ${etaVal}m
              </div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([atmLat, atmLng], { icon: atmIcon }).addTo(layerGroup);

        marker.on("click", () => {
          onSelectAtm(atm);
        });

        marker.bindPopup(`
          <div style="padding:12px; font-family:sans-serif; min-width:210px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="font-size:10px; font-weight:700; background:${mainColor}18; color:${mainColor}; padding:2px 6px; border-radius:4px; font-family:monospace;">
                RANK #${rank} HOTSPOT
              </span>
              <span style="font-size:11px; font-weight:700; color:${mainColor}; font-family:monospace;">
                ${riskVal}% RISK
              </span>
            </div>
            <div style="font-weight:700; font-size:13px; color:#0F172A; margin-bottom:2px;">${atm.name}</div>
            <div style="font-size:11px; color:#64748B; margin-bottom:8px;">${kioskVal}</div>
            <div style="display:flex; justify-content:space-between; font-size:11px; color:#334155; border-top:1px solid #F1F5F9; padding-top:6px; font-family:monospace;">
              <span>ETA: <b>${etaVal} mins</b></span>
              <span>Dist: <b>${distVal}m</b></span>
            </div>
          </div>
        `);

        if (isSelected) {
          marker.openPopup();
        }
      });

      // 3. Draw Clean Cobalt Polyline Corridor to targetAtm
      if (validMuleLocation && targetAtm) {
        const targetLat = typeof targetAtm.lat === "number" && !isNaN(targetAtm.lat) ? targetAtm.lat : validCenter[0];
        const rawTargetLng = targetAtm.lng ?? targetAtm.lon;
        const targetLng = typeof rawTargetLng === "number" && !isNaN(rawTargetLng) ? rawTargetLng : validCenter[1];
        L.polyline([validMuleLocation, [targetLat, targetLng]], {
          color: selectedAtm && selectedAtm.rank !== 1 ? "#2563EB" : "#E11D48",
          weight: 2.5,
          dashArray: "5, 6",
          opacity: 0.85,
        }).addTo(layerGroup);
      }
    };

    updateLayers();
  }, [mapReady, center, atms, selectedAtm, muleLocation, onSelectAtm, zoom]);

  return (
    <div className="relative w-full h-full min-h-[440px] rounded-lg overflow-hidden border border-slate-200 bg-white shadow-card">
      <div ref={mapContainerRef} className="w-full h-full min-h-[440px] z-10" />

      {/* Clean Technical Map HUD */}
      <div className="absolute top-3 left-3 z-20 pointer-events-none flex flex-col gap-1.5">
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-slate-200/90 px-2.5 py-1 rounded-md text-xs font-mono font-medium text-slate-800 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span>GIS CORRIDOR: OPENSTREETMAP</span>
        </div>
        <div className="text-[10px] font-mono text-slate-600 bg-white/90 px-2 py-0.5 rounded border border-slate-200 shadow-xs max-w-[280px] truncate">
          {locationName || "National Threat Interdiction Sector"}
        </div>
      </div>

      {/* Clean Technical Legend */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-none bg-white/95 backdrop-blur-sm border border-slate-200 p-2.5 rounded-md shadow-sm flex flex-col gap-1.5 text-[11px] font-mono text-slate-700">
        <div className="flex items-center gap-2 text-rose-700 font-semibold">
          <span className="w-2 h-2 rounded-full bg-rose-600" />
          <span>Rank 1 ATM (Priority Hotspot &bull; 82%)</span>
        </div>
        <div className="flex items-center gap-2 text-amber-700">
          <span className="w-2 h-2 rounded-full bg-amber-600" />
          <span>Rank 2 ATM (Elevated Risk &bull; 13%)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <span className="w-2 h-2 rounded-full bg-slate-500" />
          <span>Rank 3 ATM (Watchlist &bull; 5%)</span>
        </div>
        <div className="flex items-center gap-2 text-blue-700">
          <span className="w-3 h-0.5 border-t-2 border-dashed border-blue-600" />
          <span>Interception Corridor</span>
        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useEffect, useRef } from "react";
import { ATMHotspot } from "@/lib/mockData";
import "leaflet/dist/leaflet.css";

interface RadarMapProps {
  center: [number, number];
  zoom?: number;
  atms: ATMHotspot[];
  selectedAtm: ATMHotspot | null;
  onSelectAtm: (atm: ATMHotspot) => void;
  muleLocation?: [number, number];
}

export const RadarMap: React.FC<RadarMapProps> = ({
  center,
  zoom = 15,
  atms,
  selectedAtm,
  onSelectAtm,
  muleLocation = [18.4682, 73.8610],
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize Leaflet map with CartoDB Positron (Pristine Light Editorial Tile Layer)
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: false,
      });

      mapInstanceRef.current = map;

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // CartoDB Positron Light Tiles
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;

      // 1. Plot Mule Last Known IP / BTS Cell Tower Pin (Clean Tactical Blue)
      if (muleLocation) {
        const muleIcon = L.divIcon({
          className: "custom-mule-pin",
          html: `
            <div class="relative flex items-center justify-center">
              <div class="absolute w-7 h-7 rounded-full bg-blue-500/20 animate-ping"></div>
              <div class="relative w-5 h-5 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center shadow-md">
                <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
              </div>
              <div class="absolute -bottom-5 whitespace-nowrap bg-white text-blue-800 text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded border border-blue-200 shadow-sm">
                LAST MULE SIGNAL
              </div>
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        L.marker(muleLocation, { icon: muleIcon })
          .bindPopup(`
            <div style="padding:10px; font-family:sans-serif; min-width:180px;">
              <div style="color:#2563EB; font-weight:700; font-size:11px; margin-bottom:2px; text-transform:uppercase;">CELLULAR BTS &bull; IP TRIANGULATION</div>
              <div style="font-size:12px; font-weight:600; color:#0F172A;">BTS Tower #411037-B</div>
              <div style="font-size:11px; color:#64748B; font-family:monospace; margin-top:2px;">Coords: ${muleLocation[0].toFixed(4)}, ${muleLocation[1].toFixed(4)}</div>
            </div>
          `)
          .addTo(layerGroup);
      }

      // 2. Plot Predicted Candidate ATMs with Clean Vector Radar Rings
      atms.forEach((atm) => {
        const isRank1 = atm.rank === 1;
        const isRank2 = atm.rank === 2;

        const mainColor = isRank1 ? "#E11D48" : isRank2 ? "#D97706" : "#475569";
        const pulseBg = isRank1 ? "rgba(225, 29, 72, 0.15)" : isRank2 ? "rgba(217, 119, 6, 0.12)" : "transparent";

        const atmIcon = L.divIcon({
          className: "custom-atm-marker",
          html: `
            <div class="relative flex items-center justify-center cursor-pointer">
              <!-- Translucent Gradient Radar Pulse -->
              ${
                isRank1
                  ? `<div class="absolute -inset-4 rounded-full animate-vector-radar" style="background:${pulseBg}; border: 1px solid rgba(225, 29, 72, 0.4);"></div>`
                  : ""
              }

              <!-- Crisp Minimalist Vector Badge -->
              <div class="relative flex items-center justify-center w-7 h-7 rounded-md bg-white border-2 font-mono text-xs font-bold shadow-md" style="border-color:${mainColor}; color:${mainColor};">
                #${atm.rank}
              </div>

              <!-- High-Contrast Tag -->
              <div class="absolute -bottom-5 whitespace-nowrap px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-white border shadow-sm" style="border-color:${mainColor}; color:${mainColor};">
                ${atm.riskScore}% RISK &bull; ${atm.etaMinutes}m
              </div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([atm.lat, atm.lng], { icon: atmIcon }).addTo(layerGroup);

        marker.on("click", () => {
          onSelectAtm(atm);
        });

        marker.bindPopup(`
          <div style="padding:12px; font-family:sans-serif; min-width:210px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="font-size:10px; font-weight:700; background:${mainColor}18; color:${mainColor}; padding:2px 6px; border-radius:4px; font-family:monospace;">
                RANK #${atm.rank} HOTSPOT
              </span>
              <span style="font-size:11px; font-weight:700; color:${mainColor}; font-family:monospace;">
                ${atm.riskScore}% RISK
              </span>
            </div>
            <div style="font-weight:700; font-size:13px; color:#0F172A; margin-bottom:2px;">${atm.name}</div>
            <div style="font-size:11px; color:#64748B; margin-bottom:8px;">${atm.kioskType}</div>
            <div style="display:flex; justify-content:space-between; font-size:11px; color:#334155; border-top:1px solid #F1F5F9; padding-top:6px; font-family:monospace;">
              <span>ETA: <b>${atm.etaMinutes} mins</b></span>
              <span>Dist: <b>${atm.distanceMeters}m</b></span>
            </div>
          </div>
        `);
      });

      // 3. Draw Clean Cobalt Polyline Corridor
      const rank1 = atms.find((a) => a.rank === 1);
      if (muleLocation && rank1) {
        L.polyline([muleLocation, [rank1.lat, rank1.lng]], {
          color: "#2563EB",
          weight: 2.5,
          dashArray: "5, 6",
          opacity: 0.85,
        }).addTo(layerGroup);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, atms, muleLocation, onSelectAtm, zoom]);

  return (
    <div className="relative w-full h-full min-h-[440px] rounded-lg overflow-hidden border border-slate-200 bg-white shadow-card">
      <div ref={mapContainerRef} className="w-full h-full min-h-[440px] z-10" />

      {/* Clean Technical Map HUD */}
      <div className="absolute top-3 left-3 z-20 pointer-events-none flex flex-col gap-1.5">
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-slate-200/90 px-2.5 py-1 rounded-md text-xs font-mono font-medium text-slate-800 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span>GIS CORRIDOR: OSM POSITRON</span>
        </div>
        <div className="text-[10px] font-mono text-slate-500 bg-white/90 px-2 py-0.5 rounded border border-slate-200 shadow-xs">
          Bibwewadi $\to$ VIT Pune Corridor
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

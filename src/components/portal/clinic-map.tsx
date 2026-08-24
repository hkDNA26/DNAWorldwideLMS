"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { isDarkTheme } from "@/lib/theme-client";
import type { ClinicItem } from "@/lib/clinics";

export function ClinicMap({
  clinics,
  token,
  onSelect,
}: {
  clinics: ClinicItem[];
  token: string;
  onSelect: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  // keep latest onSelect without re-running the marker effect
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !token) return;
    mapboxgl.accessToken = token;
    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: isDarkTheme() ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11",
      center: [10, 25],
      zoom: 1.4,
    });
    mapRef.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [token]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const placed = clinics.filter((c) => c.lat != null && c.lng != null);
    const bounds = new mapboxgl.LngLatBounds();

    placed.forEach((c) => {
      const el = document.createElement("div");
      el.style.cssText =
        "width:34px;height:34px;border-radius:9999px;border:2px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.4);background-size:cover;background-position:center;cursor:pointer";
      if (c.photoUrl) el.style.backgroundImage = `url("${encodeURI(c.photoUrl)}")`;
      else el.style.backgroundColor = "#1d4f8c";

      const popup = new mapboxgl.Popup({ offset: 20, closeButton: false }).setDOMContent(
        clinicPopup(c, () => onSelectRef.current(c.id))
      );
      const marker = new mapboxgl.Marker({ element: el }).setLngLat([c.lng!, c.lat!]).setPopup(popup).addTo(map);
      markersRef.current.push(marker);
      bounds.extend([c.lng!, c.lat!]);
    });

    if (placed.length > 0) map.fitBounds(bounds, { padding: 60, maxZoom: 6, duration: 500 });
  }, [clinics]);

  return <div ref={containerRef} className="w-full h-[600px] rounded-2xl overflow-hidden border border-line" />;
}

/** Popup: small image, name, location, and a "View details" button — all via DOM (no HTML injection). */
function clinicPopup(c: ClinicItem, onView: () => void): HTMLElement {
  const wrap = document.createElement("div");
  wrap.style.cssText = "font-family:Inter,system-ui,sans-serif;max-width:200px";

  if (c.photoUrl) {
    const img = document.createElement("img");
    img.src = c.photoUrl;
    img.alt = "";
    img.style.cssText = "width:100%;height:90px;object-fit:cover;border-radius:8px;margin-bottom:6px";
    wrap.appendChild(img);
  }

  const name = document.createElement("div");
  name.style.cssText = "font-weight:700;color:#16202c;font-size:13.5px;line-height:1.25";
  name.textContent = c.name;
  wrap.appendChild(name);

  const loc = document.createElement("div");
  loc.style.cssText = "color:#4c5a68;font-size:11.5px;margin-top:1px";
  loc.textContent = [c.city, c.country].filter(Boolean).join(", ");
  wrap.appendChild(loc);

  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "View details →";
  btn.style.cssText =
    "margin-top:8px;width:100%;background:#1d4f8c;color:#fff;border:none;border-radius:8px;padding:6px 8px;font-size:12px;font-weight:600;cursor:pointer";
  btn.addEventListener("click", onView);
  wrap.appendChild(btn);

  return wrap;
}

"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { isDarkTheme } from "@/lib/theme-client";
import { capabilityLabel, type CollectorItem } from "@/lib/collectors";

export function CollectorMap({ collectors, token }: { collectors: CollectorItem[]; token: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Init map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (!token) return;
    mapboxgl.accessToken = token;
    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: isDarkTheme() ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11",
      center: [-2.5, 54.0], // UK
      zoom: 4.6,
    });
    mapRef.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [token]);

  // Sync markers with the (filtered) collector list.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const placed = collectors.filter((c) => c.lat != null && c.lng != null);
    const bounds = new mapboxgl.LngLatBounds();

    placed.forEach((c) => {
      const el = document.createElement("div");
      el.style.cssText =
        "width:38px;height:38px;border-radius:9999px;border:2px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.35);background-size:cover;background-position:center;cursor:pointer";
      if (c.photoUrl) el.style.backgroundImage = `url("${encodeURI(c.photoUrl)}")`;
      else el.style.backgroundColor = "#1d4f8c";

      const popup = new mapboxgl.Popup({ offset: 24, closeButton: false }).setDOMContent(collectorPopup(c));
      const marker = new mapboxgl.Marker({ element: el }).setLngLat([c.lng!, c.lat!]).setPopup(popup).addTo(map);
      markersRef.current.push(marker);
      bounds.extend([c.lng!, c.lat!]);
    });

    if (placed.length > 0) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 9, duration: 500 });
    }
  }, [collectors]);

  return <div ref={containerRef} className="w-full h-[600px] rounded-2xl overflow-hidden border border-line" />;
}

/** Build the popup content with DOM nodes (textContent) — no HTML injection. */
function collectorPopup(c: CollectorItem): HTMLElement {
  const wrap = document.createElement("div");
  wrap.style.cssText = "max-width:220px;font-family:Inter,system-ui,sans-serif";

  const name = document.createElement("div");
  name.style.cssText = "font-weight:700;color:#16202c;font-size:14px";
  name.textContent = c.name;
  wrap.appendChild(name);

  const loc = document.createElement("div");
  loc.style.cssText = "color:#4c5a68;font-size:12px;margin-top:2px";
  loc.textContent = c.livesOutcode ? `${c.area} · ${c.livesOutcode}` : c.area;
  wrap.appendChild(loc);

  const caps = c.capabilities.map(capabilityLabel).join(", ");
  if (caps) {
    const capsEl = document.createElement("div");
    capsEl.style.cssText = "color:#2e8659;font-size:11.5px;margin-top:6px;line-height:1.4";
    capsEl.textContent = caps;
    wrap.appendChild(capsEl);
  }
  return wrap;
}

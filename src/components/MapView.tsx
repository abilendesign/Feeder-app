"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Location } from "@/lib/schema";

const PIN_COLOR = "#d6ff00";
const DARK_STYLE = "mapbox://styles/mapbox/dark-v11";
const DEFAULT_CENTER: [number, number] = [-79.5199, 8.9824]; // Panamá

export default function MapView({ location }: { location: Location | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Inicializa el mapa una sola vez.
  useEffect(() => {
    if (!token || !containerRef.current || mapRef.current) return;
    mapboxgl.accessToken = token;
    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: DARK_STYLE,
      center: DEFAULT_CENTER,
      zoom: 11,
    });
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [token]);

  // Mueve / crea el pin en la ubicación exacta.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !location) return;
    const lngLat: [number, number] = [location.longitude, location.latitude];

    if (!markerRef.current) {
      markerRef.current = new mapboxgl.Marker({ color: PIN_COLOR });
    }
    markerRef.current.setLngLat(lngLat).addTo(map);
    map.flyTo({ center: lngLat, zoom: 15, essential: true });
  }, [location]);

  if (!token) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#0a0a0a] text-sm text-neutral-500">
        Falta NEXT_PUBLIC_MAPBOX_TOKEN en .env.local
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full" />;
}

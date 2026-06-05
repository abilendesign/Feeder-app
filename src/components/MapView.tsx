"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const PIN_COLOR = "#d6ff00";
const DARK_STYLE = "mapbox://styles/mapbox/dark-v11";
const DEFAULT_CENTER: [number, number] = [-79.5199, 8.9824]; // Panamá

export default function MapView({
  lat,
  lng,
}: {
  lat: number | null;
  lng: number | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

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

  useEffect(() => {
    const map = mapRef.current;
    if (!map || lat == null || lng == null) return;
    const lngLat: [number, number] = [lng, lat];

    if (!markerRef.current) {
      markerRef.current = new mapboxgl.Marker({ color: PIN_COLOR });
    }
    markerRef.current.setLngLat(lngLat).addTo(map);
    map.flyTo({ center: lngLat, zoom: 15, essential: true });
  }, [lat, lng]);

  if (!token) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#0a0a0a] text-sm text-neutral-500">
        Falta NEXT_PUBLIC_MAPBOX_TOKEN en .env.local
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full" />;
}

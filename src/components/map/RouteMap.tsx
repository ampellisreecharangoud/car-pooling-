import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';

interface RouteStopPoint {
  lat: number;
  lng: number;
  label: string;
  isPickup?: boolean;
  isDropoff?: boolean;
}

interface RouteMapProps {
  pickupLat: number;
  pickupLng: number;
  pickupLabel: string;
  destLat: number;
  destLng: number;
  destLabel: string;
  stops?: { latitude: number; longitude: number; location: string }[];
  className?: string;
  interactive?: boolean;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  pickupLat,
  pickupLng,
  pickupLabel,
  destLat,
  destLng,
  destLabel,
  stops = [],
  className = 'h-72 w-full',
  interactive = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: [(pickupLat + destLat) / 2, (pickupLng + destLng) / 2],
        zoom: 12,
        dragging: interactive,
        touchZoom: interactive,
        scrollWheelZoom: false,
        zoomControl: interactive,
      });

      // Standard OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Create Custom DivIcons (reliable, self-contained SVG/HTML markers)
      const pickupIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div style="background-color: #059669; color: white; width: 30px; height: 30px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); font-size: 13px;">
            A
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const dropoffIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div style="background-color: #0f172a; color: white; width: 30px; height: 30px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); font-size: 13px;">
            B
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const stopIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div style="background-color: #d97706; color: white; width: 24px; height: 24px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 11px;">
            •
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      // Add pickup marker
      const pickupMarker = L.marker([pickupLat, pickupLng], { icon: pickupIcon }).addTo(map);
      pickupMarker.bindPopup(`<b>Pickup:</b> ${pickupLabel}`);

      // Add intermediate stops
      const waypointCoords: [number, number][] = [[pickupLat, pickupLng]];
      stops.forEach((s, idx) => {
        const marker = L.marker([s.latitude, s.longitude], { icon: stopIcon }).addTo(map);
        marker.bindPopup(`<b>Stop ${idx + 1}:</b> ${s.location}`);
        waypointCoords.push([s.latitude, s.longitude]);
      });

      // Add destination marker
      const destMarker = L.marker([destLat, destLng], { icon: dropoffIcon }).addTo(map);
      destMarker.bindPopup(`<b>Destination:</b> ${destLabel}`);
      waypointCoords.push([destLat, destLng]);

      // Draw route connecting polyline
      const routeLine = L.polyline(waypointCoords, {
        color: '#059669',
        weight: 4,
        opacity: 0.8,
        dashArray: '6, 8',
      }).addTo(map);

      // Fit bounds nicely with padding
      const group = L.featureGroup([pickupMarker, destMarker, routeLine]);
      map.fitBounds(group.getBounds(), { padding: [40, 40] });

      mapInstanceRef.current = map;
    } catch (err) {
      console.warn('Leaflet map initialization fallback:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [pickupLat, pickupLng, pickupLabel, destLat, destLng, destLabel, stops, interactive]);

  return (
    <div className={`relative overflow-hidden border border-slate-200 bg-slate-100 rounded-xl ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Route badge indicator */}
      <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs flex items-center gap-2 text-xs text-slate-700">
        <Navigation className="w-3.5 h-3.5 text-emerald-600" />
        <span className="font-medium">Direct Route Preview</span>
        <span className="text-slate-400">·</span>
        <span className="text-slate-500">OpenStreetMap</span>
      </div>

      {/* Quick Legend at bottom */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-200 text-[11px] text-slate-600 flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
          <span>Pickup</span>
        </div>
        {stops.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"></span>
            <span>Stop ({stops.length})</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-900 inline-block"></span>
          <span>Destination</span>
        </div>
      </div>
    </div>
  );
};

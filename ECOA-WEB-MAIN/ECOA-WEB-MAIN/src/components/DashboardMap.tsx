'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import StatsService from '@/services/stats.service';

const createCustomIcon = (type: string, isSelected: boolean = false) => {
  let color = '#20C997'; // Brand neon green
  if (type === 'AGUA') color = '#0ea5e9'; // Blue
  if (type === 'URBANO') color = '#ef4444'; // Red
  if (type === 'INDUSTRIAL') color = '#fbbf24'; // Yellow

  const size = isSelected ? 18 : 10;
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 1.5px solid white;
      box-shadow: 0 0 8px ${color}, 0 0 15px ${color};
      transition: all 0.3s ease;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
};

const createClusterIcon = (clusterId: number) => {
  const colors = ['#f43f5e', '#a855f7', '#3b82f6']; // Rose, Purple, Blue
  const color = colors[clusterId % colors.length];
  const size = 32;

  return L.divIcon({
    className: 'spark-cluster-icon',
    html: `<div class="relative flex items-center justify-center">
      <div style="
        position: absolute;
        width: ${size * 1.5}px;
        height: ${size * 1.5}px;
        background-color: ${color};
        opacity: 0.15;
        border-radius: 50%;
        animation: pulse 2s infinite;
      "></div>
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 15px ${color}, 0 0 30px ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 900;
        font-size: 11px;
        font-family: monospace;
      ">SPK${clusterId}</div>
    </div>`,
    iconSize: [size * 2, size * 2],
    iconAnchor: [size, size],
  });
};

interface MapPoint {
  id: string;
  latitude: number;
  longitude: number;
  type: string;
  status: string;
  description: string;
}

interface SparkCluster {
  id: number;
  latitude: number;
  longitude: number;
  clusterId: number;
  predictionLabel: string;
}

export default function DashboardMap() {
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [clusters, setClusters] = useState<SparkCluster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pointsData, clustersData] = await Promise.all([
          StatsService.getMapData(),
          StatsService.getSparkPredictions(),
        ]);
        setPoints((pointsData || []) as MapPoint[]);
        setClusters((clustersData || []) as SparkCluster[]);
      } catch (err) {
        console.error('Erro ao buscar dados do mapa:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-87.5 bg-black/40 backdrop-blur-md rounded-3xl border border-white/5">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Processando coordenadas espaciais...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative w-full h-87.5 rounded-3xl overflow-hidden border border-white/5 bg-black"
    >
      <MapContainer
        center={[-23.5505, -46.6333]}
        zoom={4}
        zoomControl={false}
        className="w-full h-full grayscale brightness-[0.7] contrast-[1.2]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Complaints Markers */}
        {points.map((p) => (
          <Marker
            key={p.id}
            position={[p.latitude, p.longitude]}
            icon={createCustomIcon(p.type)}
          />
        ))}

        {/* Spark Cluster Centers */}
        {clusters.map((c) => (
          <Marker
            key={`cluster-${c.id}`}
            position={[c.latitude, c.longitude]}
            icon={createClusterIcon(c.clusterId)}
          />
        ))}

        <MapInitializer points={points} clusters={clusters} />
      </MapContainer>

      <div className="absolute bottom-4 left-4 z-1000 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-muted-foreground flex gap-3">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> Queixas</div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Hotspot (Spark ML)</div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.2; }
          50% { transform: scale(1.2); opacity: 0.4; }
          100% { transform: scale(0.9); opacity: 0.2; }
        }
      `}</style>
    </motion.div>
  );
}

function MapInitializer({ points, clusters }: { points: MapPoint[], clusters: SparkCluster[] }) {
  const map = useMap();
  useEffect(() => {
    const coords = [
      ...points.map(p => [p.latitude, p.longitude]),
      ...clusters.map(c => [c.latitude, c.longitude]),
    ].filter(coord => coord[0] !== undefined && coord[1] !== undefined);

    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords as [number, number][]);
      map.fitBounds(bounds, { padding: [40, 40], duration: 1.5 });
    }
  }, [points, clusters, map]);
  return null;
}

'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  MapPin, 
  AlertCircle, 
  Search, 
  Maximize2,
  Calendar,
  Layers,
  X,
  Navigation
} from 'lucide-react';
import StatsService from '@/services/stats.service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { showToast } from '@/lib/toast';

// Custom Marker que brilha (Glow Effect)
const createCustomIcon = (type: string, isSelected: boolean = false) => {
  let color = '#3b82f6'; // Default blue
  if (type === 'AR' || type === 'INDUSTRIAL') color = '#fbbf24'; // Yellow
  if (type === 'AGUA') color = '#0ea5e9'; // Light blue
  if (type === 'RESIDUOS' || type === 'URBANO') color = '#ef4444'; // Red

  const size = isSelected ? 24 : 14;
  const shadowSize = isSelected ? 40 : 20;

  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 10px ${color}, 0 0 ${shadowSize}px ${color};
      transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
};

interface ComplaintLocation {
  id: string;
  latitude: number;
  longitude: number;
  type: string;
  status: string;
  description: string;
  createdAt: string;
}

export default function ComplaintMap() {
  const [locations, setLocations] = useState<ComplaintLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintLocation | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'dark' | 'satellite'>('dark');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleAction = async (action: string) => {
    setIsActionLoading(action);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsActionLoading(null);
  };

  const locateUser = () => {
    if (!navigator.geolocation) {
      showToast('Geolocalização não suportada pelo seu navegador.', 'warning');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        // Note: MapController will handle the FlyTo
      },
      (error) => {
        console.error("Erro ao obter localização:", error);
        showToast('Não foi possível obter sua localização.', 'error');
      }
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await StatsService.getMapData();
        setLocations(data as ComplaintLocation[]);
      } catch (err) {
        console.error('Erro ao buscar dados do mapa:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      const matchesType = filterType === 'ALL' || loc.type === filterType;
      const matchesSearch = loc.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [locations, filterType, searchTerm]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black rounded-[2.5rem] border border-white/5 shadow-2xl">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-primary/20 rounded-full animate-ping absolute inset-0" />
          <Loader2 className="w-10 h-10 text-primary animate-spin relative z-10" />
        </div>
        <p className="text-slate-400 font-black tracking-[0.2em] uppercase text-[10px] mt-8 animate-pulse">
          Sincronizando Rede Global de Monitoramento...
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full h-full rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl bg-black group"
    >
      {/* Search & Filter Header (Apple Glassmorphism) */}
      <motion.div 
        animate={{ 
          x: selectedComplaint ? (isMobile ? 0 : -460) : 0,
          opacity: selectedComplaint && isMobile ? 0 : 1,
          width: selectedComplaint && !isMobile ? 'calc(100% - 480px)' : 'calc(100% - 64px)'
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute top-8 left-8 z-1000 flex flex-col md:flex-row gap-4 items-start md:items-center"
      >
        <div className="flex-1 flex items-center gap-4 w-full">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por descrição ou localidade..."
              className="w-full bg-black/40 backdrop-blur-3xl border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 transition-all shadow-2xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-2xl p-1 shadow-2xl overflow-x-auto no-scrollbar max-w-[200px] md:max-w-none">
            {['ALL', 'AR', 'AGUA', 'RESIDUOS'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filterType === type ? 'bg-primary text-black shadow-[0_0_15px_rgba(32,201,151,0.4)]' : 'text-slate-500 hover:text-white'
                }`}
              >
                {type === 'ALL' ? 'Todos' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Tactical Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-1 shadow-2xl flex items-center">
             <button 
               onClick={() => setViewMode('dark')}
               className={`p-3 rounded-xl transition-all ${viewMode === 'dark' ? 'bg-white/10 text-primary' : 'text-slate-500 hover:text-white'}`}
               title="Modo Noturno"
             >
               <Layers size={18} />
             </button>
             <button 
               onClick={() => setViewMode('satellite')}
               className={`p-3 rounded-xl transition-all ${viewMode === 'satellite' ? 'bg-white/10 text-primary' : 'text-slate-500 hover:text-white'}`}
               title="Visão de Satélite"
             >
               <Maximize2 size={18} />
             </button>
          </div>

          <button 
            onClick={locateUser}
            className="bg-primary text-black p-3.5 rounded-2xl shadow-[0_0_20px_rgba(32,201,151,0.4)] hover:scale-105 active:scale-95 transition-all"
            title="Minha Localização"
          >
            <Navigation size={18} className="fill-current" />
          </button>
        </div>
      </motion.div>

      {/* Floating HUD - Stats */}
      <div className="absolute bottom-8 left-8 z-1000 flex flex-col gap-2">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-white font-black text-xs uppercase tracking-widest">Sistema Operacional</span>
          </div>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tight">
            {filteredLocations.length} Queixas Detectadas na Área
          </p>
        </div>
      </div>

      {/* Sidebar Details (Apple Style) */}
      <AnimatePresence>
        {selectedComplaint && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-y-0 right-0 z-1000 w-full sm:w-[460px] bg-[#080808]/95 backdrop-blur-3xl border-l border-white/5 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col"
          >
            <div className="p-8 flex items-center justify-between border-b border-white/5">
              <h3 className="text-xl font-black uppercase tracking-tight italic">Detalhes da <span className="text-primary text-glow">Ocorrência</span></h3>
              <button 
                onClick={() => setSelectedComplaint(null)}
                className="absolute top-6 right-6 z-1001 p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl transition-all border border-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Categoria</p>
                    <p className="text-sm font-bold text-white">{selectedComplaint.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Status</p>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    selectedComplaint.status === 'PENDENTE' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                  }`}>
                    {selectedComplaint.status}
                  </span>
                </div>
              </div>

              <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-3">Relato do Usuário</p>
                <p className="text-slate-200 text-sm leading-relaxed font-medium">
                  {selectedComplaint.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/2 border border-white/5 rounded-2xl p-4">
                  <Calendar size={18} className="text-slate-500 mb-2" />
                  <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Data do Registro</p>
                  <p className="text-xs font-bold text-white">
                    {format(new Date(selectedComplaint.createdAt), "dd 'de' MMM, yyyy", { locale: ptBR })}
                  </p>
                </div>
                <div className="bg-white/2 border border-white/5 rounded-2xl p-4">
                  <MapPin size={18} className="text-slate-500 mb-2" />
                  <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Coordenadas</p>
                  <p className="text-[10px] font-bold text-white">
                    {selectedComplaint.latitude.toFixed(4)}, {selectedComplaint.longitude.toFixed(4)}
                  </p>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex items-center justify-between">
                <div>
                   <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-1">Empresa Responsável</p>
                   <p className="text-sm font-bold text-white">Engenharia Alfa Ltda</p>
                </div>
                <Button variant="ghost" className="text-[10px] font-black uppercase text-primary hover:bg-primary/10">Trocar</Button>
              </div>

              <div className="pt-8 space-y-3">
                <button 
                  disabled={isActionLoading !== null}
                  onClick={() => handleAction('resolve')}
                  className="w-full py-5 bg-primary text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-[0_0_20px_rgba(32,201,151,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                >
                  {isActionLoading === 'resolve' ? (
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : 'Assumir Resolução'}
                </button>
                <button 
                  disabled={isActionLoading !== null}
                  onClick={() => handleAction('delegate')}
                  className="w-full py-5 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-white/10 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isActionLoading === 'delegate' ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : 'Delegar para Equipe'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Container */}
      <MapContainer 
        center={[-23.5505, -46.6333]} // Default SP
        zoom={4} 
        zoomControl={false}
        scrollWheelZoom={true}
        className={`w-full h-full contrast-[1.1] ${viewMode === 'dark' ? 'grayscale-[0.2] brightness-[0.8]' : ''}`}
        style={{ background: '#000' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={viewMode === 'dark' 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          }
        />
        
        {/* Renderização das Queixas */}
        {filteredLocations.map((loc) => (
          <Marker 
            key={loc.id} 
            position={[loc.latitude, loc.longitude]}
            icon={createCustomIcon(loc.type, selectedComplaint?.id === loc.id)}
            eventHandlers={{
              click: () => setSelectedComplaint(loc),
            }}
          />
        ))}

        {/* Marcador do Usuário (Bússola) */}
        {userLocation && (
          <Marker 
            position={userLocation}
            icon={L.divIcon({
              className: 'user-location-marker',
              html: `
                <div class="relative flex items-center justify-center">
                  <div class="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping"></div>
                  <div class="relative w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                </div>
              `,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            })}
          />
        )}
        
        {userLocation && (
          <Marker 
            position={userLocation} 
            icon={L.divIcon({
              className: 'user-location-marker',
              html: `<div class="relative">
                      <div class="absolute -inset-2 bg-blue-500/30 rounded-full animate-ping"></div>
                      <div class="w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                    </div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            })}
          />
        )}
        
        <MapController 
          locations={filteredLocations} 
          selected={selectedComplaint} 
          userLocation={userLocation} 
        />
      </MapContainer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        .leaflet-container {
          background: #080808 !important;
        }
        .text-glow {
          text-shadow: 0 0 10px currentColor;
        }
        .user-location-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </motion.div>
  );
}

// Sub-componente para controlar o comportamento do mapa
function MapController({ 
  locations, 
  selected, 
  userLocation 
}: { 
  locations: ComplaintLocation[], 
  selected: ComplaintLocation | null,
  userLocation: [number, number] | null
}) {
  const map = useMap();
  
  // Efeito para centralizar inicialmente nos pontos
  useEffect(() => {
    if (locations.length > 0 && !selected && !userLocation) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.latitude, loc.longitude]));
      map.fitBounds(bounds, { padding: [100, 100], duration: 1.5 });
    }
  }, [locations, map, selected, userLocation]);

  // Efeito para voar para o ponto selecionado (Apple-style FlyTo)
  useEffect(() => {
    if (selected) {
      map.flyTo([selected.latitude, selected.longitude], 15, {
        duration: 2,
        easeLinearity: 0.25
      });
    }
  }, [selected, map]);

  // Efeito para voar para a localização do usuário
  useEffect(() => {
    if (userLocation) {
      map.flyTo(userLocation, 17, {
        duration: 2.5,
        easeLinearity: 0.2
      });
    }
  }, [userLocation, map]);
  
  return null;
}

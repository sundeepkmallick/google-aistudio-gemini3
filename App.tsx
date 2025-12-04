import React, { useState, useEffect, useRef } from 'react';
import { Coordinates, AppState, ChargingStationResponse, Station, ViewMode, Screen, Connector } from './types';
import { findChargingStations } from './services/gemini';

// --- Assets / Icons Helper ---
const Icon = ({ name, className = "" }: { name: string, className?: string }) => (
  <span className={`material-icons-round ${className}`}>{name}</span>
);

// --- 1. Onboarding Screen ---
const OnboardingScreen = ({ onStart }: { onStart: () => void }) => (
  <div className="h-full w-full bg-slate-900 flex flex-col items-center justify-between p-8 text-white animate-fade-in relative overflow-hidden">
    {/* Background decoration */}
    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none"></div>
    <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

    <div className="flex-1 flex flex-col items-center justify-center w-full z-10">
       <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/20">
          <Icon name="electric_bolt" className="text-5xl text-white" />
       </div>
       <h1 className="text-3xl font-bold text-center mb-3 leading-tight">
         SunCharge<br/> <span className="text-blue-400 text-xl font-medium">Power Your Journey</span>
       </h1>
       <p className="text-slate-400 text-center max-w-xs">
         Locate reliable charging stations nearby, manage payments, and track your history.
       </p>
    </div>

    <div className="w-full space-y-4 z-10">
      <button 
        onClick={onStart}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-xl shadow-lg active:scale-95 transition-all"
      >
        Get Started
      </button>
      <button className="w-full text-slate-500 text-sm font-medium">
        Sign In
      </button>
    </div>
  </div>
);

// --- 2. Menu / Drawer ---
const SideMenu = ({ isOpen, onClose, onNavigate, currentScreen }: any) => {
  const menuItems = [
    { id: Screen.HOME, label: 'Stations', icon: 'map' },
    { id: Screen.FAVORITES, label: 'Favorite Stations', icon: 'star' },
    { id: Screen.PROFILE, label: 'Profile & Settings', icon: 'person' },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>
      )}
      
      {/* Drawer */}
      <div className={`fixed top-0 left-0 h-full w-3/4 max-w-xs bg-slate-900 z-50 transform transition-transform duration-300 ease-out shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-4">
           <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
             S
           </div>
           <div>
             <h2 className="text-white font-semibold">Sundeep</h2>
             <p className="text-slate-400 text-xs">sundeep@xzy.com</p>
           </div>
        </div>
        <div className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); onClose(); }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${currentScreen === item.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              <Icon name={item.icon} className="text-xl" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
        
        <div className="absolute bottom-6 left-0 w-full px-4">
           <button className="w-full flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-white transition-colors">
              <Icon name="logout" className="text-xl" />
              <span className="font-medium">Log Out</span>
           </button>
        </div>
      </div>
    </>
  );
};

// --- 3. Profile Screen ---
const ProfileScreen = ({ onBack }: { onBack: () => void }) => (
  <div className="h-full bg-slate-950 text-white flex flex-col animate-fade-in">
    <div className="flex items-center p-4 border-b border-slate-800">
      <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-800"><Icon name="arrow_back" /></button>
      <h2 className="text-lg font-semibold ml-2">Profile & Settings</h2>
    </div>
    
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      <div className="flex flex-col items-center py-6">
        <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-full p-1 mb-4">
           <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center overflow-hidden">
             <Icon name="person" className="text-6xl text-slate-600" />
           </div>
        </div>
        <h3 className="text-xl font-bold">Sundeep</h3>
        <p className="text-slate-400">sundeep@xzy.com</p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Account</p>
        {[
          { label: 'Personal Info', icon: 'badge' },
          { label: 'My Vehicles', icon: 'directions_car' },
          { label: 'Payment Methods', icon: 'credit_card' },
          { label: 'Charging History', icon: 'history' },
        ].map((item, i) => (
          <button key={i} className="w-full bg-slate-900 p-4 rounded-xl flex items-center justify-between hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-blue-400"><Icon name={item.icon} className="text-sm"/></div>
              <span>{item.label}</span>
            </div>
            <Icon name="chevron_right" className="text-slate-600" />
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Preferences</p>
        {[
          { label: 'Notifications', icon: 'notifications' },
          { label: 'Map Settings', icon: 'map' },
        ].map((item, i) => (
           <button key={i} className="w-full bg-slate-900 p-4 rounded-xl flex items-center justify-between hover:bg-slate-800 transition-colors">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-blue-400"><Icon name={item.icon} className="text-sm"/></div>
               <span>{item.label}</span>
             </div>
             <Icon name="chevron_right" className="text-slate-600" />
           </button>
        ))}
      </div>
    </div>
  </div>
);

// --- 4. Favorites Screen ---
const FavoritesScreen = ({ onBack, onStationClick }: { onBack: () => void, onStationClick: (s: Station) => void }) => {
  // Mock favorites
  const favorites: Partial<Station>[] = [
    { id: 'fav1', name: 'Electrify America - Target', address: '123 Main St, City', isFastCharging: true, provider: 'Electrify America' },
    { id: 'fav2', name: 'EVGo - Central Mall', address: '500 Mall Rd, City', isFastCharging: true, provider: 'EVGo' },
  ];

  return (
    <div className="h-full bg-slate-950 text-white flex flex-col animate-fade-in">
       <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-800"><Icon name="arrow_back" /></button>
          <h2 className="text-lg font-semibold ml-2">Favorite Stations</h2>
        </div>
        <Icon name="map" className="text-slate-400" />
      </div>

      <div className="p-4">
        <div className="bg-slate-900 rounded-xl flex items-center px-4 py-3 mb-6 border border-slate-800">
           <Icon name="search" className="text-slate-400 mr-2" />
           <input type="text" placeholder="Search saved places..." className="bg-transparent flex-1 outline-none text-white placeholder-slate-500" />
        </div>

        <div className="space-y-3">
          {favorites.map((fav, i) => (
            <div key={i} onClick={() => onStationClick(fav as Station)} className="bg-slate-900 p-4 rounded-xl border border-slate-800 active:scale-[0.98] transition-transform">
               <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-green-900/30 rounded-lg flex items-center justify-center text-green-400">
                      <Icon name="electric_bolt" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{fav.name}</h3>
                      <p className="text-sm text-slate-400">{fav.address}</p>
                      <div className="flex items-center gap-2 mt-2">
                         <span className="text-xs text-slate-500">2x CCS • 2x CHAdeMO</span>
                      </div>
                    </div>
                  </div>
                  <Icon name="star" className="text-yellow-400" />
               </div>
            </div>
          ))}
          
          <div className="mt-8 border-t border-slate-800 pt-8 flex flex-col items-center text-center">
             <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 text-slate-600">
                <Icon name="add" className="text-3xl" />
             </div>
             <p className="text-slate-500 text-sm">Find more stations on the map to add them here.</p>
             <button onClick={onBack} className="mt-4 text-blue-400 font-medium">Find Stations to Add</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 5. Details Screen ---
const StationDetailScreen = ({ station, onBack }: { station: Station, onBack: () => void }) => {
  return (
    <div className="h-full bg-slate-950 text-white flex flex-col animate-fade-in overflow-y-auto">
      {/* Header Image Area */}
      <div className="relative w-full h-64 bg-slate-800">
         <img 
           src={`https://source.unsplash.com/800x600/?electric,car,charger`} 
           className="w-full h-full object-cover opacity-60" 
           alt="Station" 
           onError={(e) => (e.currentTarget.style.display = 'none')}
         />
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-slate-950 to-transparent"></div>
         <div className="absolute top-4 left-4 z-10">
           <button onClick={onBack} className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/60 text-white">
             <Icon name="arrow_back" />
           </button>
         </div>
         <div className="absolute top-4 right-4 z-10">
           <button className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/60 text-white">
             <Icon name="favorite_border" />
           </button>
         </div>
      </div>

      <div className="px-5 -mt-10 relative z-10 flex-1">
         <div className="mb-6">
           <h1 className="text-2xl font-bold mb-1 leading-tight">{station.name}</h1>
           <p className="text-slate-400 text-sm mb-2">{station.address}</p>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                 <Icon name="star" className="text-yellow-400 text-sm" />
                 <span className="font-bold text-sm">{station.rating || 4.5}</span>
                 <span className="text-slate-500 text-xs">({station.reviews || 12} reviews)</span>
              </div>
              <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
              <span className="text-green-400 text-sm font-medium">{station.isOpen ? 'Open 24/7' : 'Closed'}</span>
           </div>
         </div>

         <div className="flex gap-3 mb-8">
            <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 active:scale-95 transition-transform flex items-center justify-center gap-2">
              <Icon name="directions" className="text-lg" />
              Get Directions
            </button>
            <button className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-900/20 active:scale-95 transition-transform flex items-center justify-center gap-2">
              <Icon name="bolt" className="text-lg" />
              Start Charging
            </button>
         </div>

         {/* Connectors Section */}
         <div className="mb-6">
            <h3 className="text-lg font-bold mb-3">Connectors</h3>
            <div className="space-y-3">
              {(station.connectors || []).map((conn, i) => (
                <div key={i} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                        <Icon name="electrical_services" className="text-blue-400" />
                     </div>
                     <div>
                       <div className="font-semibold">{conn.type}</div>
                       <div className="text-xs text-slate-400">{conn.power} • {conn.price}</div>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className={`text-sm font-bold ${conn.available > 0 ? 'text-green-400' : 'text-red-400'}`}>
                       {conn.available} / {conn.total}
                     </div>
                     <div className="text-xs text-slate-500">Available</div>
                  </div>
                </div>
              ))}
              {(!station.connectors || station.connectors.length === 0) && (
                <p className="text-slate-500 text-sm italic">Connector info unavailable</p>
              )}
            </div>
         </div>

         {/* Amenities Section */}
         <div className="mb-8">
            <h3 className="text-lg font-bold mb-3">Amenities</h3>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {(station.amenities || ['Restrooms', 'Dining', 'Shopping']).map((amenity, i) => (
                <div key={i} className="flex flex-col items-center min-w-[60px]">
                   <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mb-1 text-slate-400 border border-slate-800">
                      <Icon name={
                        amenity.includes('Wifi') ? 'wifi' : 
                        amenity.includes('Food') || amenity.includes('Dining') ? 'restaurant' :
                        amenity.includes('Shop') ? 'shopping_cart' : 'wc'
                      } />
                   </div>
                   <span className="text-xs text-slate-500">{amenity}</span>
                </div>
              ))}
            </div>
         </div>
      </div>
    </div>
  );
};


// --- 6. Home / Map Screen Component ---
const HomeScreen = ({ 
  stations, 
  center, 
  onMenuClick, 
  viewMode, 
  setViewMode, 
  onStationSelect,
  loading 
}: any) => {
  return (
    <div className="h-full w-full flex flex-col relative bg-slate-100">
      {/* Search Bar Overlay */}
      <div className="absolute top-4 left-4 right-4 z-20 flex gap-2">
         <button onClick={onMenuClick} className="w-12 h-12 bg-slate-900 text-white rounded-xl shadow-xl flex items-center justify-center">
            <Icon name="menu" />
         </button>
         <div className="flex-1 bg-slate-900/90 backdrop-blur text-white rounded-xl shadow-xl flex items-center px-4">
            <Icon name="search" className="text-slate-400 mr-2" />
            <input className="bg-transparent w-full h-12 outline-none placeholder-slate-400" placeholder="Search address or station..." />
         </div>
         <button 
           onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
           className="w-12 h-12 bg-blue-600 text-white rounded-xl shadow-xl flex items-center justify-center"
         >
            <Icon name={viewMode === 'map' ? 'format_list_bulleted' : 'map'} />
         </button>
      </div>

      {/* Filter Chips */}
      <div className="absolute top-20 left-0 w-full z-20 px-4 flex gap-2 overflow-x-auto no-scrollbar">
         <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg flex items-center gap-1">
            <Icon name="tune" className="text-xs" /> Filters
         </button>
         <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg flex items-center gap-1">
            <Icon name="bolt" className="text-xs text-yellow-400" /> Fast Charging
         </button>
         <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg">
            Available Now
         </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative">
         {loading ? (
           <div className="h-full flex flex-col items-center justify-center bg-slate-100">
             <div className="w-12 h-12 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin mb-4"></div>
             <p className="text-slate-600 font-medium">Locating stations...</p>
           </div>
         ) : viewMode === 'map' ? (
           <MapView stations={stations} center={center} onStationSelect={onStationSelect} />
         ) : (
           <div className="h-full overflow-y-auto pt-24 pb-4 px-4 bg-slate-100">
              <h2 className="text-slate-900 font-bold mb-4 text-lg">Nearby Stations ({stations.length})</h2>
              {stations.map((s: Station) => (
                <div key={s.id || Math.random()} onClick={() => onStationSelect(s)} className="bg-white p-4 rounded-xl shadow-sm mb-3 flex justify-between items-center active:scale-[0.99] transition-transform">
                   <div className="flex gap-4 items-center">
                     <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${s.isFastCharging ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        <Icon name="ev_station" />
                     </div>
                     <div>
                       <h3 className="font-bold text-slate-800">{s.name}</h3>
                       <p className="text-sm text-slate-500 line-clamp-1">{s.address}</p>
                       <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                            {s.connectors?.[0]?.power || (s.isFastCharging ? '150kW' : '50kW')}
                          </span>
                          <span className="text-xs text-green-600 font-medium">
                            {s.isOpen ? 'Available' : 'Closed'}
                          </span>
                       </div>
                     </div>
                   </div>
                   <Icon name="chevron_right" className="text-slate-300" />
                </div>
              ))}
           </div>
         )}
      </div>
    </div>
  );
};

// --- Helper: Map View ---
const MapView = ({ stations, center, onStationSelect }: { stations: Station[], center: Coordinates, onStationSelect: (s: Station) => void }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapContainerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([center.latitude, center.longitude], 14);

      // Light/Grey Map Style for better contrast with colorful markers
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
      }).addTo(mapRef.current);
    } else {
        mapRef.current.setView([center.latitude, center.longitude]);
    }

    // Clear layers
    mapRef.current.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        mapRef.current.removeLayer(layer);
      }
    });

    // Add Markers using CircleMarker for better reliability than default icons which can 404
    stations.forEach(station => {
      const color = station.isFastCharging ? '#16a34a' : '#2563eb'; // Green or Blue
      
      const marker = L.circleMarker([station.latitude, station.longitude], {
        radius: 10,
        fillColor: color,
        color: '#ffffff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.9
      }).addTo(mapRef.current);
      
      marker.on('click', () => onStationSelect(station));
    });

    return () => {};
  }, [stations, center]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
};


// --- MAIN APP COMPONENT ---

export default function App() {
  const [screen, setScreen] = useState<Screen>(Screen.ONBOARDING);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [data, setData] = useState<ChargingStationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  // Hardcoded location: Sydney, Australia
  const SYDNEY_COORDS: Coordinates = { latitude: -33.8688, longitude: 151.2093 };

  // --- Actions ---
  const handleLocationRequest = () => {
    // Skip direct permissions check UI for now, just go to home and load
    setScreen(Screen.HOME);
    setLoading(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const c = { latitude: position.coords.latitude, longitude: position.coords.longitude };
          setCoords(c);
          loadStations(c);
        },
        (error) => {
          console.warn("Location failed, using Sydney", error);
          setCoords(SYDNEY_COORDS);
          loadStations(SYDNEY_COORDS);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setCoords(SYDNEY_COORDS);
      loadStations(SYDNEY_COORDS);
    }
  };

  const loadStations = async (c: Coordinates) => {
    try {
      setLoading(true);
      const res = await findChargingStations(c);
      setData(res);
    } catch (e) {
      console.error(e);
      // Mock data if API fails completely to preserve UI flow for demo
      setData({ stations: [], chunks: [], summaryText: '' }); 
    } finally {
      setLoading(false);
    }
  };

  const handleStationSelect = (s: Station) => {
    setSelectedStation(s);
    setScreen(Screen.DETAILS);
  };

  // --- Rendering ---

  return (
    <div className="h-full w-full bg-slate-900 overflow-hidden font-sans text-slate-900">
      
      {screen === Screen.ONBOARDING && (
        <OnboardingScreen onStart={handleLocationRequest} />
      )}

      {screen === Screen.HOME && (
        <>
          <SideMenu 
            isOpen={isMenuOpen} 
            onClose={() => setIsMenuOpen(false)} 
            currentScreen={Screen.HOME}
            onNavigate={(s: Screen) => { setScreen(s); }}
          />
          <HomeScreen 
            loading={loading}
            stations={data?.stations || []}
            center={coords || SYDNEY_COORDS}
            onMenuClick={() => setIsMenuOpen(true)}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onStationSelect={handleStationSelect}
          />
        </>
      )}

      {screen === Screen.DETAILS && selectedStation && (
        <StationDetailScreen 
          station={selectedStation} 
          onBack={() => setScreen(Screen.HOME)} 
        />
      )}

      {screen === Screen.FAVORITES && (
        <>
          <SideMenu 
            isOpen={isMenuOpen} 
            onClose={() => setIsMenuOpen(false)} 
            currentScreen={Screen.FAVORITES}
            onNavigate={(s: Screen) => { setScreen(s); }}
          />
          <FavoritesScreen 
            onBack={() => setScreen(Screen.HOME)} 
            onStationClick={handleStationSelect}
          />
        </>
      )}

      {screen === Screen.PROFILE && (
        <ProfileScreen onBack={() => setScreen(Screen.HOME)} />
      )}

    </div>
  );
}
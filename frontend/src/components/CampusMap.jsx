import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search } from 'lucide-react';

// Fix for default marker icons in React-Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Key campus location markers
const locations = [
  { id: 1, name: 'Main Library', position: [12.8230, 80.0440], description: 'Central library with study halls and digital sandbox.' },
  { id: 2, name: 'CSE Department (Alan Turing Block)', position: [12.8235, 80.0445], description: 'Alan Turing Computer Science Block, labs, and faculty rooms.' },
  { id: 3, name: 'Hostel Block A (Residence Hall)', position: [12.8220, 80.0435], description: 'Aryabhata Boys Residence Hall (HST-B1).' },
  { id: 4, name: 'Student Food Court', position: [12.8225, 80.0450], description: 'Main student center, canteens, and food court stall area.' },
];

export const CampusMap = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering
  const filteredLocations = locations.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="campus-map-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', height: 'calc(100vh - 180px)', minHeight: '550px' }}>
      
      {/* Search and Filter UI */}
      <div className="glass-card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '48px', margin: 0, fontFamily: 'Outfit' }}
            placeholder="Search for a lab, hostel, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Map Display Container */}
      <div className="glass-card" style={{ flex: 1, overflow: 'hidden', borderRadius: '16px', border: '1px solid var(--border-color)', position: 'relative', zIndex: 1 }}>
        <MapContainer 
          center={[12.8230, 80.0440]} 
          zoom={17} 
          style={{ width: '100%', height: '100%', minHeight: '400px' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredLocations.map(loc => (
            <Marker key={loc.id} position={loc.position}>
              <Popup>
                <div style={{ fontFamily: 'Outfit', padding: '4px' }}>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{loc.name}</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{loc.description}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

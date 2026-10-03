import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import { useAuth } from '../context/AuthContext';
import 'leaflet/dist/leaflet.css';

export const AdminHeatmap = () => {
  const { authFetch } = useAuth();
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHeatmapData = async () => {
    try {
      const res = await authFetch('/api/admin/complaints/heatmap');
      if (res.ok) {
        const data = await res.json();
        setHeatmapData(data.heatmapData || []);
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to fetch heatmap data.');
      }
    } catch (err) {
      console.error('Heatmap fetch error:', err);
      setError('Error loading heatmap.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmapData();
  }, []);

  // Helper to determine color based on active ticket count
  const getMarkerColor = (count) => {
    if (count >= 5) return '#ef4444'; // Red (Danger)
    if (count >= 3) return '#f59e0b'; // Orange (Warning)
    return '#eab308'; // Yellow (Alert)
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', fontFamily: 'Outfit' }}>
        <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Loading spatial heatmap data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card" style={{ padding: '24px', textAlign: 'center', fontFamily: 'Outfit', color: 'var(--warning-red)' }}>
        <h3 style={{ fontWeight: 800 }}>Error Loading Map</h3>
        <p style={{ color: 'var(--text-muted)' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="campus-map-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', height: 'calc(100vh - 180px)', minHeight: '550px', fontFamily: 'Outfit' }}>
      
      {/* Header Info */}
      <div className="glass-card" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Campus Issues Heatmap</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Spatial mapping of active student complaints. Circle sizes and colors represent ticket density.
          </p>
        </div>
        
        {/* Legend */}
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', fontWeight: '700' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
            <span>High Density (5+)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
            <span>Medium Density (3-4)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#eab308', display: 'inline-block' }} />
            <span>Low Density (1-2)</span>
          </div>
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
          {heatmapData.map((item, idx) => {
            const radius = Math.max(10, item.activeTicketsCount * 6);
            return (
              <CircleMarker
                key={idx}
                center={item.position}
                radius={radius}
                fillColor={getMarkerColor(item.activeTicketsCount)}
                color="#ffffff"
                weight={2}
                fillOpacity={0.65}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
                  <div style={{ fontFamily: 'Outfit', padding: '4px' }}>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{item.locationName}</strong>
                    <div style={{ marginTop: '2px', fontSize: '0.8rem', color: getMarkerColor(item.activeTicketsCount), fontWeight: 'bold' }}>
                      🔥 {item.activeTicketsCount} Active Issue{item.activeTicketsCount > 1 ? 's' : ''}
                    </div>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

import React from 'react';

export const OrbitalBackground = () => {
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Primary Spinning Orbit Path */}
      <div 
        style={{
          width: '650px',
          height: '650px',
          borderRadius: '50%',
          border: '1px solid rgba(107, 33, 168, 0.12)',
          position: 'relative',
          animation: 'orbitalSpin 40s linear infinite'
        }}
      >
        {/* Orbital Bead */}
        <div 
          style={{
            position: 'absolute',
            top: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '12px',
            height: '12px',
            backgroundColor: '#6b21a8',
            borderRadius: '50%',
            boxShadow: '0 0 12px rgba(107, 33, 168, 0.6), 0 0 4px rgba(107, 33, 168, 0.9)'
          }}
        />
      </div>

      {/* Outer Dashed Orbit Path for Subtle Depth */}
      <div 
        style={{
          position: 'absolute',
          width: '980px',
          height: '980px',
          borderRadius: '50%',
          border: '1px dashed rgba(107, 33, 168, 0.05)',
          animation: 'orbitalSpinReverse 75s linear infinite'
        }}
      />
    </div>
  );
};

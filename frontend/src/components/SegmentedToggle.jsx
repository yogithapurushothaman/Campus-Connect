import React from 'react';

export const SegmentedToggle = ({ options, activeId, onChange, size = 'md' }) => {
  const isSmall = size === 'sm';

  return (
    <div 
      className="segmented-toggle-wrapper"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? '6px' : '10px',
        padding: isSmall ? '4px' : '6px',
        background: 'var(--bg-card)',
        borderRadius: '9999px',
        border: '1.5px solid var(--border-color)',
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
        zIndex: 20
      }}
    >
      {options.map((option) => {
        const isActive = activeId === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: isSmall ? '8px 20px' : '10px 28px',
              borderRadius: '9999px',
              fontSize: isSmall ? '0.8rem' : '0.875rem',
              fontWeight: '800',
              cursor: 'pointer',
              border: isActive ? '1px solid transparent' : '1px solid var(--border-color)',
              backgroundColor: isActive ? 'var(--primary-purple)' : 'transparent',
              color: isActive ? '#ffffff' : 'var(--text-main)',
              boxShadow: isActive ? '0 4px 16px 0 rgba(139, 92, 246, 0.45)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              outline: 'none',
              userSelect: 'none'
            }}
          >
            {option.icon && <span style={{ display: 'flex', alignItems: 'center' }}>{option.icon}</span>}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

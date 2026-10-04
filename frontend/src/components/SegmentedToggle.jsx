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
            data-active={isActive ? "true" : "false"}
            onClick={() => onChange(option.id)}
            className="segmented-toggle-btn"
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
              border: isActive ? '1.5px solid transparent' : '1.5px solid var(--border-color)',
              background: isActive 
                ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' 
                : 'transparent',
              color: isActive ? '#ffffff' : 'var(--text-main)',
              boxShadow: isActive ? '0 6px 20px -2px rgba(139, 92, 246, 0.5)' : 'none',
              transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              outline: 'none',
              userSelect: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
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

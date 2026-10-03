import React, { useEffect, useRef } from 'react';

export const CursorGlow = () => {
  const glowRef = useRef(null);

  useEffect(() => {
    const el = glowRef.current;
    if (!el) return;

    let requestID;

    const handleMouseMove = (e) => {
      cancelAnimationFrame(requestID);
      requestID = requestAnimationFrame(() => {
        if (el) {
          el.style.setProperty('--mouse-x', `${e.clientX}px`);
          el.style.setProperty('--mouse-y', `${e.clientY}px`);
          el.style.opacity = '1';
        }
      });
    };

    const handleMouseLeave = () => {
      if (el) {
        el.style.opacity = '0';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(requestID);
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        background: 'radial-gradient(600px circle at var(--mouse-x, -1000px) var(--mouse-y, -1000px), rgba(255, 255, 255, 0.85), transparent 40%)',
        opacity: 0,
        transition: 'opacity 0.4s ease',
        mixBlendMode: 'soft-light'
      }}
    />
  );
};

// src/components/ui/Card.jsx - Minimal card component
import React from 'react';

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      {children}
    </div>
  );
}

export default Card;
import React from 'react';

interface LogoProps {
  size?: number | string;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 48, className = '' }) => (
  <img
    src="/img/logo.png"
    alt="Strata Noble Logo"
    width={size}
    height={size}
    className={`block object-contain ${className}`}
    style={{ maxWidth: size, maxHeight: size }}
    draggable={false}
  />
);

export default Logo; 
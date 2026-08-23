import React from 'react';
import { APP_NAME } from '../../constants';

type LogoSize = 'sm' | 'md' | 'lg';

interface Props {
  size?: LogoSize;
  showWordmark?: boolean;
  className?: string;
}

const markSize: Record<LogoSize, number> = { sm: 28, md: 36, lg: 56 };
const wordSize: Record<LogoSize, string> = { sm: '1.05rem', md: '1.25rem', lg: '1.65rem' };

const BrandLogo: React.FC<Props> = ({ size = 'md', showWordmark = true, className = '' }) => {
  const px = markSize[size];

  return (
    <span className={`brand-logo d-inline-flex align-items-center gap-2 ${className}`}>
      <svg
        width={px}
        height={px}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="64" height="64" rx="14" fill="#2C3D8F" />
        <path
          d="M32 12.5l17 6.4v13.2c0 10.4-7 19.9-17 23.4-10-3.5-17-13-17-23.4V18.9l17-6.4z"
          fill="#C9A227"
        />
        <path
          d="M32 16.2l13.2 5v10.4c0 8.1-5.4 15.5-13.2 18.2-7.8-2.7-13.2-10.1-13.2-18.2V21.2L32 16.2z"
          fill="#2C3D8F"
        />
        <path
          d="M28.4 34.6l-4-4-2.7 2.7 6.7 6.7 13-13-2.7-2.7-10.3 10.3z"
          fill="#C9A227"
        />
      </svg>
      {showWordmark && (
        <span className="brand-wordmark fw-bold mb-0" style={{ fontSize: wordSize[size], letterSpacing: '-0.02em' }}>
          {APP_NAME}
        </span>
      )}
    </span>
  );
};

export default BrandLogo;

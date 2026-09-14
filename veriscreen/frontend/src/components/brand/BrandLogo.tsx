import React from 'react';
import { APP_NAME } from '../../constants';
import veriscreenMark from '../../assets/veriscreen-mark.jpg';

type LogoSize = 'sm' | 'md' | 'lg';

interface Props {
  size?: LogoSize;
  showWordmark?: boolean;
  className?: string;
  inverted?: boolean;
}

const markSize: Record<LogoSize, number> = { sm: 28, md: 36, lg: 56 };
const wordSize: Record<LogoSize, string> = { sm: '1.05rem', md: '1.25rem', lg: '1.65rem' };

const BrandLogo: React.FC<Props> = ({ size = 'md', showWordmark = true, className = '', inverted = false }) => {
  const px = markSize[size];

  return (
    <span className={`brand-logo d-inline-flex align-items-center gap-2 ${className}`}>
      <img
        src={veriscreenMark}
        alt=""
        width={px}
        height={px}
        className={`brand-mark${inverted ? ' brand-mark--inverted' : ''}`}
      />
      {showWordmark && (
        <span className="brand-wordmark fw-bold mb-0" style={{ fontSize: wordSize[size], letterSpacing: '-0.02em' }}>
          {APP_NAME}
        </span>
      )}
    </span>
  );
};

export default BrandLogo;

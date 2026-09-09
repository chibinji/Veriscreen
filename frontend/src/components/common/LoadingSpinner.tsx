import React from 'react';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullPage?: boolean;
  variant?: string;
}

const sizeMap = { sm: '1rem', md: '2rem', lg: '3.5rem' };

const LoadingSpinner: React.FC<Props> = ({
  size = 'md',
  text,
  fullPage = false,
  variant = 'primary',
}) => {
  const spinner = (
    <div className="text-center py-4">
      <div
        className={`spinner-border text-${variant}`}
        role="status"
        style={{ width: sizeMap[size], height: sizeMap[size] }}
      >
        <span className="visually-hidden">Loading…</span>
      </div>
      {text && <p className="mt-2 mb-0 text-muted small">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: '100vh' }}
      >
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;

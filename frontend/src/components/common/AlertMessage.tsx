import React, { useEffect, useState } from 'react';

interface Props {
  type: 'success' | 'danger' | 'warning' | 'info';
  message: string;
  dismissible?: boolean;
  autoDismiss?: number; // ms
  onDismiss?: () => void;
}

const iconMap = {
  success: 'bi-check-circle-fill',
  danger: 'bi-exclamation-circle-fill',
  warning: 'bi-exclamation-triangle-fill',
  info: 'bi-info-circle-fill',
};

const AlertMessage: React.FC<Props> = ({
  type,
  message,
  dismissible = true,
  autoDismiss,
  onDismiss,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, autoDismiss);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onDismiss]);

  if (!visible) return null;

  return (
    <div className={`alert alert-${type} d-flex align-items-center gap-2 ${dismissible ? 'alert-dismissible' : ''}`} role="alert">
      <i className={`bi ${iconMap[type]} flex-shrink-0`} />
      <span>{message}</span>
      {dismissible && (
        <button
          type="button"
          className="btn-close ms-auto"
          onClick={() => { setVisible(false); onDismiss?.(); }}
          aria-label="Close"
        />
      )}
    </div>
  );
};

export default AlertMessage;

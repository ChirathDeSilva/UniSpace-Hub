import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import './Toast.css';

const iconMap = {
  success: FaCheckCircle,
  error: FaExclamationCircle,
  info: FaInfoCircle,
};

export default function Toast({ type = 'info', message, duration = 3000, onClose }) {
  const [visible, setVisible] = useState(true);
  const Icon = iconMap[type] || FaInfoCircle;

  useEffect(() => {
    if (!message) return undefined;
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message || !visible) return null;

  return (
    <div className={`toast-card toast-${type}`} role="status" aria-live="polite">
      <div className="toast-icon">
        <Icon />
      </div>
      <p className="toast-message">{message}</p>
      <button type="button" className="toast-close" onClick={() => { setVisible(false); if (onClose) onClose(); }} aria-label="Dismiss notification">
        <FaTimes />
      </button>
    </div>
  );
}

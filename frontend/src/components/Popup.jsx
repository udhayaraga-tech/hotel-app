import { useEffect } from 'react';

// Small success/error popup. Closes itself after a few seconds.
export default function Popup({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className={`popup popup-${type}`} role="alertdialog" aria-live="assertive"
           onClick={(e) => e.stopPropagation()}>
        <div className="popup-icon" aria-hidden="true">{type === 'success' ? '✓' : '!'}</div>
        <p>{message}</p>
        <button className="btn btn-primary" onClick={onClose} autoFocus>OK</button>
      </div>
    </div>
  );
}

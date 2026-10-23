export default function Toast({ message, onDismiss }) {
  if (!message) return null;
  return <div className="toast" role="status"><span>✓</span>{message}<button onClick={onDismiss} aria-label="Dismiss notification">×</button></div>;
}

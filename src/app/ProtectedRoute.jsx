export default function ProtectedRoute({ allowed, onBack, children }) {
  if (allowed) return children;
  return <section className="access-card"><div className="access-icon">!</div><h2>Access restricted</h2><p>Your current demo role does not have permission to view this area.</p><button className="btn primary" onClick={onBack}>Back to dashboard</button></section>;
}

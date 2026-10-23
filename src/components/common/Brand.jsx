export default function Brand({ className = '', children }) {
  return <div className={`brand ${className}`}>
    <img className="brand-logo" src="/rsr-groups-logo.png" alt="RSR Groups logo" />
    <div><strong>RSR GROUPS</strong><small>COMPLIANCE DESK</small></div>
    {children}
  </div>;
}

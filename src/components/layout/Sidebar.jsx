import { navigationItems } from '../../data/moduleConfig.js';

export default function Sidebar({ page, allowedPages, navigate, mobileNav, setMobileNav }) {
  return <><aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
    <div className="brand"><div className="brand-mark">R</div><div><strong>RSS VIZAG</strong><small>COMPLIANCE DESK</small></div><button className="mobile-close" onClick={() => setMobileNav(false)} aria-label="Close navigation">×</button></div>
    <div className="workspace-label">WORKSPACE</div>
    <nav>{navigationItems.filter(([name]) => allowedPages.has(name)).map(([name, icon]) => <button key={name} onClick={() => navigate(name)} className={`nav-link ${page === name ? 'active' : ''}`}><span className="nav-icon">{icon}</span>{name}{name === 'Dashboard' && <span className="nav-dot" />}</button>)}</nav>
    <div className="sidebar-footer"><div className="secure-symbol">✓</div><div><strong>Demo environment</strong><small>No live government connections</small></div></div>
  </aside>{mobileNav && <button className="nav-scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation overlay" />}</>;
}

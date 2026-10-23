import { initials } from '../../utils/formatters.js';

export default function Topbar({ page, role, navigate, onLogout, onOpenMenu }) {
  return <header className="topbar"><button className="menu-toggle" onClick={onOpenMenu} aria-label="Open navigation">☰</button><div className="crumb"><span>Workspace</span><b>/</b>{page === 'Access Denied' ? 'Access Denied' : page}</div><div className="topbar-right"><span className="demo-chip"><i /> DEMO MODE</span><span className="role-badge">{role}</span><button className="bell" aria-label="Notifications" onClick={() => navigate('Activity History')}>♧<span /></button><div className="profile-avatar">{initials(role)}</div><div className="profile-copy"><strong>{role.split(' /')[0]}</strong><small>Demo user</small></div><button className="chevron" aria-label="Logout" title="Logout" onClick={onLogout}>⌄</button></div></header>;
}

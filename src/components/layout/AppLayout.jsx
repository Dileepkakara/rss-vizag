import { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function AppLayout({ page, role, allowedPages, navigate, onLogout, children }) {
  const [mobileNav, setMobileNav] = useState(false);
  return <div className="app-shell">
    <Sidebar page={page} allowedPages={allowedPages} navigate={(target) => { navigate(target); setMobileNav(false); }} mobileNav={mobileNav} setMobileNav={setMobileNav} />
    <main className="main-area">
      <Topbar page={page} role={role} navigate={navigate} onLogout={onLogout} onOpenMenu={() => setMobileNav(true)} />
      <div className="content">{children}</div>
    </main>
  </div>;
}

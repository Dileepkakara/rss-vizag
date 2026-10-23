import { useState } from 'react';
import { demoRoles } from '../../data/moduleConfig.js';
import Brand from '../../components/common/Brand.jsx';

export default function LoginPage({ onChoose }) {
  const [selectedRole, setSelectedRole] = useState(demoRoles[0]);
  return <main className="login-screen"><section className="login-card"><Brand className="login-brand" /><div className="login-kicker">MODULE 03 · ADMINISTRATION</div><h1>Welcome back</h1><p className="muted">Sign in to explore the compliance management demo.</p><label className="form-label" htmlFor="role-select">Choose a demo role</label><select id="role-select" value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)}>{demoRoles.map((role) => <option key={role}>{role}</option>)}</select><button className="btn primary login-button" onClick={() => onChoose(selectedRole)}>Continue to workspace <span>→</span></button><div className="login-note"><strong>Demo access</strong><p>No password is needed. Select any role to preview its available modules and permissions.</p></div><p className="login-disclaimer">Frontend simulation only · No production authentication</p></section><div className="login-aside"><div className="login-decoration"><span>03</span><div className="line" /><p>Compliance<br />management<br />made clear.</p></div><small>RSR GROUPS · INTERNAL DEMO WORKSPACE</small></div></main>;
}

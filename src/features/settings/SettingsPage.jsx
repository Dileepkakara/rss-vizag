import PageTitle from '../../components/common/PageTitle.jsx';
import { demoRoles } from '../../data/moduleConfig.js';

const descriptions = {
  'Super Admin': 'Full access to demo modules, management actions and reset control.',
  'Director / Management': 'Read-only oversight for dashboard, records and reports.',
  'HR / Compliance Officer': 'Manage employee master, PF/ESI records and document metadata.',
  'Accounts Officer': 'Manage GST, ITR, GeM and financial document metadata.',
  'Viewer / Auditor': 'Read-only access to authorized demo records.',
};

export default function SettingsPage({ role, setRole, onReset }) {
  return <><PageTitle eyebrow="WORKSPACE PREFERENCES" title="Settings" subtitle="Manage your demo view and explore frontend role permissions." /><div className="settings-grid"><section className="panel settings-card"><div className="settings-icon">♙</div><h2>Demo role</h2><p>Your selected role controls which pages and actions are available in this frontend demo.</p><label className="form-label" htmlFor="settings-role">Switch demo role</label><select id="settings-role" value={role} onChange={(event) => setRole(event.target.value)}>{demoRoles.map((item) => <option key={item}>{item}</option>)}</select><div className="role-explainer"><strong>{role}</strong><p>{descriptions[role]}</p></div></section><section className="panel settings-card"><div className="settings-icon teal">⚙</div><h2>Demo data</h2><p>Demo records persist in this browser using localStorage. No confidential file content is saved.</p><div className="setting-line"><span>Storage mode</span><strong>Browser only</strong></div><div className="setting-line"><span>Current version</span><strong>Seed demo data</strong></div>{role === 'Super Admin' && <button className="btn danger-outline" onClick={onReset}>Reset demo data</button>}</section></div><div className="security-note"><strong>Security limitation</strong><p>Role selection is simulated client-side authorization and is not production security. A real deployment requires authentication, server-side authorization, and secure document storage.</p></div></>;
}

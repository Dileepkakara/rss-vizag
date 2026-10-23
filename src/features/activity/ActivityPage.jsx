import PageTitle from '../../components/common/PageTitle.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { initials } from '../../utils/formatters.js';

export default function ActivityPage({ data }) {
  return <><PageTitle eyebrow="WORKSPACE HISTORY" title="Activity history" subtitle="Actions recorded by this frontend demo since the current data set was loaded." /><div className="notice"><span>ⓘ</span><p>This is a demo activity log, not an authoritative or tamper-proof audit trail.</p></div><section className="panel activity-table">{data.activity.map((item) => <div className="history-row" key={item.id}><div className="timeline-mark"><span /></div><div className="activity-avatar">{initials(item.user)}</div><div className="history-description"><strong>{item.action} · {item.module}</strong><p>{item.description}</p><small>{item.reference} · {item.user}</small></div><time>{new Date(item.time).toLocaleString()}</time></div>)}{!data.activity.length && <EmptyState title="No activity yet" description="Changes made in the demo will appear here." />}</section></>;
}

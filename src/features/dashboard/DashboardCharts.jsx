export default function DashboardCharts({ data, total, pendingCount, onNavigate }) {
  const months = Array.from({ length: 6 }, (_, index) => {
    const month = new Date(); month.setDate(1); month.setMonth(month.getMonth() - (5 - index));
    return { month, label: month.toLocaleDateString('en-IN', { month: 'short' }) };
  });
  const complianceDates = [...data.pf, ...data.esi, ...data.gst, ...data.itr, ...data.gem].filter((record) => !record.archived).map((record) => record.reviewed || record.dueDate).filter(Boolean);
  const monthlyEmployees = months.map(({ month }) => data.employees.filter((employee) => {
    const created = employee.createdDate ? new Date(`${employee.createdDate}T00:00:00`) : null;
    return created && created.getFullYear() === month.getFullYear() && created.getMonth() === month.getMonth();
  }).length);
  const monthlyCompliance = months.map(({ month }) => complianceDates.filter((date) => {
    const value = new Date(`${date}T00:00:00`);
    return value.getFullYear() === month.getFullYear() && value.getMonth() === month.getMonth();
  }).length);
  const maximum = Math.max(1, ...monthlyEmployees, ...monthlyCompliance);
  const records = [...data.pf, ...data.esi, ...data.gst, ...data.itr, ...data.gem].filter((item) => !item.archived);
  const verified = [...data.pf, ...data.esi, ...data.gst].filter((item) => !item.archived && item.verification === 'Verified').length;
  const other = Math.max(0, records.length - pendingCount);

  return <div className="dashboard-grid"><section className="panel chart-panel"><div className="panel-title"><div><h2>Workforce overview</h2><p>New records and compliance dates · last 6 months</p></div><button className="text-button" onClick={() => onNavigate('Reports')}>View reports ↗</button></div><div className="chart-summary"><strong>{total}</strong><span>employee records</span><span className="trend">Live demo data</span></div><div className="bar-chart" role="img" aria-label="Employee records created and compliance dates in the last six months">{months.map(({ label }, index) => <div className="bar-group" key={label}><div className="bar-stack"><span title={`${monthlyEmployees[index]} employee records`} style={{ height: `${Math.max(3, monthlyEmployees[index] / maximum * 122)}px` }} /><i title={`${monthlyCompliance[index]} compliance dates`} style={{ height: `${Math.max(3, monthlyCompliance[index] / maximum * 122)}px` }} /></div><small>{label}</small></div>)}</div><div className="chart-legend"><span><i className="legend-blue" />Employee records</span><span><i className="legend-teal" />Compliance dates</span></div></section>
    <section className="panel status-panel"><div className="panel-title"><div><h2>Compliance status</h2><p>Across PF, ESI & company records</p></div><button className="more-button" aria-label="Compliance options">···</button></div><div className="donut-wrap"><div className="donut"><div><strong>{records.length}</strong><small>records</small></div></div><div className="donut-legend"><div><span className="legend-blue" />Verified <strong>{verified}</strong></div><div><span className="legend-orange" />Pending review <strong>{pendingCount}</strong></div><div><span className="legend-gray" />Other <strong>{other}</strong></div></div></div><div className="status-foot">Status counts reflect current demo records</div></section></div>;
}

export default function DashboardCards({ data, activeEmployees, pendingCount, missingDocs, deadlines }) {
  const total = data.employees.length;
  const former = data.employees.filter((employee) => employee.status !== 'Active').length;
  const cards = [
    ['Total employees', total, `${activeEmployees} currently active`, '♙', 'blue'],
    ['Active employees', activeEmployees, `${total ? Math.round(activeEmployees / total * 100) : 0}% of workforce`, '✓', 'green'],
    ['Former / retired', former, 'Historical records retained', '◷', 'purple'],
    ['PF records', data.pf.filter((item) => !item.archived).length, 'Across all employee records', '◉', 'blue'],
    ['ESI records', data.esi.filter((item) => !item.archived).length, 'Eligibility not auto-assessed', '＋', 'teal'],
    ['Pending review', pendingCount, 'Needs authorized review', '◷', 'orange'],
    ['Missing documents', missingDocs, 'Checklist needs attention', '▱', 'red'],
    ['Upcoming deadlines', deadlines.length, 'GST, ITR and GeM records', '▦', 'purple'],
  ];
  return <div className="stats-grid">{cards.map(([label, value, detail, icon, tone]) => <div className="stat-card" key={label}><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-label">{label}<span>↗</span></div><strong className="stat-value">{value}</strong><small>{detail}</small></div>)}</div>;
}

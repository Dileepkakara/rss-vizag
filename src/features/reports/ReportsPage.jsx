import { useMemo, useState } from 'react';
import PageTitle from '../../components/common/PageTitle.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import { moduleConfig } from '../../data/moduleConfig.js';
import { readableDate } from '../../utils/formatters.js';
import { downloadCsv } from '../../services/reportService.js';

const employeeName = (id, employees) => employees.find((employee) => employee.id === id)?.name || id || 'Company record';

export default function ReportsPage({ data }) {
  const [category, setCategory] = useState('All categories');
  const [status, setStatus] = useState('All statuses');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const rows = useMemo(() => {
    const values = Object.entries(moduleConfig).flatMap(([module, config]) => data[config.key].filter((record) => !record.archived).map((record) => {
      const overdue = record.dueDate && record.dueDate < new Date().toISOString().slice(0, 10) && !/filed|completed/i.test(record.status || '');
      const recordStatus = overdue ? (module === 'GeM Records' ? 'Expired' : 'Overdue') : record.status || record.verification || record.membership || '—';
      return { module, id: record.id, title: record.name || record.title || employeeName(record.employeeId, data.employees), status: recordStatus, date: record.dueDate || record.joiningDate || '', ref: record.employeeId || record.reference || '' };
    }));
    return values.filter((item) => (category === 'All categories' || item.module === category) && (status === 'All statuses' || item.status === status) && (!dateFrom || (item.date && item.date >= dateFrom)) && (!dateTo || (item.date && item.date <= dateTo)));
  }, [data, category, status, dateFrom, dateTo]);
  const summary = [['Employees', data.employees.length], ['Active', data.employees.filter((item) => item.status === 'Active').length], ['PF records', data.pf.filter((item) => !item.archived).length], ['ESI records', data.esi.filter((item) => !item.archived).length], ['Missing documents', data.documents.filter((item) => !item.archived && item.status === 'Missing').length], ['GST / ITR / GeM', [...data.gst, ...data.itr, ...data.gem].filter((item) => !item.archived).length]];
  const exportCsv = () => downloadCsv('rss-vizag-demo-report.csv', ['Module', 'Reference', 'Record', 'Status', 'Date'], rows.map((row) => [row.module, row.ref, row.title, row.status, row.date]));
  const statuses = [...new Set(Object.values(moduleConfig).flatMap((config) => data[config.key].filter((record) => !record.archived).map((record) => record.status || record.verification || record.membership)).filter(Boolean))];
  return <><PageTitle eyebrow="ANALYTICS & EXPORTS" title="Reports" subtitle="Live summaries from the current demo workspace." action={<div className="heading-actions"><button className="btn secondary" onClick={() => window.print()}>⎙ Print report</button><button className="btn primary" onClick={exportCsv}>↓ Export CSV</button></div>} /><div className="reports-summary">{summary.map(([label, value]) => <div className="panel report-card" key={label}><small>{label}</small><strong>{value}</strong></div>)}</div><section className="panel table-panel report-table"><div className="panel-title"><div><h2>Compliance report</h2><p>{rows.length} visible records · values update with demo data</p></div><div className="toolbar-controls"><label className="report-date"><span>From</span><input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} aria-label="Report date from" /></label><label className="report-date"><span>To</span><input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} aria-label="Report date to" /></label><select value={category} onChange={(event) => setCategory(event.target.value)}><option>All categories</option>{Object.keys(moduleConfig).map((item) => <option key={item}>{item}</option>)}</select><select value={status} onChange={(event) => setStatus(event.target.value)}><option>All statuses</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select></div></div><DataTable headings={['MODULE', 'RECORD', 'REFERENCE', 'STATUS', 'DATE']}>{rows.map((row) => <tr key={`${row.module}${row.id}`}><td>{row.module}</td><td><strong>{row.title}</strong><small className="block">{row.id}</small></td><td>{row.ref || '—'}</td><td><StatusBadge value={row.status} /></td><td>{readableDate(row.date)}</td></tr>)}</DataTable>{!rows.length && <EmptyState title="No records match" description="Update the report filters to view records." />}<div className="pagination"><span>Demo report · generated {new Date().toLocaleString()}</span><span className="muted">No government filing or eligibility assessment</span></div></section></>;
}

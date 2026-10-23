import { useEffect, useMemo, useState } from 'react';
import PageTitle from '../../components/common/PageTitle.jsx';
import SearchBar from '../../components/common/SearchBar.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import RowActions from '../../components/common/RowActions.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import { initials, readableDate } from '../../utils/formatters.js';

export function useRecordList(records, page) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All statuses');
  const [sortBy, setSortBy] = useState('name');
  const [pageNum, setPageNum] = useState(1);
  useEffect(() => {
    setQuery('');
    setFilter('All statuses');
    setPageNum(1);
  }, [page]);
  const visibleRecords = useMemo(() => {
    const term = query.toLowerCase().trim();
    return [...records].filter((record) => {
      const matchesQuery = !term || Object.values(record).some((value) => String(value ?? '').toLowerCase().includes(term));
      const states = [record.status, record.verification, record.membership, record.pfStatus, record.esiStatus].filter(Boolean);
      const matchesFilter = filter === 'Archived' ? record.archived : filter === 'All statuses' ? !record.archived : !record.archived && (states.includes(filter) || (filter === 'Overdue' && record.status === 'Overdue') || (filter === 'Expired' && record.status === 'Expired'));
      return matchesQuery && matchesFilter;
    }).sort((a, b) => String(a[sortBy] || '').localeCompare(String(b[sortBy] || '')));
  }, [records, query, filter, sortBy]);
  const pageCount = Math.max(1, Math.ceil(visibleRecords.length / 6));
  return { query, setQuery, filter, setFilter, sortBy, setSortBy, pageNum, setPageNum, visibleRecords, pageCount, pagedRecords: visibleRecords.slice((pageNum - 1) * 6, pageNum * 6) };
}

export default function RecordManagementPage({ page, config, data, employeesById, visibleRecords, pagedRecords, query, filter, setQuery, setFilter, sortBy, setSortBy, pageNum, setPageNum, pageCount, onCreate, onView, onEdit, onArchive, onDelete, canWrite }) {
  const records = data[config.key];
  const statusOptions = [...new Set(records.filter((item) => !item.archived).flatMap((item) => [item.status, item.verification, item.membership, item.pfStatus, item.esiStatus]).filter(Boolean))];
  if (['GST Records', 'Income Tax / ITR Records'].includes(page) && records.some((item) => item.dueDate && item.dueDate < new Date().toISOString().slice(0, 10) && !/filed|completed/i.test(item.status || ''))) statusOptions.push('Overdue');
  if (page === 'GeM Records' && records.some((item) => item.dueDate && item.dueDate < new Date().toISOString().slice(0, 10) && !/completed/i.test(item.status || ''))) statusOptions.push('Expired');
  if (records.some((item) => item.archived)) statusOptions.push('Archived');
  return <><PageTitle eyebrow="RECORD MANAGEMENT" title={page} subtitle={page === 'Employee Master' ? 'Manage fictional employee profiles and related compliance references.' : 'Review and manage demo-only compliance records.'} action={canWrite && <button className="btn primary" onClick={onCreate}>＋ Add {config.singular}</button>} />
    {(page.includes('EPF') || page.includes('ESI')) && <div className="notice amber"><span>ⓘ</span><p><strong>HR / accounts review required.</strong> Eligibility, enrolment and contribution requirements must be confirmed by authorized personnel. No real UANs or government filings are generated.</p></div>}
    {page === 'GST Records' && <div className="notice amber"><span>ⓘ</span><p><strong>Company-level records.</strong> Filing statuses are demo labels only. This application does not file GST returns or connect to government portals.</p></div>}
    {page.includes('Income Tax') && <div className="notice amber"><span>ⓘ</span><p>Demo records only. Income tax returns are not calculated, validated or submitted to the government.</p></div>}
    {page === 'GeM Records' && <div className="notice amber"><span>ⓘ</span><p>Demo-only GeM tracking. There is no connection to or transaction with the real GeM portal.</p></div>}
    <div className="module-stats">{[['Total records', records.filter((item) => !item.archived).length], ['Pending review', records.filter((item) => !item.archived && /pending|needs information/i.test(item.verification || item.status || '')).length], ['Verified / active', records.filter((item) => !item.archived && /verified|active|completed|filed/i.test(item.verification || item.status || '')).length]].map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>
    <section className="panel table-panel"><div className="table-toolbar"><SearchBar value={query} onChange={(event) => { setQuery(event.target.value); setPageNum(1); }} placeholder={`Search ${page.toLowerCase()}...`} label={`Search ${page}`} /><div className="toolbar-controls"><select value={filter} onChange={(event) => { setFilter(event.target.value); setPageNum(1); }} aria-label="Filter by status"><option>All statuses</option>{statusOptions.map((option) => <option key={option}>{option}</option>)}</select><select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort records"><option value={config.fields[0]?.key || 'id'}>Sort: Default</option><option value="id">Record ID</option><option value="status">Status</option>{config.fields.map((item) => <option value={item.key} key={item.key}>{`Sort: ${item.label}`}</option>)}</select></div></div>
      <DataTable headings={page === 'Employee Master' ? ['EMPLOYEE', 'DESIGNATION', 'JOINED', 'EMPLOYMENT', 'PF STATUS', 'ESI STATUS', 'LOCATION', { label: '', ariaLabel: 'Actions' }] : ['RECORD', page.includes('EPF') || page.includes('ESI') ? 'EMPLOYEE' : 'TYPE / PERIOD', page.includes('EPF') ? 'MEMBERSHIP' : 'STATUS', 'VERIFICATION / DUE', 'REFERENCE', 'NOTES', { label: '', ariaLabel: 'Actions' }]}>{pagedRecords.map((record) => <tr key={record.id} onDoubleClick={() => onView(record)}>{page === 'Employee Master' ? <><td><div className="table-person"><div className="person-avatar">{initials(record.name)}</div><div><strong>{record.name}</strong><small>{record.id} · {record.mobile}</small></div></div></td><td>{record.designation}</td><td>{readableDate(record.joiningDate)}</td><td><StatusBadge value={record.status} /></td><td><span className="cell-text">{record.pfStatus}</span></td><td><StatusBadge value={record.esiStatus} /></td><td>{record.branch}</td></> : <><td><div className="record-title"><strong>{record.title || record.id}</strong><small>{record.id}{record.archived ? ' · Archived' : ''}</small></div></td><td>{record.employeeId ? <div className="record-title"><strong>{employeesById[record.employeeId]?.name || 'Employee unavailable'}</strong><small>{record.employeeId} · {record.period || ''}</small></div> : <div className="record-title"><strong>{record.type || record.period || record.year || 'Company record'}</strong><small>{record.year || record.period || record.client || ''}</small></div>}</td><td><StatusBadge value={record.membership || record.status} /></td><td>{record.dueDate ? readableDate(record.dueDate) : <StatusBadge value={record.verification || 'Pending Verification'} />}</td><td>{record.reference || record.document || record.uan || '—'}</td><td className="notes-cell">{record.notes || '—'}</td></>}<td><RowActions record={record} onView={onView} onEdit={onEdit} onArchive={onArchive} onDelete={onDelete} canWrite={canWrite} allowDelete={page === 'Employee Master'} /></td></tr>)}</DataTable>
      {!pagedRecords.length && <EmptyState title="No matching records" description="Try changing your search or filters, or add a demo record." />}
      <Pagination pageNum={pageNum} pageCount={pageCount} total={visibleRecords.length} setPageNum={setPageNum} />
    </section>
    {page.includes('EPF') && <div className="fine-print">Notice: Actual PF eligibility, enrolment and contribution requirements must be confirmed by authorized HR/accounts personnel. Existing membership from prior employment remains subject to verification.</div>}
  </>;
}

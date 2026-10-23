import { useEffect, useMemo, useState } from 'react';
import AppLayout from '../components/layout/AppLayout.jsx';
import RecordModal from '../components/common/Modal.jsx';
import Toast from '../components/common/Toast.jsx';
import DashboardPage from '../features/dashboard/DashboardPage.jsx';
import { useRecordList } from '../features/records/RecordManagementPage.jsx';
import EmployeePage from '../features/employees/EmployeesPage.jsx';
import EPFPage from '../features/epf/EPFPage.jsx';
import ESIPage from '../features/esi/ESIPage.jsx';
import GSTPage from '../features/gst/GSTPage.jsx';
import ITRPage from '../features/itr/ITRPage.jsx';
import GeMPage from '../features/gem/GeMPage.jsx';
import DocumentsPage from '../features/documents/DocumentsPage.jsx';
import ReportsPage from '../features/reports/ReportsPage.jsx';
import ActivityPage from '../features/activity/ActivityPage.jsx';
import SettingsPage from '../features/settings/SettingsPage.jsx';
import LoginPage from '../features/auth/LoginPage.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import { moduleConfig, rolePermissions } from '../data/moduleConfig.js';
import { loadDemoData, resetDemoData, saveDemoData, ROLE_STORAGE_KEY } from '../services/storageService.js';
import { addEmployeeComplianceRecords, createEmployeeRecord } from '../services/employeeService.js';
import { archiveRecord as archiveRecords, createActivityEntry, getEffectiveRecord, removeRecord, upsertRecord } from '../services/recordService.js';
import { canManageRecords, canAccessPage, isReadOnlyRole } from '../utils/permissions.js';
import { getPageFromHash, pathForPage } from './routes.jsx';

const recordPages = {
  'Employee Master': EmployeePage,
  'EPF / PF Management': EPFPage,
  'ESI Management': ESIPage,
  'GST Records': GSTPage,
  'Income Tax / ITR Records': ITRPage,
  'GeM Records': GeMPage,
};

export default function App() {
  const [data, setData] = useState(loadDemoData);
  const [role, setRole] = useState(() => localStorage.getItem(ROLE_STORAGE_KEY) || '');
  const [page, setPage] = useState(() => {
    const currentRole = localStorage.getItem(ROLE_STORAGE_KEY);
    const initialPage = getPageFromHash();
    return currentRole && !canAccessPage(currentRole, initialPage) ? 'Access Denied' : initialPage;
  });
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');
  const [selected, setSelected] = useState(null);
  const [fileName, setFileName] = useState('');
  const allowedPages = rolePermissions[role] || new Set();
  const config = moduleConfig[page];
  const RecordPage = recordPages[page];

  useEffect(() => {
    try { saveDemoData(data); }
    catch (error) { console.error('Could not save demo records to localStorage.', error); setToast('Could not save changes in this browser.'); }
  }, [data]);
  useEffect(() => {
    const onHashChange = () => {
      const nextPage = getPageFromHash();
      setPage(nextPage === 'Access Denied' ? nextPage : canAccessPage(role, nextPage) ? nextPage : 'Access Denied');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [role]);
  useEffect(() => { if (toast) { const timeout = setTimeout(() => setToast(''), 3200); return () => clearTimeout(timeout); } }, [toast]);
  useEffect(() => { setSelected(null); }, [page]);

  const mutate = (key, next, activity) => setData((previous) => ({ ...previous, [key]: next, activity: activity ? [activity, ...previous.activity] : previous.activity }));
  const navigate = (next) => {
    if (!canAccessPage(role, next)) { setPage('Access Denied'); window.location.hash = 'access-denied'; return; }
    window.location.hash = pathForPage(next).slice(1);
    setPage(next);
  };
  const sourceRecords = config ? data[config.key] : [];
  const records = sourceRecords.map((record) => getEffectiveRecord(record, page));
  const {
    query, setQuery, filter, setFilter, sortBy, setSortBy, pageNum, setPageNum,
    visibleRecords, pageCount, pagedRecords,
  } = useRecordList(records, page);
  const employeesById = useMemo(() => Object.fromEntries(data.employees.map((employee) => [employee.id, employee])), [data.employees]);

  const saveRecord = (record) => {
    const isUpdate = Boolean(selected);
    if (page === 'Documents') {
      const doc = { ...record, id: record.id || `DOC-${Date.now()}`, uploaded: record.uploaded || new Date().toISOString().slice(0, 10), attachmentName: fileName || (record.attachmentName === null ? '' : record.attachmentName || ''), status: fileName || record.attachmentName ? 'Demo metadata only' : 'Reference only' };
      mutate('documents', upsertRecord(data.documents, doc, isUpdate), createActivityEntry({ action: isUpdate ? 'Updated' : 'Added', module: 'Documents', reference: doc.id, description: `${fileName ? `Selected ${fileName}; ` : ''}demo attachment metadata saved for ${doc.name}.`, role }));
      setFileName('');
    } else {
      let recordWithId = { ...record, id: record.id || `${config.key.toUpperCase()}-${Date.now()}` };
      if (page === 'Employee Master' && !isUpdate) recordWithId = createEmployeeRecord(recordWithId);
      const activity = createActivityEntry({ action: isUpdate ? 'Updated' : 'Created', module: page, reference: recordWithId.id, description: `${isUpdate ? 'Updated' : 'Created'} ${config.singular} ${recordWithId.id}.`, role });
      setData((previous) => {
        const next = { ...previous, [config.key]: upsertRecord(previous[config.key], recordWithId, isUpdate), activity: [activity, ...previous.activity] };
        if (page === 'Employee Master' && !isUpdate) Object.assign(next, addEmployeeComplianceRecords(previous, recordWithId));
        return next;
      });
    }
    setModal(null); setSelected(null); setToast('Changes saved in this demo.');
  };
  const deleteRecord = (record) => {
    const key = page === 'Documents' ? 'documents' : config.key;
    mutate(key, removeRecord(data[key], record.id), createActivityEntry({ action: 'Deleted', module: page, reference: record.id, description: `Removed demo record ${record.id}.`, role }));
    setModal(null); setSelected(null); setToast('Demo record removed.');
  };
  const archiveRecord = (record, archived = true) => {
    const key = page === 'Documents' ? 'documents' : config.key;
    mutate(key, archiveRecords(data[key], record.id, archived), createActivityEntry({ action: archived ? 'Archived' : 'Restored', module: page, reference: record.id, description: `${archived ? 'Archived' : 'Restored'} demo record ${record.id}.`, role }));
    setToast(archived ? 'Demo record archived.' : 'Demo record restored.');
  };
  const openCreate = () => { setSelected(null); setFileName(''); setModal({ type: 'form' }); };
  const openEdit = (record) => { setSelected(record); setFileName(''); setModal({ type: 'form' }); };
  const activeEmployees = data.employees.filter((item) => item.status === 'Active').length;
  const complianceRecords = [...data.pf, ...data.esi, ...data.gst, ...data.itr, ...data.gem].filter((record) => !record.archived);
  const pendingCount = complianceRecords.filter((record) => /pending|needs information/i.test(`${record.verification || ''} ${record.status || ''}`)).length;
  const deadlines = [...data.gst, ...data.itr, ...data.gem].filter((record) => !record.archived && record.dueDate && record.dueDate >= new Date().toISOString().slice(0, 10) && !/filed|completed/i.test(record.status || '')).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4);
  const missingDocs = data.documents.filter((doc) => !doc.archived && doc.status === 'Missing').length + Math.max(0, data.employees.length - data.documents.filter((doc) => !doc.archived && doc.category === 'Employee Documents').length);
  const canWrite = canManageRecords(role) && !isReadOnlyRole(role);

  if (!role) return <LoginPage onChoose={(nextRole) => { setRole(nextRole); localStorage.setItem(ROLE_STORAGE_KEY, nextRole); window.location.hash = '#dashboard'; }} />;

  const handleLogout = () => { setRole(''); localStorage.removeItem(ROLE_STORAGE_KEY); window.location.hash = ''; };
  const openView = (record) => { setSelected(record); setModal({ type: 'view' }); };
  const content = <ProtectedRoute allowed={page !== 'Access Denied' && canAccessPage(role, page)} onBack={() => navigate('Dashboard')}>
    {page === 'Dashboard' && <DashboardPage data={data} activeEmployees={activeEmployees} pendingCount={pendingCount} missingDocs={missingDocs} deadlines={deadlines} onNavigate={navigate} onCreate={() => { navigate('Employee Master'); setSelected(null); setModal({ type: 'form' }); }} />}
    {RecordPage && <RecordPage data={data} employeesById={employeesById} visibleRecords={visibleRecords} pagedRecords={pagedRecords} query={query} filter={filter} setQuery={setQuery} setFilter={setFilter} sortBy={sortBy} setSortBy={setSortBy} pageNum={pageNum} setPageNum={setPageNum} pageCount={pageCount} onCreate={openCreate} onView={openView} onEdit={openEdit} onArchive={archiveRecord} onDelete={(record) => { setSelected(record); setModal({ type: 'delete' }); }} canWrite={canWrite} />}
    {page === 'Documents' && <DocumentsPage data={data} query={query} setQuery={setQuery} onCreate={openCreate} onView={openView} onEdit={openEdit} onArchive={archiveRecord} onDelete={(doc) => { setSelected(doc); setModal({ type: 'delete' }); }} canWrite={canWrite} />}
    {page === 'Reports' && <ReportsPage data={data} />}
    {page === 'Activity History' && <ActivityPage data={data} />}
    {page === 'Settings' && <SettingsPage role={role} setRole={(next) => { setRole(next); localStorage.setItem(ROLE_STORAGE_KEY, next); navigate('Dashboard'); }} onReset={() => setModal({ type: 'reset' })} />}
  </ProtectedRoute>;

  return <><AppLayout page={page} role={role} allowedPages={allowedPages} navigate={navigate} onLogout={handleLogout}>{content}</AppLayout>
    {modal && <RecordModal modal={modal} page={page} selected={selected} config={config} employees={data.employees} relatedRecords={page === 'Employee Master' && selected ? [...data.pf, ...data.esi].filter((record) => record.employeeId === selected.id) : []} onClose={() => { setModal(null); setFileName(''); }} onSave={saveRecord} onDelete={() => deleteRecord(selected)} onReset={() => { setData(resetDemoData()); setModal(null); setToast('Seed demo records restored.'); }} fileName={fileName} setFileName={setFileName} />}
    <Toast message={toast} onDismiss={() => setToast('')} />
  </>;
}

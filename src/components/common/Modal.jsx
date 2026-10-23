import { useEffect, useRef, useState } from 'react';
import { titleCase, readableDate } from '../../utils/formatters.js';
import StatusBadge from './StatusBadge.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import { isRequiredField, validateRecord } from '../../utils/validation.js';

const documentFields = [
  { key: 'name', label: 'Document Name' },
  { key: 'category', label: 'Category', type: 'select', options: ['EPF', 'ESI', 'GST', 'ITR', 'GeM', 'Employee Documents'] },
  { key: 'linked', label: 'Linked Record Reference' },
  { key: 'expiry', label: 'Expiry Date', type: 'date' },
];
export default function RecordModal({ modal, page, selected, config, employees, relatedRecords = [], onClose, onSave, onDelete, onReset, fileName, setFileName }) {
  const dialogRef = useRef(null);
  const isView = modal.type === 'view';
  const [values, setValues] = useState(selected || {});
  const [errors, setErrors] = useState({});
  const formConfig = page === 'Documents' ? { singular: 'document reference', fields: documentFields } : config;
  const fields = formConfig?.fields || [];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    const previousFocus = document.activeElement;
    const focusable = () => [...dialog.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])')];
    const targets = focusable();
    (targets.find((element) => !element.classList.contains('modal-close')) || targets[0])?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (!items.length) return;
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items[items.length - 1].focus(); }
      else if (!event.shiftKey && document.activeElement === items[items.length - 1]) { event.preventDefault(); items[0].focus(); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [modal.type]);

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = validateRecord({ fields, values, page, employees, selected });
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    onSave(values);
  };

  if (modal.type === 'delete' || modal.type === 'reset') {
    return <ConfirmDialog
      title={modal.type === 'reset' ? 'Reset demo data?' : 'Delete this record?'}
      description={modal.type === 'reset' ? 'This restores the original fictional seed records and removes the current browser demo changes.' : 'This action removes the demo record from this browser. Related historical records may remain.'}
      confirmLabel={modal.type === 'reset' ? 'Reset demo data' : 'Delete record'}
      onCancel={onClose}
      onConfirm={modal.type === 'reset' ? onReset : onDelete}
    />;
  }

  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section ref={dialogRef} className={`dialog ${isView ? 'view-dialog' : ''}`} role="dialog" aria-modal="true" aria-labelledby="modal-title"><header className="dialog-header"><div><div className="eyebrow">{isView ? 'RECORD DETAILS' : selected ? 'UPDATE RECORD' : 'NEW RECORD'}</div><h2 id="modal-title">{isView ? (selected?.name || selected?.title || selected?.id) : selected ? `Edit ${formConfig?.singular}` : `Add ${formConfig?.singular}`}</h2></div><button className="modal-close" onClick={onClose} aria-label="Close dialog">×</button></header>
    {isView ? <><div className="detail-grid">{Object.entries(selected || {}).filter(([key]) => key !== 'id').map(([key, value]) => <div key={key} className="detail-field"><small>{titleCase(key)}</small><strong>{key === 'employeeId' ? `${employees.find((employee) => employee.id === value)?.name || 'Employee unavailable'} · ${value}` : key.toLowerCase().includes('date') || key === 'uploaded' || key === 'reviewed' ? readableDate(value) : String(value || '—')}</strong></div>)}</div>{page === 'Employee Master' && <div className="related-records"><strong>Linked PF / ESI history</strong>{relatedRecords.length ? relatedRecords.map((record) => <div key={record.id}><span>{record.id.startsWith('PF') ? 'EPF / PF' : 'ESI'} · {record.id}</span><StatusBadge value={record.verification || record.status || record.membership} /></div>) : <p>No linked PF or ESI records.</p>}</div>}<div className="modal-actions"><button className="btn secondary" onClick={onClose}>Close</button></div></> :
    <form onSubmit={submit}><div className="form-grid">{fields.map((item) => <label className={`form-field ${item.key === 'notes' ? 'wide' : ''}`} key={item.key}><span>{item.label}{isRequiredField(item.key) && <i> *</i>}</span>{item.type === 'select' ? <select value={values[item.key] || item.options?.[0] || ''} onChange={(event) => setValues({ ...values, [item.key]: event.target.value })}>{item.options.map((option) => <option key={option}>{option}</option>)}</select> : item.type === 'employee' ? <select value={values.employeeId || ''} onChange={(event) => setValues({ ...values, employeeId: event.target.value })}><option value="">Choose employee</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name} · {employee.id}</option>)}</select> : item.key === 'notes' ? <textarea rows="3" value={values[item.key] || ''} onChange={(event) => setValues({ ...values, [item.key]: event.target.value })} /> : <input type={item.type === 'date' ? 'date' : 'text'} value={values[item.key] || ''} disabled={Boolean(selected && item.key === 'id')} onChange={(event) => setValues({ ...values, [item.key]: event.target.value })} placeholder={item.key === 'id' ? 'e.g. RSS-D-006' : ''} />}{errors[item.key] && <small className="field-error">{errors[item.key]}</small>}</label>)}
      {page === 'Documents' && <div className="form-field wide"><label className="form-field"><span>Select a local demo file (optional)</span><input type="file" onChange={(event) => setFileName(event.target.files?.[0]?.name || '')} /><small className="muted">{fileName ? `Selected: ${fileName}. File remains on this device and is not uploaded.` : values.attachmentName ? `Current demo attachment: ${values.attachmentName}` : 'Only the filename is referenced; file contents are not saved.'}</small></label>{selected?.attachmentName && <button type="button" className="text-button attachment-remove" onClick={() => { setFileName(''); setValues({ ...values, attachmentName: null }); }}>Remove current attachment</button>}</div>}
      {page === 'EPF / PF Management' && <p className="form-hint wide">Do not assume a new UAN is required. Confirm previous membership and all PF decisions with authorized HR/accounts staff.</p>}
      </div><div className="modal-actions"><button type="button" className="btn secondary" onClick={onClose}>Cancel</button><button type="submit" className="btn primary">{selected ? 'Save changes' : 'Create demo record'}</button></div></form>}
    <p className="dialog-disclaimer">Demo only · Not permanently saved to a database or submitted to a government portal.</p>
  </section></div>;
}

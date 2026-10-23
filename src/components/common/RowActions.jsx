import { useState } from 'react';

export default function RowActions({ record, onView, onEdit, onArchive, onDelete, canWrite, allowDelete = false }) {
  const [open, setOpen] = useState(false);
  return <div className="actions-wrap"><button className="icon-button" onClick={() => setOpen(!open)} aria-label={`Actions for ${record.id}`}>···</button>{open && <><button className="dropdown-dismiss" onClick={() => setOpen(false)} aria-label="Close actions" /><div className="row-menu"><button onClick={() => { onView(record); setOpen(false); }}>View details</button>{canWrite && <button onClick={() => { onEdit(record); setOpen(false); }}>Edit record</button>}{canWrite && onArchive && <button onClick={() => { onArchive(record, !record.archived); setOpen(false); }}>{record.archived ? 'Restore record' : 'Archive record'}</button>}{canWrite && allowDelete && <button className="danger-text" onClick={() => { onDelete(record); setOpen(false); }}>Delete</button>}</div></>}</div>;
}

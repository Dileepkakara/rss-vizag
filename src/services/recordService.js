export function createActivityEntry({ action, module, reference, description, role }) {
  return {
    id: `ACT-${Date.now()}`,
    action,
    module,
    reference,
    user: role,
    time: new Date().toISOString(),
    description,
  };
}

export function upsertRecord(records, record, isUpdate) {
  return isUpdate
    ? records.map((item) => item.id === record.id ? record : item)
    : [record, ...records];
}

export function archiveRecord(records, recordId, archived) {
  return records.map((item) => item.id === recordId ? { ...item, archived } : item);
}

export function removeRecord(records, recordId) {
  return records.filter((item) => item.id !== recordId);
}

export function getEffectiveRecord(record, module, today = new Date().toISOString().slice(0, 10)) {
  if (!record.dueDate || !['GST Records', 'Income Tax / ITR Records', 'GeM Records'].includes(module)) return record;
  const overdue = record.dueDate < today && !/filed|completed/i.test(record.status || '');
  return overdue ? { ...record, status: module === 'GeM Records' ? 'Expired' : 'Overdue' } : record;
}

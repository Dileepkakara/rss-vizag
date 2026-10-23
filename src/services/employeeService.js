export function createEmployeeRecord(record, today = new Date().toISOString().slice(0, 10)) {
  return { ...record, createdDate: record.createdDate || today };
}

export function addEmployeeComplianceRecords(data, employee, now = Date.now()) {
  const pf = data.pf.some((record) => record.employeeId === employee.id)
    ? data.pf
    : [...data.pf, {
      id: `PF-${now}`, employeeId: employee.id, uan: 'Pending', membership: employee.pfStatus,
      previousEmployment: 'Unknown', verification: 'Pending Verification', period: 'FY 2026-27',
      reference: '', reviewed: '', notes: '',
    }];
  const esi = data.esi.some((record) => record.employeeId === employee.id)
    ? data.esi
    : [...data.esi, {
      id: `ESI-${now}`, employeeId: employee.id, reference: 'Pending', status: employee.esiStatus,
      verification: 'Pending Verification', period: 'FY 2026-27', reviewed: '', notes: '',
    }];
  return { pf, esi };
}

const field = (key, label, type = 'text', options) => ({ key, label, type, options });

export const moduleConfig = {
  'Employee Master': { key: 'employees', singular: 'Employee', fields: [
    field('id', 'Demo Employee ID'), field('name', 'Full Name'), field('mobile', 'Mobile Number'), field('designation', 'Designation', 'select', ['Security Guard', 'Supervisor', 'Office Staff', 'Field Officer']),
    field('department', 'Department'), field('joiningDate', 'Joining Date', 'date'), field('createdDate', 'Created Date', 'date'), field('status', 'Employment Status', 'select', ['Active', 'Former', 'Retired']),
    field('pfStatus', 'PF Membership Status', 'select', ['Pending Verification', 'Existing Membership', 'New Membership Required', 'Not Applicable (Confirmed)']),
    field('esiStatus', 'ESI Status', 'select', ['Pending Verification', 'Active', 'Not Applicable (Confirmed)']), field('branch', 'Branch / Work Location'), field('notes', 'Notes'),
  ] },
  'EPF / PF Management': { key: 'pf', singular: 'PF record', fields: [
    field('employeeId', 'Linked Employee', 'employee'), field('uan', 'Masked UAN Reference'), field('membership', 'Membership Status', 'select', ['Pending Verification', 'Existing Membership', 'New Membership Required', 'Not Applicable (Confirmed)']),
    field('previousEmployment', 'Previous Employment', 'select', ['Unknown', 'Yes', 'No']), field('verification', 'Verification Status', 'select', ['Pending Verification', 'Verified', 'Needs Information']),
    field('period', 'Relevant Period'), field('reference', 'Contribution Record Reference'), field('supportingDocuments', 'Supporting Document References'), field('reviewed', 'Last Reviewed Date', 'date'), field('notes', 'Notes'),
  ] },
  'ESI Management': { key: 'esi', singular: 'ESI record', fields: [
    field('employeeId', 'Linked Employee', 'employee'), field('reference', 'Demo Insurance Reference'), field('status', 'ESI Status', 'select', ['Pending Verification', 'Active', 'Not Applicable (Confirmed)']),
    field('verification', 'Verification Status', 'select', ['Pending Verification', 'Verified', 'Needs Information']), field('period', 'Relevant Period'), field('supportingDocuments', 'Supporting Document References'), field('reviewed', 'Last Reviewed Date', 'date'), field('notes', 'Notes'),
  ] },
  'GST Records': { key: 'gst', singular: 'GST record', fields: [
    field('title', 'Record Title'), field('gstin', 'GSTIN Reference (fictional / masked)'), field('type', 'Return / Document Type'), field('year', 'Financial Year'),
    field('period', 'Tax Period'), field('dueDate', 'Filing Due Date', 'date'), field('status', 'Filing Status', 'select', ['Draft', 'Pending Review', 'Filed (Demo)', 'Overdue']),
    field('verification', 'Verification Status', 'select', ['Pending Verification', 'Verified', 'Needs Information']), field('document', 'Document Reference'), field('notes', 'Notes'),
  ] },
  'Income Tax / ITR Records': { key: 'itr', singular: 'ITR record', fields: [
    field('title', 'Record Title'), field('year', 'Financial / Assessment Year'), field('type', 'Return or Document Type'), field('dueDate', 'Due Date', 'date'),
    field('status', 'Record Status', 'select', ['Draft', 'Pending Review', 'Filed (Demo)', 'Overdue']), field('verification', 'Review Status', 'select', ['Pending Verification', 'Verified', 'Needs Information']),
    field('document', 'Document Reference'), field('notes', 'Notes'),
  ] },
  'GeM Records': { key: 'gem', singular: 'GeM record', fields: [
    field('title', 'Record Title'), field('reference', 'Registration / Bid / Order Reference'), field('type', 'Record Type', 'select', ['Registration', 'Bid', 'Order', 'Contract', 'Other']),
    field('client', 'Related Department / Client'), field('dueDate', 'Submission or Due Date', 'date'), field('status', 'Status', 'select', ['Draft', 'In Progress', 'Submitted (Demo)', 'Completed', 'Expired']),
    field('document', 'Supporting Document Reference'), field('notes', 'Notes'),
  ] },
};

export const navigationItems = [
  ['Dashboard', '⌂'], ['Employee Master', '♙'], ['EPF / PF Management', '◉'], ['ESI Management', '＋'],
  ['GST Records', '▤'], ['Income Tax / ITR Records', '▧'], ['GeM Records', '◇'], ['Documents', '▱'],
  ['Reports', '▥'], ['Activity History', '◷'], ['Settings', '⚙'],
];

export const demoRoles = ['Super Admin', 'Director / Management', 'HR / Compliance Officer', 'Accounts Officer', 'Viewer / Auditor'];

export const rolePermissions = {
  'Super Admin': new Set(navigationItems.map(([name]) => name)),
  'Director / Management': new Set(['Dashboard', 'EPF / PF Management', 'ESI Management', 'GST Records', 'Income Tax / ITR Records', 'GeM Records', 'Documents', 'Reports', 'Activity History']),
  'HR / Compliance Officer': new Set(['Dashboard', 'Employee Master', 'EPF / PF Management', 'ESI Management', 'Documents', 'Reports', 'Activity History']),
  'Accounts Officer': new Set(['Dashboard', 'GST Records', 'Income Tax / ITR Records', 'GeM Records', 'Documents', 'Reports', 'Activity History']),
  'Viewer / Auditor': new Set(['Dashboard', 'Employee Master', 'EPF / PF Management', 'ESI Management', 'GST Records', 'Income Tax / ITR Records', 'GeM Records', 'Documents', 'Reports', 'Activity History']),
};

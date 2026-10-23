import { rolePermissions } from '../data/moduleConfig.js';

export const canAccessPage = (role, page) => Boolean(rolePermissions[role]?.has(page));
export const canManageRecords = (role) => ['Super Admin', 'HR / Compliance Officer', 'Accounts Officer'].includes(role);
export const isReadOnlyRole = (role) => ['Director / Management', 'Viewer / Auditor'].includes(role) || !canManageRecords(role);

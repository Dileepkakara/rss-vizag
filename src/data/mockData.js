import { mockEmployees } from './mockEmployees.js';
import { mockEPFRecords } from './mockEPF.js';
import { mockESIRecords } from './mockESI.js';
import { mockGSTRecords } from './mockGST.js';
import { mockITRRecords } from './mockITR.js';
import { mockGeMRecords } from './mockGeM.js';
import { mockDocuments } from './mockDocuments.js';

export const seedData = {
  employees: mockEmployees,
  pf: mockEPFRecords,
  esi: mockESIRecords,
  gst: mockGSTRecords,
  itr: mockITRRecords,
  gem: mockGeMRecords,
  documents: mockDocuments,
  activity: [{ id: 'ACT-001', action: 'Demo data initialized', module: 'System', reference: 'Workspace', user: 'Super Admin', time: new Date().toISOString(), description: 'Fictional demo records loaded for this browser.' }],
};

import RecordManagementPage from './RecordManagementPage.jsx';
import { moduleConfig } from '../../data/moduleConfig.js';

export function createRecordPage(page) {
  function ModuleRecordsPage(props) {
    return <RecordManagementPage {...props} page={page} config={moduleConfig[page]} />;
  }
  ModuleRecordsPage.displayName = `${page.replace(/[^a-zA-Z0-9]+/g, '')}Page`;
  return ModuleRecordsPage;
}

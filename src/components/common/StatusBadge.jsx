import { statusTone } from '../../utils/formatters.js';

export default function StatusBadge({ value }) {
  return <span className={`status ${statusTone(value)}`}><i />{value || '—'}</span>;
}

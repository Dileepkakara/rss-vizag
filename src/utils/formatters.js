export const initials = (text = '') => text.split(/[\s/]+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
export const titleCase = (value = '') => value.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
export const readableDate = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
export const statusTone = (value = '') => /verified|active|completed|filed/i.test(value) ? 'good' : /overdue|expired|missing|needs information/i.test(value) ? 'bad' : /draft/i.test(value) ? 'neutral' : 'warning';
export const routeSlug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

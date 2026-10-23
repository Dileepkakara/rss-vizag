import { navigationItems } from '../data/moduleConfig.js';
import { routeSlug } from '../utils/formatters.js';

export const routeTable = Object.fromEntries(navigationItems.map(([name]) => [routeSlug(name), name]));

export function getPageFromHash(hash = window.location.hash) {
  if (hash.slice(1) === 'access-denied') return 'Access Denied';
  return routeTable[hash.slice(1)] || 'Dashboard';
}

export function pathForPage(page) {
  if (page === 'Access Denied') return '#access-denied';
  return `#${routeSlug(page)}`;
}

import { seedData } from '../data/mockData.js';

export const STORAGE_KEY = 'rss-vizag-compliance-demo-v1';
export const ROLE_STORAGE_KEY = 'rss-demo-role';

export function loadDemoData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return structuredClone(seedData);
    const parsed = JSON.parse(saved);
    return Object.fromEntries(Object.keys(seedData).map((key) => [key, Array.isArray(parsed[key]) ? parsed[key] : structuredClone(seedData[key])]));
  } catch (error) {
    console.warn('Could not load demo data from localStorage; using seed data.', error);
    return structuredClone(seedData);
  }
}

export function saveDemoData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetDemoData() {
  return structuredClone(seedData);
}
